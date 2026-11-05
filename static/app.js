const ICONS = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  chart: '<path d="M4 4v16h17M8 15l4-5 4 2 5-7"/>',
  sliders: '<path d="M4 7h8m4 0h4M4 17h3m4 0h9"/><circle cx="14" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  sprout: '<path d="M12 21V11M12 15C2 15 3 6 3 6s9-1 9 9ZM12 11c0-8 9-8 9-8s1 8-9 8Z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  book: '<path d="M12 6v15M3 4c3-1 6 0 9 2 3-2 6-3 9-2v15c-3-1-6 0-9 2-3-2-6-3-9-2Z"/>',
  headphones: '<path d="M4 14v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="12" width="4" height="8" rx="2"/><rect x="17" y="12" width="4" height="8" rx="2"/>',
  volume: '<path d="m11 4-6 5H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  stop: '<rect x="6" y="6" width="12" height="12" rx="2"/>',
  text: '<path d="m3 20 6-16 6 16M5 15h8m3-3h6m-3 0v8"/>',
  focus: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><circle cx="12" cy="12" r="3"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  layers: '<path d="m12 3 10 6-10 6L2 9Zm-9 12 9 5 9-5M3 12l9 5 9-5"/>',
  sparkles: '<path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5ZM20 2v4m-2-2h4"/>',
  shield: '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6Z"/><path d="m8 12 3 3 5-6"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
  water: '<path d="M12 2s-7 8-7 13a7 7 0 0 0 14 0c0-5-7-13-7-13Z"/><path d="M8 15a4 4 0 0 0 4 4"/>',
  leaf: '<path d="M20 3S3 1 3 13a8 8 0 0 0 8 8C23 21 20 3 20 3ZM4 20 16 8"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-13h-8Z"/>',
  bulb: '<path d="M9 18h6m-5 3h4M8 15a7 7 0 1 1 8 0l-1 3H9Z"/>',
  refresh: '<path d="M20 8a9 9 0 0 0-15-3L2 8m0-6v6h6m-4 8a9 9 0 0 0 15 3l3-3m0 6v-6h-6"/>',
  flag: '<path d="M5 22V3m0 0c5-5 9 5 15 0v11c-6 5-10-5-15 0"/>',
};
function icon(name) {
  return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || ICONS.book) + '</svg>';
}
function hydrateIcons() {
  document.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = icon(element.dataset.icon); });
}
function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
}
const DEFAULTS = {fontSize:20, lineSpacing:1.9, speechRate:0.85, chunked:false, contrast:false, focus:false, remember:true};
const STORAGE_KEY = 'pace.learning.v1';
let state = {version:1, prefs:{...DEFAULTS}, sessions:{}, currentId:null};
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved?.version === 1 && saved.sessions && typeof saved.sessions === 'object') {
    state = {...state, ...saved, prefs:{...DEFAULTS, ...saved.prefs}};
    state.prefs.fontSize = Math.max(16, Math.min(28, Number(state.prefs.fontSize) || 20));
    state.prefs.lineSpacing = [1.6,1.9,2.2].includes(Number(state.prefs.lineSpacing)) ? Number(state.prefs.lineSpacing) : 1.9;
    state.prefs.speechRate = [0.7,0.85,1,1.2].includes(Number(state.prefs.speechRate)) ? Number(state.prefs.speechRate) : 0.85;
  }
} catch { state = {version:1, prefs:{...DEFAULTS}, sessions:{}, currentId:null}; }
let catalog = [];
let health = {remote_ai:false};
let speaking = false;
let toastTimer;
let generationController;
let routeVersion = 0;
let checking = false;
let initialRoute = true;
const main = document.getElementById('main');

function persist() {
  try {
    if (!state.prefs.remember) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  catch { toast('Your browser could not save this session. You can still study and export progress.'); }
}
function announce(message) { document.getElementById('announcer').textContent = message; }
function toast(message) {
  const element = document.getElementById('toast');
  element.textContent = message;
  element.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { element.hidden = true; }, 5000);
}
async function api(path, options = {}) {
  let response;
  try {
    response = await fetch('/api' + path, {...options, headers:{'Content-Type':'application/json', ...options.headers}});
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new Error('Pace could not connect. Check that the app is running, then try again.');
  }
  let result;
  try { result = await response.json(); }
  catch { throw new Error('Pace could not complete that request. Please try again in a moment.'); }
  if (!response.ok) {
    const detail = typeof result.detail === 'string' ? result.detail : 'Please check the lesson text and try again.';
    throw new Error(detail);
  }
  return result;
}
function applyPreferences() {
  document.documentElement.style.setProperty('--lesson-size', state.prefs.fontSize + 'px');
  document.documentElement.style.setProperty('--reading-line', state.prefs.lineSpacing);
  document.body.classList.toggle('high-contrast', state.prefs.contrast);
  document.body.classList.toggle('focus-reading', state.prefs.focus && location.hash.startsWith('#learn/'));
  document.getElementById('font-size').value = state.prefs.fontSize;
  document.getElementById('font-size-value').textContent = state.prefs.fontSize + ' px';
  document.getElementById('line-spacing').value = state.prefs.lineSpacing;
  document.getElementById('speech-rate').value = state.prefs.speechRate;
  document.getElementById('chunked').checked = state.prefs.chunked;
  document.getElementById('contrast').checked = state.prefs.contrast;
  document.getElementById('focus-mode').checked = state.prefs.focus;
  document.getElementById('remember').checked = state.prefs.remember;
}
function session() { return state.sessions[state.currentId]; }
function recordFor(activeSession, concept) {
  if (!activeSession.records[concept.id]) activeSession.records[concept.id] = {probability:0.2, answers:[], question:0, feedback:null};
  return activeSession.records[concept.id];
}
function statistics(activeSession) {
  const records = Object.values(activeSession.records);
  const answers = records.flatMap(record => record.answers || []);
  return {attempted:records.filter(record => record.answers?.length).length, correct:answers.filter(answer => answer.correct).length, answers:answers.length};
}
function totalStats() {
  return Object.values(state.sessions).reduce((total, active) => {
    const stats = statistics(active);
    return {attempted:total.attempted + stats.attempted, correct:total.correct + stats.correct, answers:total.answers + stats.answers};
  }, {attempted:0, correct:0, answers:0});
}
function heroArt() {
  return '<svg viewBox="0 0 390 290" aria-hidden="true"><circle cx="208" cy="148" r="112" fill="#e0e9d6"/><circle cx="208" cy="148" r="89" fill="none" stroke="#c5d3b9" stroke-dasharray="3 6"/><path d="M63 239c100-16 34-128 137-100s48-89 143-97" fill="none" stroke="#a5b99a" stroke-width="2.5" stroke-dasharray="5 7"/><g transform="translate(71 53) rotate(-7)"><rect width="147" height="67" rx="12" fill="#fffdf7" stroke="#dce4d4"/><rect x="13" y="14" width="35" height="35" rx="10" fill="#e5eddc"/><path d="M24 25v13m12-13v13m-12-13c5-2 7 3 12 0" fill="none" stroke="#668253" stroke-width="2"/><text x="58" y="29" font-family="Arial,sans-serif" font-size="10" fill="#486044">Read your way</text><rect x="58" y="39" width="67" height="3" rx="2" fill="#dbe3d2"/><rect x="58" y="47" width="45" height="3" rx="2" fill="#e7ebdf"/></g><g transform="translate(171 151) rotate(7)"><rect width="166" height="70" rx="12" fill="#fffdf8" stroke="#dce4d4"/><circle cx="31" cy="34" r="18" fill="#f7e8d5"/><path d="m23 34 6 6 10-12" fill="none" stroke="#b18a4c" stroke-width="2"/><text x="61" y="29" font-family="Arial,sans-serif" font-size="10" fill="#486044">Find your rhythm</text><rect x="61" y="39" width="81" height="4" rx="2" fill="#e2e8d8"/><rect x="61" y="39" width="47" height="4" rx="2" fill="#a3bb8d"/></g><path d="M107 241c0-22-12-37-7-57m6 41c-26-2-26-20-26-20 25-1 26 20 26 20Zm-3-19c21-10 16-29 16-29-23 7-16 29-16 29Z" fill="#8ca779" stroke="#809a6c" stroke-width="1.2"/><circle cx="329" cy="66" r="8" fill="#d8b879"/><circle cx="59" cy="162" r="4" fill="#b0c69b"/><path d="M285 47v12m-6-6h12" stroke="#a8bb97" stroke-width="1.5"/><path d="m151 261 4-5 4 5" fill="none" stroke="#b1c19f" stroke-width="2"/></svg>';
}
function lessonArt(kind) {
  const scenes = {
    water:'<circle cx="181" cy="36" r="21" fill="#e8d39e"/><path d="M0 101 67 45 117 99 160 59 224 116H0Z" fill="#b6cfd0"/><path d="m44 65 23-20 22 24-22-8Z" fill="#eef5ee"/><path d="M0 104c35-14 64 16 105 0s75-6 135 3v33H0Z" fill="#89b7ba"/><path d="M0 120c44-11 65 10 104 0s84 0 136 5" fill="none" stroke="#c9e1dc" stroke-width="2"/><path d="M30 34c0-10 15-14 21-6 8-4 21 1 20 11H28c-6-1-6-5 2-5Z" fill="#fffefa"/><path d="m137 30-3 8m15-9-3 8m15-7-3 8" stroke="#80a9b1" stroke-width="2" stroke-linecap="round"/><path d="M125 24c0-11 15-15 22-6 11-4 21 0 22 11h-47c-4-3-3-5 3-5Z" fill="#fffefa"/>',
    leaf:'<circle cx="128" cy="69" r="51" fill="#dce5c7"/><path d="M119 123V47" stroke="#52754b" stroke-width="3"/><path d="M120 86C75 84 77 49 77 49s45-2 43 37Z" fill="#92af73"/><path d="M120 63c-2-43 40-45 40-45s5 44-40 45Z" fill="#6f9363"/><path d="M120 109c-1-36 36-38 36-38s4 36-36 38Z" fill="#a8be86"/><path d="m118 86-27-25m29 1 26-30m-26 78 25-25" fill="none" stroke="#d3dfb9" stroke-width="1.5"/><path d="M82 126c22-8 57-8 80 0" fill="none" stroke="#b9caa3" stroke-width="2"/><circle cx="58" cy="39" r="4" fill="#b9cd9e"/><path d="M184 62v10m-5-5h10" stroke="#a4ba8d" stroke-width="2"/>',
    bolt:'<circle cx="129" cy="63" r="44" fill="#f0d9b6"/><path d="M146 51a24 24 0 1 0-38 19l4 12h22l4-12a24 24 0 0 0 8-19Z" fill="#fffae8" stroke="#bb965f" stroke-width="2"/><path d="M113 88h20m-18 6h16m-14 6h12" stroke="#a98c64" stroke-width="3" stroke-linecap="round"/><path d="m127 40-13 18h11l-5 16 16-22h-11Z" fill="#d5b072"/><path d="M62 85V43h21m80 42h25v-31m-96 57H63" fill="none" stroke="#cdb395" stroke-width="2"/><circle cx="62" cy="89" r="4" fill="#c1a585"/><circle cx="188" cy="51" r="4" fill="#c1a585"/><path d="M65 23v10m-5-5h10" stroke="#d5b88e" stroke-width="1.5"/>',
    book:'<circle cx="120" cy="70" r="47" fill="#dcd5ed"/><path d="M120 47c-16-11-35-10-48-4v58c18-6 31-4 48 6 17-10 30-12 48-6V43c-13-6-32-7-48 4Z" fill="#faf8ff" stroke="#a195b6" stroke-width="2"/><path d="M120 47v60M84 57l24 5m-24 8 24 5m-24 8 24 5m24-26 24-5m-24 18 24-5m-24 18 24-5" stroke="#bfb4cd" stroke-width="2"/>'
  };
  return '<svg viewBox="0 0 240 140" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + (scenes[kind] || scenes.book) + '</svg>';
}
function lessonCard(lesson) {
  const saved = state.sessions[lesson.id];
  const count = lesson.concept_count ?? lesson.concepts.length;
  const practiced = saved ? statistics(saved).attempted : 0;
  return '<article class="lesson-card"><div class="lesson-art ' + escapeHtml(lesson.color) + '">' + lessonArt(lesson.icon) + '</div>' +
    (practiced ? '<span class="card-progress">' + practiced + ' of ' + count + ' practised</span>' : '') +
    '<div class="lesson-card-body"><span class="eyebrow">' + escapeHtml(lesson.category) + '</span><h3>' + escapeHtml(lesson.title) + '</h3><p>' + escapeHtml(lesson.subtitle) + '</p><div class="lesson-card-foot"><span class="lesson-meta">' + icon('layers') + count + ' small steps</span><a class="round-link" href="#learn/' + encodeURIComponent(lesson.id) + '" aria-label="' + (saved ? 'Continue ' : 'Start ') + escapeHtml(lesson.title) + '">' + icon('arrow') + '</a></div></div></article>';
}
function renderLibrary() {
  const current = state.sessions[state.currentId];
  const resume = current && !current.finished;
  const date = new Intl.DateTimeFormat('en', {month:'short',day:'numeric',weekday:'short'}).format(new Date());
  const custom = Object.values(state.sessions).filter(active => active.lesson.mode !== 'sample').map(active => active.lesson);
  main.innerHTML = '<div class="page-intro"><div><h1>Your learning space</h1><p>A fresh idea. A familiar lesson. Start wherever you are.</p></div><span class="date-tag">' + escapeHtml(date) + '</span></div>' +
    '<section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><span class="eyebrow">LEARNING THAT MEETS YOU WHERE YOU ARE</span><h2 id="hero-title">A little progress.<br><em>At your own pace.</em></h2><p>Explore ideas in smaller steps, find your way of learning, and make room for curiosity.</p><a class="button primary" href="#learn/' + (resume ? encodeURIComponent(current.lesson.id) : 'water-cycle') + '">' + (resume ? 'Pick up where you left off' : 'Find your first small step') + icon('arrow') + '</a></div><div class="hero-art">' + heroArt() + '</div></section>' +
    '<section aria-labelledby="lessons-title"><div class="section-heading"><div><h2 id="lessons-title">A little curiosity goes a long way</h2><p>Pick a lesson. Make it your own.</p></div><button class="text-link" data-action="create">' + icon('plus') + 'Add a lesson</button></div><div class="lessons-grid">' + catalog.map(lessonCard).join('') + '</div></section>' +
    '<section class="comfort-strip" aria-label="Quick learning preferences"><div class="comfort-title">' + icon('sliders') + '<div><h3>Make yourself comfortable</h3><p>Your preferences travel with every lesson.</p></div></div><div class="comfort-options"><button class="chip-button" data-action="preferences">' + icon('headphones') + 'Read aloud</button><button class="chip-button" data-action="larger" aria-pressed="' + (state.prefs.fontSize > 20) + '">' + icon('text') + 'Larger text</button><button class="chip-button" data-action="focus" aria-pressed="' + state.prefs.focus + '">' + icon('focus') + 'Fewer distractions</button></div></section>' +
    (custom.length ? '<section aria-labelledby="custom-title"><div class="section-heading"><h2 id="custom-title">From your own notes</h2></div><div class="lessons-grid">' + custom.map(lessonCard).join('') + '</div></section><div style="height:24px"></div>' : '') +
    '<section class="bring-lesson"><div class="bring-lesson-copy"><span class="bring-icon">' + icon('book') + '</span><div><h3>Something of your own to explore?</h3><p>Turn your notes into a learning path that works for you.</p></div></div><button class="button secondary small" data-action="create">Bring a lesson ' + icon('plus') + '</button></section>';
}
function renderProgress() {
  const stats = totalStats();
  const sessions = Object.values(state.sessions);
  main.innerHTML = '<div class="page-intro"><div><h1>Every step counts.</h1><p>A record of your practice, at a pace that belongs to you.</p></div><button class="button secondary small" data-action="export">Export progress ' + icon('download') + '</button></div>' +
    '<div class="progress-stats"><div class="stat"><span class="stat-label">Lessons explored</span><div class="stat-value">' + sessions.length + '</div></div><div class="stat"><span class="stat-label">Concepts practised</span><div class="stat-value">' + stats.attempted + '</div></div><div class="stat"><span class="stat-label">Questions tried</span><div class="stat-value">' + stats.answers + '</div></div></div>' +
    (sessions.length ? '<div class="section-heading"><h2>Your learning journeys</h2></div><div class="progress-list">' + sessions.map(active => {
      const progress = statistics(active);
      const total = active.lesson.concepts.length;
      return '<article class="progress-row"><span class="mini-icon">' + icon(active.lesson.icon) + '</span><div class="progress-info"><h3>' + escapeHtml(active.lesson.title) + '</h3><p>' + progress.attempted + ' of ' + total + ' concepts practised · ' + progress.correct + ' correct out of ' + progress.answers + ' attempts</p><div class="progress-track" role="progressbar" aria-label="Concepts practised in ' + escapeHtml(active.lesson.title) + '" aria-valuenow="' + progress.attempted + '" aria-valuemin="0" aria-valuemax="' + total + '"><div class="progress-fill" style="width:' + (progress.attempted / total * 100) + '%"></div></div></div><a class="button secondary small" href="#learn/' + encodeURIComponent(active.lesson.id) + '">Continue ' + icon('arrow') + '</a></article>';
    }).join('') + '</div><p class="reader-method">This is a record of practice, not a measure of ability or a validated learning assessment. Saved on this browser when remembering progress is enabled.</p>' :
      '<div class="empty-state">' + icon('sprout') + '<h2>A fresh page, just for you.</h2><p>Your progress will appear here as you explore lessons and try a little practice.</p><a class="button primary" href="#library">Find a lesson ' + icon('arrow') + '</a></div>');
}

function renderReader() {
  const active = session();
  const lesson = active.lesson;
  const index = Math.max(0, Math.min(active.index, lesson.concepts.length - 1));
  active.index = index;
  const concept = lesson.concepts[index];
  const record = recordFor(active, concept);
  const scaffold = record.feedback?.action === 'scaffold';
  const hasFollowup = concept.questions.some((_, questionIndex) => !record.answers.some(answer => answer.question === questionIndex));
  const chunked = record.stepOverride ?? (state.prefs.chunked || scaffold);
  const sourceURL = /^https:\/\//.test(lesson.source_url || '') ? lesson.source_url : '';
  const mode = {sample:'Prepared lesson', local_nlp:'Local text analysis', remote_ai:'AI-generated lesson'}[lesson.mode];
  main.innerHTML = '<div class="breadcrumb"><a href="#library">' + icon('back') + 'My learning space</a><span>/</span><span>' + escapeHtml(lesson.title) + '</span></div>' +
    '<div class="reader-head"><div><h1>' + escapeHtml(lesson.title) + '</h1><p>One idea at a time. You set the pace.</p></div><div class="reader-toolbar-group"><span class="pill">' + icon('layers') + (index + 1) + ' of ' + lesson.concepts.length + ' steps</span><button class="button secondary small" data-action="preferences">' + icon('sliders') + 'Preferences</button></div></div>' +
    '<div class="reader-layout"><aside class="lesson-outline" aria-label="Lesson concepts"><p class="eyebrow">YOUR LEARNING PATH</p><ol class="concept-list">' + lesson.concepts.map((item, itemIndex) => {
      const done = Boolean(active.records[item.id]?.answers?.length);
      return '<li><button class="concept-link" data-action="concept" data-index="' + itemIndex + '"' + (itemIndex === index ? ' aria-current="step"' : '') + '><span class="step-number ' + (done ? 'done' : '') + '">' + (done ? icon('check') : String(itemIndex + 1).padStart(2,'0')) + '</span>' + escapeHtml(item.title) + '</button></li>';
    }).join('') + '</ol><div class="outline-note">' + icon('sprout') + '<strong>There is no timer here.</strong>Pause, revisit, or keep going. This space is yours.</div></aside><div>' +
    (scaffold && chunked ? '<div class="adaptation-banner" role="status">' + icon('sparkles') + '<div><strong>A smaller step, a different angle.</strong><p>Based on your last answer, this idea is now broken into steps. Take a look, then ' + (hasFollowup ? 'try a follow-up.' : 're-read the steps or check the source.') + '</p></div></div>' : '') +
    '<article class="reader-card" aria-labelledby="concept-heading"><div class="reader-toolbar"><div class="reader-toolbar-group"><button class="button secondary small" data-action="speak" aria-pressed="false" id="speak-button">' + icon('volume') + 'Read aloud</button><button class="chip-button" data-action="steps" aria-pressed="' + chunked + '">' + icon('layers') + 'Small steps</button></div><button class="button ghost small" data-action="source">' + icon('book') + 'View source</button></div>' +
    '<div class="reader-content"><div class="concept-eyebrow"><span class="eyebrow">STEP ' + String(index + 1).padStart(2,'0') + ' · ' + escapeHtml(lesson.category) + '</span></div><h2 id="concept-heading" tabindex="-1">' + escapeHtml(concept.title) + '</h2><div class="lesson-text" id="lesson-reading">' +
    (chunked ? '<ol class="numbered-steps">' + concept.steps.map((step, stepIndex) => '<li><span class="step-number" aria-hidden="true">' + (stepIndex + 1) + '</span><span>' + escapeHtml(step) + '</span></li>').join('') + '</ol>' : '<p>' + escapeHtml(concept.summary) + '</p>') +
    '</div><div class="keyword-list" aria-label="Key terms">' + concept.keywords.map(term => '<span class="keyword">' + escapeHtml(term) + '</span>').join('') + '</div>' +
    '<div class="example-box"><span class="eyebrow">' + icon('bulb') + (lesson.mode === 'local_nlp' ? 'ANOTHER LINE FROM YOUR SOURCE' : 'MAKE THE CONNECTION') + '</span><p>' + escapeHtml(concept.example) + '</p></div>' +
    '<details class="source-details" id="source-details"><summary>See the original passage</summary><blockquote class="source-quote">' + escapeHtml(concept.source_quote) + '</blockquote><p class="source-note">' + escapeHtml(lesson.source_label) + (sourceURL ? ' · <a href="' + escapeHtml(sourceURL) + '" target="_blank" rel="noopener noreferrer">Background reference ↗</a>' : '') + '</p>' + (lesson.mode === 'remote_ai' ? '<p class="source-note">The quote was checked against your source. AI explanations and answers can still contain mistakes.</p>' : '') + '</details></div>' +
    renderPractice(concept, record, active) + '</article><div class="reader-navigation"><button class="button secondary" data-action="previous"' + (index === 0 ? ' disabled' : '') + '>' + icon('back') + 'Previous step</button><button class="button ' + (!record.feedback || record.feedback.action === 'advance' ? 'primary' : 'secondary') + '" data-action="next">' + (index === lesson.concepts.length - 1 ? 'See my journey' : 'Next small step') + icon('arrow') + '</button></div>' +
    '<div class="reader-method"><details><summary>' + escapeHtml(mode) + ' · How this works</summary><p>' + escapeHtml(lesson.method) + ' Practice recommendations use an illustrative Bayesian model. They are not a diagnosis or validated mastery score.</p></details></div>' +
    (state.prefs.focus ? '<button class="text-link" data-action="focus">' + icon('focus') + 'Leave focus view</button>' : '') + '</div></div>';
  applyPreferences();
  const sourceDetails = document.getElementById('source-details');
  sourceDetails.open = Boolean(record.sourceOpen);
  sourceDetails.addEventListener('toggle', () => { record.sourceOpen = sourceDetails.open; persist(); });
  const draft = record.drafts?.[record.question];
  if (!record.answers.some(answer => answer.question === record.question) && Number.isInteger(draft)) {
    const chosen = document.querySelector('input[name="answer"][value="' + draft + '"]');
    if (chosen) chosen.checked = true;
  }
}
function renderPractice(concept, record, active) {
  const questionIndex = Math.min(record.question, concept.questions.length - 1);
  const question = concept.questions[questionIndex];
  const answerRecord = record.answers.find(answer => answer.question === questionIndex);
  const feedback = record.feedback;
  const unanswered = concept.questions.some((_, index) => !record.answers.some(answer => answer.question === index));
  const nextPrimary = feedback?.action === 'advance' || (!unanswered && answerRecord?.correct);
  const estimate = Number.isFinite(feedback?.previousProbability)
    ? 'Practice estimate moved from ' + Math.round(feedback.previousProbability * 100) + '% to ' + Math.round(record.probability * 100) + '% after your ' + (answerRecord?.correct ? 'correct' : 'incorrect') + ' answer.'
    : 'Practice estimate: ' + Math.round(record.probability * 100) + '%.';
  return '<section class="practice-card" aria-label="Practice this concept"><div class="practice-header"><span class="eyebrow">A LITTLE CHECK-IN</span><span>No timer. No pressure.</span></div><form id="practice-form"><fieldset><legend id="question-title" tabindex="-1">' + escapeHtml(question.prompt) + '</legend><div class="answer-options">' +
    question.options.map((option, optionIndex) => '<label class="answer-option' + (answerRecord && optionIndex === question.answer ? ' correct' : '') + (answerRecord && optionIndex === answerRecord.selected && !answerRecord.correct ? ' incorrect' : '') + '"><input type="radio" name="answer" value="' + optionIndex + '"' + (answerRecord?.selected === optionIndex ? ' checked' : '') + (answerRecord ? ' disabled' : '') + ' required><span>' + escapeHtml(option) + '</span>' + (answerRecord && optionIndex === question.answer ? '<span class="sr-only"> — correct answer</span>' : '') + '</label>').join('') +
    '</div></fieldset>' + (!answerRecord ? '<div class="practice-actions"><span class="muted">You can always revisit the explanation.</span><button class="button primary" id="check-answer" type="submit">Check my understanding ' + icon('arrow') + '</button></div>' : '') + '<p id="practice-error" class="error-message" role="alert" hidden></p></form>' +
    (answerRecord && feedback ? '<div class="feedback ' + (answerRecord.correct ? '' : 'incorrect') + '" id="practice-feedback" tabindex="-1"><h3>' + icon(answerRecord.correct ? 'check' : 'bulb') + (answerRecord.correct ? 'You’ve got this step.' : 'A useful moment to revisit.') + '</h3><p>' + escapeHtml(question.explanation) + '</p><details><summary>Why this next step?</summary><p>' + escapeHtml(feedback.reason) + '</p><p>' + estimate + ' An illustrative model estimate based on answers, not reading speed. It is not a validated measure of ability.</p></details>' +
      (!unanswered && !answerRecord.correct ? '<p>Re-read the steps above or check the source</p>' : '') + '<div class="dialog-actions">' +
      (unanswered ? '<button class="button ' + (nextPrimary ? 'secondary' : 'primary') + ' small" data-action="followup">' + (answerRecord.correct ? 'Try another question' : 'Try a follow-up') + icon('refresh') + '</button>' : !answerRecord.correct ? '<button class="button primary small" data-action="review-source">Review steps and source ' + icon('book') + '</button>' : '<span class="muted">You’ve tried all questions for this concept.</span>') +
      '<button class="button ' + (nextPrimary ? 'primary' : 'secondary') + ' small" data-action="next">' + (active.index === active.lesson.concepts.length - 1 ? 'See my journey' : 'Next small step') + icon('arrow') + '</button></div></div>' : '') + '</section>';
}
function renderSummary() {
  const active = session();
  if (!active) { location.hash = '#library'; return; }
  const stats = statistics(active);
  main.innerHTML = '<div class="breadcrumb"><a href="#library">' + icon('back') + 'My learning space</a></div><section class="result-hero">' + icon('sprout') + '<span class="eyebrow">YOUR JOURNEY, SO FAR</span><h1>You made room for learning.</h1><p>Every question and every revisit is part of the process. Here’s your journey through ' + escapeHtml(active.lesson.title.toLowerCase()) + '.</p></section>' +
    '<div class="progress-stats"><div class="stat"><span class="stat-label">Concepts practised</span><div class="stat-value">' + stats.attempted + '<span style="font-size:18px;color:var(--muted)"> / ' + active.lesson.concepts.length + '</span></div></div><div class="stat"><span class="stat-label">Questions tried</span><div class="stat-value">' + stats.answers + '</div></div><div class="stat"><span class="stat-label">Correct answers</span><div class="stat-value">' + stats.correct + '</div></div></div>' +
    '<div class="section-heading"><div><h2>Your next small steps</h2><p>Revisit an idea or explore something new.</p></div></div><ul class="result-concepts">' + active.lesson.concepts.map((concept, index) => {
      const record = active.records[concept.id];
      const attempts = record?.answers?.length || 0;
      const note = !attempts ? 'Ready when you are · no practice yet' : record.probability < 0.8 ? 'Worth another look · ' + attempts + ' question' + (attempts === 1 ? '' : 's') + ' tried' : 'Keep building on this · recent answers were encouraging';
      return '<li><div><h3>' + escapeHtml(concept.title) + '</h3><p>' + note + '</p></div><button class="button secondary small" data-action="revisit" data-index="' + index + '">Revisit ' + icon('arrow') + '</button></li>';
    }).join('') + '</ul><p class="reader-method">These suggestions reflect this practice session, not a validated learning assessment. You can revisit any concept, regardless of its estimate.</p><div class="result-actions"><a class="button primary" href="#library">Explore another lesson ' + icon('arrow') + '</a><button class="button secondary" data-action="export">Save my progress ' + icon('download') + '</button></div>';
}
async function route() {
  const version = ++routeVersion;
  stopSpeech();
  const hash = location.hash || '#library';
  const view = hash.startsWith('#learn/') ? 'learn' : hash === '#summary' ? 'summary' : hash === '#progress' ? 'progress' : 'library';
  document.querySelectorAll('[data-nav]').forEach(link => {
    if (link.dataset.nav === (view === 'progress' ? 'progress' : 'library')) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
  document.getElementById('location').textContent = {library:'Your learning space',learn:'A little space to focus',progress:'Your progress',summary:'Your learning journey'}[view];
  document.body.classList.toggle('focus-reading', state.prefs.focus && view === 'learn');
  try {
    if (view === 'learn') {
      const lessonId = decodeURIComponent(hash.slice(7));
      let active = state.sessions[lessonId];
      if (!active) {
        main.innerHTML = '<div class="initial-loading" role="status">Opening your lesson…</div>';
        const lesson = await api('/lessons/' + encodeURIComponent(lessonId));
        if (version !== routeVersion) return;
        active = {lesson, index:0, records:{}, finished:false, startedAt:new Date().toISOString()};
        state.sessions[lessonId] = active;
      }
      state.currentId = lessonId;
      active.finished = false;
      renderReader();
      persist();
    } else if (view === 'progress') renderProgress();
    else if (view === 'summary') renderSummary();
    else renderLibrary();
    if (version !== routeVersion) return;
    main.focus({preventScroll:true});
    window.scrollTo({top:0, behavior:'instant'});
    if (initialRoute && view === 'learn' && session()) {
      const active = session();
      const savedScroll = recordFor(active, active.lesson.concepts[active.index]).scrollY;
      if (Number.isFinite(savedScroll)) window.scrollTo({top:savedScroll, behavior:'instant'});
    }
    initialRoute = false;
    document.title = 'Pace · ' + (view === 'learn' && session() ? session().lesson.title : 'At your own pace');
  } catch (error) {
    main.innerHTML = '<div class="empty-error"><h2>Let’s try that again.</h2><p>' + escapeHtml(error.message) + '</p><a class="button primary" href="#library">Back to my learning space</a></div>';
  }
}
function openDialog(id) {
  const dialog = document.getElementById(id);
  if (id === 'preferences-dialog') applyPreferences();
  if (id === 'create-dialog') document.getElementById('remote-option').hidden = !health.remote_ai;
  if (!dialog.open) {
    dialog.returnElement = document.activeElement;
    dialog.returnLabel = document.activeElement?.textContent?.trim();
    dialog.returnTarget = document.activeElement?.dataset?.action;
    dialog.showModal();
  }
}
function moveConcept(index, focus = true) {
  stopSpeech();
  session().index = Math.max(0, Math.min(index, session().lesson.concepts.length - 1));
  persist();
  if (!location.hash.startsWith('#learn/')) {
    location.hash = '#learn/' + encodeURIComponent(session().lesson.id);
    return;
  }
  renderReader();
  if (focus) document.getElementById('concept-heading').focus({preventScroll:true});
  window.scrollTo({top:0, behavior:'instant'});
}
function nextConcept() {
  const active = session();
  if (active.index >= active.lesson.concepts.length - 1) {
    active.finished = true;
    persist();
    location.hash = '#summary';
  } else moveConcept(active.index + 1);
}
function reviewExplanation() {
  const active = session();
  const record = recordFor(active, active.lesson.concepts[active.index]);
  record.sourceOpen = true;
  persist();
  document.getElementById('source-details').open = true;
  document.getElementById('concept-heading').focus();
  announce('The source passage is open. Re-read the explanation above.');
}
let utterance;
function stopSpeech() {
  if (utterance) { utterance.onend = null; utterance.onerror = null; }
  utterance = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  speaking = false;
  const button = document.getElementById('speak-button');
  if (button) { button.innerHTML = icon('volume') + 'Read aloud'; button.setAttribute('aria-pressed','false'); }
}
function readAloud() {
  if (speaking) { stopSpeech(); return; }
  if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance !== 'function') { toast('Read-aloud is not supported by this browser. All lesson content is available as text.'); return; }
  const active = session();
  const concept = active.lesson.concepts[active.index];
  const record = recordFor(active, concept);
  const text = (record.stepOverride ?? (state.prefs.chunked || record.feedback?.action === 'scaffold')) ? concept.steps.join('. ') : concept.summary;
  utterance = new SpeechSynthesisUtterance(concept.title + '. ' + text + '. ' + concept.example);
  utterance.lang = 'en-US';
  utterance.rate = state.prefs.speechRate;
  const voices = speechSynthesis.getVoices();
  const voice = voices.find(item => item.lang.startsWith('en') && item.localService) || voices.find(item => item.lang.startsWith('en'));
  if (voice) utterance.voice = voice;
  utterance.onend = () => { stopSpeech(); };
  utterance.onerror = event => {
    stopSpeech();
    if (!['canceled','interrupted'].includes(event.error)) toast('Your browser could not start narration. Try another installed voice or use the text.');
  };
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
  speaking = true;
  const button = document.getElementById('speak-button');
  button.innerHTML = icon('stop') + 'Stop reading';
  button.setAttribute('aria-pressed','true');
}
function exportProgress() {
  const data = {
    application:'Pace', exportedAt:new Date().toISOString(),
    note:'Practice records, not a validated learning assessment. Bayesian parameters are illustrative.',
    preferences:state.prefs,
    lessons:Object.values(state.sessions).map(active => ({title:active.lesson.title, mode:active.lesson.mode, startedAt:active.startedAt, statistics:statistics(active), concepts:active.lesson.concepts.map(concept => ({title:concept.title, practice:active.records[concept.id] || null}))}))
  };
  const url = URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'pace-progress-' + new Date().toISOString().slice(0,10) + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast('Your progress export is ready.');
}
document.addEventListener('click', event => {
  if (event.target.closest('.skip-link')) {
    event.preventDefault();
    main.focus();
    return;
  }
  const close = event.target.closest('[data-close]');
  if (close) { document.getElementById(close.dataset.close).close(); return; }
  const button = event.target.closest('[data-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.action;
  if (action === 'preferences') openDialog('preferences-dialog');
  else if (action === 'create') openDialog('create-dialog');
  else if (action === 'about') openDialog('about-dialog');
  else if (action === 'export') exportProgress();
  else if (action === 'clear-data') openDialog('clear-dialog');
  else if (action === 'confirm-clear') {
    stopSpeech();
    try { localStorage.removeItem(STORAGE_KEY); }
    catch { toast('Browser storage is unavailable. The current session will still be cleared.'); }
    state = {version:1,prefs:{...DEFAULTS},sessions:{},currentId:null};
    document.querySelectorAll('dialog[open]').forEach(dialog => dialog.close());
    applyPreferences();
    location.hash = '#library';
    route();
    toast('Saved lessons, preferences and practice history cleared.');
  }
  else if (action === 'larger') {
    state.prefs.fontSize = state.prefs.fontSize > 20 ? 20 : 24;
    applyPreferences(); persist(); renderLibrary();
    toast('Lesson text size set to ' + state.prefs.fontSize + ' pixels.');
  }
  else if (action === 'focus') {
    state.prefs.focus = !state.prefs.focus;
    applyPreferences(); persist();
    if (location.hash.startsWith('#learn/')) renderReader(); else renderLibrary();
    toast(state.prefs.focus ? 'Focus view will hide the sidebar while you study.' : 'Focus view turned off.');
  }
  else if (action === 'concept' || action === 'revisit') moveConcept(Number(button.dataset.index));
  else if (action === 'next') nextConcept();
  else if (action === 'previous') moveConcept(session().index - 1);
  else if (action === 'review-source') reviewExplanation();
  else if (action === 'source') {
    const details = document.getElementById('source-details');
    details.open = true;
    details.querySelector('summary').focus();
  }
  else if (action === 'speak') readAloud();
  else if (action === 'steps') {
    const active = session();
    const record = recordFor(active, active.lesson.concepts[active.index]);
    const currentlyChunked = record.stepOverride ?? (state.prefs.chunked || record.feedback?.action === 'scaffold');
    record.stepOverride = !currentlyChunked;
    state.prefs.chunked = !currentlyChunked;
    applyPreferences(); persist(); stopSpeech(); renderReader();
    announce(state.prefs.chunked ? 'Lesson now shown in smaller steps.' : 'Lesson now shown as an overview.');
    document.querySelector('[data-action="steps"]').focus({preventScroll:true});
  }
  else if (action === 'followup') {
    const active = session();
    const concept = active.lesson.concepts[active.index];
    const record = recordFor(active, concept);
    const next = concept.questions.findIndex((_, index) => !record.answers.some(answer => answer.question === index));
    if (next >= 0) {
      record.question = next;
      persist(); renderReader();
      document.getElementById('question-title').focus();
      announce('A new practice question is ready.');
    }
  }
});
document.addEventListener('submit', async event => {
  if (event.target.id !== 'practice-form') return;
  event.preventDefault();
  if (checking) return;
  const chosen = new FormData(event.target).get('answer');
  if (chosen === null) return;
  const active = session();
  const concept = active.lesson.concepts[active.index];
  const record = recordFor(active, concept);
  const questionIndex = record.question;
  if (record.answers.some(answer => answer.question === questionIndex)) return;
  const question = concept.questions[questionIndex];
  const selected = Number(chosen);
  const correct = selected === question.answer;
  const submit = document.getElementById('check-answer');
  const routeAtSubmit = routeVersion;
  checking = true;
  submit.disabled = true;
  submit.textContent = 'Checking…';
  const previousProbability = record.probability;
  try {
    const result = await api('/practice', {method:'POST',body:JSON.stringify({prior:previousProbability,correct,attempts:record.answers.length})});
    record.probability = result.probability;
    record.feedback = {...result, previousProbability};
    delete record.stepOverride;
    record.answers.push({question:questionIndex,selected,correct,at:new Date().toISOString()});
    persist();
    if (routeAtSubmit === routeVersion && session() === active && active.lesson.concepts[active.index] === concept) {
      renderReader();
      document.getElementById('practice-feedback').focus({preventScroll:false});
    }
    const hasFollowup = concept.questions.some((_, index) => !record.answers.some(answer => answer.question === index));
    announce(correct ? 'Correct. Your next learning step is ready.' : hasFollowup ? 'Let’s revisit this idea. A step-by-step explanation and follow-up are available.' : 'Let’s revisit this idea. Re-read the steps above or check the source.');
  } catch (error) {
    if (routeAtSubmit === routeVersion) {
      const errorElement = document.getElementById('practice-error');
      if (errorElement) { errorElement.hidden = false; errorElement.textContent = 'Your answer hasn’t been saved. ' + error.message; }
      submit.disabled = false;
      submit.innerHTML = 'Check my understanding ' + icon('arrow');
    }
  } finally { checking = false; }
});
document.getElementById('create-form').addEventListener('submit', async event => {
  event.preventDefault();
  const source = document.getElementById('lesson-source').value.trim();
  const title = document.getElementById('lesson-title').value.trim();
  const errorElement = document.getElementById('create-error');
  errorElement.hidden = true;
  if (source.split(/\s+/).filter(Boolean).length < 35) {
    errorElement.textContent = 'Add at least 35 words, with two or more complete sentences.';
    errorElement.hidden = false; return;
  }
  if (!title) {
    errorElement.textContent = 'Give your lesson a name so you can find it again.';
    errorElement.hidden = false;
    document.getElementById('lesson-title').focus(); return;
  }
  if (source.length > 24000) {
    errorElement.textContent = 'Use a shorter passage, up to 24,000 characters.';
    errorElement.hidden = false; return;
  }
  const submit = document.getElementById('create-submit');
  submit.disabled = true;
  submit.textContent = 'Finding the key ideas…';
  generationController = new AbortController();
  try {
    const lesson = await api('/lessons', {method:'POST', signal:generationController.signal, body:JSON.stringify({title,source,mode:document.getElementById('use-remote').checked && health.remote_ai ? 'remote' : 'local'})});
    state.sessions[lesson.id] ??= {lesson,index:0,records:{},finished:false,startedAt:new Date().toISOString()};
    state.currentId = lesson.id;
    persist();
    generationController = null;
    document.getElementById('create-dialog').close();
    document.getElementById('create-form').reset();
    document.getElementById('source-count').textContent = '0 words';
    const target = '#learn/' + encodeURIComponent(lesson.id);
    if (location.hash === target) route(); else location.hash = target;
    announce('Your learning path is ready, with ' + lesson.concepts.length + ' small steps.');
  } catch (error) {
    if (error.name !== 'AbortError') {
      errorElement.textContent = error.message;
      errorElement.hidden = false;
    }
  } finally {
    generationController = null;
    submit.disabled = false;
    submit.innerHTML = icon('sparkles') + 'Create my learning path';
  }
});
document.getElementById('create-dialog').addEventListener('close', () => { generationController?.abort(); });
document.getElementById('lesson-source').addEventListener('input', event => {
  document.getElementById('source-count').textContent = event.target.value.trim().split(/\s+/).filter(Boolean).length + ' words';
});
const preferenceBindings = {'font-size':'fontSize','line-spacing':'lineSpacing','speech-rate':'speechRate',chunked:'chunked',contrast:'contrast','focus-mode':'focus',remember:'remember'};
Object.entries(preferenceBindings).forEach(([id,key]) => {
  document.getElementById(id).addEventListener(id === 'font-size' ? 'input' : 'change', event => {
    state.prefs[key] = event.target.type === 'checkbox' ? event.target.checked : Number(event.target.value);
    applyPreferences();
    persist();
    if (key === 'speechRate') stopSpeech();
    if (key === 'focus' && location.hash.startsWith('#learn/')) { stopSpeech(); renderReader(); }
    if (key === 'chunked') {
      Object.values(state.sessions).forEach(active => Object.values(active.records).forEach(record => { record.stepOverride = state.prefs.chunked; }));
      persist();
      if (location.hash.startsWith('#learn/')) { stopSpeech(); renderReader(); }
    }
  });
});
window.addEventListener('hashchange', route);
window.addEventListener('pagehide', stopSpeech);
window.addEventListener('pagehide', () => {
  const active = session();
  if (active && location.hash.startsWith('#learn/')) {
    recordFor(active, active.lesson.concepts[active.index]).scrollY = window.scrollY;
    persist();
  }
});
document.addEventListener('change', event => {
  if (event.target.matches('input[name="answer"]')) {
    const active = session();
    const record = recordFor(active, active.lesson.concepts[active.index]);
    record.drafts ??= {};
    record.drafts[record.question] = Number(event.target.value);
    persist();
  }
});
document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', () => {
  if (dialog.returnTarget && !document.querySelector('dialog[open]')) {
    const original = dialog.returnElement;
    const candidates = Array.from(document.querySelectorAll('[data-action="' + dialog.returnTarget + '"]')).filter(element => element.getClientRects().length);
    const target = original?.isConnected && original.getClientRects().length ? original : candidates.find(element => element.textContent.trim() === dialog.returnLabel) || candidates[0];
    target?.focus({preventScroll:true});
  }
}));
window.addEventListener('keydown', event => { if (event.key === 'Escape') stopSpeech(); });
async function initialize() {
  hydrateIcons();
  applyPreferences();
  main.innerHTML = '<div class="initial-loading" role="status">Getting your learning space ready…</div>';
  const wakingTimer = setTimeout(() => {
    const loading = main.querySelector('.initial-loading');
    if (loading) loading.textContent = 'Waking up the free server. The first visit can take up to a minute. Your lessons will appear automatically.';
  }, 4000);
  try {
    [catalog, health] = await Promise.all([api('/lessons'), api('/health')]).finally(() => clearTimeout(wakingTimer));
    await route();
  } catch {
    main.innerHTML = '<div class="empty-error"><h2>Your space is taking a moment.</h2><p>The Python server could not be reached. Keep the app running and reload to reconnect. Your saved progress stays in this browser.</p><button class="button primary" id="retry-connection">Try again</button></div>';
    document.getElementById('retry-connection').addEventListener('click', initialize);
  }
}
initialize();
