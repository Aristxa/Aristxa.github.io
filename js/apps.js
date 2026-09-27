/* ============================================================
   Icons + app registry + app contents
   ============================================================ */
(function () {
  'use strict';

  // ---------- Icons ----------
  // Animated line icons from itshover (https://itshover.com, Apache-2.0), converted from their
  // React/motion components to plain SVG. The hover animations live in css/style.css (".ih-*").
  // vb = viewBox size; stroke width is scaled from 24 so all icons look equally heavy.
  const FILE = '<path class="ih-draw a-fold" pathLength="1" d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h7l5 5v11a2 2 0 0 1 -2 2z"/><path class="ih-draw a-line" pathLength="1" d="M9 17h6"/><path class="ih-draw a-line" pathLength="1" d="M9 13h6"/>';
  const SVGS = {
    about: { vb: 24, g: FILE },
    file: { vb: 24, g: FILE },
    projects: { vb: 24, g: '<path class="p-top" d="M12 6l-8 4l8 4l8 -4l-8 -4"/><path class="p-bot" d="M4 14l8 4l8 -4"/>' },
    coolcity: { vb: 24, g: '<path class="c-dish" d="M4 10a7.31 7.31 0 0 0 10 10Z"/><path d="m9 15 3-3"/><path class="c-in" d="M17 13a6 6 0 0 0-6-6"/><path class="c-out" d="M21 13A10 10 0 0 0 11 3"/>' },
    fiskal: { vb: 48, cap: 'square', g: '<path d="M24 40.5V41L24 10V10.5"/><path d="M24 41C31.0005 36.9995 37.9995 36.9995 45 41V10.0003C37.9995 5.99989 31.0005 5.99989 24 10.0003C16.9995 5.99989 10.0005 5.99989 3 10.0003V41C10.0005 36.9995 16.9995 36.9995 24 41Z"/><path class="ih-draw b-1" pathLength="1" d="M30 16.5C32.8362 15.1345 36.5662 15.06 39.5 16.2763"/><path class="ih-draw b-2" pathLength="1" d="M30 23.5832C32.8362 22.2178 36.5662 22.1432 39.5 23.3596"/><path class="ih-draw b-3" pathLength="1" d="M30 30.6665C32.8362 29.301 36.5662 29.2265 39.5 30.4428"/>' },
    finscope: { vb: 24, g: '<path class="f-base" d="M4 19l16 0"/><path class="ih-draw f-line" pathLength="1" d="M4 15l4 -6l4 2l4 -5l4 4"/>' },
    ndea: { vb: 24, g: '<path class="n-b1" d="M3 13a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path class="n-b2" d="M9 5a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v14a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path class="n-b3" d="M15 9a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v10a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1z"/><path class="n-base" d="M4 20h14"/>' },
    speakup: { vb: 24, g: '<path class="ih-draw m-path" pathLength="1" d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/>' },
    kupon: { vb: 32, cap: 'square', g: '<rect class="q-scan" x="2" y="0" width="28" height="2" fill="currentColor" stroke="none"/><rect class="ih-draw q-c q-c1" pathLength="1" x="3" y="3" width="9" height="9"/><rect class="ih-draw q-c q-c2" pathLength="1" x="3" y="20" width="9" height="9"/><rect class="ih-draw q-c q-c3" pathLength="1" x="20" y="3" width="9" height="9"/><g class="q-in"><rect x="27" y="20" width="2" height="2"/><rect x="16" y="27" width="2" height="2"/><path d="M3 16H7"/><path d="M13 16H18M22 16V23H29M22 16H26M22 16H18M18 16V20H16"/><path d="M16 7V10"/><path d="M16 25V29H23V27"/><path d="M29.01 29H29"/></g><rect class="q-dot" x="24" y="7" width="1" height="1"/><rect class="q-dot" x="7" y="7" width="1" height="1"/><rect class="q-dot" x="7" y="24" width="1" height="1"/>' },
    terminal: { vb: 24, g: '<path class="t-chev" d="M5 7l5 5l-5 5"/><path class="t-cur" d="M12 19l7 0"/>' },
    music: { vb: 24, g: '<path class="v-disc" d="M16 3.937a9 9 0 1 0 5 8.063"/><path class="v-dot" d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M20 4m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M20 4l-3.5 10l-2.5 2"/>' },
    github: { vb: 24, g: '<g class="g-cat"><path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5"/></g>' },
    hf: { vb: 24, g: '<path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z"/><path d="M6.003 5.125A3 3 0 0 0 6.401 6.5"/><path d="M3.477 10.896a4 4 0 0 1 .585-.396"/><path d="M6 18a4 4 0 0 1-1.967-.516"/><path class="ih-draw h-c" pathLength="1" d="M9 13a4.5 4.5 0 0 0 3-4"/><path class="ih-draw h-c" pathLength="1" d="M12 13h4"/><path class="ih-draw h-c" pathLength="1" d="M12 18h6a2 2 0 0 1 2 2v1"/><path class="ih-draw h-c" pathLength="1" d="M12 8h8"/><path class="ih-draw h-c" pathLength="1" d="M16 8V5a2 2 0 0 1 2-2"/><circle class="h-t" cx="16" cy="13" r=".5"/><circle class="h-t" cx="18" cy="3" r=".5"/><circle class="h-t" cx="20" cy="21" r=".5"/><circle class="h-t" cx="20" cy="8" r=".5"/>' },
    contact: { vb: 24, g: '<g class="s-plane"><path d="M10 14l11 -11"/><path d="M21 3l-6.5 18a.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a.55 .55 0 0 1 0 -1l18 -6.5"/></g>' },
    trash: { vb: 24, g: '<path class="r-low" d="M4 7l16 0"/><path d="M10 11l0 6"/><path d="M14 11l0 6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2 -2l1 -12"/><path class="r-up" d="M9 7v-3a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v3"/>' },
    settings: { vb: 32, cap: 'square', g: '<g class="k-rot"><circle class="k-mid" cx="16" cy="16" r="5"/><path d="m30,17.5v-3l-3.388-1.355c-.25-.933-.617-1.815-1.089-2.633l1.436-3.351-2.121-2.121-3.351,1.436c-.817-.472-1.7-.838-2.633-1.089l-1.355-3.388h-3l-1.355,3.388c-.933.25-1.815.617-2.633,1.089l-3.351-1.436-2.121,2.121 1.436,3.351c-.472.817-.838,1.7-1.089,2.633l-3.388,1.355v3l3.388,1.355c.25.933.617,1.815,1.089,2.633l-1.436,3.351 2.121,2.121 3.351-1.436c.817.472 1.7.838 2.633,1.089l1.355,3.388h3l1.355-3.388c.933-.25 1.815-.617 2.633-1.089l3.351,1.436 2.121-2.121-1.436-3.351c.472-.817.838-1.7 1.089-2.633l3.388-1.355Z"/></g>' },
  };
  const Icons = {
    html(key, size = 40) {
      const v = SVGS[key] || SVGS.file;
      const sw = (1.6 * v.vb / 24).toFixed(2);
      return `<svg class="ico ih ih-${key}" viewBox="0 0 ${v.vb} ${v.vb}" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="${v.cap || 'round'}" stroke-linejoin="round" stroke-miterlimit="10" aria-hidden="true">${v.g}</svg>`;
    },
  };

  // ---------- helpers ----------
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  function tabs(body, defs) {
    body.classList.add('has-tabs');
    body.innerHTML = `<div class="tabs" role="tablist">${defs.map(d => `<button role="tab" aria-selected="false" data-t="${d.id}">${d.label}</button>`).join('')}</div><div class="tab-panels"></div>`;
    const panels = body.querySelector('.tab-panels');
    const made = {};
    function show(id) {
      body.querySelectorAll('[role=tab]').forEach(b => b.setAttribute('aria-selected', String(b.dataset.t === id)));
      defs.forEach(d => {
        if (d.id === id && !made[id]) {
          const el = document.createElement('div');
          el.className = 'tab-panel' + (d.flush ? ' flush' : '');
          el.setAttribute('role', 'tabpanel');
          panels.appendChild(el);
          made[id] = el;
          d.render(el, { show });
        }
        if (made[d.id]) made[d.id].hidden = d.id !== id;
      });
    }
    body.querySelector('.tabs').addEventListener('click', e => {
      const b = e.target.closest('[role=tab]');
      if (b) show(b.dataset.t);
    });
    show(defs[0].id);
    return { show };
  }

  function live(el, url, { note, wake = true, title, allow = 'clipboard-write' }) {
    el.innerHTML = `
      <div class="live">
        <div class="live-bar"><span class="lock">🔒</span><span class="url mono">${esc(url.replace(/^https?:\/\//, ''))}</span><a class="mono" href="${url}" target="_blank" rel="noopener">open ↗</a></div>
        <div class="live-stage">
          <div class="live-cover">
            <p>${note}</p>
            <button class="btn-sm primary">${wake ? 'Wake &amp; load app' : 'Load'}</button>
          </div>
        </div>
      </div>`;
    const stage = el.querySelector('.live-stage');
    const go = () => {
      stage.innerHTML = `<div class="live-loading mono"><span class="spinner"></span>${wake ? 'connecting… free-tier Spaces can take a minute to wake' : 'loading…'}</div>`;
      const f = document.createElement('iframe');
      f.src = url;
      f.title = title || 'Live app';
      f.loading = 'lazy';
      f.allow = allow;
      f.addEventListener('load', () => stage.querySelector('.live-loading')?.remove());
      stage.appendChild(f);
    };
    if (!wake) go(); else el.querySelector('button').addEventListener('click', go);
  }

  const openApp = id => window.WM && WM.open(id);

  // ============================================================
  // About
  // ============================================================
  function mountAbout(b, win) {
    const L = (id, t) => `<a href="#/${id}" data-open="${id}">${t}</a>`;
    const text = [
      'Aristea Gjokthomi',
      'Tirana, Albania',
      '',
      "Hi! I'm a data scientist. I did my MSc in Information Systems in Economics at the University of Tirana, and most of what I build sits somewhere between statistics, machine learning and actually shipping something people can use.",
      '',
      'Stuff on this desktop (open the icons, or click a name here):',
      '',
      `- ${L('coolcity', 'CoolCity')}`,
      '  Where should Tirana plant its next 1,000 trees? Satellite data + LightGBM + a greedy planner.',
      '',
      `- ${L('fiskal', 'Asistenti Fiskal')}`,
      '  Answers questions about Albanian tax law, and has to cite the article or it refuses.',
      '',
      `- ${L('finscope', 'FinScope')}`,
      "  My master's thesis: SEC filings -> warehouse -> forecasting and anomaly detection.",
      '',
      `- ${L('ndea', 'Bank NDEA')}`,
      '  How efficient are 9 Albanian banks? Done in R with network DEA.',
      '',
      `- ${L('speakup', 'Guxo')}`,
      '  A bilingual (EN/SQ) app for practising public speaking. It listens, counts your filler words and tracks your nerves over time.',
      '',
      `- ${L('kupon', 'Kupon')}`,
      '  Scan the QR code on any Albanian receipt and see where your money goes. Nothing leaves your phone.',
      '',
      'Right-click the desktop and pick the CoolCity heat map wallpaper btw. You can plant trees on it.',
      '',
      "One habit I try to keep: decide how a result will be judged before looking at it. On Asistenti Fiskal my main hypothesis didn't hold up, and the README says exactly that.",
      '',
      `github       <a href="https://github.com/Aristxa" target="_blank" rel="noopener">github.com/Aristxa</a>`,
      `huggingface  <a href="https://huggingface.co/aristeaaa" target="_blank" rel="noopener">huggingface.co/aristeaaa</a>`,
      `linkedin     <a href="https://www.linkedin.com/in/aristea-gjokthomi/" target="_blank" rel="noopener">linkedin.com/in/aristea-gjokthomi</a>`,
      `email        <a href="mailto:agjokthomii@gmail.com">agjokthomii@gmail.com</a>`,
      '',
    ].join('\n');
    b.classList.add('notepad');
    b.innerHTML = `
      <div class="np-menu">
        <button data-m="file">File</button><button data-m="edit">Edit</button><button data-m="format">Format</button><button data-m="view">View</button><button data-m="help">Help</button>
      </div>
      <pre class="np-text wrap" tabindex="0">${text}</pre>
      <div class="np-status"><span data-pos>Ln 1, Col 1</span><span data-zoom>100%</span><span>Windows (CRLF)</span><span>UTF-8</span></div>`;
    const pre = b.querySelector('.np-text');
    let zoom = 100;
    b.querySelector('.np-menu').addEventListener('click', e => {
      const m = e.target.closest('[data-m]')?.dataset.m;
      if (m === 'file') openApp('projects');
      if (m === 'edit') { const r = document.createRange(); r.selectNodeContents(pre); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      if (m === 'format') { pre.classList.toggle('wrap'); OS.toast(pre.classList.contains('wrap') ? 'Word wrap on' : 'Word wrap off'); }
      if (m === 'view') { zoom = zoom >= 130 ? 100 : zoom + 15; pre.style.fontSize = zoom / 100 * 14 + 'px'; b.querySelector('[data-zoom]').textContent = zoom + '%'; }
      if (m === 'help') OS.toast('Not really Notepad. Built by hand in plain JS.');
    });
    pre.addEventListener('click', e => {
      const o = e.target.closest('[data-open]');
      if (o) { e.preventDefault(); openApp(o.dataset.open); return; }
      const sel = getSelection();
      if (!sel.rangeCount) return;
      const r = sel.getRangeAt(0).cloneRange();
      r.setStart(pre, 0);
      const before = r.toString().split('\n');
      b.querySelector('[data-pos]').textContent = `Ln ${before.length}, Col ${before[before.length - 1].length + 1}`;
    });
  }

  // ============================================================
  // CoolCity
  // ============================================================
  const PARETO = [
    { n: 'Random', share: 31, cool: 5520, trees: 884, vs: '−55%' },
    { n: 'Hottest first', share: 36, cool: 8535, trees: 738, vs: '−31%' },
    { n: 'Densest first', share: 55, cool: 12385, trees: 778, vs: '—' },
    { n: 'λ = 0', share: 42, cool: 16958, trees: 930, vs: '+37%', l: 0 },
    { n: 'λ = 1', share: 76, cool: 16904, trees: 1000, vs: '+36%', l: 1 },
    { n: 'λ = 2', share: 87, cool: 15784, trees: 932, vs: '+27%', l: 2 },
  ];

  function paretoChart(el) {
    el.innerHTML = `
      <div class="viz-head"><span class="mono dim">Cooling vs. equity · €300k budget, ≤ 1,000 trees</span>
        <div class="seg" role="radiogroup" aria-label="Equity weight">
          ${[0, 1, 2].map(l => `<button role="radio" aria-checked="${l === 0}" data-l="${l}">λ = ${l}</button>`).join('')}
        </div>
      </div>
      <svg class="pareto" viewBox="0 0 540 300" role="img" aria-label="Strategies plotted by person-degrees of cooling against share reaching the poorest third"></svg>
      <div class="readout"></div>
      <p class="note">Each point is a published result. The dashed line is CoolCity's equity sweep. Raising the poorest third's share from 42% to 76% costs just 0.3% of total cooling.</p>`;
    const svg = el.querySelector('svg');
    const M = { l: 56, r: 18, t: 14, b: 42 }, Wd = 540, Ht = 300;
    const x = s => M.l + (s - 25) / (95 - 25) * (Wd - M.l - M.r);
    const y = c => Ht - M.b - (c - 4000) / (18500 - 4000) * (Ht - M.t - M.b);
    let s = '<g class="grid">';
    [30, 45, 60, 75, 90].forEach(v => { s += `<line x1="${x(v)}" x2="${x(v)}" y1="${M.t}" y2="${Ht - M.b}"/><text x="${x(v)}" y="${Ht - M.b + 16}" text-anchor="middle">${v}%</text>`; });
    [5000, 10000, 15000].forEach(v => { s += `<line x1="${M.l}" x2="${Wd - M.r}" y1="${y(v)}" y2="${y(v)}"/><text x="${M.l - 8}" y="${y(v) + 3}" text-anchor="end">${v / 1000}k</text>`; });
    s += '</g>';
    s += `<text class="ax" x="${(Wd + M.l) / 2}" y="${Ht - 6}" text-anchor="middle">share of cooling reaching the poorest third →</text>`;
    s += `<text class="ax" transform="translate(14 ${(Ht - M.b + M.t) / 2}) rotate(-90)" text-anchor="middle">person-°C of cooling →</text>`;
    const cc = PARETO.filter(p => p.l !== undefined);
    s += `<path class="frontier" d="M${cc.map(p => `${x(p.share)} ${y(p.cool)}`).join(' L')}"/>`;
    PARETO.forEach(p => {
      const isC = p.l !== undefined;
      const lx = x(p.share), ly = y(p.cool);
      const dy = isC ? (p.l === 1 ? -14 : p.l === 0 ? -14 : 20) : 18;
      const anchor = p.share > 80 ? 'end' : 'middle';
      s += `<circle class="pt ${isC ? 'cc' : 'base'}" data-l="${isC ? p.l : ''}" cx="${lx}" cy="${ly}" r="${isC ? 6 : 5}"/>`;
      s += `<text class="pt-label" x="${lx + (anchor === 'end' ? 6 : 0)}" y="${ly + dy}" text-anchor="${anchor}">${p.n}</text>`;
    });
    s += `<circle class="halo" r="12"/><circle class="halo pulse-ring" r="12"/>`;
    svg.innerHTML = s;
    const halos = svg.querySelectorAll('.halo');
    const read = el.querySelector('.readout');
    function pick(l) {
      const p = cc[l];
      el.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', String(+b.dataset.l === l)));
      halos.forEach(h => { h.setAttribute('cx', x(p.share)); h.setAttribute('cy', y(p.cool)); });
      read.innerHTML = `
        <div><span class="k">person-°C</span><span class="v">${p.cool.toLocaleString('en')}</span></div>
        <div><span class="k">vs densest-first</span><span class="v cool">${p.vs}</span></div>
        <div><span class="k">poorest third</span><span class="v">${p.share}%</span></div>
        <div><span class="k">trees</span><span class="v">${p.trees.toLocaleString('en')}</span></div>`;
    }
    el.querySelector('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) pick(+b.dataset.l); });
    pick(0);
  }

  function mountCoolCity(b) {
    tabs(b, [
      { id: 'o', label: 'Overview', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">Where should Tirana plant its next 1,000 trees?</h2>
            <p>In summer, surface temperatures in Tirana's densest neighbourhoods pass <b>46 °C</b>, while the Grand Park area stays about 10 °C cooler.
            CoolCity learns how much cooling a tree buys in each of <b>14,630</b> 100 m cells, using three summers of satellite data.
            It then picks sites that cool the most residents per euro, with a tunable guarantee that the poorest neighbourhoods get their share.</p>
            <table class="facts"><tbody>
              <tr><td class="n">+37%</td><td>cooling vs. the best simple rule</td></tr>
              <tr><td class="n">0.916</td><td>R² with 1 km spatial-block CV</td></tr>
              <tr><td class="n">0.90 °C</td><td>RMSE (linear baseline 1.12)</td></tr>
              <tr><td class="n">−1.35 °C</td><td>per +10 pts canopy</td></tr>
            </tbody></table>
            <h4 class="mono">Method notes</h4>
            <ul class="bul">
              <li>Each Landsat scene is <b>normalised by its city-wide median</b>, so the composite captures <i>where</i> it's hot, not <i>when</i>.</li>
              <li><b>Spatial-block CV</b>, because random K-fold leaks between neighbouring cells.</li>
              <li><b>Monotone constraints</b> on greenery features encode the physics and stop the optimiser from exploiting noise.</li>
              <li><b>No coordinates as features</b>, so the model learns mechanisms instead of memorising places.</li>
            </ul>
            <p class="built">Built with LightGBM, Landsat 8/9, Sentinel-2, WorldPop, OSM, Planetary Computer, lazy greedy.</p>
            <div class="row-links"><a class="btn-sm primary" href="https://github.com/Aristxa/Cool-City" target="_blank" rel="noopener">Source &amp; method ↗</a><button class="btn-sm" data-go="f">See the trade-off →</button></div>
          </div>`;
        el.querySelector('[data-go]').addEventListener('click', () => b.querySelector('[data-t=f]').click());
      } },
      { id: 'f', label: 'Trade-off', render: paretoChart },
      { id: 't', label: 'Try it', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">Try a small CoolCity as your wallpaper.</h2>
            <p>Switch the desktop to a synthetic surface-temperature field. Every tree cools its own cell and its neighbours, and cooling saturates when trees stack up.
            The planner uses the same idea as the real one: a <b>lazy greedy</b> search that places each tree where the population-weighted marginal cooling is largest.</p>
            <table class="facts"><tbody>
              <tr><td class="n" data-k="mean">—</td><td>mean surface</td></tr>
              <tr><td class="n" data-k="trees">0</td><td>trees</td></tr>
              <tr><td class="n cool" data-k="delta">0.00°</td><td>cooled</td></tr>
            </tbody></table>
            <div class="row-links">
              <button class="btn-sm primary" data-use>Use as wallpaper</button>
              <button class="btn-sm" data-run>▶ Plant 25 with greedy planner</button>
              <button class="btn-sm" data-reset>Reset</button>
              <button class="btn-sm" data-back>Back to galaxy</button>
            </div>
            <p class="note">Toy model for illustration. The synthetic field is not Tirana data. Minimise this window to watch, or click the wallpaper to plant trees yourself.</p>
          </div>`;
        const set = st => {
          el.querySelector('[data-k=mean]').textContent = st.mean.toFixed(1) + '°C';
          el.querySelector('[data-k=trees]').textContent = st.trees;
          el.querySelector('[data-k=delta]').textContent = OS.fmtCool(st.delta);
        };
        Heat.onStats(set);
        el.querySelector('[data-use]').addEventListener('click', () => OS.setWallpaper('heat'));
        el.querySelector('[data-back]').addEventListener('click', () => OS.setWallpaper('galaxy'));
        el.querySelector('[data-run]').addEventListener('click', () => OS.runPlanner());
        el.querySelector('[data-reset]').addEventListener('click', () => Heat.reset());
      } },
    ]);
  }

  // ============================================================
  // Asistenti Fiskal
  // ============================================================
  const BENCH = [
    { name: 'Semantic (dense)', tag: 'exploratory', art: [28, 16], act: [68, 63] },
    { name: 'Hybrid: semantic + BM25', tag: 'pre-registered', art: [23, 20], act: [62, 63] },
    { name: 'Keyword (BM25)', tag: '', art: [12, 10], act: [50, 47] },
  ];

  function benchChart(el) {
    el.innerHTML = `
      <div class="viz-head"><span class="mono dim">Retrieval hit-rate · 60 hand-labelled questions</span>
        <div class="seg" role="radiogroup" aria-label="Metric">
          <button role="radio" aria-checked="true" data-m="art">found article</button>
          <button role="radio" aria-checked="false" data-m="act">found act</button>
        </div>
      </div>
      <div class="bars"></div>
      <div class="bars-legend mono"><span><i class="sw a"></i>chunk by article</span><span><i class="sw f"></i>fixed window</span><span class="rule">rule fixed in advance: Δ &lt; 10 pts ⇒ no clear difference</span></div>
      <p class="note">The pre-registered comparison (hybrid arm) came out <b>null</b>, and that's what gets reported. The semantic arm's 20-point gap was spotted after the results were in, so it stays labelled exploratory. Structurally, though, a fixed window cites things like <i>"window 437"</i>, which can never be a legal citation.</p>`;
    const bars = el.querySelector('.bars');
    function draw(m) {
      el.querySelectorAll('.seg button').forEach(b => b.setAttribute('aria-checked', String(b.dataset.m === m)));
      bars.innerHTML = BENCH.map(r => {
        const [a, f] = r[m];
        const pa = m === 'art' ? Math.round(a / 60 * 100) : a;
        const pf = m === 'art' ? Math.round(f / 60 * 100) : f;
        const la = m === 'art' ? `<b>${pa}%</b> ${a}/60` : `<b>${pa}%</b>${r.name.startsWith('Semantic') ? ' 41/60' : ''}`;
        const lf = m === 'art' ? `<b>${pf}%</b> ${f}/60` : `<b>${pf}%</b>`;
        const d = pa - pf;
        const clear = Math.abs(d) >= 10;
        return `
          <div class="bar-group">
            <div class="bg-head"><span class="bg-name">${r.name}${r.tag ? ` <em class="mono">${r.tag}</em>` : ''}</span><span class="verdict ${clear ? 'clear' : ''}">Δ ${d > 0 ? '+' : ''}${d} pts · ${clear ? 'clear' : 'no clear diff.'}</span></div>
            <div class="bar-row"><div class="bar-track"><div class="bar-fill a" style="--w:${pa}%"></div></div><span class="bar-val">${la}</span></div>
            <div class="bar-row"><div class="bar-track"><div class="bar-fill f" style="--w:${pf}%"></div></div><span class="bar-val">${lf}</span></div>
          </div>`;
      }).join('');
    }
    el.querySelector('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) draw(b.dataset.m); });
    draw('art');
  }

  const FISKAL_STEPS = [
    ['Crawl', 'tatime.gov.al, 11 categories. Rate-limited, resumable, magic-byte type sniffing.', '253 docs · 262 MB'],
    ['Extract', 'PyMuPDF text extraction plus detection of each document\'s structural regime.', '129 decimal · 78 neni · 46 flat'],
    ['Segment ×2', 'Every document is chunked two ways: by legal article and by fixed window. Both arms are kept for the experiment.', '16,917 article · 14,166 window'],
    ['Retrieve', 'Dense FAISS over sentence embeddings, plus BM25 keyword search.', 'index built on a free Colab T4'],
    ['Fuse', 'Reciprocal rank fusion merges the dense and keyword rankings.', 'RRF'],
    ['Generate', 'An LLM answers under a citation contract: every claim must point at a retrieved article.', '0 unretrieved citations / 81'],
    ['Answer or refuse', 'Answers cite the controlling article, link the official source and state the law\'s vintage. Otherwise the system refuses.', '8 / 9 refusals after retrieval miss'],
  ];

  function stepper(el, steps) {
    el.innerHTML = `<ol class="stepper">${steps.map((s, i) => `<li style="--i:${i}"><span class="st-n mono">${String(i + 1).padStart(2, '0')}</span><div><b>${s[0]}</b><p>${s[1]}</p></div><span class="st-k mono">${s[2]}</span></li>`).join('')}</ol>`;
  }

  function mountFiskal(b) {
    tabs(b, [
      { id: 'o', label: 'Overview', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">Q&amp;A over Albanian tax law that cites the article, or refuses.</h2>
            <p>Albanian tax law is spread across laws, guidelines, VKM decisions and yearly amendments. General-purpose LLMs answer questions about it fluently, often wrongly, and with no way to check.
            Asistenti Fiskal answers only what the law says. It cites the controlling article, links the official source, and refuses out-of-scope questions.</p>
            <blockquote>In Albanian legal QA, correctness is decided by retrieval, not by the language model.</blockquote>
            <table class="facts"><tbody>
              <tr><td class="n">60</td><td>Q&amp;A benchmark, the first public one for Albanian tax law</td></tr>
              <tr><td class="n">31,083</td><td>chunks across 253 documents</td></tr>
              <tr><td class="n">0 / 81</td><td>answers citing an unretrieved source</td></tr>
              <tr><td class="n">+18 pts</td><td>hybrid over keyword-only</td></tr>
            </tbody></table>
            <p class="built">Built with FAISS, BM25, RRF, sentence-transformers, Claude, Gradio, PyMuPDF.</p>
            <div class="row-links"><button class="btn-sm primary" data-go="l">Try it live →</button><a class="btn-sm" href="https://github.com/Aristxa/Asistenti-Fiskal" target="_blank" rel="noopener">Source ↗</a></div>
          </div>`;
        el.querySelector('[data-go]').addEventListener('click', () => b.querySelector('[data-t=l]').click());
      } },
      { id: 'b', label: 'Benchmark', render: benchChart },
      { id: 'p', label: 'Pipeline', render: el => stepper(el, FISKAL_STEPS) },
      { id: 'l', label: 'Live', flush: true, render: el => live(el, 'https://aristeaaa-assistent.hf.space', { note: 'The real system, running on a free Hugging Face Space. Ask it about Albanian tax law (in Albanian).', title: 'Asistenti Fiskal' }) },
    ]);
  }

  // ============================================================
  // FinScope
  // ============================================================
  const FIN = [
    { k: 'Raw', t: 'SEC EDGAR filings', d: 'Financial Statement Data Sets (sub.txt + num.txt). Public TSV, no third-party data API.', kv: [['archives', '20'], ['span', '2021Q1–2025Q4']] },
    { k: 'Bronze', t: 'Parse & filter', d: 'Raw XBRL rows parsed and filtered to the target filers.', kv: [['companies', '10'], ['sectors', 'tech · finance · health · auto']] },
    { k: 'Silver', t: 'Map & dedupe', d: 'XBRL tags mapped to canonical metrics. On conflicts the latest filed_date wins, and fiscal Q4 is implied as Annual − Q1 − Q2 − Q3 with a 290-day lookback.', kv: [['conflicts', 'ON CONFLICT DO UPDATE']] },
    { k: 'Gold', t: 'Star schema', d: 'A normalised SQLite star schema built for OLAP-style slicing and drill-down.', kv: [['facts', '~4,501'], ['periods', '57']] },
    { k: 'Forecast', t: 'Five models', d: 'Naive random walk, ARIMA, SARIMA, Prophet and an LSTM with MC-Dropout intervals. Walk-forward backtests, compared with Diebold–Mariano tests (HLN-corrected).', kv: [['experiments', '150'], ['PI', '80% calibration']] },
    { k: 'Anomaly', t: 'Unusual quarters', d: 'Z-scores with Benjamini–Hochberg FDR control over the full multiple-testing universe, plus an Isolation Forest across all metrics at once.', kv: [['tests', '~4,057'], ['FDR', 'BH']] },
    { k: 'Serve', t: 'Dashboard', d: 'FastAPI + Jinja2 + Plotly.js: 10 pages, a JSON/SSE API, income-statement waterfalls and click-to-drill OLAP.', kv: [['pages', '10'], ['deploy', 'Docker · HF Spaces']] },
  ];

  function finPipeline(el) {
    el.innerHTML = `
      <div class="viz-head"><span class="mono dim">Medallion ETL → analytics · click a stage</span><button class="btn-sm" data-auto>▶ auto-play</button></div>
      <div class="pipeline"><div class="pipe-rail"><i></i></div>${FIN.map((s, i) => `<button class="stage" data-i="${i}"><span class="dot">${i + 1}</span><span class="stage-name">${s.k}</span></button>`).join('')}</div>
      <div class="pipe-detail" aria-live="polite"></div>`;
    const detail = el.querySelector('.pipe-detail');
    const rail = el.querySelector('.pipe-rail i');
    let cur = 0, timer = null;
    function set(i) {
      cur = i;
      el.querySelectorAll('.stage').forEach((s, j) => { s.classList.toggle('active', j === i); s.classList.toggle('done', j < i); });
      rail.style.width = (i / (FIN.length - 1) * 100) + '%';
      const s = FIN[i];
      detail.innerHTML = `<h5>${s.t}</h5><p>${s.d}</p><div class="pipe-kv">${s.kv.map(([k, v]) => `<span>${k} <b>${v}</b></span>`).join('')}</div>`;
    }
    const stopAuto = () => { clearInterval(timer); timer = null; el.querySelector('[data-auto]').textContent = '▶ auto-play'; };
    el.querySelector('.pipeline').addEventListener('click', e => { const s = e.target.closest('.stage'); if (s) { stopAuto(); set(+s.dataset.i); } });
    el.querySelector('[data-auto]').addEventListener('click', ev => {
      if (timer) return stopAuto();
      ev.target.textContent = '■ stop';
      timer = setInterval(() => { if (!el.isConnected) return stopAuto(); set((cur + 1) % FIN.length); }, 1800);
    });
    set(0);
  }

  function mountFinScope(b) {
    tabs(b, [
      { id: 'o', label: 'Overview', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">Financial analytics built entirely from free SEC filings.</h2>
            <p>FinScope takes raw XBRL quarterly reports from SEC EDGAR and runs them through a Bronze → Silver → Gold pipeline into a star-schema warehouse.
            The result is an interactive dashboard for OLAP analysis, five-model forecasting, and anomaly detection that surfaces odd quarters single-metric dashboards miss.</p>
            <table class="facts"><tbody>
              <tr><td class="n">150</td><td>walk-forward experiments (10 × 3 × 5)</td></tr>
              <tr><td class="n">5</td><td>models, naive to LSTM + MC-Dropout</td></tr>
              <tr><td class="n">~4,057</td><td>tests under BH-FDR control</td></tr>
              <tr><td class="n">10</td><td>dashboard pages</td></tr>
            </tbody></table>
            <h4 class="mono">Evaluation protocol</h4>
            <ul class="bul">
              <li><b>Walk-forward</b>, expanding window, min_train = 16 quarters, step = 1.</li>
              <li><b>MAPE / RMSE / MAE</b> point loss, plus a skill score against the random walk.</li>
              <li><b>80% prediction-interval calibration</b>: the share of test points that land inside.</li>
              <li><b>Diebold–Mariano</b> with the Harvey–Leybourne–Newbold small-sample correction.</li>
            </ul>
            <p class="built">Built with FastAPI, SQLite, statsmodels, Prophet, TensorFlow, scikit-learn, Plotly.js, Docker.</p>
            <div class="row-links"><button class="btn-sm primary" data-go="l">Open dashboard →</button><a class="btn-sm" href="https://github.com/Aristxa/FINSCOPE" target="_blank" rel="noopener">Source ↗</a></div>
          </div>`;
        el.querySelector('[data-go]').addEventListener('click', () => b.querySelector('[data-t=l]').click());
      } },
      { id: 'p', label: 'Pipeline', render: finPipeline },
      { id: 'l', label: 'Live', flush: true, render: el => live(el, 'https://aristeaaa-finscope.hf.space/', { note: 'The full FastAPI dashboard, running in Docker on a free Hugging Face Space.', title: 'FinScope dashboard' }) },
    ]);
  }

  // ============================================================
  // NDEA
  // ============================================================
  function network(el) {
    el.innerHTML = `
      <div class="viz-head"><span class="mono dim">Two-stage dynamic network · hover a node</span></div>
      <svg class="network" viewBox="0 0 600 300" role="img" aria-label="Inputs staff, branches, deposits feed stage 1, producing investments, cards and loans, which feed stage 2 producing net income and ROE, with carry-over to the next year"></svg>
      <p class="note mono">network efficiency θ = θ<sub>stage 1</sub> × θ<sub>stage 2</sub> · LPs solved per bank × year × stage</p>`;
    const svg = el.querySelector('svg');
    const N = {
      staff: [10, 50, 'Staff'], branches: [10, 110, 'Branches'], deposits: [10, 170, 'Deposits'],
      s1: [140, 90, 'Stage 1', 1],
      inv: [262, 50, 'Investments'], cards: [262, 110, 'Cards'], loans: [262, 170, 'Loans'],
      s2: [400, 90, 'Stage 2', 1],
      ni: [512, 80, 'Net income'], roe: [512, 140, 'ROE'],
    };
    const size = k => N[k][3] ? [82, 70] : (k === 'ni' || k === 'roe' ? [80, 30] : [92, 30]);
    const E = [['staff', 's1'], ['branches', 's1'], ['deposits', 's1'], ['s1', 'inv'], ['s1', 'cards'], ['s1', 'loans'], ['inv', 's2'], ['cards', 's2'], ['loans', 's2'], ['s2', 'ni'], ['s2', 'roe']];
    const R = k => { const [x, y] = N[k]; const [w, h] = size(k); return { x, y, w, h, cx: x + w / 2, cy: y + h / 2 }; };
    let s = `<text class="col" x="56" y="30" text-anchor="middle">inputs</text><text class="col" x="308" y="30" text-anchor="middle">intermediate</text><text class="col" x="552" y="62" text-anchor="middle">outputs</text>`;
    E.forEach(([a, bb]) => {
      const A = R(a), B = R(bb);
      const x1 = A.x + A.w, y1 = A.cy, x2 = B.x, y2 = B.cy, mx = (x1 + x2) / 2;
      s += `<path class="edge flow" data-a="${a}" data-b="${bb}" d="M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}"/>`;
    });
    const L = R('loans'), S1 = R('s1');
    s += `<path class="edge carry" data-a="loans" data-b="s1" d="M${L.cx} ${L.y + L.h} C${L.cx} 270 ${S1.cx} 270 ${S1.cx} ${S1.y + S1.h}"/>`;
    s += `<text class="carry-l" x="${(L.cx + S1.cx) / 2}" y="262" text-anchor="middle">carry-over → year t+1</text>`;
    Object.keys(N).forEach(k => {
      const r = R(k);
      s += `<g class="node ${N[k][3] ? 'stage-node' : ''}" data-k="${k}" tabindex="0"><rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="${N[k][3] ? 12 : 8}"/><text x="${r.cx}" y="${r.cy + 3.5}" text-anchor="middle">${N[k][2]}</text></g>`;
    });
    svg.innerHTML = s;
    const lit = k => {
      svg.querySelectorAll('.edge').forEach(p => {
        const on = !k || p.dataset.a === k || p.dataset.b === k;
        p.classList.toggle('lit', !!k && on);
        p.classList.toggle('dimmed', !!k && !on);
      });
      svg.querySelectorAll('.node').forEach(n => n.classList.toggle('lit', n.dataset.k === k));
    };
    svg.querySelectorAll('.node').forEach(n => {
      n.addEventListener('mouseenter', () => lit(n.dataset.k));
      n.addEventListener('focus', () => lit(n.dataset.k));
      n.addEventListener('mouseleave', () => lit(null));
      n.addEventListener('blur', () => lit(null));
    });
  }

  function mountNDEA(b) {
    tabs(b, [
      { id: 'o', label: 'Overview', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">How efficient are Albania's banks, stage by stage?</h2>
            <p>A Dynamic Network DEA of nine Albanian commercial banks from 2021 to 2023. Stage 1 turns labour, branches and deposits into investments, cards and loans.
            Stage 2 turns those into net income and ROE. Carry-overs push part of each year's intermediate products into the next year's inputs.</p>
            <table class="facts"><tbody>
              <tr><td class="n">9</td><td>banks, from BKT to ABI</td></tr>
              <tr><td class="n">3</td><td>years, dynamic carry-over</td></tr>
              <tr><td class="n">10</td><td>variables from annual reports</td></tr>
              <tr><td class="n">2</td><td>stages, θ = θ₁ × θ₂</td></tr>
            </tbody></table>
            <h4 class="mono">Supplementary analyses</h4>
            <ul class="bul">
              <li><b>Bias-corrected bootstrap</b> confidence intervals (Simar &amp; Wilson, 1998).</li>
              <li><b>Malmquist productivity index</b>, decomposed into efficiency change × frontier shift.</li>
              <li><b>Sensitivity analysis</b> across the carry-over parameters.</li>
            </ul>
            <p class="built">Built with R, Benchmarking, Quarto, Shiny, Plotly, GitHub Actions.</p>
            <div class="row-links"><button class="btn-sm primary" data-go="r">Read the report →</button><a class="btn-sm" href="https://github.com/Aristxa/bank-efficiency-ndea" target="_blank" rel="noopener">Source ↗</a></div>
          </div>`;
        el.querySelector('[data-go]').addEventListener('click', () => b.querySelector('[data-t=r]').click());
      } },
      { id: 'n', label: 'Network', render: network },
      { id: 'r', label: 'Report', flush: true, render: el => live(el, 'https://aristxa.github.io/bank-efficiency-ndea/', { wake: false, title: 'NDEA report' }) },
    ]);
  }

  // ============================================================
  // Guxo (Speak-UP)
  // ============================================================
  function mountSpeakUp(b) {
    tabs(b, [
      { id: 'o', label: 'Overview', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">Guxo: practise public speaking until it stops being scary.</h2>
            <p>A bilingual (English / Albanian) web app for people who are afraid of speaking in public. It gives you a prompt and a short time to prepare,
            then you speak until the timer runs out. Your pace, filler words and nerves are tracked over time, so you can see the fear actually shrinking.</p>
            <table class="facts"><tbody>
              <tr><td class="n">4</td><td>practice modes: single word, question, debate (switch sides halfway), story from three random words</td></tr>
              <tr><td class="n">130+</td><td>prompts in 11 topics, each in EN and SQ, plus a daily challenge</td></tr>
              <tr><td class="n">30s → 5 min</td><td>"Courage Path": three full sessions unlock the next level</td></tr>
              <tr><td class="n">0</td><td>bytes uploaded. Everything stays in the browser</td></tr>
            </tbody></table>
            <h4 class="mono">How it works</h4>
            <ul class="bul">
              <li><b>Live transcript</b> with the Web Speech API: words per minute, plus filler words detected per language (<i>um, like</i> / <i>ëë, domethënë, pra</i>) and highlighted.</li>
              <li><b>Pause detection</b>: calibrates to room noise while you prepare, then measures your longest pause and how much of the time you were actually speaking.</li>
              <li><b>A session built around nerves</b>: a 1–5 nervousness check-in, an optional 4-2-6 breathing warm-up, speech structures like PREP, gentle nudges after 4 s of silence, and a reflection at the end.</li>
              <li><b>Progress</b>: streaks, total minutes, a before/after nervousness chart, 12 badges, audio or video recordings you can download, and JSON export.</li>
            </ul>
            <p class="built">Built with vanilla JavaScript, Web Audio API, Web Speech API, MediaRecorder and localStorage. No framework, no build step.</p>
            <div class="row-links"><button class="btn-sm primary" data-go="l">Try it here →</button><a class="btn-sm" href="https://aristxa.github.io/Speak-UP/" target="_blank" rel="noopener">Open full screen ↗</a><a class="btn-sm" href="https://github.com/Aristxa/Speak-UP" target="_blank" rel="noopener">Source ↗</a></div>
          </div>`;
        el.querySelector('[data-go]').addEventListener('click', () => b.querySelector('[data-t=l]').click());
      } },
      { id: 'l', label: 'Live', flush: true, render: el => live(el, 'https://aristxa.github.io/Speak-UP/', { wake: false, title: 'Guxo', allow: 'microphone; camera; clipboard-write' }) },
    ]);
  }

  // ============================================================
  // Kupon
  // ============================================================
  function mountKupon(b) {
    tabs(b, [
      { id: 'o', label: 'Overview', render: el => {
        el.innerHTML = `
          <div class="case">
            <h2 class="case-q">Kupon: scan your receipts, see where your money goes.</h2>
            <p>By law, every fiscal receipt in Albania carries a QR code. The tax authority's portal only uses it to check that a receipt is valid,
            and apps like Expensify don't understand Albanian receipts. Kupon is a phone app built on that QR code: point the camera at a receipt
            and the store, items, VAT and total are logged, with no typing and no account.</p>
            <table class="facts"><tbody>
              <tr><td class="n">1 scan</td><td>logs a receipt: camera, photo upload or pasted link, with duplicates caught by the receipt's unique code</td></tr>
              <tr><td class="n">48 h</td><td>the window in which tills without internet may declare late. Kupon keeps checking, then flags receipts the tax authority never received</td></tr>
              <tr><td class="n">2</td><td>languages: Albanian first, English toggle</td></tr>
              <tr><td class="n">0</td><td>Kupon servers. Receipts stay in the browser, and it works offline</td></tr>
            </tbody></table>
            <h4 class="mono">What it does</h4>
            <ul class="bul">
              <li><b>Declared check</b>: every receipt is looked up on the tax authority's public portal, which returns the store name, the items and the VAT, and shows whether the receipt was declared.</li>
              <li><b>Price memory</b>: every product you buy gets a price history across stores, showing where it is cheapest and how its price has changed.</li>
              <li><b>Split the bill</b>: equally, by amount, or by item (tap who had what), then a ready message for WhatsApp (<i>Secili: 1 450 L</i>).</li>
              <li><b>Overview</b>: this month against the same days of last month, VAT paid, spend by category and store, and monthly budgets.</li>
              <li><b>Warranty vault</b>: mark a receipt as under warranty, see what expires soon, and add a calendar reminder.</li>
            </ul>
            <h4 class="mono">The trick</h4>
            <p>The QR code only holds the store's tax ID, the date and the total. The portal's own page gets the rest with a plain form POST,
            which needs no CORS preflight, and the endpoint allows any origin. So the app reads it straight from the phone, with no proxy or scraping:
            one request per receipt you scan.</p>
            <p class="built">Built with vanilla JavaScript, BarcodeDetector with a jsQR fallback, localStorage and a service worker (installable PWA). No framework, no build step.</p>
            <div class="row-links"><button class="btn-sm primary" data-go="l">Try it here →</button><a class="btn-sm" href="https://aristxa.github.io/KUPON/" target="_blank" rel="noopener">Open on your phone ↗</a><a class="btn-sm" href="https://github.com/Aristxa/KUPON" target="_blank" rel="noopener">Source ↗</a></div>
          </div>`;
        el.querySelector('[data-go]').addEventListener('click', () => b.querySelector('[data-t=l]').click());
      } },
      { id: 'l', label: 'Live', flush: true, render: el => live(el, 'https://aristxa.github.io/KUPON/', { wake: false, title: 'Kupon', allow: 'camera; clipboard-write' }) },
    ]);
  }

  // ============================================================
  // Explorer
  // ============================================================
  const FILES = [
    { f: 'flagship', icon: 'coolcity', name: 'CoolCity Tirana', meta: 'Python · LightGBM · optimisation', open: 'coolcity' },
    { f: 'flagship', icon: 'fiskal', name: 'Asistenti Fiskal', meta: 'Python · RAG · Gradio', open: 'fiskal' },
    { f: 'flagship', icon: 'finscope', name: 'FinScope', meta: 'Python · FastAPI · forecasting', open: 'finscope' },
    { f: 'flagship', icon: 'ndea', name: 'Bank Efficiency NDEA', meta: 'R · DEA · Quarto', open: 'ndea' },
    { f: 'flagship', icon: 'speakup', name: 'Guxo · Speak Boldly', meta: 'JavaScript · Web Audio · Web Speech', open: 'speakup', url: 'https://github.com/Aristxa/Speak-UP' },
    { f: 'flagship', icon: 'kupon', name: 'Kupon', meta: 'JavaScript · QR scanning · PWA', open: 'kupon', url: 'https://github.com/Aristxa/KUPON' },
    { f: 'archive', icon: 'music', name: 'Music AI Generator', meta: 'TensorFlow · LSTM · Music21', desc: 'LSTM sequence model trained on the MAESTRO piano dataset. Generates 30–60 s melodies with MIDI export and a web player.', open: 'music', url: 'https://github.com/Aristxa/Music-AI-Generator' },
    { f: 'archive', icon: 'file', name: 'Hospital Management System', meta: 'PHP · MySQL', desc: 'Role-based web app for admins, doctors and patients: records, appointments, medical history and billing.', url: 'https://github.com/Aristxa/Hospital-Management-System' },
    { f: 'archive', icon: 'file', name: 'Movie Management System', meta: 'PHP · SQL', desc: 'Catalogue platform for admins, users and cinema managers over a centralised database.', url: 'https://github.com/Aristxa/Movies-Management-System' },
    { f: 'archive', icon: 'file', name: 'Caffe Bistro', meta: 'TypeScript · Vite', desc: 'Marketing site for a bakery bistro.', url: 'https://github.com/Aristxa/DEMO-CAFFE-BISTRO' },
    { f: 'live', icon: 'hf', name: 'Asistenti Fiskal (live app)', meta: 'Hugging Face Space', desc: 'The working Asistenti Fiskal app. Ask it about Albanian tax law.', url: 'https://aristeaaa-assistent.hf.space/' },
    { f: 'live', icon: 'hf', name: 'FinScope (live app)', meta: 'Hugging Face Space', desc: 'The FinScope dashboard, running on Hugging Face.', url: 'https://aristeaaa-finscope.hf.space/' },
  ];
  const FOLDERS = [['all', 'All'], ['flagship', 'Flagship'], ['archive', 'Archive'], ['live', 'Live apps']];

  function mountExplorer(b) {
    b.classList.add('explorer');
    b.innerHTML = `
      <aside class="ex-side">${FOLDERS.map(([k, l]) => `<button data-f="${k}" aria-pressed="${k === 'all'}">${Icons.html('projects', 18)}<span>${l}</span></button>`).join('')}</aside>
      <div class="ex-main">
        <div class="ex-path mono">~/projects/<span data-path></span></div>
        <div class="ex-grid" role="listbox" aria-label="Projects"></div>
        <div class="ex-info mono">Select an item · double-click to open</div>
      </div>`;
    const grid = b.querySelector('.ex-grid');
    const info = b.querySelector('.ex-info');
    const act = it => it.open ? openApp(it.open) : window.open(it.url, '_blank', 'noopener');
    function show(f) {
      b.querySelectorAll('.ex-side button').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.f === f)));
      b.querySelector('[data-path]').textContent = f === 'all' ? '' : f;
      grid.innerHTML = FILES.map((it, i) => (f === 'all' || it.f === f) ? `<button class="ex-item" role="option" data-i="${i}">${Icons.html(it.icon, 44)}<span>${it.name}</span></button>` : '').join('');
    }
    b.querySelector('.ex-side').addEventListener('click', e => { const x = e.target.closest('button'); if (x) show(x.dataset.f); });
    grid.addEventListener('click', e => {
      const x = e.target.closest('.ex-item'); if (!x) return;
      grid.querySelectorAll('.ex-item').forEach(y => y.setAttribute('aria-selected', String(y === x)));
      const it = FILES[+x.dataset.i];
      info.innerHTML = `<b>${it.name}</b> · ${it.meta}${it.desc ? `<br><span class="dim">${it.desc}</span>` : ''}<br><button class="btn-sm primary" data-act>${it.open ? 'Open app' : 'Open on web ↗'}</button>${it.url && it.open ? ` <a class="btn-sm" href="${it.url}" target="_blank" rel="noopener">Source ↗</a>` : ''}`;
      info.querySelector('[data-act]').addEventListener('click', () => act(it));
      if (matchMedia('(pointer: coarse)').matches && !it.desc) act(it);
    });
    grid.addEventListener('dblclick', e => { const x = e.target.closest('.ex-item'); if (x) act(FILES[+x.dataset.i]); });
    grid.addEventListener('keydown', e => { const x = e.target.closest('.ex-item'); if (x && e.key === 'Enter') act(FILES[+x.dataset.i]); });
    show('all');
  }

  // ============================================================
  // GitHub (live)
  // ============================================================
  const LANG = { Python: '#3572A5', R: '#198CE7', TypeScript: '#3178c6', JavaScript: '#f1e05a', PHP: '#4F5D95', HTML: '#e34c26', 'Jupyter Notebook': '#DA5B0B', CSS: '#563d7c' };
  const ago = d => {
    const s = (Date.now() - new Date(d)) / 1000;
    const u = [[31536000, 'y'], [2592000, 'mo'], [86400, 'd'], [3600, 'h'], [60, 'm']];
    for (const [n, l] of u) if (s >= n) return Math.floor(s / n) + l + ' ago';
    return 'just now';
  };

  async function ghData() {
    try { const c = JSON.parse(sessionStorage.getItem('gh') || 'null'); if (c && Date.now() - c.t < 6e5) return c.d; } catch (e) {}
    const [u, r] = await Promise.all([
      fetch('https://api.github.com/users/Aristxa').then(x => { if (!x.ok) throw new Error(x.status); return x.json(); }),
      fetch('https://api.github.com/users/Aristxa/repos?per_page=100&sort=updated').then(x => { if (!x.ok) throw new Error(x.status); return x.json(); }),
    ]);
    const d = { u, r: r.filter(x => !x.fork) };
    try { sessionStorage.setItem('gh', JSON.stringify({ t: Date.now(), d })); } catch (e) {}
    return d;
  }

  async function mountGitHub(b) {
    b.innerHTML = `<div class="gh"><div class="live-loading mono"><span class="spinner"></span>GET api.github.com/users/Aristxa …</div></div>`;
    const root = b.querySelector('.gh');
    try {
      const { u, r } = await ghData();
      const counts = {};
      r.forEach(x => { if (x.language) counts[x.language] = (counts[x.language] || 0) + 1; });
      const total = Object.values(counts).reduce((a, c) => a + c, 0) || 1;
      const langs = Object.entries(counts).sort((a, c) => c[1] - a[1]);
      root.innerHTML = `
        <div class="gh-head">
          <img src="${u.avatar_url}&s=96" alt="" width="48" height="48" />
          <div><b>${esc(u.name || u.login)}</b><span class="mono dim">@${esc(u.login)} · ${u.public_repos} repos · ${u.followers} followers</span></div>
          <a class="btn-sm" href="${u.html_url}" target="_blank" rel="noopener">Profile ↗</a>
        </div>
        <div class="gh-langbar">${langs.map(([l, c]) => `<i style="flex:${c};background:${LANG[l] || '#888'}" title="${l}"></i>`).join('')}</div>
        <div class="gh-langs mono">${langs.map(([l, c]) => `<span><i style="background:${LANG[l] || '#888'}"></i>${l} ${Math.round(c / total * 100)}%</span>`).join('')}</div>
        <ul class="gh-list">${r.map(x => `
          <li><a href="${x.html_url}" target="_blank" rel="noopener">
            <span class="gh-name">${esc(x.name)}${x.description ? `<small>${esc(x.description)}</small>` : ''}</span>
            <span class="gh-lang mono">${x.language ? `<i style="background:${LANG[x.language] || '#888'}"></i>${x.language}` : ''}</span>
            <span class="gh-time mono">${ago(x.pushed_at)}</span>
          </a></li>`).join('')}</ul>
        <p class="note">Pulled live from the GitHub API.</p>`;
    } catch (e) {
      root.innerHTML = `<div class="case"><p>Couldn't reach the GitHub API right now (it rate-limits anonymous requests).</p><a class="btn-sm primary" href="https://github.com/Aristxa" target="_blank" rel="noopener">Open github.com/Aristxa ↗</a></div>`;
    }
  }

  // ============================================================
  // Melody (toy)
  // ============================================================
  function mountMusic(b, win) {
    const SCALE = [0, 3, 5, 7, 10];
    b.innerHTML = `
      <div class="music">
        <div class="music-top">
          <div><b>melody.exe</b><p class="note">An in-browser toy, not the real model. <a href="https://github.com/Aristxa/Music-AI-Generator" target="_blank" rel="noopener">Music AI Generator</a> trains an LSTM on MAESTRO piano with TensorFlow + music21. This one uses a Markov chain so it plays instantly.</p></div>
        </div>
        <canvas class="roll" height="170"></canvas>
        <div class="music-ctrl">
          <button class="btn-sm primary" data-play>▶ Play</button>
          <button class="btn-sm" data-gen>↻ Generate</button>
          <label class="mono">tempo <input type="range" min="70" max="160" value="108" data-tempo /><span data-tv>108</span></label>
          <label class="mono">voice <select data-voice><option value="keys">soft keys</option><option value="glass">glass</option><option value="chip">chip</option></select></label>
        </div>
      </div>`;
    const cv = b.querySelector('.roll');
    const ctx = cv.getContext('2d');
    let notes = [], ac = null, playing = false, t0 = 0, raf = 0, nodes = [];
    const tempo = () => +b.querySelector('[data-tempo]').value;

    function gen() {
      notes = [];
      let deg = 5 + Math.floor(Math.random() * 3), t = 0;
      const rhythms = [[1, 1, 1, 1], [1.5, .5, 1, 1], [.5, .5, 1, 2], [2, 1, 1], [1, .5, .5, 2], [1, 1, 2]];
      for (let bar = 0; bar < 8; bar++) {
        const r = rhythms[Math.floor(Math.random() * rhythms.length)];
        for (const d of r) {
          const x = Math.random();
          const step = x < .38 ? (Math.random() < .5 ? -1 : 1) : x < .62 ? (Math.random() < .5 ? -2 : 2) : x < .74 ? 0 : x < .87 ? (deg > 6 ? -3 : 3) : (Math.random() < .5 ? -4 : 4);
          deg = Math.max(0, Math.min(11, deg + step));
          if (bar === 7 && d === r[r.length - 1]) deg = 5;
          const midi = 60 + Math.floor(deg / 5) * 12 + SCALE[deg % 5];
          notes.push({ t, d: d * .95, midi, vel: .6 + Math.random() * .4 });
          t += d;
        }
        const root = [0, 0, 3, 5, 0, 7, 3, 0][bar];
        notes.push({ t: bar * 4, d: 3.8, midi: 48 + root, vel: .35, bass: true });
      }
      draw(-1);
    }

    function draw(beat) {
      const W = cv.clientWidth, H = cv.clientHeight, dpr = Math.min(devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(W * dpr)) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const css = getComputedStyle(b);
      ctx.fillStyle = css.getPropertyValue('--bg-2');
      ctx.fillRect(0, 0, W, H);
      const lo = 46, hi = 86, beats = 32;
      ctx.strokeStyle = css.getPropertyValue('--line');
      for (let i = 0; i <= beats; i++) { ctx.globalAlpha = i % 4 ? .35 : 1; ctx.beginPath(); ctx.moveTo(i / beats * W + .5, 0); ctx.lineTo(i / beats * W + .5, H); ctx.stroke(); }
      ctx.globalAlpha = 1;
      for (const n of notes) {
        const x = n.t / beats * W, w = Math.max(3, n.d / beats * W - 2), y = H - (n.midi - lo) / (hi - lo) * H;
        const on = beat >= n.t && beat < n.t + n.d;
        ctx.fillStyle = n.bass ? (on ? '#a78bfa' : 'rgba(167,139,250,.35)') : (on ? '#ffe39a' : '#f472b6');
        ctx.beginPath(); ctx.roundRect ? ctx.roundRect(x + 1, y - 4, w, 7, 3) : ctx.rect(x + 1, y - 4, w, 7); ctx.fill();
      }
      if (beat >= 0) { ctx.fillStyle = '#5eead4'; ctx.fillRect(beat / beats * W, 0, 2, H); }
    }

    function voice(n, when, spb) {
      const v = b.querySelector('[data-voice]').value;
      const f = 440 * Math.pow(2, (n.midi - 69) / 12);
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = v === 'chip' ? 'square' : v === 'glass' ? 'sine' : 'triangle';
      o.frequency.value = f;
      const peak = (v === 'chip' ? .05 : .16) * n.vel * (n.bass ? .8 : 1);
      const dur = n.d * spb;
      g.gain.setValueAtTime(0, when);
      g.gain.linearRampToValueAtTime(peak, when + .012);
      g.gain.exponentialRampToValueAtTime(Math.max(peak * (v === 'glass' ? .4 : .25), .0002), when + Math.min(dur, .35));
      g.gain.exponentialRampToValueAtTime(.0001, when + dur + .25);
      o.connect(g).connect(ac.destination);
      o.start(when); o.stop(when + dur + .3);
      nodes.push(o);
      if (v === 'glass' && !n.bass) {
        const o2 = ac.createOscillator(), g2 = ac.createGain();
        o2.frequency.value = f * 3; g2.gain.setValueAtTime(peak * .15, when); g2.gain.exponentialRampToValueAtTime(.0001, when + .6);
        o2.connect(g2).connect(ac.destination); o2.start(when); o2.stop(when + .7); nodes.push(o2);
      }
    }

    function stop() {
      playing = false; cancelAnimationFrame(raf);
      nodes.forEach(o => { try { o.stop(); } catch (e) {} }); nodes = [];
      b.querySelector('[data-play]').textContent = '▶ Play';
      draw(-1);
    }
    function play() {
      ac = ac || new (window.AudioContext || window.webkitAudioContext)();
      ac.resume();
      const spb = 60 / tempo();
      t0 = ac.currentTime + .08;
      notes.forEach(n => voice(n, t0 + n.t * spb, spb));
      playing = true;
      b.querySelector('[data-play]').textContent = '■ Stop';
      const tick = () => {
        if (!playing) return;
        const beat = (ac.currentTime - t0) / spb;
        if (beat > 32.5) return stop();
        draw(beat);
        raf = requestAnimationFrame(tick);
      };
      tick();
    }
    b.querySelector('[data-play]').addEventListener('click', () => (playing ? stop() : play()));
    b.querySelector('[data-gen]').addEventListener('click', () => { const was = playing; stop(); gen(); if (was) play(); });
    b.querySelector('[data-tempo]').addEventListener('input', e => { b.querySelector('[data-tv]').textContent = e.target.value; });
    new ResizeObserver(() => draw(-1)).observe(cv);
    gen();
    win.onClose = stop;
  }

  // ============================================================
  // Contact
  // ============================================================
  function mountContact(b) {
    const C = window.CONFIG || {};
    b.innerHTML = `
      <div class="doc contact">
        <h2 class="case-q">Contact</h2>
        <p>I'm looking for data science / ML roles, and I'm happy to talk about research or freelance work too.</p>
        <div class="contact-list">
          ${C.email ? `<div class="c-row"><span class="mono dim">email</span><a href="mailto:${esc(C.email)}">${esc(C.email)}</a><button class="btn-sm" data-copy="${esc(C.email)}">copy</button></div>` : ''}
          ${C.linkedin ? `<div class="c-row"><span class="mono dim">linkedin</span><a href="${esc(C.linkedin)}" target="_blank" rel="noopener">${esc(C.linkedin.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))}</a><span></span></div>` : ''}
          <div class="c-row"><span class="mono dim">github</span><a href="https://github.com/Aristxa" target="_blank" rel="noopener">github.com/Aristxa</a><span></span></div>
          <div class="c-row"><span class="mono dim">hugging face</span><a href="https://huggingface.co/aristeaaa" target="_blank" rel="noopener">huggingface.co/aristeaaa</a><span></span></div>
          <div class="c-row"><span class="mono dim">based in</span><span>Tirana, Albania · <span data-tz></span></span><span></span></div>
        </div>
      </div>`;
    const tz = b.querySelector('[data-tz]');
    const upd = () => { tz.textContent = new Date().toLocaleTimeString('en-GB', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }) + ' local time'; };
    upd();
    b.addEventListener('click', e => {
      const c = e.target.closest('[data-copy]');
      if (c) navigator.clipboard?.writeText(c.dataset.copy).then(() => OS.toast('Copied to clipboard'));
    });
  }

  // ============================================================
  // Recycle bin
  // ============================================================
  const BIN = [
    ['p-values.txt', 'On a 60-question benchmark, replaced by a rule fixed in advance: differences under 10 points are reported as "no clear difference".'],
    ['random_kfold_cv.py', 'It leaks information between neighbouring 100 m cells and overstates accuracy. Replaced by 1 km spatial-block CV.'],
    ['window_437.txt', 'A fixed-window chunk whose boundaries match no legal unit, so it can never be cited as law.'],
    ['lat_lon_features.csv', 'With coordinates as features, the model memorised places instead of learning mechanisms, and couldn\'t respond to interventions.'],
    ['reframed_results_FINAL_v2.docx', 'Never written. The null was reported as the null.'],
  ];
  function mountTrash(b) {
    b.innerHTML = `<div class="bin"><p class="dim">${BIN.length} items</p><ul>${BIN.map(([n, w]) => `<li>${Icons.html('file', 30)}<div><b class="mono">${n}</b><p>${w}</p></div></li>`).join('')}</ul></div>`;
  }

  // ============================================================
  // Settings
  // ============================================================
  function mountSettings(b) {
    b.innerHTML = `
      <div class="settings">
        <section><h4 class="mono">Appearance</h4>
          <div class="seg" role="radiogroup" aria-label="Theme">${['dark', 'light', 'system'].map(t => `<button role="radio" data-theme-set="${t}">${t}</button>`).join('')}</div>
        </section>
        <section><h4 class="mono">Wallpaper</h4>
          <div class="seg" role="radiogroup" aria-label="Wallpaper">
            <button role="radio" data-wall-set="galaxy">Galaxy</button>
            <button role="radio" data-wall-set="heat">CoolCity heat map</button>
          </div>
          <p class="dim">The heat map is interactive: click it to plant trees, or run the greedy planner.</p>
          <label class="switch"><input type="checkbox" data-anim /> <span>Animate the wallpaper</span></label>
        </section>
        <section><h4 class="mono">System</h4>
          <p class="dim">AristeaOS 1.0. Plain HTML, CSS and JavaScript, hosted on GitHub Pages.</p>
          <div class="row-links"><button class="btn-sm" data-reboot>Reboot</button><a class="btn-sm" href="https://github.com/Aristxa/Aristxa.github.io" target="_blank" rel="noopener">View source ↗</a></div>
        </section>
      </div>`;
    const sync = () => {
      const cur = OS.themePref();
      b.querySelectorAll('[data-theme-set]').forEach(x => x.setAttribute('aria-checked', String(x.dataset.themeSet === cur)));
      b.querySelectorAll('[data-wall-set]').forEach(x => x.setAttribute('aria-checked', String(x.dataset.wallSet === OS.wallpaper())));
      b.querySelector('[data-anim]').checked = Heat.animated;
    };
    b.addEventListener('click', e => {
      const t = e.target.closest('[data-theme-set]'); if (t) { OS.setTheme(t.dataset.themeSet); sync(); }
      const w = e.target.closest('[data-wall-set]'); if (w) { OS.setWallpaper(w.dataset.wallSet); sync(); }
      if (e.target.closest('[data-reboot]')) OS.reboot();
    });
    b.querySelector('[data-anim]').addEventListener('change', e => OS.setAnimated(e.target.checked));
    sync();
  }

  // ============================================================
  // Registry
  // ============================================================
  const LIST = [
    { id: 'about', title: 'about_me.txt - Notepad', icon: 'about', label: 'about_me.txt', w: 700, h: 600, mount: mountAbout, desc: 'Who I am and how I work' },
    { id: 'projects', title: 'Projects', icon: 'projects', label: 'Projects', w: 700, h: 470, mount: mountExplorer, desc: 'Browse every project' },
    { id: 'coolcity', title: 'CoolCity Tirana', icon: 'coolcity', label: 'CoolCity', w: 720, h: 640, mount: mountCoolCity, desc: 'Where to plant 1,000 trees' },
    { id: 'fiskal', title: 'Asistenti Fiskal', icon: 'fiskal', label: 'Asistenti Fiskal', w: 740, h: 660, mount: mountFiskal, desc: 'Citation-bound legal RAG' },
    { id: 'finscope', title: 'FinScope', icon: 'finscope', label: 'FinScope', w: 760, h: 640, mount: mountFinScope, desc: 'SEC EDGAR analytics platform' },
    { id: 'ndea', title: 'Bank Efficiency · NDEA', icon: 'ndea', label: 'Bank NDEA', w: 740, h: 620, mount: mountNDEA, desc: 'Dynamic Network DEA' },
    { id: 'speakup', title: 'Guxo · Speak Boldly', icon: 'speakup', label: 'Guxo', w: 820, h: 660, mount: mountSpeakUp, desc: 'Public-speaking practice app' },
    { id: 'kupon', title: 'Kupon', icon: 'kupon', label: 'Kupon', w: 760, h: 680, mount: mountKupon, desc: 'Receipt scanner for Albania' },
    { id: 'terminal', title: 'Terminal', icon: 'terminal', label: 'Terminal', w: 640, h: 420, mount: (b, w) => window.Terminal.mount(b, w), desc: 'Type help' },
    { id: 'music', title: 'melody.exe', icon: 'music', label: 'melody.exe', w: 620, h: 400, mount: mountMusic, desc: 'Generative music toy' },
    { id: 'github', title: 'GitHub · live', icon: 'github', label: 'GitHub', w: 620, h: 580, mount: mountGitHub, desc: 'Live repos from the API' },
    { id: 'contact', title: 'Contact', icon: 'contact', label: 'Contact', w: 520, h: 420, mount: mountContact, desc: 'Get in touch' },
    { id: 'trash', title: 'Recycle Bin', icon: 'trash', label: 'Recycle Bin', w: 520, h: 460, mount: mountTrash, desc: 'Bad practices, deleted' },
    { id: 'settings', title: 'Settings', icon: 'settings', label: 'Settings', w: 460, h: 440, mount: mountSettings, desc: 'Theme and wallpaper' },
    { id: 'hf', title: 'Hugging Face', icon: 'hf', label: 'Hugging Face', external: 'https://huggingface.co/aristeaaa', desc: 'huggingface.co/aristeaaa' },
  ];
  const MAP = Object.fromEntries(LIST.map(a => [a.id, a]));

  window.Icons = Icons;
  window.Apps = { list: LIST, get: id => MAP[id], esc };
})();
