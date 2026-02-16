/* global CONTENT */
(function(){
  const $ = (sel) => document.querySelector(sel);

  const navEl = $('#nav');
  const contentEl = $('#content');
  const bcEl = $('#breadcrumbs');
  const searchInput = $('#searchInput');
  const copyLinkBtn = $('#copyLinkBtn');

  const state = {
    q: '',
    route: parseHash(),
  };

  function parseHash(){
    // #/pkg/<id>/<variant>
    const h = (location.hash || '#/').replace(/^#/, '');
    const parts = h.split('/').filter(Boolean);
    if(parts.length >= 3 && parts[0] === 'pkg'){
      return { page:'pkg', pkgId: parts[1], variantId: parts[2] };
    }
    if(parts.length >= 1 && parts[0] === 'glossary') return { page:'glossary' };
    return { page:'home' };
  }

  function setHash(route){
    if(route.page === 'pkg') location.hash = `#/pkg/${route.pkgId}/${route.variantId}`;
    else if(route.page === 'glossary') location.hash = '#/glossary';
    else location.hash = '#/';
  }

  function esc(s){
    return String(s).replace(/[&<>"']/g, (c)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
  }

  function norm(s){
    return String(s || '').toLowerCase().replace(/ё/g,'е');
  }

  function renderNav(){
    navEl.innerHTML = '';
    const pkgList = CONTENT.packages || [];

    // Home + glossary
    const top = document.createElement('div');
    top.className = 'nav-section';
    top.innerHTML = `
      <div class="nav-head" data-open="1">
        <div>
          <div class="nav-title">Разделы</div>
          <div class="nav-sub">Быстрый доступ</div>
        </div>
      </div>
      <div class="nav-body">
        <a class="nav-link" href="#/">🏠 Главная <span class="badges"></span></a>
        <a class="nav-link" href="#/glossary">📚 Словарь терминов <span class="badges"></span></a>
      </div>
    `;
    navEl.appendChild(top);

    for(const pkg of pkgList){
      const sec = document.createElement('div');
      sec.className = 'nav-section';

      const variants = (pkg.variants || []).slice().sort((a,b)=>{
        // put high priority first
        const pa = a.priority === 'high' ? 0 : 1;
        const pb = b.priority === 'high' ? 0 : 1;
        return pa - pb;
      });

      const bodyLinks = variants.map(v=>{
        const badges = [];
        if(v.priority === 'high') badges.push('<span class="badge badge--high">Фокус</span>');
        if(v.notes) badges.push('<span class="badge badge--note">примеч.</span>');
        const active = (state.route.page==='pkg' && state.route.pkgId===pkg.id && state.route.variantId===v.id) ? 'active' : '';
        return `<a class="nav-link ${active}" href="#/pkg/${pkg.id}/${v.id}">
          <span>${esc(v.name)}</span>
          <span class="badges">${badges.join('')}</span>
        </a>`;
      }).join('');

      sec.innerHTML = `
        <div class="nav-head" data-open="1">
          <div>
            <div class="nav-title">${esc(pkg.name)}</div>
            <div class="nav-sub">${esc(pkg.audience || '')}</div>
          </div>
        </div>
        <div class="nav-body">${bodyLinks}</div>
      `;
      navEl.appendChild(sec);
    }

    // search filtering
    applySearchFilter();
  }

  function applySearchFilter(){
    const q = norm(state.q).trim();
    const links = navEl.querySelectorAll('.nav-link');
    if(!q){
      links.forEach(a=>a.style.display = '');
      return;
    }
    links.forEach(a=>{
      const href = a.getAttribute('href') || '';
      // keep home/glossary visible
      if(href === '#/' || href === '#/glossary'){ a.style.display=''; return; }
      // pkg link: look into its content
      const m = href.match(/#\/pkg\/([^\/]+)\/([^\/]+)/);
      if(!m){ a.style.display=''; return; }
      const pkgId = m[1], variantId = m[2];
      const pkg = (CONTENT.packages||[]).find(p=>p.id===pkgId);
      const v = pkg && (pkg.variants||[]).find(x=>x.id===variantId);
      const hay = norm([
        pkg?.name, pkg?.audience, v?.name,
        ...(v?.what_includes||[])
      ].join('\n'));
      a.style.display = hay.includes(q) ? '' : 'none';
    });
  }

  function renderHome(){
    const meta = CONTENT.meta || {};
    bcEl.textContent = 'Главная';
    contentEl.innerHTML = `
      <h1>${esc(meta.title || 'Шпаргалка')}</h1>
      <p class="small">${esc(meta.subtitle || '')}</p>
      <div class="callout">
        <strong>Фокус изучения:</strong> ${esc(meta.focus_note || '')}
      </div>

      <h2>Как устроены таблицы (что ты прислал)</h2>
      <ul>
        <li><strong>Строка слева</strong> — название пакета (например: «Юрист», «Бюджетные организации») и версия (Базовый / Оптимальный / Проф / Эксперт).</li>
        <li><strong>Большой список справа</strong> — какие <em>информационные банки</em> входят в этот комплект.</li>
        <li><strong>Различия между таблицами</strong> — это разная целевая аудитория и разная «глубина» наполнения:
          <ul>
            <li><strong>Базовый</strong> — обычно более короткий состав, часто с пометками «базовая версия» и «усеченный».</li>
            <li><strong>Оптимальный</strong> — как правило расширенная версия законодательства и больше блоков практики/архивов/путеводителей.</li>
            <li><strong>Проф / Эксперт</strong> — ещё шире (у тебя на листах они встречаются, но сейчас мы их не делаем фокусом).</li>
          </ul>
        </li>
      </ul>

      <h2>Как пользоваться сайтом</h2>
      <ul>
        <li>Открой нужный комплект слева.</li>
        <li>Вверху есть поиск — вводи слово, например <span class="kbd">ФАС</span>, <span class="kbd">закупок</span>, <span class="kbd">путеводитель</span>.</li>
        <li>Ссылку на конкретный раздел можно скопировать кнопкой сверху.</li>
      </ul>

      <hr />
      <p class="small">Дальше можно постепенно добавлять: «как искать», «типовые сценарии», «шорткаты», «любимые фильтры» — и всё это будет жить в репозитории.</p>
    `;
  }

  function renderGlossary(){
    bcEl.textContent = 'Словарь терминов';
    const items = (CONTENT.glossary || []).map(x=>`
      <h3>${esc(x.term)}</h3>
      <p>${esc(x.desc)}</p>
    `).join('');
    contentEl.innerHTML = `
      <h1>Словарь</h1>
      <p class="small">Короткие пояснения к терминам, которые постоянно встречаются в пакетах.</p>
      ${items || '<p>Пока пусто.</p>'}
    `;
  }

  function renderPackage(pkgId, variantId){
    const pkg = (CONTENT.packages||[]).find(p=>p.id===pkgId);
    const variant = pkg?.variants?.find(v=>v.id===variantId);

    if(!pkg || !variant){
      bcEl.textContent = 'Раздел не найден';
      contentEl.innerHTML = `
        <h1>Раздел не найден</h1>
        <p>Похоже, ссылка устарела. Открой раздел слева.</p>
      `;
      return;
    }

    bcEl.textContent = `${pkg.name} → ${variant.name}`;

    const priorityBadge = variant.priority === 'high'
      ? '<span class="badge badge--high">Фокус (учить в первую очередь)</span>'
      : '';

    const notes = variant.notes
      ? `<div class="callout warn"><strong>Примечание:</strong> ${esc(variant.notes)}</div>`
      : '';

    const list = (variant.what_includes || []).map(x=>`<li>${esc(x)}</li>`).join('');

    contentEl.innerHTML = `
      <h1>${esc(pkg.name)}</h1>
      <p class="small">${esc(pkg.audience || '')}</p>

      <div class="callout">
        <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
          <strong>${esc(variant.name)}</strong>
          ${priorityBadge}
        </div>
        <p class="small" style="margin-top:8px">Ниже — <em>что входит</em> (по твоим фото). Дальше можно дополнять «как использовать» и «когда полезно».</p>
      </div>

      ${notes}

      <h2>Что входит</h2>
      <ul>${list}</ul>

      <h2>Короткое пояснение к типам материалов</h2>
      <ul>
        <li><strong>Законодательство</strong> — нормативные акты (в базовой/расширенной версии).</li>
        <li><strong>Судебная практика</strong> — решения/определения судов, иногда в виде «супермассива».</li>
        <li><strong>Разъясняющие письма</strong> — письма/позиции органов власти по применению норм.</li>
        <li><strong>Путеводители</strong> — «как сделать» по типовым задачам (налоги, кадры, закупки, договоры и т.д.).</li>
        <li><strong>Архивы</strong> — исторические массивы решений/документов.</li>
      </ul>
    `;
  }

  function render(){
    state.route = parseHash();
    renderNav();

    if(state.route.page === 'home') return renderHome();
    if(state.route.page === 'glossary') return renderGlossary();
    if(state.route.page === 'pkg') return renderPackage(state.route.pkgId, state.route.variantId);
    return renderHome();
  }

  // events
  window.addEventListener('hashchange', render);

  searchInput.addEventListener('input', (e)=>{
    state.q = e.target.value || '';
    applySearchFilter();
  });

  copyLinkBtn.addEventListener('click', async ()=>{
    try{
      await navigator.clipboard.writeText(location.href);
      copyLinkBtn.textContent = 'Скопировано ✓';
      setTimeout(()=>copyLinkBtn.textContent = 'Скопировать ссылку', 1200);
    }catch(e){
      alert('Не получилось скопировать (в некоторых webview это ограничено). Можно скопировать вручную из адресной строки.');
    }
  });

  // initial
  render();
})();
