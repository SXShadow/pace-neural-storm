const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../static/app.js'), 'utf8');

function productionCode(start, end) {
  return source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start)));
}

function run(code, context, expression) {
  return vm.runInNewContext(code + '\n' + expression, context);
}

test('user text is escaped before HTML rendering', () => {
  const value = run(productionCode('function escapeHtml(', 'const DEFAULTS'), {}, 'escapeHtml(\'<script>"&</script>\')');
  assert.equal(value, '&lt;script&gt;&quot;&amp;&lt;/script&gt;');
});

test('missing speech support gives a text fallback instead of throwing', () => {
  const messages = [];
  run(productionCode('function readAloud(', 'function exportProgress('), {speaking:false, window:{}, toast:message=>messages.push(message)}, 'readAloud()');
  assert.match(messages[0], /not supported.*available as text/);
});

test('stopping narration detaches stale callbacks before cancellation', () => {
  let cancelled = false;
  const utterance = {onend:()=>{throw Error('Stale callback ran');}, onerror:()=>{throw Error('Stale callback ran');}};
  const synth = {cancel:()=>{cancelled=true; utterance.onend?.(); utterance.onerror?.();}};
  const result = run(productionCode('function stopSpeech(', 'function readAloud('), {utterance,speaking:true,window:{speechSynthesis:synth},speechSynthesis:synth,document:{getElementById:()=>null}}, 'stopSpeech(); ({speaking,utterance})');
  assert.equal(cancelled,true);
  assert.equal(result.speaking,false);
  assert.equal(result.utterance,null);
});

test('network failures produce a friendly retry message', async () => {
  const response = run(productionCode('async function api(', 'function applyPreferences('), {fetch:async()=>{throw Error('Network disconnected');}}, "api('/lessons')");
  await assert.rejects(response, /Pace could not connect/);
});

test('non-JSON server failures produce a friendly message', async () => {
  const response = run(productionCode('async function api(', 'function applyPreferences('), {fetch:async()=>({json:async()=>{throw Error('Unexpected token <');}})}, "api('/lessons')");
  await assert.rejects(response, /could not complete that request/);
});

test('cancelled lesson creation remains distinguishable from failure', async () => {
  const error = Object.assign(new Error('Cancelled'), {name:'AbortError'});
  const response = run(productionCode('async function api(', 'function applyPreferences('), {fetch:async()=>{throw error;}}, "api('/lessons')");
  await assert.rejects(response, actual=>actual===error);
});

test('validation messages do not expose raw schema objects', async () => {
  const response = run(productionCode('async function api(', 'function applyPreferences('), {fetch:async()=>({ok:false,json:async()=>({detail:[{type:'invalid',input:'private input'}]})})}, "api('/lessons')");
  await assert.rejects(response, /Please check the lesson text and try again/);
});

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return {promise, resolve, reject};
}

function initializationHarness(route) {
  const requests = [];
  const timers = new Map();
  const routeStarted = deferred();
  const loading = {textContent:''};
  let clock = 0, nextTimer = 0, markup = '', retry, routes = 0;
  const main = {
    set innerHTML(value) { markup=value; loading.textContent=value; },
    get innerHTML() { return markup; },
    querySelector:selector=>selector==='.initial-loading' && markup.includes('initial-loading') ? loading : null,
  };
  const context = {
    main, catalog:[], health:{}, hydrateIcons:()=>{}, applyPreferences:()=>{},
    api:path=>{ const request=deferred(); requests.push({path,...request}); return request.promise; },
    route:async()=>{ routes++; routeStarted.resolve(); if (route) await route(); main.innerHTML='Ready library'; },
    setTimeout:(callback,delay)=>{ const id=++nextTimer; timers.set(id,{callback,at:clock+delay}); return id; },
    clearTimeout:id=>timers.delete(id),
    document:{getElementById:()=>({addEventListener:(_,callback)=>{ retry=callback; }})},
  };
  const initialize = run(productionCode('async function initialize()', '\ninitialize();'), context, 'initialize');
  return {initialize, requests, main, loading, timers, routeStarted:routeStarted.promise, routes:()=>routes, retry:()=>retry(),
    advance:milliseconds=>{clock+=milliseconds; for(const [id,timer] of timers) if(timer.at<=clock){timers.delete(id);timer.callback();}},
  };
}

test('cold-start status changes at four seconds while either initial request is pending', async () => {
  const app=initializationHarness();
  const pending=app.initialize();
  assert.match(app.main.innerHTML,/role="status"/);
  app.requests[0].resolve([]);
  app.advance(3999);
  assert.doesNotMatch(app.loading.textContent,/Waking up/);
  app.advance(1);
  assert.equal(app.loading.textContent,'Waking up the free server. The first visit can take up to a minute. Your lessons will appear automatically.');
  app.requests[1].resolve({remote_ai:false});
  await pending;
  assert.equal(app.routes(),1);
  assert.equal(app.main.innerHTML,'Ready library');
  assert.equal(app.timers.size,0);
});

test('fast initial responses cancel the cold-start timer before it can replace the library', async () => {
  const app=initializationHarness();
  const pending=app.initialize();
  app.requests[0].resolve([]); app.requests[1].resolve({});
  await pending;
  app.advance(5000);
  assert.equal(app.main.innerHTML,'Ready library');
  assert.equal(app.timers.size,0);
});

test('initial failure retains the retry path and retry starts a fresh loading cycle', async () => {
  const app=initializationHarness();
  const pending=app.initialize();
  app.advance(4000);
  app.requests[0].reject(Error('Disconnected')); app.requests[1].resolve({});
  await pending;
  assert.match(app.main.innerHTML,/id="retry-connection"/);
  const errorMarkup=app.main.innerHTML;
  app.advance(5000);
  assert.equal(app.main.innerHTML,errorMarkup);
  const retried=app.retry();
  assert.match(app.main.innerHTML,/role="status"/);
  app.advance(4000);
  assert.match(app.loading.textContent,/Waking up/);
  app.requests[2].resolve([]); app.requests[3].resolve({});
  await retried;
  assert.equal(app.main.innerHTML,'Ready library');
});

test('the initial API timer is cancelled even while a subsequent lesson route is pending', async () => {
  const route=deferred();
  const app=initializationHarness(()=>route.promise);
  const pending=app.initialize();
  app.requests[0].resolve([]); app.requests[1].resolve({});
  await app.routeStarted;
  assert.equal(app.timers.size,0);
  app.advance(5000);
  assert.doesNotMatch(app.loading.textContent,/Waking up/);
  route.resolve(); await pending;
});

function practiceMarkup({action='scaffold', correct=false, exhausted=false, prior=0.2, probability=0.1774, last=false}={}) {
  const questions=Array.from({length:3},(_,index)=>({prompt:'Question '+index,options:['First','Second'],answer:1,explanation:'Explanation from the source.'}));
  const record={question:0,probability,answers:[{question:0,selected:correct?1:0,correct}],feedback:{action,reason:'A reason from the model.',previousProbability:prior}};
  if(exhausted) record.answers.push({question:1,correct:true},{question:2,correct:true});
  const concept={questions};
  const active={index:last?1:0,lesson:{concepts:[concept,concept]}};
  return run(productionCode('function renderPractice(', 'function renderSummary('), {concept,record,active,icon:()=>'',escapeHtml:value=>String(value)}, 'renderPractice(concept,record,active)');
}

test('incorrect feedback shows the estimate transition and recommends follow-up while keeping next available', () => {
  const html=practiceMarkup();
  assert.match(html,/Practice estimate moved from 20% to 18% after your incorrect answer\./);
  assert.match(html,/class="button primary small" data-action="followup"/);
  assert.match(html,/class="button secondary small" data-action="next">Next small step/);
  assert.match(html,/not a validated measure of ability/);
});

test('advance feedback makes the next step primary and keeps optional practice secondary', () => {
  const html=practiceMarkup({action:'advance',correct:true,prior:0.5526,probability:0.8439});
  assert.match(html,/moved from 55% to 84% after your correct answer/);
  assert.match(html,/class="button primary small" data-action="next">Next small step/);
  assert.match(html,/class="button secondary small" data-action="followup"/);
});

test('reinforcement recommends another question without blocking manual advancement', () => {
  const html=practiceMarkup({action:'reinforce',correct:true,probability:0.5526});
  assert.match(html,/moved from 20% to 55% after your correct answer/);
  assert.match(html,/class="button primary small" data-action="followup">Try another question/);
  assert.match(html,/class="button secondary small" data-action="next"/);
});

test('exhausted incorrect practice offers source review instead of an unavailable follow-up', () => {
  const html=practiceMarkup({exhausted:true});
  assert.match(html,/Re-read the steps above or check the source/);
  assert.match(html,/class="button primary small" data-action="review-source"/);
  assert.doesNotMatch(html,/data-action="followup"/);
  assert.match(html,/data-action="next"/);
});

test('a completed final concept retains a primary journey action', () => {
  const html=practiceMarkup({action:'reinforce',correct:true,exhausted:true,last:true});
  assert.match(html,/class="button primary small" data-action="next">See my journey/);
  assert.doesNotMatch(html,/data-action="followup"/);
});

test('older saved feedback displays its current estimate without inventing a previous estimate', () => {
  const html=practiceMarkup({prior:null});
  assert.match(html,/Practice estimate: 18%\./);
  assert.doesNotMatch(html,/moved from/);
});

test('source review opens and persists the source, focuses the explanation and announces it', () => {
  const record={}; const source={open:false}; const events=[];
  run(productionCode('function reviewExplanation()', 'let utterance;'), {
    session:()=>({index:0,lesson:{concepts:[{}]}}),recordFor:()=>record,
    persist:()=>events.push('persist'),announce:message=>events.push(message),
    document:{getElementById:id=>id==='source-details'?source:{focus:()=>events.push('explanation focused')}},
  }, 'reviewExplanation()');
  assert.equal(source.open,true);
  assert.equal(record.sourceOpen,true);
  assert.ok(events.includes('persist'));
  assert.ok(events.includes('explanation focused'));
  assert.match(events.at(-1),/source passage is open/);
});

function practiceSubmitHarness({correct=false,fail=false}={}) {
  const events=[]; let handler, payload, saved;
  const concept={questions:[{answer:1},{answer:0}]};
  const active={index:0,lesson:{concepts:[concept]}};
  const record={probability:0.2,question:0,answers:[],stepOverride:false};
  const submit={disabled:false,textContent:'',innerHTML:''}; const error={hidden:true};
  const context={checking:false,routeVersion:1,session:()=>active,recordFor:()=>record,icon:()=>'',
    document:{addEventListener:(_,callback)=>{handler=callback;},getElementById:id=>id==='check-answer'?submit:id==='practice-error'?error:{focus:()=>events.push('feedback focused')}},
    FormData:class {get(){return correct?'1':'0';}},
    api:async(_,options)=>{payload=JSON.parse(options.body);if(fail)throw Error('Try again.');return {probability:correct?0.5526:0.1774,action:correct?'reinforce':'scaffold',reason:'Model reason'};},
    persist:()=>{saved=JSON.parse(JSON.stringify(record));},renderReader:()=>events.push('rendered'),announce:message=>events.push(message),
  };
  run(productionCode("document.addEventListener('submit',", "document.getElementById('create-form').addEventListener"), context, '');
  return {submit:()=>handler({target:{id:'practice-form'},preventDefault(){}}),record,events,error,button:submit,payload:()=>payload,saved:()=>saved};
}

test('submitting preserves the real previous estimate with the saved feedback for reload', async () => {
  for(const correct of [false,true]) {
    const app=practiceSubmitHarness({correct}); await app.submit();
    assert.equal(app.payload().prior,0.2);
    assert.equal(app.saved().feedback.previousProbability,0.2);
    assert.equal(app.saved().feedback.probability,app.saved().probability);
    assert.equal(app.saved().answers[0].correct,correct);
    assert.equal(app.record.stepOverride,undefined);
    assert.ok(app.events.includes('feedback focused'));
    await app.submit();
    assert.equal(app.record.answers.length,1,'an answered question cannot be scored twice');
  }
});

test('failed submissions retain the estimate and answers and restore the retry control', async () => {
  const app=practiceSubmitHarness({fail:true}); await app.submit();
  assert.equal(app.record.probability,0.2);
  assert.equal(app.record.answers.length,0);
  assert.equal(app.record.feedback,undefined);
  assert.equal(app.button.disabled,false);
  assert.equal(app.error.hidden,false);
  assert.match(app.error.textContent,/hasn’t been saved/);
});

test('a follow-up focuses the new question and the exhausted source button is wired to review', () => {
  let handler; const events=[]; const concept={questions:[{},{}]};
  const record={question:0,answers:[{question:0}]};
  const context={session:()=>({index:0,lesson:{concepts:[concept]}}),recordFor:()=>record,
    persist:()=>events.push('persist'),renderReader:()=>events.push('rendered'),announce:()=>{},reviewExplanation:()=>events.push('reviewed'),
    document:{addEventListener:(_,callback)=>{handler=callback;},getElementById:()=>({focus:()=>events.push('question focused')})},
  };
  run(productionCode("document.addEventListener('click',", "document.addEventListener('submit',"), context, '');
  const click=action=>handler({target:{closest:selector=>selector==='[data-action]'?{dataset:{action}}:null}});
  click('followup');
  assert.equal(record.question,1);
  assert.deepEqual(events,['persist','rendered','question focused']);
  click('review-source');
  assert.equal(events.at(-1),'reviewed');
});
