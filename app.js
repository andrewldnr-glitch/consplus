/* global CONTENT */
(() => {
  const $ = (s, el=document) => el.querySelector(s);
  const $$ = (s, el=document) => Array.from(el.querySelectorAll(s));

  const stage = $('#stage');
  const backBtn = $('#backBtn');
  const shareBtn = $('#shareBtn');
  const titleTop = $('#titleTop');
  const titleSub = $('#titleSub');

  function esc(str){
    return String(str ?? '').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#39;'
    }[c]));
  }
  function norm(s){
    return String(s || '').toLowerCase().replace(/ё/g,'е');
  }

  // --- Router ---
  function parseRoute(){
    const raw = (location.hash || '#/home').replace(/^#/, '');
    const parts = raw.split('/').filter(Boolean);
    const page = parts[0] || 'home';
    if(page === 'pkg') return {page:'pkg', pkgId: parts[1], variantId: parts[2]};
    return {page};
  }

  function setActiveTab(route){
    const tab = route.page === 'pkg' ? 'home' : route.page;
    $$('.tab').forEach(a => a.classList.toggle('active', a.dataset.tab === tab));
  }

  function setHeader(route, payload={}){
    if(route.page === 'home'){
      titleTop.textContent = 'Шпаргалка';
      titleSub.textContent = 'КонсультантПлюс';
    }else if(route.page === 'search'){
      titleTop.textContent = 'Поиск';
      titleSub.textContent = 'по банкам и пакетам';
    }else if(route.page === 'focus'){
      titleTop.textContent = 'Фокус';
      titleSub.textContent = 'Базовый и Оптимальный';
    }else if(route.page === 'quiz'){
      titleTop.textContent = 'Тест';
      titleSub.textContent = 'проверка знаний пакетов';
    }else if(route.page === 'glossary'){
      titleTop.textContent = 'Словарь';
      titleSub.textContent = 'краткие термины';
    }else if(route.page === 'pkg'){
      titleTop.textContent = payload.titleTop || 'Комплект';
      titleSub.textContent = payload.titleSub || '';
    }else{
      titleTop.textContent = 'Шпаргалка';
      titleSub.textContent = 'КонсультантПлюс';
    }
  }

  function canGoBack(){
    // if user opened a pkg, back should go to home/focus/search
    const route = parseRoute();
    return route.page === 'pkg';
  }

  backBtn.addEventListener('click', () => {
    if(canGoBack()) location.hash = '#/home';
  });

  shareBtn.addEventListener('click', async () => {
    try{
      await navigator.clipboard.writeText(location.href);
      const old = shareBtn.innerHTML;
      shareBtn.innerHTML = '<span class="ic">✓</span>';
      setTimeout(()=> shareBtn.innerHTML = old, 900);
    }catch(e){
      alert('В этом режиме не удалось скопировать ссылку. Можно скопировать вручную из адресной строки.');
    }
  });

  // --- Data helpers ---
  const PKGS = CONTENT.packages || [];

  function getPkg(id){ return PKGS.find(p => p.id === id); }
  function getVariant(pkg, vid){ return (pkg?.variants || []).find(v => v.id === vid); }

  // Simple grouping heuristic (keywords)
  const GROUPS = [
    { id:'law', title:'Законодательство', match: [/законодательств/i, /законопроект/i, /проект.*норматив/i, /международн/i, /документ.*ссср/i] },
    { id:'practice', title:'Судебная практика', match: [/судебн/i, /арбитраж/i, /кассац/i, /апелляц/i, /суд по интеллект/i, /супермассив/i, /правовые позиции/i, /подборки судебн/i] },
    { id:'guides', title:'Путеводители', match: [/путеводител/i] },
    { id:'letters', title:'Разъяснения и консультации', match: [/разъясня/i, /вопросы-ответы/i, /горячей линии/i, /корреспонденц/i] },
    { id:'forms', title:'Формы и договоры', match: [/деловые бумаги/i, /дополнительные формы/i, /конструктор договор/i] },
    { id:'archives', title:'Архивы', match: [/архив/i, /фас/i, /уфас/i] },
    { id:'press', title:'Пресса и комментарии', match: [/пресса/i, /комментар/i, /книг/i] },
    { id:'industry', title:'Отраслевое', match: [/здравоохран/i, /медицина/i, /фармац/i, /отраслевые технические нормы/i, /эксперт-прилож/i, /бюджетн/i] },
  ];

  function groupItems(items){
    const out = new Map();
    for(const g of GROUPS) out.set(g.id, []);
    out.set('other', []);

    for(const it of items){
      const s = String(it);
      let placed = false;
      for(const g of GROUPS){
        if(g.match.some(rx => rx.test(s))){
          out.get(g.id).push(s);
          placed = true;
          break;
        }
      }
      if(!placed) out.get('other').push(s);
    }

    const groups = [];
    for(const g of GROUPS){
      const arr = out.get(g.id);
      if(arr && arr.length) groups.push({id:g.id, title:g.title, items:arr});
    }
    const other = out.get('other');
    if(other && other.length) groups.push({id:'other', title:'Прочее', items:other});
    return groups;
  }

  // --- Rendering ---
  function mount(html){
    stage.innerHTML = html;
    const page = $('.page', stage);
    if(page) page.classList.add('enter');
  }

  function pkgCard(pkg){
    const variants = (pkg.variants || []).slice().sort((a,b)=>{
      const pa = a.priority === 'high' ? 0 : 1;
      const pb = b.priority === 'high' ? 0 : 1;
      return pa - pb;
    });
    const focusCount = variants.filter(v => v.priority === 'high').length;
    const totalCount = variants.length;

    return `
      <div class="card" role="button" tabindex="0" data-open-pkg="${esc(pkg.id)}">
        <div class="card__top">
          <div>
            <div class="card__title">${esc(pkg.name)}</div>
            <div class="card__sub">${esc(pkg.audience || '')}</div>
          </div>
          <div class="badges">
            ${focusCount ? `<span class="badge focus">Фокус</span>` : ''}
            <span class="badge">${totalCount} уровн.</span>
          </div>
        </div>
        <div style="margin-top:10px" class="p">
          Быстрый вход: <span class="kbd">Базовый</span> / <span class="kbd">Оптимальный</span>
        </div>
      </div>
    `;
  }

  function variantCard(pkg, v){
    const badges = `
      ${v.priority === 'high' ? `<span class="badge focus">Фокус</span>` : ''}
      ${v.notes ? `<span class="badge note">примеч.</span>` : ''}
    `;
    const count = (v.what_includes || []).length;
    return `
      <div class="card" role="button" tabindex="0" data-open-variant="${esc(pkg.id)}::${esc(v.id)}">
        <div class="card__top">
          <div>
            <div class="card__title">${esc(v.name)}</div>
            <div class="card__sub">${esc(pkg.name)}</div>
          </div>
          <div class="badges">${badges}</div>
        </div>
        <div class="p" style="margin-top:10px">${count} позиций «что входит»</div>
      </div>
    `;
  }

  function renderHome(){
    setHeader({page:'home'});
    const meta = CONTENT.meta || {};
    const cards = PKGS.map(pkgCard).join('');
    mount(`
      <section class="page">
        <div class="h1">${esc(meta.title || 'Шпаргалка')}</div>
        <div class="p">${esc(meta.focus_note || '')}</div>

        <div class="callout">
          <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px">
            <a class="badge" href="#/quiz" style="text-decoration:none">Пройти тест</a>
            <a class="badge" href="#/glossary" style="text-decoration:none">Открыть словарь</a>
          </div>
          <div style="font-weight:900; margin-bottom:6px">Как пользоваться</div>
          <div class="p" style="margin:0">
            Выбирай направление → уровень комплекта → смотри состав по группам. Для быстрого поиска используй вкладку <span class="kbd">Поиск</span>.
          </div>
        </div>

        <div class="grid">
          ${cards}
        </div>
      </section>
    `);

    // interactions
    $$('[data-open-pkg]').forEach(el => {
      const id = el.dataset.openPkg;
      el.addEventListener('click', () => openPkgBest(id));
      el.addEventListener('keypress', (e)=>{ if(e.key==='Enter') openPkgBest(id); });
    });
  }

  function openPkgBest(pkgId){
    const pkg = getPkg(pkgId);
    if(!pkg) return;
    // Prefer base/optimal if exists
    const preferred = ['base','optimal','prof','expert'];
    const v = preferred.map(id => getVariant(pkg,id)).find(Boolean) || pkg.variants?.[0];
    if(v) location.hash = `#/pkg/${pkgId}/${v.id}`;
  }

  function renderFocus(){
    setHeader({page:'focus'});
    const focusVariants = [];
    for(const pkg of PKGS){
      for(const v of (pkg.variants||[])){
        if(v.priority === 'high') focusVariants.push({pkg, v});
      }
    }
    const cards = focusVariants.map(({pkg,v}) => variantCard(pkg,v)).join('');
    mount(`
      <section class="page">
        <div class="h1">Фокус изучения</div>
        <div class="p">Собрал все комплекты, помеченные как приоритетные (Базовый и Оптимальный).</div>
        <div class="grid">${cards}</div>
      </section>
    `);
    $$('[data-open-variant]').forEach(el => {
      const [pid, vid] = el.dataset.openVariant.split('::');
      el.addEventListener('click', () => location.hash = `#/pkg/${pid}/${vid}`);
      el.addEventListener('keypress', (e)=>{ if(e.key==='Enter') location.hash = `#/pkg/${pid}/${vid}`; });
    });
  }


  function renderQuiz(){
    setHeader({page:'quiz'});
    const allVariants = [];
    for(const pkg of PKGS){
      for(const v of (pkg.variants||[])){
        allVariants.push({pkg, v});
      }
    }

    function variantLabel(x){
      const lvl = x.v.name.replace('Смарт-комплект ', '');
      return `${x.pkg.name} — ${lvl}`;
    }

    function makeQuestions(n=10, focusOnly=false){
      const pool = focusOnly
        ? allVariants.filter(x => x.v.id === 'base' || x.v.id === 'optimal')
        : allVariants.slice();

      const itemMap = new Map();
      for(const x of pool){
        for(const it of (x.v.what_includes||[])){
          const key = it.trim();
          if(!itemMap.has(key)) itemMap.set(key, []);
          itemMap.get(key).push(x);
        }
      }

      const items = Array.from(itemMap.keys()).filter(k => k.length > 3);
      for(let i=items.length-1;i>0;i--){
        const j=Math.floor(Math.random()*(i+1));
        [items[i],items[j]]=[items[j],items[i]];
      }

      const qs=[];
      for(const it of items){
        if(qs.length>=n) break;
        const owners = itemMap.get(it) || [];
        if(!owners.length) continue;
        const correct = owners[Math.floor(Math.random()*owners.length)];

        const opts = [correct];
        while(opts.length<4 && pool.length>opts.length){
          const cand = pool[Math.floor(Math.random()*pool.length)];
          if(!opts.some(o => o.pkg.id===cand.pkg.id && o.v.id===cand.v.id)){
            opts.push(cand);
          }
        }
        for(let i=opts.length-1;i>0;i--){
          const j=Math.floor(Math.random()*(i+1));
          [opts[i],opts[j]]=[opts[j],opts[i]];
        }
        qs.push({
          item: it,
          correctId: `${correct.pkg.id}::${correct.v.id}`,
          options: opts.map(o => ({ id:`${o.pkg.id}::${o.v.id}`, label: variantLabel(o) }))
        });
      }
      return qs;
    }

    mount(`
      <section class="page">
        <div class="h1">Тест по пакетам</div>
        <div class="p">Формат: выбираешь вариант — сразу видишь, правильно или нет. В конце — статистика.</div>

        <div class="block" style="margin-top:10px">
          <div class="block__head" style="cursor:default">
            <div>
              <div class="block__ttl">Настройки</div>
              <div class="block__meta">Можно менять перед стартом</div>
            </div>
          </div>
          <div class="block__body">
            <div class="item">
              <div class="dot"></div>
              <div class="item__txt">
                <div class="item__name">Количество вопросов</div>
                <div class="item__desc">
                  <select id="qCount" style="margin-top:8px; width:100%; padding:10px; border-radius:12px; border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.18); color:rgba(243,248,255,.92)">
                    <option>5</option><option selected>10</option><option>15</option><option>20</option>
                  </select>
                </div>
              </div>
            </div>

            <div class="item">
              <div class="dot"></div>
              <div class="item__txt">
                <div class="item__name">Режим</div>
                <div class="item__desc" style="margin-top:8px">
                  <label style="display:flex; gap:10px; align-items:center">
                    <input type="checkbox" id="focusOnly" checked />
                    <span>Только фокус (Базовый + Оптимальный)</span>
                  </label>
                </div>
              </div>
            </div>

            <div style="margin-top:12px">
              <button class="iconbtn" id="startQuiz" style="width:100%; height:auto; padding:12px 14px; border-radius:18px">
                <span style="font-weight:900">Начать тест</span>
              </button>
            </div>
          </div>
        </div>

        <div id="quizArea" style="margin-top:12px"></div>
      </section>
    `);

    const area = $('#quizArea');
    const startBtn = $('#startQuiz');
    const qCountEl = $('#qCount');
    const focusOnlyEl = $('#focusOnly');

    let state = null;

    function renderQuestion(){
      const q = state.questions[state.idx];
      const progress = `${state.idx+1} / ${state.questions.length}`;
      area.innerHTML = `
        <div class="card">
          <div class="card__top">
            <div>
              <div class="card__title">В каком смарт‑комплекте есть:</div>
              <div class="card__sub">${esc(q.item)}</div>
            </div>
            <div class="badges"><span class="badge">${progress}</span></div>
          </div>

          <div style="margin-top:12px; display:grid; gap:10px" id="opts"></div>

          <div style="margin-top:12px; display:flex; gap:10px">
            <button class="iconbtn" id="nextBtn" style="flex:1; height:auto; padding:12px 14px; border-radius:18px; opacity:.55" disabled>
              <span style="font-weight:900">Дальше</span>
            </button>
            <button class="iconbtn" id="stopBtn" style="width:120px; height:auto; padding:12px 14px; border-radius:18px">
              <span style="font-weight:900">Стоп</span>
            </button>
          </div>

          <div id="fb" class="p" style="margin-top:10px"></div>
        </div>
      `;

      const optsEl = $('#opts');
      const fb = $('#fb');
      const nextBtn = $('#nextBtn');

      let locked = false;

      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'iconbtn';
        btn.style.width = '100%';
        btn.style.height = 'auto';
        btn.style.padding = '12px 14px';
        btn.style.borderRadius = '18px';
        btn.style.justifyContent = 'flex-start';
        btn.style.textAlign = 'left';
        btn.innerHTML = `<span style="font-weight:900">${esc(opt.label)}</span>`;
        btn.addEventListener('click', () => {
          if(locked) return;
          locked = true;

          const ok = opt.id === q.correctId;
          if(ok){
            state.correct++;
            fb.textContent = '✓ Верно';
          }else{
            state.wrong++;
            fb.textContent = '✗ Неверно';
          }

          Array.from(optsEl.children).forEach(child => {
            const id = child.dataset.id;
            if(id === q.correctId){
              child.style.borderColor = 'rgba(34,197,94,.35)';
              child.style.background = 'rgba(34,197,94,.10)';
            }
            if(id === opt.id && !ok){
              child.style.borderColor = 'rgba(251,191,36,.30)';
              child.style.background = 'rgba(251,191,36,.10)';
            }
            child.disabled = true;
            child.style.cursor = 'default';
          });

          nextBtn.disabled = false;
          nextBtn.style.opacity = '1';
        });
        btn.dataset.id = opt.id;
        optsEl.appendChild(btn);
      });

      $('#stopBtn').addEventListener('click', () => renderResult());

      nextBtn.addEventListener('click', () => {
        if(state.idx < state.questions.length - 1){
          state.idx++;
          renderQuestion();
        }else{
          renderResult();
        }
      });
    }

    function renderResult(){
      const total = state.questions.length || 1;
      const ok = state.correct;
      const bad = state.wrong;
      const okPct = Math.round((ok/total)*100);
      const badPct = 100 - okPct;

      area.innerHTML = `
        <div class="card">
          <div class="h1" style="margin:0 0 6px 0">Результат</div>
          <div class="p">Всего вопросов: <span class="kbd">${total}</span></div>

          <div class="block" style="margin-top:10px">
            <div class="block__body">
              <div class="item" style="border-color: rgba(34,197,94,.18); background: rgba(34,197,94,.06)">
                <div class="dot"></div>
                <div class="item__txt">
                  <div class="item__name">Верно</div>
                  <div class="item__desc">${ok} (${okPct}%)</div>
                </div>
              </div>

              <div class="item" style="border-color: rgba(251,191,36,.18); background: rgba(251,191,36,.06)">
                <div class="dot"></div>
                <div class="item__txt">
                  <div class="item__name">Неверно</div>
                  <div class="item__desc">${bad} (${badPct}%)</div>
                </div>
              </div>

              <div style="margin-top:12px; display:flex; gap:10px">
                <button class="iconbtn" id="again" style="flex:1; height:auto; padding:12px 14px; border-radius:18px">
                  <span style="font-weight:900">Ещё раз</span>
                </button>
                <a class="iconbtn" href="#/focus" style="width:140px; height:auto; padding:12px 14px; border-radius:18px; text-decoration:none; display:flex; align-items:center; justify-content:center">
                  <span style="font-weight:900">Фокус</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      `;
      $('#again').addEventListener('click', () => {
        state = null;
        start();
      });
    }

    function start(){
      const n = parseInt(qCountEl.value, 10) || 10;
      const focusOnly = !!focusOnlyEl.checked;
      const qs = makeQuestions(n, focusOnly);
      state = {questions: qs, idx:0, correct:0, wrong:0};
      if(!qs.length){
        area.innerHTML = `<div class="p">Не удалось собрать вопросы (мало данных). Проверь списки «что входит» в базе.</div>`;
        return;
      }
      renderQuestion();
    }

    startBtn.addEventListener('click', start);
  }
  function renderGlossary(){
    setHeader({page:'glossary'});
    const items = (CONTENT.glossary || []).map(x => `
      <div class="item">
        <div class="dot"></div>
        <div class="item__txt">
          <div class="item__name">${esc(x.term)}</div>
          <div class="item__desc">${esc(x.desc)}</div>
        </div>
      </div>
    `).join('');
    mount(`
      <section class="page">
        <div class="h1">Словарь</div>
        <div class="p">Короткие пояснения к словам, которые постоянно встречаются в пакетах.</div>
        ${items || '<div class="p">Пока пусто.</div>'}
      </section>
    `);
  }

  function renderSearch(){
    setHeader({page:'search'});
    mount(`
      <section class="page">
        <div class="h1">Поиск</div>
        <div class="p">Ищи по ключевым словам: <span class="kbd">ФАС</span>, <span class="kbd">закупок</span>, <span class="kbd">путеводитель</span>, <span class="kbd">архив</span>…</div>
        <div class="searchbar">
          <span class="kbd">⌕</span>
          <input id="q" type="search" placeholder="Например: налогам, закупок, ФАС, суд..." autocomplete="off" />
          <span class="kbd" id="cnt">0</span>
        </div>
        <div style="margin-top:12px" id="results"></div>
      </section>
    `);

    const q = $('#q');
    const results = $('#results');
    const cnt = $('#cnt');

    const index = [];
    for(const pkg of PKGS){
      for(const v of (pkg.variants||[])){
        for(const it of (v.what_includes||[])){
          index.push({
            pkgId: pkg.id,
            pkgName: pkg.name,
            variantId: v.id,
            variantName: v.name,
            text: it,
            hay: norm(`${pkg.name}\n${v.name}\n${it}`)
          });
        }
      }
    }

    function renderRes(list){
      cnt.textContent = String(list.length);
      if(!list.length){
        results.innerHTML = `<div class="p">Ничего не найдено. Попробуй другое слово.</div>`;
        return;
      }
      const top = list.slice(0, 40).map(x => `
        <div class="card" data-open-variant="${esc(x.pkgId)}::${esc(x.variantId)}" style="margin-top:10px">
          <div class="card__top">
            <div>
              <div class="card__title">${esc(x.text)}</div>
              <div class="card__sub">${esc(x.pkgName)} → ${esc(x.variantName)}</div>
            </div>
            <div class="badges">
              ${x.variantId === 'base' || x.variantId === 'optimal' ? '<span class="badge focus">Фокус</span>' : ''}
            </div>
          </div>
        </div>
      `).join('');
      results.innerHTML = top + (list.length > 40 ? `<div class="p" style="margin-top:10px">Показаны первые 40 результатов.</div>` : '');
      $$('[data-open-variant]', results).forEach(el => {
        const [pid, vid] = el.dataset.openVariant.split('::');
        el.addEventListener('click', () => location.hash = `#/pkg/${pid}/${vid}`);
      });
    }

    function score(x){
      // prioritize focus packs lightly
      let s = 0;
      if(x.variantId === 'base' || x.variantId === 'optimal') s -= 2;
      return s;
    }

    q.addEventListener('input', () => {
      const qq = norm(q.value).trim();
      if(!qq){ renderRes([]); return; }
      const list = index.filter(x => x.hay.includes(qq)).sort((a,b)=>score(a)-score(b));
      renderRes(list);
    });

    q.focus();
  }

  function renderPkg(pkgId, variantId){
    const pkg = getPkg(pkgId);
    const v = pkg ? getVariant(pkg, variantId) : null;
    if(!pkg || !v){
      setHeader({page:'pkg'}, {titleTop:'Не найдено', titleSub:''});
      mount(`
        <section class="page">
          <div class="h1">Раздел не найден</div>
          <div class="p">Открой другой раздел с главной.</div>
        </section>
      `);
      return;
    }

    setHeader({page:'pkg'}, {titleTop: pkg.name, titleSub: v.name});
    setActiveTab({page:'home'});

    const variants = (pkg.variants || []).slice().sort((a,b)=>{
      const pa = a.priority === 'high' ? 0 : 1;
      const pb = b.priority === 'high' ? 0 : 1;
      return pa - pb;
    });

    const tabs = variants.map(x => `
      <button class="${x.id === v.id ? 'active' : ''}" data-tabv="${esc(x.id)}">${esc(x.name.replace('Смарт-комплект ', ''))}</button>
    `).join('');

    const grouped = groupItems(v.what_includes || []);
    const blocks = grouped.map(g => {
      const inner = g.items.map(it => `
        <div class="item">
          <div class="dot"></div>
          <div class="item__txt">
            <div class="item__name">${esc(it)}</div>
            <div class="item__desc">${shortExplain(it)}</div>
          </div>
        </div>
      `).join('');
      return `
        <div class="block" data-block="${esc(g.id)}">
          <div class="block__head">
            <div>
              <div class="block__ttl">${esc(g.title)}</div>
              <div class="block__meta">${g.items.length} позиц.</div>
            </div>
            <div class="kbd">⌄</div>
          </div>
          <div class="block__body">${inner}</div>
        </div>
      `;
    }).join('');

    const focusBadge = (v.priority === 'high') ? `<span class="badge focus">Фокус</span>` : '';
    const note = v.notes ? `<div class="callout warn"><div style="font-weight:900;margin-bottom:6px">Примечание</div><div class="p" style="margin:0">${esc(v.notes)}</div></div>` : '';

    mount(`
      <section class="page">
        <div class="card" style="padding:14px; margin-bottom:12px">
          <div class="card__top">
            <div>
              <div class="card__title">${esc(pkg.name)}</div>
              <div class="card__sub">${esc(pkg.audience || '')}</div>
            </div>
            <div class="badges">${focusBadge}</div>
          </div>
          <div style="margin-top:12px" class="seg" aria-label="Уровни комплекта">
            ${tabs}
          </div>
        </div>

        ${note}

        ${blocks}

        <div class="callout" style="margin-top:12px">
          <div style="font-weight:900; margin-bottom:6px">Подсказка</div>
          <div class="p" style="margin:0">В Telegram удобнее пользоваться вкладкой <span class="kbd">Поиск</span> и искать по словам (например: <span class="kbd">ФАС</span>, <span class="kbd">закупок</span>, <span class="kbd">путеводитель</span>).</div>
        </div>
      </section>
    `);

    // tab clicks
    $$('[data-tabv]').forEach(btn => {
      btn.addEventListener('click', () => {
        const vid = btn.dataset.tabv;
        location.hash = `#/pkg/${pkgId}/${vid}`;
      });
    });

    // block collapse
    $$('[data-block]').forEach(block => {
      const head = $('.block__head', block);
      const body = $('.block__body', block);
      head.addEventListener('click', () => {
        const isHidden = body.style.display === 'none';
        body.style.display = isHidden ? '' : 'none';
        $('.kbd', head).textContent = isHidden ? '⌄' : '›';
      });
    });
  }

  function shortExplain(line){
    const s = line.toLowerCase();
    if(s.includes('российское законодательство')) return 'Основные нормативные акты (версия зависит от комплекта).';
    if(s.includes('региональный выпуск')) return 'Региональные документы и практика по субъектам РФ (вариант зависит от пакета).';
    if(s.includes('законопроекты')) return 'Проекты законов и инициативы — полезно для отслеживания изменений.';
    if(s.includes('проекты нормативных')) return 'Проекты НПА до принятия — для анализа будущих требований.';
    if(s.includes('правовые позиции')) return 'Позиции высших судов по ключевым вопросам применения норм.';
    if(s.includes('решения высших судов')) return 'Акты высших судов (как ориентир для практики).';
    if(s.includes('суд по интеллектуальным')) return 'Практика по интеллектуальным правам.';
    if(s.includes('супермассив')) return 'Расширенный массив судебных решений/определений по инстанциям и регионам.';
    if(s.includes('разъясняющие письма')) return 'Письма органов власти о применении норм на практике.';
    if(s.includes('горячей линии')) return 'Подборки и консультации по типовым вопросам.';
    if(s.includes('путеводитель')) return 'Практические материалы «как сделать» по типовым задачам.';
    if(s.includes('вопросы-ответы')) return 'Короткие ответы на практические вопросы по теме.';
    if(s.includes('корреспонденция счетов')) return 'Проводки и бухгалтерские ситуации.';
    if(s.includes('пресса')) return 'Подборка профильных изданий, статей и материалов.';
    if(s.includes('комментарии')) return 'Постатейные комментарии и книги по законодательству.';
    if(s.includes('конструктор договор')) return 'Шаблоны и мастер составления договоров.';
    if(s.includes('деловые бумаги')) return 'Формы документов и образцы оформления.';
    if(s.includes('архив')) return 'Исторические массивы решений и документов.';
    if(s.includes('эксперт-приложение')) return 'Специализированные материалы под отрасль/аудиторию.';
    if(s.includes('медицина') || s.includes('фармацевтика')) return 'Отраслевые материалы по медицине и фарме.';
    if(s.includes('отраслевые технические нормы')) return 'Нормы и требования отрасли (регламенты/стандарты).';
    return 'Краткое описание можно уточнить и дополнить позже.';
  }

  function render(){
    const route = parseRoute();
    setActiveTab(route);
    backBtn.style.opacity = canGoBack() ? '1' : '.35';

    if(route.page === 'home') return renderHome();
    if(route.page === 'search') return renderSearch();
    if(route.page === 'focus') return renderFocus();
    if(route.page === 'quiz') return renderQuiz();
    if(route.page === 'glossary') return renderGlossary();
    if(route.page === 'pkg') return renderPkg(route.pkgId, route.variantId);

    location.hash = '#/home';
  }

  window.addEventListener('hashchange', render);
  render();
})();
