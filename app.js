/* Learn — Stable SPA Core
   Safe version (no nested screens, no splash loop, no silent crash)
*/

(function () {
  'use strict';

  // =============================
  // Safe guards for missing data
  // =============================

  if (typeof CONTENT === 'undefined') {
    window.CONTENT = { meta: { app_name: 'Learn', subtitle: '' }, packages: [] };
    console.error('CONTENT not loaded');
  }

  if (typeof TEST_CATALOG === 'undefined') {
    window.TEST_CATALOG = [];
    console.error('TEST_CATALOG not loaded');
  }

  if (typeof QUESTION_BANKS === 'undefined') {
    window.QUESTION_BANKS = {};
  }

  // =============================
  // Utilities
  // =============================

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const esc = (s = '') =>
    String(s)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

  const uid = () =>
    Math.random().toString(16).slice(2) + Date.now().toString(16);

  const todayISO = () => new Date().toISOString().slice(0, 10);

  // =============================
  // State
  // =============================

  const STORE_KEY = 'learn_state_v9';

  const defaultState = () => ({
    onboarded: false,
    goal: null,
    premium: false,
    lastRoute: '#/home',
    history: [],
  });

  const loadState = () => {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
    } catch {
      return defaultState();
    }
  };

  const saveState = () =>
    localStorage.setItem(STORE_KEY, JSON.stringify(state));

  let state = loadState();
  let session = null;

  // =============================
  // App Shell
  // =============================

  const app = document.getElementById('app');

  app.innerHTML = `
    <div class="shell">
      <header id="topbar"></header>
      <main id="view"></main>
      <nav id="bottomnav"></nav>
    </div>
  `;

  const elView = $('#view');
  const elTop = $('#topbar');
  const elBottom = $('#bottomnav');

  // =============================
  // Router
  // =============================

  function parseRoute() {
    if (!location.hash || location.hash === '#')
      return { path: '/splash', parts: [] };

    const raw = location.hash.slice(1);
    const parts = raw.replace(/^\//, '').split('/');
    return { path: '/' + parts[0], parts };
  }

  function navTo(h) {
    location.hash = h;
  }

  function render() {
    const r = parseRoute();

    if (r.path === '/splash') return screenSplash();
    if (r.path === '/onboarding') return screenOnboarding();
    if (r.path === '/home') return screenHome();
    if (r.path === '/tests') return screenTests();
    if (r.path === '/test-run') return screenTestRun();
    if (r.path === '/test-result') return screenTestResult();
    if (r.path === '/stats') return screenStats();
    if (r.path === '/profile') return screenProfile();

    navTo('#/home');
  }

  window.addEventListener('hashchange', render);

  // =============================
  // Screens
  // =============================

  function screenSplash() {
    elBottom.innerHTML = '';
    elView.innerHTML = `
      <div class="page splash">
        <h1>Learn</h1>
        <button id="enterBtn">Enter</button>
      </div>
    `;

    $('#enterBtn').addEventListener('click', () => {
      if (state.onboarded) {
        navTo('#/home');
      } else {
        navTo('#/onboarding');
      }
    });
  }

  function screenOnboarding() {
    elView.innerHTML = `
      <div class="page">
        <h2>Welcome</h2>
        <button id="finishOnb">Continue</button>
      </div>
    `;
    $('#finishOnb').addEventListener('click', () => {
      state.onboarded = true;
      saveState();
      navTo('#/home');
    });
  }

  function screenHome() {
    elBottom.innerHTML = `
      <button onclick="location.hash='#/home'">Home</button>
      <button onclick="location.hash='#/tests'">Tests</button>
      <button onclick="location.hash='#/stats'">Stats</button>
      <button onclick="location.hash='#/profile'">Profile</button>
    `;

    elView.innerHTML = `
      <div class="page">
        <h2>Dashboard</h2>
        <button id="quickTest">Start Test</button>
      </div>
    `;

    $('#quickTest').addEventListener('click', () => {
      session = buildTestSession();
      navTo('#/test-run');
    });
  }

  function screenTests() {
    elView.innerHTML = `
      <div class="page">
        <h2>Tests</h2>
        <button id="startTest">Start</button>
      </div>
    `;

    $('#startTest').addEventListener('click', () => {
      session = buildTestSession();
      navTo('#/test-run');
    });
  }

  function buildTestSession() {
    const questions = (QUESTION_BANKS?.default?.questions || []).slice(0, 5);
    return {
      id: uid(),
      questions,
      idx: 0,
      correct: 0,
    };
  }

  function screenTestRun() {
    if (!session) return navTo('#/tests');

    const q = session.questions[session.idx];
    if (!q) return navTo('#/tests');

    elView.innerHTML = `
      <div class="page">
        <h3>${esc(q.question)}</h3>
        ${(q.options || [])
          .map(
            (opt, i) =>
              `<button class="opt" data-i="${i}">${esc(opt)}</button>`
          )
          .join('')}
      </div>
    `;

    $$('.opt').forEach((btn) =>
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (i === q.correctIndex) session.correct++;
        session.idx++;
        if (session.idx >= session.questions.length) {
          navTo('#/test-result');
        } else {
          screenTestRun();
        }
      })
    );
  }

  function screenTestResult() {
    const total = session.questions.length;
    const correct = session.correct;
    const percent = Math.round((correct / total) * 100);

    state.history.push({
      date: todayISO(),
      correct,
      total,
      percent,
    });

    saveState();

    elView.innerHTML = `
      <div class="page">
        <h2>Result: ${percent}%</h2>
        <button onclick="location.hash='#/home'">Home</button>
      </div>
    `;
  }

  function screenStats() {
    elView.innerHTML = `
      <div class="page">
        <h2>Stats</h2>
        <p>Total sessions: ${state.history.length}</p>
      </div>
    `;
  }

  function screenProfile() {
    elView.innerHTML = `
      <div class="page">
        <h2>Profile</h2>
        <button id="reset">Reset Progress</button>
      </div>
    `;

    $('#reset').addEventListener('click', () => {
      state = defaultState();
      saveState();
      navTo('#/splash');
    });
  }

  // =============================
  // Start
  // =============================

  if (!location.hash) location.hash = '#/splash';
  render();
})();
