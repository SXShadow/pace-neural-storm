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
