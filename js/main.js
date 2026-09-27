/* ============================================================
   AristeaOS shell: boot, desktop, start menu, taskbar, context menu
   ============================================================ */
(function () {
  'use strict';

  // Edit these to show more contact options (empty = hidden).
  const CONFIG = {
    email: 'agjokthomii@gmail.com',
    linkedin: 'https://www.linkedin.com/in/aristea-gjokthomi/',
  };
  window.CONFIG = CONFIG;

  const $ = s => document.querySelector(s);
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;

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
    setAnimated(on) { store.set('anim', on ? '1' : '0'); Heat.setAnimated(on); },
    async runPlanner(n = 25) {
      if (Heat.busy) return;
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
  const DESKTOP = ['about', 'projects', 'coolcity', 'fiskal', 'finscope', 'ndea', 'terminal', 'music', 'github', 'hf', 'contact', 'trash'];
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
  const isWall = t => t === desktop || t.id === 'icons' || t.id === 'windows' || t.classList.contains('wall-scrim');
  let lastShade = 0;
  desktop.addEventListener('pointermove', e => {
    if (!isWall(e.target) || document.body.classList.contains('is-dragging')) return;
    const now = performance.now();
    if (now - lastShade < 16) return;
    lastShade = now;
    Heat.shadeAt(e.clientX, e.clientY);
  });
  desktop.addEventListener('click', e => {
    if (!isWall(e.target)) return;
    selectIcon(null);
    closeMenus();
    Heat.plantAt(e.clientX, e.clientY);
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
    { label: 'Run greedy tree planner', hint: 'wallpaper', run: () => OS.runPlanner() },
    { label: 'Clear planted trees', hint: 'wallpaper', run: () => Heat.reset() },
    { label: 'Toggle light / dark', hint: 'theme', run: () => OS.toggleTheme() },
    { label: 'Show desktop', hint: 'windows', run: () => WM.minimizeAll() },
    { label: 'Reboot AristeaOS', hint: 'system', run: () => OS.reboot() },
  ];
  pinned.innerHTML = Apps.list.filter(a => a.id !== 'settings' || true).map(a =>
    `<button class="pin" data-app="${a.id}">${Icons.html(a.icon, 36)}<span>${a.label}</span></button>`).join('');
  pinned.addEventListener('click', e => { const b = e.target.closest('[data-app]'); if (b) { closeMenus(); WM.open(b.dataset.app); } });

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
  start.querySelector('[data-power]').addEventListener('click', () => OS.reboot());
  start.querySelector('[data-settings]').addEventListener('click', () => { closeMenus(); WM.open('settings'); });

  function openStart() {
    closeCtx();
    start.hidden = false;
    startBtn.setAttribute('aria-expanded', 'true');
    sInput.value = '';
    renderResults();
    setTimeout(() => sInput.focus(), 20);
  }
  function closeStart() { start.hidden = true; startBtn.setAttribute('aria-expanded', 'false'); }
  startBtn.addEventListener('click', e => { e.stopPropagation(); start.hidden ? openStart() : closeStart(); });

  // ---------- context menu ----------
  const ctx = $('#ctx');
  const CTX = [
    ['Plant 25 trees (greedy)', () => OS.runPlanner()],
    ['Clear trees', () => Heat.reset()],
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
    if (!start.hidden && !start.contains(e.target) && !startBtn.contains(e.target)) closeStart();
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
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); start.hidden ? openStart() : closeStart(); }
    else if (e.key === 'Escape') closeMenus();
  });

  // ---------- routing ----------
  const fromHash = () => { const m = location.hash.match(/^#\/([\w-]+)/); return m && Apps.get(m[1]) ? m[1] : null; };
  window.addEventListener('hashchange', () => { const id = fromHash(); if (id) WM.open(id); });

  // ---------- boot ----------
  WM.init({ layer: $('#windows'), taskList: $('#tasks') });
  Heat.init($('#wall'), { animated: !reduced && store.get('anim') !== '0' });

  function ready() {
    document.body.classList.add('booted');
    const id = fromHash();
    WM.open(id || 'about');
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
      ['loaded wallpaper', '14,630 cells'],
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
