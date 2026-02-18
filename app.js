/* Learn — SPA (static) for GitHub Pages / Telegram WebView
   ---------------------------------------------------------
   Data sources:
   - CONTENT (data/content.js)
   - TEST_CATALOG, QUESTION_BANKS (data/tests.js)
*/

(function(){
  'use strict';

  // ---------- Utilities ----------
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = (s='') => String(s)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#039;');

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  const todayISO = () => (new Date()).toISOString().slice(0,10);

  const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);

  // ---------- Icons (minimal subset, Lucide-inspired) ----------
  const ICONS = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V6a2 2 0 0 1 2-2h11.5"/><path d="M20 22H6a2 2 0 0 1-2-2"/><path d="M20 2v18a2 2 0 0 1-2 2H6"/><path d="M8 6h8"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 6-8"/></svg>`,
    user: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21a8 8 0 0 0-16 0"/><circle cx="12" cy="8" r="4"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>`,
    share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7"/><path d="M12 3v12"/><path d="M7 8l5-5 5 5"/></svg>`,
    crown: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7l4 4 5-8 5 8 4-4"/><path d="M5 21h14"/><path d="M5 21l-2-9h18l-2 9"/></svg>`,
    doc: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h8"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a7.8 7.8 0 0 0 .1-2l2-1.4-2-3.4-2.3.6a7.7 7.7 0 0 0-1.7-1L14.9 4h-3.8l-.6 2.8a7.7 7.7 0 0 0-1.7 1L6.5 7.2l-2 3.4L6.5 12a7.8 7.8 0 0 0 .1 2l-2 1.4 2 3.4 2.3-.6c.5.4 1.1.8 1.7 1l.6 2.8h3.8l.6-2.8c.6-.2 1.2-.6 1.7-1l2.3.6 2-3.4z"/></svg>`,
  };
  const icon = (name) => ICONS[name] || '';

  // ---------- Storage ----------
  const STORE_KEY = 'learn_state_v8';

  const defaultState = () => ({
    onboarded: false,
    goal: null, // 'prepare' | 'improve' | 'practice'
    premium: false, // demo-only
    lastRoute: '#/home',
    history: [], // {id, testId, date, correct, total, accuracy, tags}
  });

  const loadState = () => {
    try{
      const raw = localStorage.getItem(STORE_KEY);
      if(!raw) return defaultState();
      const s = JSON.parse(raw);
      return { ...defaultState(), ...s };
    }catch(e){
      return defaultState();
    }
  };
  const saveState = () => localStorage.setItem(STORE_KEY, JSON.stringify(state));

  let state = loadState();

  // ---------- App shell ----------
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="shell">
      <header class="topbar" id="topbar"></header>
      <main class="view" id="view"></main>
      <nav class="bottomnav" id="bottomnav"></nav>
      <div class="toast" id="toast"></div>
    </div>
  `;

  const elTopbar = $('#topbar');
  const elView = $('#view');
  const elBottom = $('#bottomnav');
  const elToast = $('#toast');

  let toastTimer = null;
  const toast = (msg) => {
    elToast.textContent = msg;
    elToast.classList.add('toast--show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> elToast.classList.remove('toast--show'), 1800);
  };

  // ---------- Routing ----------
  const parseRoute = () => {
    const raw = (location.hash || '#/').slice(1);
    const [pathRaw, qsRaw] = raw.split('?');
    const path = '/' + (pathRaw || '').replace(/^\/+/,'').replace(/\/+$/,'');
    const parts = path.split('/').filter(Boolean);
    const query = new URLSearchParams(qsRaw || '');
    return { path, parts, query, raw };
  };

  const navTo = (hash) => {
    if(location.hash === hash) return;
    location.hash = hash;
  };

  // ---------- Data helpers ----------
  const P = (CONTENT && CONTENT.packages) ? CONTENT.packages : [];

  const packageById = (id) => P.find(p => p.id === id);

  const variantLabelShort = (vid) => ({
    base:'Базовый',
    optimal:'Оптимальный',
    prof:'Проф',
    expert:'Эксперт'
  }[vid] || vid);

  const variantOrder = { base:0, optimal:1, prof:2, expert:3, other:9 };

  // For generator: build package index with item sets
  const buildPackageIndex = (scope='all') => {
    const packs = P.map(pkg => {
      const vars = pkg.variants.slice().sort((a,b)=>(variantOrder[a.id]||9)-(variantOrder[b.id]||9));
      let chosen = vars;
      if(scope === 'focus'){
        chosen = vars.filter(v => v.id === 'base' || v.id === 'optimal');
        if(chosen.length === 0) chosen = vars.slice(0,1);
      }
      const items = new Set();
      chosen.forEach(v => (v.what_includes||[]).forEach(it => items.add(it)));
      return { id: pkg.id, name: pkg.name, audience: pkg.audience, items, variants: chosen };
    });

    // Map item -> package ids
    const itemToPackages = new Map();
    for(const pack of packs){
      for(const it of pack.items){
        const arr = itemToPackages.get(it) || [];
        arr.push(pack.id);
        itemToPackages.set(it, arr);
      }
    }
    // dedupe/sort
    for(const [k,arr] of itemToPackages.entries()){
      itemToPackages.set(k, Array.from(new Set(arr)));
    }
    return { packs, itemToPackages };
  };

  // ---------- Test generation ----------
  const shuffle = (arr) => {
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  };

  const sample = (arr, n) => shuffle(arr).slice(0,n);

  const makeOptId = (text) => text.toLowerCase()
    .replace(/ё/g,'е')
    .replace(/[^a-z0-9а-я]+/g,'_')
    .replace(/^_+|_+$/g,'')
    .slice(0,60) || ('id_'+Math.random().toString(16).slice(2));

  const genQuestions_packageByBank = (count=12, scope='focus') => {
    const { packs, itemToPackages } = buildPackageIndex(scope);

    // candidates for single/multiple
    const single = [];
    const multi = [];
    for(const [item, owners] of itemToPackages.entries()){
      if(owners.length === 1) single.push(item);
      else if(owners.length >= 2 && owners.length <= 3) multi.push(item);
    }
    const picked = [];

    // Strategy: 70% single, rest multi (if possible)
    const targetSingle = Math.min(single.length, Math.ceil(count*0.7));
    const singleItems = sample(single, targetSingle);
    const multiItems = sample(multi, Math.max(0, count - singleItems.length));

    for(const it of singleItems){
      const correct = itemToPackages.get(it)[0];
      const opts = shuffle([correct, ...sample(packs.filter(p=>p.id!==correct).map(p=>p.id), 3)]);
      picked.push({
        id: uid(),
        type: 'single',
        prompt: 'В каком пакете встречается банк/материал:',
        stem: it,
        options: opts.map(pid => ({ id: pid, text: packageById(pid).name })),
        answer: [correct],
        explanation: `«${it}» встречается в пакете «${packageById(correct).name}».`,
        ref: `#/package/${correct}`,
        tags: ['generated','packageByBank', scope],
        difficulty: 'easy',
        time_estimate_s: 25,
      });
    }

    for(const it of multiItems){
      const correct = itemToPackages.get(it);
      const extras = sample(packs.filter(p=>!correct.includes(p.id)).map(p=>p.id), Math.max(0, 4 - correct.length));
      const opts = shuffle([...correct, ...extras]);
      picked.push({
        id: uid(),
        type: 'multiple',
        prompt: 'Выбери ВСЕ пакеты, в которые входит:',
        stem: it,
        options: opts.map(pid => ({ id: pid, text: packageById(pid).name })),
        answer: correct,
        explanation: `Этот пункт входит в: ${correct.map(pid => `«${packageById(pid).name}»`).join(', ')}.`,
        ref: `#/library?search=${encodeURIComponent(it)}`,
        tags: ['generated','packageByBank', scope],
        difficulty: 'medium',
        time_estimate_s: 35,
      });
    }

    return shuffle(picked).slice(0, count);
  };

  const genQuestions_upgradeDiff = (count=12, from='base', to='optimal') => {
    const packs = P
      .filter(pkg => pkg.variants.some(v=>v.id===from) && pkg.variants.some(v=>v.id===to))
      .map(pkg => {
        const vFrom = pkg.variants.find(v=>v.id===from);
        const vTo = pkg.variants.find(v=>v.id===to);
        const setFrom = new Set(vFrom.what_includes || []);
        const setTo = new Set(vTo.what_includes || []);
        const added = Array.from(setTo).filter(x=>!setFrom.has(x));
        const base = Array.from(setFrom);
        return { id: pkg.id, name: pkg.name, added, base };
      })
      .filter(p => p.added.length >= 3);

    const questions = [];
    const maxIter = 200;

    let iter=0;
    while(questions.length < count && iter < maxIter){
      iter++;
      const pack = packs[Math.floor(Math.random()*packs.length)];
      const correctItem = pack.added[Math.floor(Math.random()*pack.added.length)];
      const distractors = sample(pack.base.filter(x=>x!==correctItem), 3);
      const options = shuffle([correctItem, ...distractors]).map(t => ({ id: makeOptId(t), text: t }));
      const correctId = makeOptId(correctItem);

      // avoid duplicates by stem+pack
      if(questions.some(q => q.stem === pack.id && q._correctItem === correctItem)) continue;

      questions.push({
        id: uid(),
        type: 'single',
        prompt: `Что добавляется при переходе «${variantLabelShort(from)} → ${variantLabelShort(to)}» в пакете:`,
        stem: pack.name,
        options,
        answer: [correctId],
        explanation: `Добавляется «${correctItem}».`,
        ref: `#/package/${pack.id}?v=${to}`,
        tags: ['generated','upgradeDiff', `${from}->${to}`, pack.id],
        difficulty: 'medium',
        time_estimate_s: 35,
        _correctItem: correctItem,
      });
    }

    return shuffle(questions).slice(0, count);
  };

  const buildTestSession = (testId) => {
    const t = TEST_CATALOG.find(x => x.id === testId);
    if(!t) return null;

    let questions = [];
    if(t.kind === 'bank'){
      const bank = QUESTION_BANKS[t.bank];
      questions = bank ? bank.questions : [];
    }else if(t.kind === 'generated'){
      if(t.generator === 'packageByBank'){
        questions = genQuestions_packageByBank(t.settings.count, t.settings.scope);
      }else if(t.generator === 'upgradeDiff'){
        questions = genQuestions_upgradeDiff(t.settings.count, t.settings.from, t.settings.to);
      }
    }

    // Normalize to array
    questions = Array.isArray(questions) ? questions.slice() : [];

    return {
      id: uid(),
      testId,
      title: t.title,
      questions,
      idx: 0,
      correct: 0,
      wrong: 0,
      answers: [], // {qid, correct:boolean, picked, meta}
      startedAt: Date.now(),
    };
  };

  // ---------- Rendering (topbar + bottomnav) ----------
  const setTopbar = ({ title, subtitle, backHref=null, right=null, hideLogo=false }) => {
    elTopbar.innerHTML = `
      <div class="topbar__left">
        ${backHref ? `<button class="iconbtn" id="backBtn" aria-label="Назад">${icon('back')}</button>` : ''}
        ${hideLogo ? '' : `<div class="logo" aria-hidden="true"><span>Le</span></div>`}
        <div class="topbar__titles">
          <div class="title">${esc(title || CONTENT?.meta?.app_name || 'Learn')}</div>
          <div class="subtitle">${esc(subtitle || CONTENT?.meta?.subtitle || '')}</div>
        </div>
      </div>
      <div class="topbar__right">
        ${right || ''}
      </div>
    `;
    const backBtn = $('#backBtn');
    if(backBtn && backHref){
      backBtn.addEventListener('click', ()=> navTo(backHref));
    }
  };

  const setBottomNav = (active='home', visible=true) => {
    if(!visible){
      elBottom.innerHTML = '';
      return;
    }
    const items = [
      { id:'home', label:'Home', icon:'home', href:'#/home' },
      { id:'library', label:'Learn', icon:'book', href:'#/library' },
      { id:'tests', label:'Tests', icon:'check', href:'#/tests' },
      { id:'stats', label:'Stats', icon:'chart', href:'#/stats' },
      { id:'profile', label:'Profile', icon:'user', href:'#/profile' },
    ];
    elBottom.innerHTML = `
      <div class="bottomnav__bar">
        ${items.map(it => `
          <div class="navitem ${active===it.id?'navitem--active':''}" data-href="${it.href}">
            ${icon(it.icon)}
            <span>${esc(it.label)}</span>
          </div>
        `).join('')}
      </div>
    `;
    $$('.navitem', elBottom).forEach(el => {
      el.addEventListener('click', () => navTo(el.getAttribute('data-href')));
    });
  };

  const copyLink = async () => {
    const url = location.href;
    try{
      await navigator.clipboard.writeText(url);
      toast('Ссылка скопирована');
    }catch(e){
      toast('Не удалось скопировать (попробуй вручную)');
    }
  };

  // ---------- Screens ----------
  const screenSplash = () => {
    setTopbar({ title: 'Learn', subtitle: CONTENT?.meta?.subtitle || '', hideLogo:false, right:'' });
    setBottomNav('home', false);

    elView.innerHTML = `
      <div class="page splash">
        <div class="splash__card">
          <div class="splash__brand">
            <div class="logo" aria-hidden="true"><span>Le</span></div>
            <div>
              <h1>Learn</h1>
              <p>${esc(CONTENT?.meta?.subtitle || '')}</p>
            </div>
          </div>

          <div class="mt3">
            <div class="badge badge--focus">${icon('check')} <span>${esc(CONTENT?.meta?.focus_note || '')}</span></div>
          </div>

          <div class="shimmer" aria-hidden="true"></div>
        </div>
      </div>
    `;

    // Robust auto-redirect logic (GitHub Pages + empty hash safe)
setTimeout(() => {
  const r = parseRoute();

  const isEmpty = !location.hash || location.hash === '#' || r.path === '/' || !r.path;
  const isSplash = r.path === '/splash';

  // Allow redirect if:
  // 1) hash is empty (fresh open)
  // 2) route is "/"
  // 3) route is explicitly "/splash"
  if (isEmpty || isSplash) {
    if (state.onboarded) {
      navTo(state.lastRoute || '#/home');
    } else {
      navTo('#/onboarding');
    }
  }

  // If user deep-linked (e.g. #/package/...), do nothing
}, 700);

  const screenOnboarding = () => {
    setTopbar({ title: 'Onboarding', subtitle: 'Настрой Learn под себя', backHref:'#/splash', right:'' });
    setBottomNav('home', false);

    const steps = [
      {
        title:'Премиальный тренажёр',
        body:'Учись по пакетам КонсультантПлюс и закрепляй знания через логически непротиворечивые тесты.',
      },
      {
        title:'Фокус на важном',
        body:'По рекомендациям наставника подсвечиваем «Базовый» и «Оптимальный». Это твой основной маршрут.',
      },
      {
        title:'Выбери цель',
        body:'Цель влияет на рекомендации тестов и подсказки.',
        goalPick:true,
      }
    ];

    const step = clamp(Number(state._onbStep || 0), 0, steps.length-1);
    const s = steps[step];

    const goalButtons = `
      <div class="list">
        <div class="item" data-goal="prepare"><div class="item__title">Подготовка</div><div class="item__sub">Быстро разобраться в пакетах и отличиях.</div></div>
        <div class="item" data-goal="improve"><div class="item__title">Улучшить знания</div><div class="item__sub">Системно закрыть пробелы и поднять точность.</div></div>
        <div class="item" data-goal="practice"><div class="item__title">Практика</div><div class="item__sub">Регулярные короткие тесты и отслеживание прогресса.</div></div>
      </div>
    `;

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">${esc(s.title)}</h1>
          <p class="hero__subtitle">${esc(s.body)}</p>
        </div>

        ${s.goalPick ? `<div class="card mt3">
          <div class="h2">Цель</div>
          <p class="p">Выбери, что сейчас важнее. Можно поменять позже в профиле.</p>
          ${goalButtons}
        </div>` : ''}

        <div class="mt3 row row--between">
          <button class="btn btn--ghost" id="onbBack" ${step===0?'disabled':''} style="${step===0?'opacity:.5;cursor:not-allowed':''}">Назад</button>
          <button class="btn" id="onbNext">${step===steps.length-1 ? 'Готово' : 'Дальше'}</button>
        </div>
      </div>
    `;

    // goal handlers
    $$('.item[data-goal]').forEach(el => {
      const g = el.getAttribute('data-goal');
      el.addEventListener('click', () => {
        state.goal = g;
        saveState();
        toast('Цель сохранена');
        // highlight
        $$('.item[data-goal]').forEach(x => x.style.borderColor = 'rgba(255,255,255,.08)');
        el.style.borderColor = 'rgba(168,85,247,.45)';
      });
      if(state.goal === g){
        el.style.borderColor = 'rgba(168,85,247,.45)';
      }
    });

    $('#onbBack').addEventListener('click', () => {
      state._onbStep = clamp(step-1,0,steps.length-1);
      saveState();
      screenOnboarding();
    });
    $('#onbNext').addEventListener('click', () => {
      if(step === steps.length-1){
        state.onboarded = true;
        state._onbStep = 0;
        saveState();
        navTo('#/home');
        return;
      }
      state._onbStep = clamp(step+1,0,steps.length-1);
      saveState();
      screenOnboarding();
    });
  };

  const screenHome = () => {
    setTopbar({
      title: 'Learn',
      subtitle: CONTENT?.meta?.focus_note || '',
      right: `<button class="iconbtn" id="shareBtn" aria-label="Скопировать ссылку">${icon('share')}</button>`
    });
    setBottomNav('home', true);

    const last = (state.history || []).slice().sort((a,b)=>(b.ts||0)-(a.ts||0))[0];
    const accuracy = last ? Math.round((last.correct/last.total)*100) : null;

    const focusCards = P.map(pkg => {
      const base = pkg.variants.find(v=>v.id==='base');
      const opt = pkg.variants.find(v=>v.id==='optimal');
      if(!base && !opt) return '';
      const chips = [
        base ? `<span class="chip chip--ok">Базовый</span>` : '',
        opt ? `<span class="chip chip--ok">Оптимальный</span>` : '',
      ].join('');
      return `
        <div class="item" data-href="#/package/${pkg.id}">
          <div class="item__title">${esc(pkg.name)}</div>
          <div class="item__sub">${esc(pkg.audience || '')}</div>
          <div class="mt2 chips">${chips}</div>
        </div>
      `;
    }).join('');

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">Dashboard</h1>
          <p class="hero__subtitle">База знаний по смарт‑комплектам + тесты. Все ссылки шарятся — удобно для Telegram.</p>

          <div class="kpi">
            <div class="kpi__item">
              <div class="label">Последний результат</div>
              <div class="value">${accuracy===null ? '—' : (accuracy+'%')}</div>
            </div>
            <div class="kpi__item">
              <div class="label">Сессий тестов</div>
              <div class="value">${(state.history||[]).length}</div>
            </div>
          </div>

          <div class="mt3 row">
            <button class="btn" id="goFocus">Пройти фокус‑тест</button>
            <button class="btn btn--ghost" id="goLibrary">Открыть базу знаний</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="row row--between">
            <div>
              <div class="h2">Фокус (Базовый + Оптимальный)</div>
              <p class="p">Быстрый доступ к приоритетным уровням.</p>
            </div>
            <span class="badge badge--focus">Focus</span>
          </div>

          <div class="list">
            ${focusCards}
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Рекомендации</div>
          <div class="list">
            <div class="item" data-href="#/tests">
              <div class="item__title">Тесты без логических ошибок</div>
              <div class="item__sub">Если ответ может быть в нескольких пакетах — вопрос становится множественным выбором.</div>
            </div>
            <div class="item" data-href="#/stats">
              <div class="item__title">Статистика</div>
              <div class="item__sub">Смотри прогресс и точность по дням.</div>
            </div>
          </div>
        </div>
      </div>
    `;

    $('#shareBtn').addEventListener('click', copyLink);
    $('#goFocus').addEventListener('click', ()=> navTo('#/test/focus_upgrade'));
    $('#goLibrary').addEventListener('click', ()=> navTo('#/library'));

    $$('.item[data-href]').forEach(el => el.addEventListener('click', ()=> navTo(el.getAttribute('data-href'))));
  };

  const screenLibrary = (query) => {
    setTopbar({
      title: 'Knowledge Base',
      subtitle: 'Пакеты и состав банков',
      right: `<button class="iconbtn" id="shareBtn" aria-label="Скопировать ссылку">${icon('share')}</button>`
    });
    setBottomNav('library', true);

    const q = (query.get('search') || '').trim();
    const focusOnly = query.get('focus') === '1';

    const packCards = P.map(pkg => {
      const vars = pkg.variants.slice().sort((a,b)=>(variantOrder[a.id]||9)-(variantOrder[b.id]||9));
      const shown = focusOnly ? vars.filter(v=>v.id==='base' || v.id==='optimal') : vars;
      const chips = shown.map(v => {
        const hi = (v.id==='base' || v.id==='optimal') ? ' chip--ok' : ' chip--hi';
        return `<span class="chip${hi}">${esc(variantLabelShort(v.id))}</span>`;
      }).join('');

      // simple search match count
      let matchCount = 0;
      if(q){
        for(const v of shown){
          matchCount += (v.what_includes||[]).filter(it => it.toLowerCase().includes(q.toLowerCase())).length;
        }
      }
      const hint = q ? `<div class="item__sub">Совпадений: ${matchCount}</div>` : `<div class="item__sub">${esc(pkg.audience||'')}</div>`;

      return `
        <div class="item" data-href="#/package/${pkg.id}">
          <div class="item__title">${esc(pkg.name)}</div>
          ${hint}
          <div class="mt2 chips">${chips}</div>
        </div>
      `;
    }).join('');

    elView.innerHTML = `
      <div class="page">
        <div class="card">
          <div class="h2">Поиск</div>
          <p class="p">Ищи по названиям банков (например: «закупок», «ФАС», «Путеводитель»).</p>
          <div class="mt3 row" style="gap:12px;">
            <input class="input" id="searchInput" placeholder="Поиск по базе..." value="${esc(q)}" />
            <button class="iconbtn" id="searchBtn" aria-label="Найти">${icon('search')}</button>
          </div>

          <div class="mt3 row row--between">
            <span class="badge">${focusOnly ? 'Показ: Фокус' : 'Показ: Все уровни'}</span>
            <button class="btn btn--ghost" id="toggleFocus">${focusOnly ? 'Показать все' : 'Только Базовый/Оптимальный'}</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="row row--between">
            <div>
              <div class="h2">Пакеты</div>
              <p class="p">Открывай пакет → выбирай уровень → смотри состав.</p>
            </div>
            <span class="badge badge--focus">Learn</span>
          </div>

          <div class="list">
            ${packCards}
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Словарь</div>
          <p class="p">Короткие определения, чтобы быстрее ориентироваться.</p>
          <div class="list">
            <div class="item" data-href="#/glossary">
              <div class="item__title">Открыть словарь</div>
              <div class="item__sub">${esc(CONTENT?.glossary?.length || 0)} терминов</div>
            </div>
          </div>
        </div>
      </div>
    `;

    $('#shareBtn').addEventListener('click', copyLink);

    const doSearch = () => {
      const v = ($('#searchInput').value || '').trim();
      const next = new URLSearchParams(query.toString());
      if(v) next.set('search', v); else next.delete('search');
      navTo(`#/library?${next.toString()}`);
    };
    $('#searchBtn').addEventListener('click', doSearch);
    $('#searchInput').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doSearch(); });

    $('#toggleFocus').addEventListener('click', ()=>{
      const next = new URLSearchParams(query.toString());
      if(focusOnly) next.delete('focus'); else next.set('focus','1');
      navTo(`#/library?${next.toString()}`);
    });

    $$('.item[data-href]').forEach(el => el.addEventListener('click', ()=> navTo(el.getAttribute('data-href'))));
  };

  const groupItems = (items=[]) => {
    const groups = new Map();
    const add = (g, it) => {
      if(!groups.has(g)) groups.set(g, []);
      groups.get(g).push(it);
    };
    for(const it of items){
      const t = it.toLowerCase();
      if(t.startsWith('путеводитель')) add('Путеводители', it);
      else if(t.startsWith('архив')) add('Архивы', it);
      else if(t.includes('суд') || t.includes('судеб') || t.includes('практик') || t.includes('правовые позиции')) add('Судебная практика', it);
      else if(t.includes('законопроект') || t.includes('норматив') || t.includes('международ')) add('Законодательство', it);
      else if(t.includes('пресса') || t.includes('книг') || t.includes('комментар')) add('Пресса и книги', it);
      else add('Инструменты и прочее', it);
    }
    return Array.from(groups.entries());
  };

  const screenPackage = (pkgId, query) => {
    const pkg = packageById(pkgId);
    if(!pkg){
      navTo('#/library');
      return;
    }

    const requestedV = query.get('v');
    const vars = pkg.variants.slice().sort((a,b)=>(variantOrder[a.id]||9)-(variantOrder[b.id]||9));
    let active = vars.find(v=>v.id===requestedV) || vars.find(v=>v.id==='base') || vars[0];

    const showNav = false;

    setTopbar({
      title: pkg.name,
      subtitle: pkg.audience || 'Пакет',
      backHref: '#/library',
      right: `<button class="iconbtn" id="shareBtn" aria-label="Скопировать ссылку">${icon('share')}</button>`,
      hideLogo:true,
    });
    setBottomNav('library', showNav);

    const tabs = `
      <div class="tabs">
        ${vars.map(v => `
          <div class="tab ${v.id===active.id?'tab--active':''}" data-vid="${v.id}">
            ${esc(variantLabelShort(v.id))}
          </div>
        `).join('')}
      </div>
    `;

    const focusBadge = (active.id==='base' || active.id==='optimal')
      ? `<span class="badge badge--focus">Фокус</span>`
      : `<span class="badge">Дополнительно</span>`;

    const groups = groupItems(active.what_includes || []);
    const highlight = (text) => {
      const q = (query.get('search')||'').trim();
      if(!q) return esc(text);
      const idx = text.toLowerCase().indexOf(q.toLowerCase());
      if(idx === -1) return esc(text);
      const before = esc(text.slice(0, idx));
      const mid = esc(text.slice(idx, idx+q.length));
      const after = esc(text.slice(idx+q.length));
      return `${before}<span style="color:rgba(255,255,255,.95);text-shadow:0 0 18px rgba(168,85,247,.25)">${mid}</span>${after}`;
    };

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <div class="row row--between">
            <div>
              <h1 class="hero__title">${esc(pkg.name.replace('СПС ',''))}</h1>
              <p class="hero__subtitle">${esc(pkg.audience || '')}</p>
            </div>
            ${focusBadge}
          </div>

          <div class="mt3">
            ${tabs}
          </div>

          <div class="mt3 chips">
            <span class="chip chip--hi">${esc(active.name || ('Смарт-комплект '+variantLabelShort(active.id)))}</span>
            ${active.docs_count ? `<span class="chip">Документов: ${esc(active.docs_count)}</span>` : ''}
          </div>

          <div class="mt3">
            <button class="btn btn--ghost" id="startTest">Тест по отличиям уровней</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Что входит</div>
          <p class="p">Состав информационных банков (по твоему файлу). Для поиска используй экран Knowledge Base.</p>

          ${groups.map(([g,arr]) => `
            <div class="divider"></div>
            <div class="h2" style="font-size:16px; margin-bottom: 10px;">${esc(g)}</div>
            <ul style="margin:0; padding-left: 18px; color: rgba(244,247,255,.86);">
              ${arr.map(it => `<li style="margin: 10px 0; line-height: 1.35; color: rgba(244,247,255,.86);">${highlight(it)}</li>`).join('')}
            </ul>
          `).join('')}
        </div>

        <div class="card mt3">
          <div class="h2">Поделиться</div>
          <p class="p">Ссылка сохранит выбранный пакет и уровень — удобно открывать в Telegram.</p>
          <button class="btn" id="copyLink">Скопировать ссылку</button>
        </div>
      </div>
    `;

    $('#shareBtn').addEventListener('click', copyLink);
    $('#copyLink').addEventListener('click', copyLink);

    $$('.tab[data-vid]').forEach(el => {
      el.addEventListener('click', ()=>{
        const vid = el.getAttribute('data-vid');
        const next = new URLSearchParams(query.toString());
        next.set('v', vid);
        navTo(`#/package/${pkgId}?${next.toString()}`);
      });
    });

    $('#startTest').addEventListener('click', ()=> navTo('#/test/focus_upgrade'));
  };

  const screenGlossary = () => {
    setTopbar({ title:'Glossary', subtitle:'Термины и определения', backHref:'#/library', right:'', hideLogo:true });
    setBottomNav('library', false);

    const items = (CONTENT.glossary || []).map(t => `
      <div class="item">
        <div class="item__title">${esc(t.term)}</div>
        <div class="item__sub">${esc(t.desc)}</div>
      </div>
    `).join('');

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">Словарь</h1>
          <p class="hero__subtitle">Короткие определения, чтобы быстрее ориентироваться в составе пакетов.</p>
        </div>

        <div class="card mt3">
          <div class="list">
            ${items || '<div class="p">Пока пусто.</div>'}
          </div>
        </div>
      </div>
    `;
  };

  const screenTestsHub = () => {
    setTopbar({ title:'Tests', subtitle:'Логически корректные вопросы', right:'' });
    setBottomNav('tests', true);

    const cards = TEST_CATALOG.map(t => `
      <div class="item" data-href="#/test/${t.id}">
        <div class="item__title">${esc(t.title)}</div>
        <div class="item__sub">${esc(t.subtitle || '')}</div>
        <div class="mt2 chips">
          ${(t.tags||[]).slice(0,3).map(tag => `<span class="chip">${esc(tag)}</span>`).join('')}
          <span class="chip chip--hi">${esc(t.difficulty || '—')}</span>
        </div>
      </div>
    `).join('');

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">Тесты</h1>
          <p class="hero__subtitle">Правило качества: если пункт входит в несколько пакетов — вопрос становится множественным выбором (или формулируется через «отличия уровней»).</p>
        </div>

        <div class="card mt3">
          <div class="h2">Доступные тесты</div>
          <div class="list">
            ${cards}
          </div>
        </div>
      </div>
    `;

    $$('.item[data-href]').forEach(el => el.addEventListener('click', ()=> navTo(el.getAttribute('data-href'))));
  };

  // ---------- Test runner ----------
  let session = null; // current test session

  const normalizeFill = (s) => (s||'')
    .toLowerCase()
    .replace(/ё/g,'е')
    .trim()
    .replace(/\s+/g,' ');

  const setsEqual = (a,b) => {
    const A = new Set(a);
    const B = new Set(b);
    if(A.size !== B.size) return false;
    for(const x of A) if(!B.has(x)) return false;
    return true;
  };

  const renderTestQuestion = () => {
    const q = session.questions[session.idx];
    const total = session.questions.length;
    const num = session.idx + 1;
    const progress = Math.round((num/total)*100);

    // topbar for test
    setTopbar({
      title: session.title,
      subtitle: `${num}/${total}`,
      backHref: '#/tests',
      right: `<button class="iconbtn" id="shareBtn" aria-label="Скопировать ссылку">${icon('share')}</button>`,
      hideLogo:true,
    });
    setBottomNav('tests', false);

    const qTitle = esc(q.prompt || 'Вопрос');
    const stem = q.stem ? `<div class="qstem">${esc(q.stem)}</div>` : '';

    const renderOptionsSingle = () => `
      <div class="options">
        ${(q.options||[]).map(opt => `
          <button class="opt" data-opt="${esc(opt.id)}">
            <div style="font-weight:700; letter-spacing:-0.01em;">${esc(opt.text)}</div>
          </button>
        `).join('')}
      </div>
    `;

    const renderOptionsMultiple = () => `
      <div class="options">
        ${(q.options||[]).map(opt => `
          <button class="opt" data-opt="${esc(opt.id)}" data-multi="1">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <div style="font-weight:700; letter-spacing:-0.01em;">${esc(opt.text)}</div>
              <small>tap</small>
            </div>
          </button>
        `).join('')}
      </div>
      <div class="mt3">
        <button class="btn" id="checkMulti">Проверить</button>
      </div>
    `;

    const renderBoolean = () => `
      <div class="options">
        <button class="opt" data-bool="true"><div style="font-weight:700;">Верно</div></button>
        <button class="opt" data-bool="false"><div style="font-weight:700;">Неверно</div></button>
      </div>
    `;

    const renderFill = () => `
      <div class="mt3">
        <input class="input" id="fillInput" placeholder="Введи ответ..." />
        <div class="mt3"><button class="btn" id="checkFill">Проверить</button></div>
      </div>
    `;

    const renderMatching = () => {
      const left = q.left || [];
      const right = q.right || [];
      return `
        <div class="mt3">
          ${left.map(li => `
            <div class="item" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <div style="font-weight:700; max-width:55%;">${esc(li.text)}</div>
              <select class="input" data-left="${esc(li.id)}" style="max-width:45%; padding:12px 14px;">
                <option value="">— выбери —</option>
                ${right.map(ri => `<option value="${esc(ri.id)}">${esc(ri.text)}</option>`).join('')}
              </select>
            </div>
          `).join('')}
          <div class="mt3"><button class="btn" id="checkMatch">Проверить</button></div>
        </div>
      `;
    };

    const renderOrdering = () => {
      const items = q.items || [];
      return `
        <div class="mt3" id="orderList">
          ${items.map((it, idx) => `
            <div class="item" data-item="${esc(it.id)}" style="display:flex; align-items:center; justify-content:space-between; gap:12px;">
              <div style="font-weight:700;">${esc(it.text)}</div>
              <div class="row" style="gap:8px;">
                <button class="iconbtn" data-move="up" aria-label="Вверх" style="width:38px;height:38px;">▲</button>
                <button class="iconbtn" data-move="down" aria-label="Вниз" style="width:38px;height:38px;">▼</button>
              </div>
            </div>
          `).join('')}
          <div class="mt3"><button class="btn" id="checkOrder">Проверить</button></div>
        </div>
      `;
    };

    elView.innerHTML = `
      <div class="page">
        <div class="card qcard">
          <div class="qmeta">
            <div>${esc((q.topic||'') || '')}</div>
            <div>${esc(q.difficulty || '')}</div>
          </div>
          <div class="mt3 progress"><div style="width:${progress}%;"></div></div>
          <div class="qtitle">${qTitle}</div>
          ${stem}

          ${q.type === 'single' ? renderOptionsSingle() : ''}
          ${q.type === 'multiple' ? renderOptionsMultiple() : ''}
          ${q.type === 'boolean' ? renderBoolean() : ''}
          ${q.type === 'fill' ? renderFill() : ''}
          ${q.type === 'matching' ? renderMatching() : ''}
          ${q.type === 'ordering' ? renderOrdering() : ''}

          <div class="explain hidden" id="explain"></div>
          <div class="mt3 hidden" id="nextWrap">
            <button class="btn" id="nextBtn">Дальше</button>
          </div>
        </div>
      </div>
    `;

    $('#shareBtn').addEventListener('click', copyLink);

    const showExplain = (isCorrect) => {
      const ex = $('#explain');
      ex.classList.remove('hidden');
      ex.innerHTML = `<b style="color:${isCorrect?'rgba(214,255,228,.95)':'rgba(255,247,214,.95)'}">${isCorrect?'Верно':'Есть ошибка'}</b><br/>${esc(q.explanation || '—')}`;
      $('#nextWrap').classList.remove('hidden');
    };

    const lockOptions = () => {
      $$('.opt').forEach(el => el.disabled = true);
      const checkBtn = $('#checkMulti') || $('#checkFill') || $('#checkMatch') || $('#checkOrder');
      if(checkBtn) checkBtn.disabled = true;
      const fill = $('#fillInput');
      if(fill) fill.disabled = true;
      $$('select').forEach(sel => sel.disabled = true);
      $$('button[data-move]').forEach(btn => btn.disabled = true);
    };

    const recordAnswer = (isCorrect, picked) => {
      if(isCorrect) session.correct++; else session.wrong++;
      session.answers.push({
        qid: q.id,
        correct: isCorrect,
        picked,
        topic: q.topic || null,
        tags: q.tags || [],
        ref: q.ref || null,
      });
    };

    const finalize = () => {
      lockOptions();
      $('#nextBtn').addEventListener('click', () => {
        if(session.idx < session.questions.length - 1){
          session.idx++;
          renderTestQuestion();
        }else{
          navTo('#/test-result');
        }
      });
    };

    // --- handlers by type ---
    if(q.type === 'single'){
      $$('.opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const picked = btn.getAttribute('data-opt');
          const isCorrect = (q.answer || []).includes(picked);
          // mark
          $$('.opt').forEach(x => {
            const id = x.getAttribute('data-opt');
            if((q.answer||[]).includes(id)) x.classList.add('opt--correct');
            if(id === picked && !isCorrect) x.classList.add('opt--wrong');
          });
          recordAnswer(isCorrect, [picked]);
          showExplain(isCorrect);
          finalize();
        });
      });
    }

    if(q.type === 'multiple'){
      const picked = new Set();
      $$('.opt[data-multi="1"]').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-opt');
          if(picked.has(id)) picked.delete(id); else picked.add(id);
          btn.classList.toggle('opt--selected', picked.has(id));
        });
      });
      $('#checkMulti').addEventListener('click', () => {
        const correct = q.answer || [];
        const pickedArr = Array.from(picked);
        const isCorrect = setsEqual(correct, pickedArr);

        $$('.opt[data-multi="1"]').forEach(x => {
          const id = x.getAttribute('data-opt');
          if(correct.includes(id)) x.classList.add('opt--correct');
          if(picked.has(id) && !correct.includes(id)) x.classList.add('opt--wrong');
        });

        recordAnswer(isCorrect, pickedArr);
        showExplain(isCorrect);
        finalize();
      });
    }

    if(q.type === 'boolean'){
      $$('.opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const val = btn.getAttribute('data-bool') === 'true';
          const isCorrect = (q.answer === val);
          // mark chosen
          btn.classList.add(isCorrect ? 'opt--correct' : 'opt--wrong');
          recordAnswer(isCorrect, [String(val)]);
          showExplain(isCorrect);
          finalize();
        });
      });
    }

    if(q.type === 'fill'){
      $('#checkFill').addEventListener('click', () => {
        const val = normalizeFill($('#fillInput').value || '');
        const accepted = (q.accepted || []).map(normalizeFill);
        const isCorrect = accepted.includes(val);

        // style input with result
        const inp = $('#fillInput');
        inp.style.borderColor = isCorrect ? 'rgba(34,197,94,.45)' : 'rgba(251,191,36,.55)';
        inp.style.background = isCorrect ? 'rgba(34,197,94,.10)' : 'rgba(251,191,36,.10)';

        recordAnswer(isCorrect, [val]);
        showExplain(isCorrect);
        finalize();
      });
    }

    if(q.type === 'matching'){
      $('#checkMatch').addEventListener('click', () => {
        const picks = {};
        $$('select[data-left]').forEach(sel => {
          picks[sel.getAttribute('data-left')] = sel.value || '';
        });

        const ans = q.answer || {};
        let ok = true;
        for(const leftId of Object.keys(ans)){
          if(picks[leftId] !== ans[leftId]) ok = false;
        }

        // mark selects
        $$('select[data-left]').forEach(sel => {
          const leftId = sel.getAttribute('data-left');
          if(!leftId) return;
          if(picks[leftId] === ans[leftId]) sel.style.borderColor = 'rgba(34,197,94,.45)';
          else sel.style.borderColor = 'rgba(251,191,36,.55)';
        });

        recordAnswer(ok, picks);
        showExplain(ok);
        finalize();
      });
    }

    if(q.type === 'ordering'){
      const list = $('#orderList');
      const move = (itemEl, dir) => {
        if(dir === 'up' && itemEl.previousElementSibling && itemEl.previousElementSibling.classList.contains('item')){
          list.insertBefore(itemEl, itemEl.previousElementSibling);
        }
        if(dir === 'down' && itemEl.nextElementSibling && itemEl.nextElementSibling.classList.contains('item')){
          list.insertBefore(itemEl.nextElementSibling, itemEl);
        }
      };
      $$('button[data-move]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const dir = btn.getAttribute('data-move');
          const itemEl = btn.closest('.item');
          move(itemEl, dir);
        });
      });

      $('#checkOrder').addEventListener('click', () => {
        const current = $$('#orderList .item[data-item]').map(el => el.getAttribute('data-item'));
        const ans = q.answer || [];
        const ok = setsEqual(current, ans) && current.every((v,i)=>v===ans[i]);

        // mark items
        $$('#orderList .item[data-item]').forEach((el, idx) => {
          const id = el.getAttribute('data-item');
          if(id === ans[idx]) el.style.borderColor = 'rgba(34,197,94,.45)';
          else el.style.borderColor = 'rgba(251,191,36,.55)';
        });

        recordAnswer(ok, current);
        showExplain(ok);
        finalize();
      });
    }
  };

  const screenTestStart = (testId) => {
    const t = TEST_CATALOG.find(x => x.id === testId);
    if(!t){
      navTo('#/tests');
      return;
    }

    setTopbar({ title: t.title, subtitle: t.subtitle || '', backHref:'#/tests', right:'', hideLogo:true });
    setBottomNav('tests', false);

    const note = (t.kind === 'generated')
      ? 'Вопросы генерируются из базы знаний, поэтому всегда соответствуют текущим данным.'
      : 'Вопросы заранее подготовлены и содержат объяснения и ссылки на базу знаний.';

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">${esc(t.title)}</h1>
          <p class="hero__subtitle">${esc(t.subtitle || '')}</p>

          <div class="mt3 chips">
            <span class="chip chip--hi">${esc(t.difficulty || '—')}</span>
            ${(t.tags||[]).slice(0,4).map(tag => `<span class="chip">${esc(tag)}</span>`).join('')}
          </div>

          <div class="mt3">
            <button class="btn" id="startBtn">Начать</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Как устроено</div>
          <p class="p">${esc(note)}</p>
          <div class="divider"></div>
          <p class="p">Подсказка: если пункт входит в несколько пакетов — нужно выбрать все корректные варианты.</p>
        </div>
      </div>
    `;

    $('#startBtn').addEventListener('click', () => {
      session = buildTestSession(testId);
      if(!session || !session.questions.length){
        toast('Нет вопросов для этого теста');
        return;
      }
      navTo('#/test-run');
    });
  };

  const screenTestRun = () => {
    if(!session){
      navTo('#/tests');
      return;
    }
    renderTestQuestion();
  };

  const screenTestResult = () => {
    if(!session){
      navTo('#/tests');
      return;
    }

    const total = session.questions.length;
    const correct = session.correct;
    const wrong = session.wrong;
    const acc = total ? Math.round((correct/total)*100) : 0;

    // group by topic
    const byTopic = {};
    for(const a of session.answers){
      const t = a.topic || 'Без темы';
      if(!byTopic[t]) byTopic[t] = { total:0, correct:0 };
      byTopic[t].total++;
      if(a.correct) byTopic[t].correct++;
    }

    // save history
    const rec = {
      id: session.id,
      testId: session.testId,
      date: todayISO(),
      ts: Date.now(),
      correct, total,
      accuracy: acc,
      tags: (TEST_CATALOG.find(t=>t.id===session.testId)?.tags)||[],
    };
    state.history = (state.history || []).concat([rec]).slice(-200);
    state.lastRoute = '#/home';
    saveState();

    setTopbar({ title:'Results', subtitle: `${acc}% • ${correct}/${total}`, backHref:'#/tests', right:'', hideLogo:true });
    setBottomNav('tests', false);

    const topicCards = Object.entries(byTopic).map(([t,v]) => {
      const p = v.total ? Math.round((v.correct/v.total)*100) : 0;
      return `
        <div class="item">
          <div class="item__title">${esc(t)}</div>
          <div class="item__sub">Точность: ${p}% • ${v.correct}/${v.total}</div>
        </div>
      `;
    }).join('');

    const wrongList = session.answers
      .filter(a=>!a.correct)
      .slice(0,8)
      .map((a,idx) => `
        <div class="item" data-href="${esc(a.ref || '#/library')}">
          <div class="item__title">Ошибка #${idx+1}</div>
          <div class="item__sub">Открыть материал для повторения</div>
        </div>
      `).join('');

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">${acc}%</h1>
          <p class="hero__subtitle">Верно: ${correct} • Ошибок: ${wrong}</p>
          <div class="mt3 row">
            <button class="btn" id="againBtn">Пройти ещё раз</button>
            <button class="btn btn--ghost" id="toStatsBtn">Статистика</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">По темам</div>
          <div class="list">
            ${topicCards || '<div class="p">—</div>'}
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Что повторить</div>
          <p class="p">Открывай материал и возвращайся к тестам.</p>
          <div class="list">
            ${wrongList || '<div class="p">Ошибок нет — отлично ✅</div>'}
          </div>
        </div>
      </div>
    `;

    $('#againBtn').addEventListener('click', ()=>{
      // new session same test
      const tid = session.testId;
      session = null;
      navTo(`#/test/${tid}`);
    });
    $('#toStatsBtn').addEventListener('click', ()=> navTo('#/stats'));

    $$('.item[data-href]').forEach(el => el.addEventListener('click', ()=> navTo(el.getAttribute('data-href'))));
  };

  // ---------- Stats ----------
  const computeStreak = (history) => {
    const days = new Set((history||[]).map(h=>h.date));
    let streak=0;
    let d = new Date();
    for(;;){
      const iso = d.toISOString().slice(0,10);
      if(days.has(iso)){
        streak++;
        d.setDate(d.getDate()-1);
      }else break;
    }
    return streak;
  };

  const screenStats = () => {
    setTopbar({ title:'Statistics', subtitle:'Прогресс и точность', right:'' });
    setBottomNav('stats', true);

    const hist = state.history || [];
    const streak = computeStreak(hist);

    // last 7 days accuracy avg
    const days = [];
    for(let i=6;i>=0;i--){
      const d = new Date();
      d.setDate(d.getDate()-i);
      const iso = d.toISOString().slice(0,10);
      days.push(iso);
    }
    const byDay = {};
    for(const day of days) byDay[day] = [];
    for(const h of hist){
      if(byDay[h.date]) byDay[h.date].push(h.accuracy);
    }
    const series = days.map(day => {
      const arr = byDay[day];
      const avg = arr.length ? Math.round(arr.reduce((a,b)=>a+b,0)/arr.length) : null;
      return { day, value: avg };
    });

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">Progress</h1>
          <p class="hero__subtitle">Streak: <b style="color:rgba(255,255,255,.95)">${streak}</b> дней • Всего сессий: <b style="color:rgba(255,255,255,.95)">${hist.length}</b></p>
          <div class="mt3 chips">
            <span class="chip chip--hi">7 дней</span>
            <span class="chip">Точность</span>
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Точность (последние 7 дней)</div>
          <p class="p">Пустые дни показываются как «—».</p>
          <div class="mt3" style="width:100%; overflow:hidden;">
            <canvas id="chart" width="800" height="280" style="width:100%; height:auto;"></canvas>
          </div>

          <div class="divider"></div>
          <div class="list">
            ${series.map(s => `
              <div class="item">
                <div class="item__title">${esc(s.day)}</div>
                <div class="item__sub">Точность: ${s.value===null?'—':(s.value+'%')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    // draw chart
    const c = $('#chart');
    const ctx = c.getContext('2d');
    const W = c.width, H = c.height;
    ctx.clearRect(0,0,W,H);

    // chart area
    const pad = {l:44, r:18, t:18, b:34};
    const x0=pad.l, y0=pad.t, w=W-pad.l-pad.r, h=H-pad.t-pad.b;

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    for(let i=0;i<=4;i++){
      const y = y0 + (h*(i/4));
      ctx.beginPath(); ctx.moveTo(x0,y); ctx.lineTo(x0+w,y); ctx.stroke();
    }

    // labels (0-100)
    ctx.fillStyle = 'rgba(244,247,255,0.55)';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    [100,75,50,25,0].forEach((val,i)=>{
      const y = y0 + (h*(i/4));
      ctx.fillText(String(val), 8, y);
    });

    // points
    const pts = series.map((s,i)=>{
      const x = x0 + (w*(i/(series.length-1)));
      const v = (s.value===null?0:s.value);
      const y = y0 + h - (h*(v/100));
      return {x,y,v:s.value};
    });

    // line
    ctx.strokeStyle = 'rgba(168,85,247,0.95)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    pts.forEach((p,i)=>{
      if(i===0) ctx.moveTo(p.x,p.y);
      else ctx.lineTo(p.x,p.y);
    });
    ctx.stroke();

    // dots
    pts.forEach((p,i)=>{
      ctx.beginPath();
      ctx.fillStyle = (series[i].value===null) ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)';
      ctx.arc(p.x,p.y,4,0,Math.PI*2);
      ctx.fill();
      ctx.beginPath();
      ctx.fillStyle = 'rgba(168,85,247,0.55)';
      ctx.arc(p.x,p.y,9,0,Math.PI*2);
      ctx.fill();
    });

    // x labels
    ctx.fillStyle = 'rgba(244,247,255,0.55)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    series.forEach((s,i)=>{
      const x = x0 + (w*(i/(series.length-1)));
      ctx.fillText(s.day.slice(5), x, y0+h+8);
    });
  };

  // ---------- Profile ----------
  const screenProfile = () => {
    setTopbar({ title:'Profile', subtitle:'Настройки и Docs', right:'' });
    setBottomNav('profile', true);

    const goalName = {
      prepare: 'Подготовка',
      improve: 'Улучшить знания',
      practice: 'Практика',
    }[state.goal] || 'Не выбрано';

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">Profile</h1>
          <p class="hero__subtitle">Цель: <b style="color:rgba(255,255,255,.95)">${esc(goalName)}</b></p>

          <div class="mt3 row">
            <button class="btn" id="editGoal">Сменить цель</button>
            <button class="btn btn--ghost" id="reset">Сбросить прогресс</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="row row--between">
            <div>
              <div class="h2">Premium (демо)</div>
              <p class="p">Ненавязчивый paywall для премиального опыта. Это демо‑переключатель, оплаты нет.</p>
            </div>
            <button class="iconbtn" id="togglePremium" aria-label="Premium">${icon('crown')}</button>
          </div>
          <div class="mt3 chips">
            <span class="chip ${state.premium?'chip--ok':'chip--warn'}">${state.premium?'Premium: ON':'Premium: OFF'}</span>
          </div>

          <div class="mt3">
            <button class="btn btn--ghost" id="openPaywall">Открыть экран Premium</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Docs / Артефакты</div>
          <p class="p">PRD, Knowledge Base, дизайн‑система, ТЗ по тестам, QA чек‑лист — всё в репозитории.</p>
          <div class="list">
            <div class="item" data-ext="./docs/KnowledgeBase.md">
              <div class="item__title">Knowledge Base</div>
              <div class="item__sub">Полная спецификация продукта</div>
            </div>
            <div class="item" data-ext="./docs/UI-Spec.md">
              <div class="item__title">UI Spec</div>
              <div class="item__sub">Экраны → блоки → состояния → события</div>
            </div>
            <div class="item" data-ext="./docs/Testing-Engine-Spec.md">
              <div class="item__title">Testing Engine Spec</div>
              <div class="item__sub">Типы вопросов, валидация, скоринг</div>
            </div>
            <div class="item" data-ext="./docs/Design-System.md">
              <div class="item__title">Design System</div>
              <div class="item__sub">Токены и компоненты</div>
            </div>
            <div class="item" data-ext="./docs/QA-Checklist.md">
              <div class="item__title">QA Checklist</div>
              <div class="item__sub">Smoke + regression ядра</div>
            </div>
          </div>
          <div class="mt3">
            <p class="p"><b>Важно:</b> в Telegram WebView markdown может открываться как текст — это нормально. На GitHub читается красиво.</p>
          </div>
        </div>
      </div>
    `;

    $('#editGoal').addEventListener('click', ()=> navTo('#/onboarding'));
    $('#reset').addEventListener('click', ()=>{
      if(confirm('Сбросить прогресс тестов и настройки?')){
        state = defaultState();
        saveState();
        toast('Сброшено');
        navTo('#/splash');
      }
    });

    $('#togglePremium').addEventListener('click', ()=>{
      state.premium = !state.premium;
      saveState();
      toast(state.premium ? 'Premium включён (демо)' : 'Premium выключен');
      screenProfile();
    });
    $('#openPaywall').addEventListener('click', ()=> navTo('#/paywall'));

    $$('[data-ext]').forEach(el => {
      el.addEventListener('click', ()=>{
        const url = el.getAttribute('data-ext');
        // open in same tab (works in GitHub Pages and Telegram)
        window.location.href = url;
      });
    });
  };

  const screenPaywall = () => {
    setTopbar({ title:'Premium', subtitle:'Ненавязчиво и красиво', backHref:'#/profile', right:'', hideLogo:true });
    setBottomNav('profile', false);

    elView.innerHTML = `
      <div class="page">
        <div class="card hero">
          <h1 class="hero__title">Learn Premium</h1>
          <p class="hero__subtitle">Больше тестов, умная аналитика, режим «экзамен». Экран — для UX‑ощущения. Реальных платежей нет.</p>

          <div class="mt3 chips">
            <span class="chip chip--hi">Pro</span>
            <span class="chip">No ads</span>
            <span class="chip">Analytics</span>
          </div>

          <div class="mt3 row">
            <button class="btn" id="buy">Оформить (демо)</button>
            <button class="btn btn--ghost" id="restore">Восстановить (демо)</button>
          </div>
        </div>

        <div class="card mt3">
          <div class="h2">Преимущества</div>
          <div class="list">
            <div class="item"><div class="item__title">Экзамены</div><div class="item__sub">Длинные наборы вопросов с разбором ошибок.</div></div>
            <div class="item"><div class="item__title">Слабые темы</div><div class="item__sub">Показываем, что повторить в первую очередь.</div></div>
            <div class="item"><div class="item__title">Микро‑анимации</div><div class="item__sub">Премиальный опыт без перегруза.</div></div>
          </div>
        </div>
      </div>
    `;

    $('#buy').addEventListener('click', ()=>{
      state.premium = true;
      saveState();
      toast('Premium включён (демо)');
      navTo('#/profile');
    });
    $('#restore').addEventListener('click', ()=>{
      toast('Нечего восстанавливать (демо)');
    });
  };

  // ---------- Router dispatcher ----------
  const render = () => {
    const r = parseRoute();

    // remember last main route
    if(['/home','/library','/tests','/stats','/profile'].includes(r.path)){
      state.lastRoute = '#'+r.raw;
      saveState();
    }

    if(r.path === '/' || r.path === '/splash'){
      screenSplash();
      return;
    }
    if(r.path === '/onboarding'){
      screenOnboarding();
      return;
    }
    if(r.path === '/home'){
      screenHome();
      return;
    }
    if(r.path === '/library'){
      screenLibrary(r.query);
      return;
    }
    if(r.path.startsWith('/package')){
      const pkgId = r.parts[1];
      screenPackage(pkgId, r.query);
      return;
    }
    if(r.path === '/glossary'){
      screenGlossary();
      return;
    }
    if(r.path === '/tests'){
      screenTestsHub();
      return;
    }
    if(r.path.startsWith('/test') && r.parts.length === 2){
      // /test/:id  -> start screen
      const testId = r.parts[1];
      screenTestStart(testId);
      return;
    }
    if(r.path === '/test-run'){
      screenTestRun();
      return;
    }
    if(r.path === '/test-result'){
      screenTestResult();
      return;
    }
    if(r.path === '/stats'){
      screenStats();
      return;
    }
    if(r.path === '/profile'){
      screenProfile();
      return;
    }
    if(r.path === '/paywall'){
      screenPaywall();
      return;
    }

    // fallback
    navTo('#/home');
  };

  window.addEventListener('hashchange', render);

  // init
  if(!location.hash){
    navTo('#/splash');
  }else{
    render();
  }
})();
