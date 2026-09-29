/* ============================================================
   Terminal
   ============================================================ */
(function () {
  'use strict';

  const esc = s => String(s).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

  const FS = {
    'about.txt': () => [
      'Aristea Gjokthomi, data scientist in Tirana, Albania.',
      'MSc Information Systems in Economics, University of Tirana.',
      '',
      'Mostly statistics + ML, and I like shipping things people can click.',
      'Open about_me.txt on the desktop for the longer version.',
    ],
    'skills.txt': () => [
      '<c>languages</c>    Python · R · SQL · TypeScript · PHP',
      '<c>ml / stats</c>   LightGBM · TensorFlow/LSTM · ARIMA/SARIMA/Prophet · Isolation Forest',
      '             bootstrap · Diebold–Mariano · Benjamini–Hochberg FDR',
      '<c>retrieval</c>    FAISS · BM25 · RRF · sentence embeddings · LLM citation contracts',
      '<c>geospatial</c>   Landsat · Sentinel-2 · WorldCover · Copernicus DEM · WorldPop · OSM',
      '<c>data eng</c>     medallion ETL · star schemas · SQLite · XBRL / SEC EDGAR · crawlers',
      '<c>op research</c>  DEA · linear programming · Malmquist · greedy / Pareto optimisation',
      '<c>shipping</c>     FastAPI · Gradio · Shiny · Quarto · Docker · HF Spaces · GH Actions',
    ],
    'contact.txt': () => {
      const C = window.CONFIG || {};
      return [
        C.email ? `email        ${C.email}` : null,
        'github       https://github.com/Aristxa',
        'huggingface  https://huggingface.co/aristeaaa',
        C.linkedin ? `linkedin     ${C.linkedin}` : null,
      ].filter(Boolean);
    },
  };
  const PROJECTS = {
    neurodrive: 'NeuroDrive: neural-network cars learn to drive a city you draw. Genetic algorithm, ray-cast sensors, zero dependencies.',
    coolcity: 'CoolCity Tirana: satellite ML + greedy planner. +37% cooling vs. best rule.',
    fiskal: 'Asistenti Fiskal: citation-bound RAG over Albanian tax law. 60-Q benchmark.',
    finscope: 'FinScope: SEC EDGAR → star schema → 5-model forecasting + anomaly detection.',
    ndea: 'Bank NDEA: Dynamic Network DEA of 9 Albanian banks, 2021–2023.',
    speakup: 'Guxo: bilingual public-speaking practice app with live transcript and filler-word tracking.',
    kupon: 'Kupon: scan Albanian receipts, get items + VAT from the tax portal, track prices, split by item.',
  };

  const COMMANDS = {
    help: { d: 'list commands', run: () => Object.entries(COMMANDS).filter(([, c]) => !c.hidden).map(([k, c]) => `  <c>${k.padEnd(10)}</c>${c.d}`) },
    whoami: { d: 'who is this', run: () => ['aristea'] },
    ls: { d: 'list files', run: a => {
      if (a[0] && a[0].replace(/\/$/, '') === 'projects') return [Object.keys(PROJECTS).map(p => `<c>${p}/</c>`).join('  ')];
      return [['<c>projects/</c>', ...Object.keys(FS)].join('  ')];
    } },
    cat: { d: 'print a file', run: a => {
      const f = (a[0] || '').replace(/^~\//, '');
      if (FS[f]) return FS[f]();
      const p = f.replace(/^projects\//, '').replace(/\/.*$/, '');
      if (PROJECTS[p]) return [PROJECTS[p], `run <c>open ${p}</c> for the full story`];
      return [`cat: ${esc(f || '')}: No such file`];
    } },
    open: { d: 'open an app: open coolcity', run: a => {
      const id = (a[0] || '').toLowerCase();
      const app = Apps.get(id);
      if (!app) return [`open: unknown app "${esc(id)}". try: ${Apps.list.map(x => x.id).join(', ')}`];
      WM.open(id);
      return [`opening ${app.title}…`];
    } },
    apps: { d: 'list apps', run: () => Apps.list.map(a => `  <c>${a.id.padEnd(10)}</c>${a.desc}`) },
    projects: { d: 'list projects', run: () => Object.entries(PROJECTS).map(([k, v]) => `  <c>${k.padEnd(10)}</c>${v}`) },
    skills: { d: 'print skills', run: () => FS['skills.txt']() },
    neofetch: { d: 'system info', run: () => {
      const st = Heat.stats();
      const logo = [
        '<t1>   ▄▄████▄▄   </t1>',
        '<t2> ▄██████████▄ </t2>',
        '<t3>████▀▀  ▀▀████</t3>',
        '<t4>███   <k>██</k>   ███</t4>',
        '<t3>████▄▄  ▄▄████</t3>',
        '<t2> ▀██████████▀ </t2>',
        '<t1>   ▀▀████▀▀   </t1>',
      ];
      const info = [
        '<c>aristea</c>@<c>tirana</c>',
        '──────────────',
        `<c>OS</c>       AristeaOS 1.0 (web)`,
        `<c>Host</c>     GitHub Pages`,
        `<c>Shell</c>    sh (sort of)`,
        `<c>Stack</c>    Python · R · SQL · TS`,
        `<c>Uptime</c>   ${Math.round(performance.now() / 1000)}s`,
        `<c>Trees</c>    ${st.trees} planted, ${OS.fmtCool(st.delta)}`,
      ];
      return [`<span class="nf"><span class="nf-logo">${logo.join('\n')}</span><span>${info.join('\n')}</span></span>`];
    } },
    plant: { d: 'run the greedy planner: plant 40', run: a => {
      const n = Math.max(1, Math.min(200, parseInt(a[0], 10) || 25));
      if (Heat.busy) return ['planner already running'];
      OS.runPlanner(n);
      return [`lazy-greedy: placing ${n} trees by population-weighted marginal cooling…`];
    } },
    heat: { d: 'wallpaper stats', run: () => {
      const s = Heat.stats();
      return [`mean ${s.mean.toFixed(2)}°C · max ${s.max.toFixed(1)}°C · trees ${s.trees} · cooled ${OS.fmtCool(s.delta)}`];
    } },
    reset: { d: 'clear planted trees', run: () => { Heat.reset(); return ['trees cleared']; } },
    wallpaper: { d: 'wallpaper drive|galaxy|heat', run: a => {
      if (!['drive', 'galaxy', 'heat'].includes(a[0])) return [`current: ${OS.wallpaper()}. usage: wallpaper drive|galaxy|heat`];
      OS.setWallpaper(a[0]); return [`wallpaper → ${OS.wallpaper()}`];
    } },
    theme: { d: 'theme dark|light|system', run: a => {
      const t = a[0];
      if (!['dark', 'light', 'system'].includes(t)) return ['usage: theme dark|light|system'];
      OS.setTheme(t); return [`theme → ${t}`];
    } },
    github: { d: 'open GitHub', run: () => { window.open('https://github.com/Aristxa', '_blank', 'noopener'); return ['→ github.com/Aristxa']; } },
    hf: { d: 'open Hugging Face', run: () => { window.open('https://huggingface.co/aristeaaa', '_blank', 'noopener'); return ['→ huggingface.co/aristeaaa']; } },
    date: { d: 'Tirana time', run: () => [new Date().toLocaleString('en-GB', { timeZone: TZ, dateStyle: 'full', timeStyle: 'short' }) + ' (Europe/Tirana)'] },
    echo: { d: 'print text', run: a => [esc(a.join(' '))] },
    history: { d: 'command history', run: (a, t) => t.hist.map((h, i) => `  ${String(i + 1).padStart(3)}  ${esc(h)}`) },
    clear: { d: 'clear screen', run: (a, t) => { t.out.innerHTML = ''; return []; } },
    exit: { d: 'close terminal', run: (a, t) => { setTimeout(() => WM.close(t.win.id), 150); return ['bye 👋']; } },
    sudo: { hidden: true, run: () => ['aristea is not in the sudoers file. This incident will be reported to the pre-registration committee.'] },
    rm: { hidden: true, run: () => ['rm: refusing to delete results that did not go my way. (see Recycle Bin)'] },
    pvalue: { hidden: true, run: () => ['p < 0.05? n = 60. We use a pre-registered 10-point rule here.'] },
    vim: { hidden: true, run: () => ['you are now trapped in vim. just kidding. type :q, or anything really.'] },
  };

  function mount(body, win) {
    body.classList.add('term');
    body.innerHTML = `<div class="term-out" aria-live="polite"></div><label class="term-line"><span class="term-ps"><c>aristea</c>@tirana:<b>~</b>$</span><input class="term-in" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="Terminal input" /></label>`;
    const out = body.querySelector('.term-out');
    const inp = body.querySelector('.term-in');
    const T = { out, win, hist: [], hi: 0 };

    const print = lines => {
      const frag = document.createDocumentFragment();
      lines.forEach(l => { const d = document.createElement('div'); d.innerHTML = l === '' ? '&nbsp;' : l; frag.appendChild(d); });
      out.appendChild(frag);
      body.scrollTop = body.scrollHeight;
    };

    function run(raw) {
      const line = raw.trim();
      print([`<span class="term-ps"><c>aristea</c>@tirana:<b>~</b>$</span> ${esc(line)}`]);
      if (!line) return;
      T.hist.push(line); T.hi = T.hist.length;
      const [cmd, ...args] = line.split(/\s+/);
      const c = COMMANDS[cmd.toLowerCase()];
      if (!c) { print([`${esc(cmd)}: command not found. try <c>help</c>`]); return; }
      try { print(c.run(args, T) || []); } catch (e) { print([`error: ${esc(e.message)}`]); }
    }

    inp.addEventListener('keydown', e => {
      if (e.key === 'Enter') { run(inp.value); inp.value = ''; }
      else if (e.key === 'ArrowUp') { if (T.hi > 0) inp.value = T.hist[--T.hi]; e.preventDefault(); }
      else if (e.key === 'ArrowDown') { if (T.hi < T.hist.length - 1) inp.value = T.hist[++T.hi]; else { T.hi = T.hist.length; inp.value = ''; } e.preventDefault(); }
      else if (e.key === 'Tab') {
        e.preventDefault();
        const parts = inp.value.split(' ');
        const last = parts[parts.length - 1];
        let pool;
        if (parts.length === 1) pool = Object.keys(COMMANDS).filter(k => !COMMANDS[k].hidden);
        else if (parts[0] === 'open') pool = Apps.list.map(a => a.id);
        else if (parts[0] === 'cat') pool = [...Object.keys(FS), ...Object.keys(PROJECTS).map(p => 'projects/' + p)];
        else if (parts[0] === 'theme') pool = ['dark', 'light', 'system'];
        else if (parts[0] === 'wallpaper') pool = ['drive', 'galaxy', 'heat'];
        else pool = [];
        const m = pool.filter(p => p.startsWith(last));
        if (m.length === 1) { parts[parts.length - 1] = m[0]; inp.value = parts.join(' ') + (parts.length === 1 ? ' ' : ''); }
        else if (m.length > 1) print([m.join('  ')]);
      } else if (e.key === 'l' && e.ctrlKey) { e.preventDefault(); out.innerHTML = ''; }
    });
    body.addEventListener('mouseup', () => { if (!getSelection().toString()) inp.focus(); });
    win.onFocus = () => inp.focus({ preventScroll: true });

    print([
      'AristeaOS terminal',
      'Type <c>help</c> to see commands. Try <c>neofetch</c>, <c>plant 40</c> or <c>open fiskal</c>.',
      '',
    ]);
    setTimeout(() => inp.focus({ preventScroll: true }), 50);
  }

  window.Terminal = { mount };
})();
