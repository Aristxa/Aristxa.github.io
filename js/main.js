/* ============================================================
   AristeaOS shell: boot, desktop, start menu, taskbar, context menu
   ============================================================ */
(function () {
  'use strict';

  // Edit these to show more contact options (empty = hidden).
  const CONFIG = {
    email: 'agjokthomii@gmail.com',
    linkedin: 'https://www.linkedin.com/in/aristea-gjokthomi/',
    // GoatCounter site code (the "xyz" in xyz.goatcounter.com). Empty = no analytics.
    goatcounter: 'aristea',
  };
  window.CONFIG = CONFIG;

  // ---------- analytics (cookie-free, GoatCounter) ----------
  // Counts the page visit, plus one event per app a visitor opens.
  const track = { app() {} };
  if (CONFIG.goatcounter && !/^(localhost|127\.)/.test(location.hostname)) {
    const gc = document.createElement('script');
    gc.async = true;
    gc.src = 'https://gc.zgo.at/count.js';
    gc.dataset.goatcounter = `https://${CONFIG.goatcounter}.goatcounter.com/count`;
    document.head.appendChild(gc);
    const opened = new Set();
    track.app = (id, title) => {
      if (opened.has(id)) return; // once per app per visit
      opened.add(id);
      const send = () => window.goatcounter.count({ path: `app/${id}`, title: `Opened ${title}`, event: true });
      if (window.goatcounter && window.goatcounter.count) send();
      else gc.addEventListener('load', send, { once: true });
    };
  }

  const $ = s => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  let wallpaper = store.get('wallpaper') === 'heat' ? 'heat' : 'galaxy';

  // ---------- theme ----------
  function applyTheme(pref) {
    if (pref === 'dark' || pref === 'light') document.documentElement.dataset.theme = pref;
    else delete document.documentElement.dataset.theme;
  }
  const themePref = () => store.get('theme') || 'system';
  const effectiveTheme = () => {
    const p = themePref();
    if (p !== 'system') return p;
    return matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  };

  // ---------- toast ----------
  let toastT;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }

  const OS = {
    toast,
    fmtCool: d => (d < 0.005 ? '0.00°C' : '−' + d.toFixed(2) + '°C'),
    themePref,
    setTheme(p) { store.set('theme', p); applyTheme(p); },
    toggleTheme() { OS.setTheme(effectiveTheme() === 'dark' ? 'light' : 'dark'); },
    setAnimated(on) { store.set('anim', on ? '1' : '0'); Heat.setAnimated(on); Galaxy.setAnimated(on); },
    iconStyle: () => document.body.dataset.icons,
    setIconStyle(v) { store.set('icons', v); document.body.dataset.icons = v; },
    wallpaper: () => wallpaper,
    setWallpaper(w) {
      if (w === 'galaxy' && !Galaxy.ok) w = 'heat'; // no WebGL: the heat map always works
      wallpaper = w;
      store.set('wallpaper', w);
      document.body.dataset.wall = w;
      Galaxy.setEnabled(w === 'galaxy');
      Heat.setEnabled(w === 'heat');
    },
    async runPlanner(n = 25) {
      if (Heat.busy) return;
      if (wallpaper !== 'heat') { OS.setWallpaper('heat'); toast('Wallpaper switched to the CoolCity heat map'); await new Promise(r => setTimeout(r, 600)); }
      const btn = $('#w-run');
      btn.disabled = true;
      toast(`Greedy planner: placing ${n} trees…`);
      await Heat.runPlanner(n);
      btn.disabled = false;
      const s = Heat.stats();
      toast(`Done. ${s.trees} trees, mean surface ${OS.fmtCool(s.delta)}`);
    },
    reboot() {
      try { sessionStorage.removeItem('booted'); } catch (e) {}
      document.body.classList.add('shutting-down');
      setTimeout(() => location.reload(), 500);
    },
  };
  window.OS = OS;

  // ---------- desktop icons ----------
  const DESKTOP = ['about', 'projects', 'coolcity', 'fiskal', 'finscope', 'ndea', 'speakup', 'kupon', 'terminal', 'music', 'github', 'hf', 'contact', 'trash'];
  const iconsEl = $('#icons');
  iconsEl.innerHTML = DESKTOP.map(id => {
    const a = Apps.get(id);
    return `<button class="d-icon" data-app="${id}" role="listitem" title="${a.desc}">${Icons.html(a.icon, 46)}<span>${a.label}</span></button>`;
  }).join('');
  const selectIcon = el => iconsEl.querySelectorAll('.d-icon').forEach(x => x.classList.toggle('sel', x === el));
  iconsEl.addEventListener('click', e => {
    const b = e.target.closest('.d-icon');
    if (!b) return;
    selectIcon(b);
    if (coarse || e.detail === 0) WM.open(b.dataset.app); // touch tap or keyboard Enter
  });
  iconsEl.addEventListener('dblclick', e => { const b = e.target.closest('.d-icon'); if (b) WM.open(b.dataset.app); });

  // ---------- wallpaper interaction ----------
  const desktop = $('#desktop');
  const isWall = t => t === desktop || ['icons', 'windows', 'galaxy', 'wall'].includes(t.id) || t.classList.contains('wall-scrim');
  let lastShade = 0;
  document.addEventListener('pointermove', e => {
    if (wallpaper === 'galaxy') { Galaxy.look(e.clientX / innerWidth * 2 - 1, e.clientY / innerHeight * 2 - 1); return; }
    if (!isWall(e.target) || document.body.classList.contains('is-dragging')) return;
    const now = performance.now();
    if (now - lastShade < 16) return;
    lastShade = now;
    Heat.shadeAt(e.clientX, e.clientY);
  });
  desktop.addEventListener('click', e => {
    if (!isWall(e.target) || rubberMoved) return;
    selectIcon(null);
    closeMenus();
    if (wallpaper === 'heat') Heat.plantAt(e.clientX, e.clientY);
  });

  // Drag on empty desktop to rubber-band select icons, like a real PC.
  const rubber = document.createElement('div');
  rubber.className = 'rubber';
  desktop.appendChild(rubber);
  let rubberMoved = false;
  desktop.addEventListener('pointerdown', e => {
    if (e.button !== 0 || coarse || !isWall(e.target)) return;
    const sx = e.clientX, sy = e.clientY;
    rubberMoved = false;
    const move = ev => {
      const x = Math.min(sx, ev.clientX), y = Math.min(sy, ev.clientY), w = Math.abs(ev.clientX - sx), h = Math.abs(ev.clientY - sy);
      if (!rubberMoved && w + h < 6) return;
      rubberMoved = true;
      Object.assign(rubber.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', display: 'block' });
      iconsEl.querySelectorAll('.d-icon').forEach(ic => {
        const r = ic.getBoundingClientRect();
        ic.classList.toggle('sel', r.right > x && r.left < x + w && r.bottom > y && r.top < y + h);
      });
    };
    const up = () => {
      removeEventListener('pointermove', move);
      removeEventListener('pointerup', up);
      rubber.style.display = 'none';
      setTimeout(() => (rubberMoved = false), 0);
    };
    addEventListener('pointermove', move);
    addEventListener('pointerup', up);
  });

  // ---------- widget ----------
  Heat.onStats(s => {
    $('#w-mean').textContent = s.mean.toFixed(1) + '°C';
    $('#w-max').textContent = s.max.toFixed(1) + '°C';
    $('#w-trees').textContent = s.trees;
    $('#w-delta').textContent = OS.fmtCool(s.delta);
  });
  $('#w-run').addEventListener('click', () => OS.runPlanner());
  $('#w-reset').addEventListener('click', () => Heat.reset());
  $('#w-info').addEventListener('click', () => { const w = WM.open('coolcity'); w && w.el.querySelector('[data-t=t]')?.click(); });

  // ---------- start menu ----------
  const start = $('#start');
  const startBtn = $('#start-btn');
  const sInput = $('#start-search');
  const sList = $('#start-results');
  const pinned = $('#start-pinned');
  const ACTIONS = [
    { label: 'Wallpaper: galaxy', hint: 'wallpaper', run: () => OS.setWallpaper('galaxy') },
    { label: 'Wallpaper: CoolCity heat map', hint: 'wallpaper', run: () => OS.setWallpaper('heat') },
    { label: 'Run greedy tree planner', hint: 'CoolCity', run: () => OS.runPlanner() },
    { label: 'Clear planted trees', hint: 'CoolCity', run: () => Heat.reset() },
    { label: 'Toggle light / dark', hint: 'theme', run: () => OS.toggleTheme() },
    { label: 'Show desktop', hint: 'windows', run: () => WM.minimizeAll() },
    { label: 'Reboot AristeaOS', hint: 'system', run: () => OS.reboot() },
  ];
  // All apps, A to Z, with the projects grouped in a folder like Windows 10.
  const PROJECT_IDS = ['coolcity', 'fiskal', 'finscope', 'ndea', 'speakup', 'kupon'];
  const FOLDER = '<svg class="folder-ico" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M2 6.5A1.5 1.5 0 0 1 3.5 5h5.4l2 2h9.6A1.5 1.5 0 0 1 22 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18z" fill="#e8a92c"/><path d="M2 9.5h20V18a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18z" fill="#f7c948"/></svg>';
  const CHEV = '<svg class="chev" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const byLabel = (a, b) => a.label.localeCompare(b.label, 'en', { sensitivity: 'base' });
  const appRow = (a, cls = '') => `<button class="sl-item ${cls}" data-app="${a.id}" role="listitem">${Icons.html(a.icon, 22)}<span>${a.label}</span></button>`;
  const rows = [
    { label: 'Projects', html: `<button class="sl-item sl-folder" data-folder aria-expanded="true">${FOLDER}<span>Projects</span>${CHEV}</button><div class="sl-sub">${PROJECT_IDS.map(id => appRow(Apps.get(id), 'sub')).join('')}</div>` },
    ...Apps.list.filter(a => !PROJECT_IDS.includes(a.id)).map(a => ({ label: a.label, html: appRow(a) })),
  ].sort(byLabel);
  pinned.innerHTML = rows.map(r => r.html).join('');
  pinned.addEventListener('click', e => {
    const f = e.target.closest('[data-folder]');
    if (f) { f.setAttribute('aria-expanded', String(f.getAttribute('aria-expanded') !== 'true')); return; }
    const b = e.target.closest('[data-app]');
    if (b) { closeMenus(); WM.open(b.dataset.app); }
  });

  start.querySelector('.start-rail').addEventListener('click', e => {
    const r = e.target.closest('[data-rail]');
    if (!r) return;
    const act = r.dataset.rail;
    if (act === 'expand') { start.classList.toggle('expanded'); return; }
    if (act === 'apps') { start.classList.remove('expanded'); return; }
    closeMenus();
    if (act === 'me' || act === 'about') WM.open('about');
    else if (act === 'settings') WM.open('settings');
    else if (act === 'power') OS.reboot();
  });
  $('#search-btn').addEventListener('click', e => { e.stopPropagation(); start.hidden ? openStart(true) : closeStart(); });

  let results = [], sel = 0;
  function renderResults() {
    const q = sInput.value.trim().toLowerCase();
    start.classList.toggle('searching', !!q);
    if (!q) { sList.innerHTML = ''; results = []; return; }
    const apps = Apps.list.filter(a => (a.label + ' ' + a.title + ' ' + a.desc + ' ' + a.id).toLowerCase().includes(q))
      .map(a => ({ label: a.label, hint: a.desc, icon: a.icon, run: () => WM.open(a.id) }));
    const acts = ACTIONS.filter(a => (a.label + ' ' + a.hint).toLowerCase().includes(q));
    results = [...apps, ...acts];
    sel = 0;
    sList.innerHTML = results.length
      ? results.map((r, i) => `<li role="option" aria-selected="${i === sel}" data-i="${i}">${r.icon ? Icons.html(r.icon, 24) : '<span class="act-ico">›</span>'}<span>${r.label}</span><small>${r.hint}</small></li>`).join('')
      : `<li class="empty">No results for “${Apps.esc(q)}”</li>`;
  }
  function moveSel(d) {
    if (!results.length) return;
    sel = (sel + d + results.length) % results.length;
    sList.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === sel)));
    sList.children[sel]?.scrollIntoView({ block: 'nearest' });
  }
  sInput.addEventListener('input', renderResults);
  sInput.addEventListener('keydown', e => {
    if (e.key === 'ArrowDown') { e.preventDefault(); moveSel(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSel(-1); }
    else if (e.key === 'Enter' && results[sel]) { const r = results[sel]; closeMenus(); r.run(); }
  });
  sList.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (li) { const r = results[+li.dataset.i]; closeMenus(); r.run(); } });

  // Focus the search box unless it would pop up a phone keyboard nobody asked for.
  function openStart(focusSearch = !coarse) {
    closeCtx();
    start.hidden = false;
    startBtn.setAttribute('aria-expanded', 'true');
    sInput.value = '';
    renderResults();
    if (focusSearch) setTimeout(() => sInput.focus(), 20);
  }
  function closeStart() { start.hidden = true; start.classList.remove('expanded'); startBtn.setAttribute('aria-expanded', 'false'); }
  startBtn.addEventListener('click', e => { e.stopPropagation(); start.hidden ? openStart() : closeStart(); });

  // ---------- context menu ----------
  const ctx = $('#ctx');
  const CTX = [
    ['Wallpaper: galaxy', () => OS.setWallpaper('galaxy')],
    ['Wallpaper: CoolCity heat map', () => OS.setWallpaper('heat')],
    null,
    ['Open Terminal', () => WM.open('terminal')],
    ['Open Projects', () => WM.open('projects')],
    null,
    ['Toggle theme', () => OS.toggleTheme()],
    ['Show desktop', () => WM.minimizeAll()],
    ['Settings', () => WM.open('settings')],
  ];
  ctx.innerHTML = CTX.map((c, i) => c ? `<button data-i="${i}">${c[0]}</button>` : '<hr />').join('');
  ctx.addEventListener('click', e => { const b = e.target.closest('button'); if (b) { closeCtx(); CTX[+b.dataset.i][1](); } });
  desktop.addEventListener('contextmenu', e => {
    if (!isWall(e.target) && !e.target.closest('.d-icon')) return;
    e.preventDefault();
    closeStart();
    ctx.hidden = false;
    const r = ctx.getBoundingClientRect();
    ctx.style.left = Math.min(e.clientX, innerWidth - r.width - 8) + 'px';
    ctx.style.top = Math.min(e.clientY, innerHeight - r.height - 60) + 'px';
  });
  function closeCtx() { ctx.hidden = true; }
  function closeMenus() { closeStart(); closeCtx(); }
  document.addEventListener('pointerdown', e => {
    if (!start.hidden && !start.contains(e.target) && !startBtn.contains(e.target) && !e.target.closest('#search-btn')) closeStart();
    if (!ctx.hidden && !ctx.contains(e.target)) closeCtx();
  });

  // ---------- taskbar tray ----------
  $('#tray-theme').addEventListener('click', () => OS.toggleTheme());
  $('#show-desktop').addEventListener('click', () => WM.minimizeAll());
  function tick() {
    const d = new Date();
    $('#clock-t').textContent = d.toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
    $('#clock-d').textContent = d.toLocaleDateString('en-GB', { timeZone: TZ, day: '2-digit', month: 'short', year: 'numeric' });
  }
  tick();
  setInterval(tick, 15000);

  // ---------- keyboard ----------
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); start.hidden ? openStart(true) : closeStart(); }
    else if (e.key === 'Escape') closeMenus();
  });

  // ---------- routing ----------
  const fromHash = () => { const m = location.hash.match(/^#\/([\w-]+)/); return m && Apps.get(m[1]) ? m[1] : null; };
  window.addEventListener('hashchange', () => { const id = fromHash(); if (id) WM.open(id); });

  // ---------- boot ----------
  WM.init({ layer: $('#windows'), taskList: $('#tasks') });
  const animated = !reduced && store.get('anim') !== '0';
  Galaxy.init($('#galaxy'), { animated, enabled: false });
  Heat.init($('#wall'), { animated, enabled: false });
  OS.setWallpaper(wallpaper);
  document.body.dataset.icons = store.get('icons') === 'white' ? 'white' : 'colour';

  function ready() {
    document.body.classList.add('booted');
    const id = fromHash();
    WM.open(id || 'about');
    // Count deep links (e.g. /#/fiskal), but not the about window that opens for everyone.
    if (id) track.app(id, Apps.get(id).title);
    WM.onOpen = (appId, title) => track.app(appId, title);
  }

  const boot = $('#boot');
  let booted = false;
  try { booted = sessionStorage.getItem('booted') === '1'; } catch (e) {}
  if (booted || reduced) {
    boot.remove();
    ready();
  } else {
    const LINES = [
      ['AristeaOS 1.0', ''],
      ['mounted /home/aristea', ''],
      ['loaded wallpaper', ''],
      ['started window manager', ''],
      ['started terminal', ''],
      ['reached target desktop', ''],
    ];
    const log = boot.querySelector('.boot-log');
    const bar = boot.querySelector('.boot-bar i');
    let i = 0, done = false, timer;
    const finish = () => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      try { sessionStorage.setItem('booted', '1'); } catch (e) {}
      boot.classList.add('out');
      setTimeout(() => boot.remove(), 600);
      ready();
    };
    const step = () => {
      if (i >= LINES.length) { timer = setTimeout(finish, 280); return; }
      const [a, b] = LINES[i];
      const li = document.createElement('div');
      li.innerHTML = i === 0 ? `<b>${a}</b>` : `<span class="ok">[ ok ]</span> ${a}${b ? ` <span class="dim">· ${b}</span>` : ''}`;
      log.appendChild(li);
      i++;
      bar.style.width = (i / LINES.length * 100) + '%';
      timer = setTimeout(step, 150 + Math.random() * 120);
    };
    boot.addEventListener('click', finish);
    document.addEventListener('keydown', finish, { once: true });
    step();
  }
})();
