/* ============================================================
   Heat — a toy surface-temperature field used as the wallpaper.
   Inspired by CoolCity: trees cool their own cell and neighbours,
   cooling saturates, and a lazy greedy planner picks the cell with
   the largest population-weighted marginal gain.
   ============================================================ */
(function () {
  'use strict';

  const TMIN = 28, TMAX = 48;
  const STOPS = [
    [0.00, [14, 90, 85]],
    [0.22, [18, 48, 58]],
    [0.42, [23, 18, 29]],
    [0.60, [107, 26, 58]],
    [0.78, [210, 63, 42]],
    [0.90, [255, 154, 60]],
    [1.00, [255, 227, 154]],
  ];
  const LUT = new Uint8ClampedArray(256 * 3);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    let j = 0;
    while (j < STOPS.length - 2 && t > STOPS[j + 1][0]) j++;
    const [t0, c0] = STOPS[j], [t1, c1] = STOPS[j + 1];
    const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    for (let k = 0; k < 3; k++) LUT[i * 3 + k] = c0[k] + (c1[k] - c0[k]) * u;
  }

  function hash(x, y, s) {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(s, 982451653);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const smooth = t => t * t * (3 - 2 * t);
  function vnoise(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y);
    const u = smooth(x - xi), v = smooth(y - yi);
    const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function fbm(x, y, s) {
    let v = 0, amp = 0.5, f = 1;
    for (let o = 0; o < 5; o++) { v += amp * vnoise(x * f, y * f, s + o * 17); f *= 2; amp *= 0.5; }
    return v / 0.96875;
  }

  // Cooling saturates: stacking trees in one place has diminishing returns.
  const SAT = 6.5;
  const eff = c => SAT * (1 - Math.exp(-c / SAT));

  // Tree kernel: strong local shade plus a wide neighbourhood effect (like the 200 m / 500 m features).
  const KR = 9;
  const KERNEL = [];
  for (let dy = -KR; dy <= KR; dy++) {
    for (let dx = -KR; dx <= KR; dx++) {
      const d2 = dx * dx + dy * dy;
      const w = 3.6 * Math.exp(-d2 / (2 * 2.2 * 2.2)) + 0.9 * Math.exp(-d2 / (2 * 6.0 * 6.0));
      if (w > 0.03) KERNEL.push(dx, dy, w);
    }
  }

  const S = {
    canvas: null, ctx: null, off: null, offCtx: null, img: null,
    W: 0, H: 0, cw: 0, ch: 0, dpr: 1,
    base: null, pop: null, cool: null, shade: null, phase: null, occupied: null,
    trees: [], seed: 7, initialMean: 0,
    animated: true, running: false, dirty: true, shadeLive: false,
    busy: false, listeners: [], frame: 0,
  };

  function build() {
    const r = S.canvas.getBoundingClientRect();
    S.cw = Math.max(1, r.width); S.ch = Math.max(1, r.height);
    S.dpr = Math.min(window.devicePixelRatio || 1, 2);
    S.canvas.width = Math.round(S.cw * S.dpr);
    S.canvas.height = Math.round(S.ch * S.dpr);

    // ~8px per cell everywhere, so heat blotches are the same physical size on a phone as on a desktop.
    const W = Math.max(36, Math.min(200, Math.round(S.cw / 8)));
    const H = Math.max(30, Math.round(W * S.ch / S.cw));
    S.W = W; S.H = H;
    const N = W * H;
    S.base = new Float32Array(N);
    S.pop = new Float32Array(N);
    S.cool = new Float32Array(N);
    S.shade = new Float32Array(N);
    S.phase = new Float32Array(N);
    S.occupied = new Uint8Array(N);
    S.off = document.createElement('canvas');
    S.off.width = W; S.off.height = H;
    S.offCtx = S.off.getContext('2d');
    S.img = S.offCtx.createImageData(W, H);

    const aspect = H / W;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const i = y * W + x;
        const u = x / W, v = y / W;
        const n = fbm(x * 0.035, y * 0.035, S.seed);
        const n2 = fbm(x * 0.12, y * 0.12, S.seed + 99);
        const dc = (u - 0.46) ** 2 + (v - 0.45 * aspect) ** 2;
        let T = 36.5 + 14 * (n - 0.5) + 4.5 * (n2 - 0.5) + 4.2 * Math.exp(-dc / 0.07);
        // A large park with a lake: the city's cool spot.
        const dp = (u - 0.7) ** 2 + (v - 0.74 * aspect) ** 2;
        T -= 10 * Math.exp(-dp / 0.0045);
        // A river crossing the city.
        const ry = (0.26 + 0.06 * Math.sin(u * 8.5) + 0.25 * u) * aspect;
        T -= 3.6 * Math.exp(-((v - ry) ** 2) / (2 * 0.011 * 0.011));
        S.base[i] = Math.max(29.5, Math.min(47.6, T));
        S.pop[i] = Math.max(0.05, Math.min(1.6, 0.25 + 1.25 * Math.exp(-dc / 0.09) + 0.6 * (n2 - 0.5) - 0.8 * Math.exp(-dp / 0.004)));
        S.phase[i] = hash(x, y, 3) * Math.PI * 2;
      }
    }
    // Re-plant existing trees on the new grid.
    const old = S.trees;
    S.trees = [];
    for (const t of old) addTree(Math.floor(t.u * W), Math.floor(t.v * H), false, t.born);
    S.initialMean = meanTemp(true);
    S.dirty = true;
    emit();
  }

  function addTree(x, y, animate, born) {
    const { W, H } = S;
    if (x < 0 || y < 0 || x >= W || y >= H) return false;
    const idx = y * W + x;
    for (let k = 0; k < KERNEL.length; k += 3) {
      const xx = x + KERNEL[k], yy = y + KERNEL[k + 1];
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      S.cool[yy * W + xx] += KERNEL[k + 2];
    }
    S.occupied[idx] = 1;
    S.trees.push({ x, y, u: (x + 0.5) / W, v: (y + 0.5) / H, born: animate ? performance.now() : (born || 0) });
    S.dirty = true;
    return true;
  }

  function meanTemp(baseOnly) {
    let s = 0;
    const N = S.W * S.H;
    for (let i = 0; i < N; i++) s += baseOnly ? S.base[i] : S.base[i] - eff(S.cool[i]);
    return s / N;
  }

  function stats() {
    const N = S.W * S.H;
    let s = 0, mx = -1, pc = 0;
    for (let i = 0; i < N; i++) {
      const c = eff(S.cool[i]);
      const T = S.base[i] - c;
      s += T; if (T > mx) mx = T;
      pc += S.pop[i] * c;
    }
    const mean = s / N;
    return { mean, max: mx, trees: S.trees.length, delta: S.initialMean - mean, personDeg: pc };
  }

  function emit() {
    const st = stats();
    S.listeners.forEach(fn => fn(st));
  }

  function render(now) {
    const { W, H, ctx } = S;
    const d = S.img.data;
    const t = now * 0.001;
    const N = W * H;
    const scale = 255 / (TMAX - TMIN);
    for (let i = 0, p = 0; i < N; i++, p += 4) {
      let T = S.base[i] - eff(S.cool[i]) - S.shade[i];
      if (S.animated) T += 0.32 * Math.sin(t * 0.9 + S.phase[i]);
      let li = ((T - TMIN) * scale) | 0;
      if (li < 0) li = 0; else if (li > 255) li = 255;
      const l3 = li * 3;
      d[p] = LUT[l3]; d[p + 1] = LUT[l3 + 1]; d[p + 2] = LUT[l3 + 2]; d[p + 3] = 255;
    }
    S.offCtx.putImageData(S.img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(S.off, 0, 0, S.canvas.width, S.canvas.height);

    // Trees
    const cx = S.canvas.width / W, cy = S.canvas.height / H, dpr = S.dpr;
    for (const tr of S.trees) {
      const px = (tr.x + 0.5) * cx, py = (tr.y + 0.5) * cy;
      const age = now - tr.born;
      if (age < 900) {
        const k = age / 900;
        ctx.beginPath();
        ctx.arc(px, py, (4 + 26 * k) * dpr, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94,234,212,${0.7 * (1 - k)})`;
        ctx.lineWidth = 1.5 * dpr;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(px, py, 4.2 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(94,234,212,.22)';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(px, py, 1.9 * dpr, 0, Math.PI * 2);
      ctx.fillStyle = '#5eead4';
      ctx.fill();
    }
  }

  function loop(now) {
    if (!S.running) return;
    S.frame++;
    // Decay shade from the cursor.
    if (S.shadeLive) {
      let any = false;
      const sh = S.shade;
      for (let i = 0; i < sh.length; i++) {
        if (sh[i] > 0.01) { sh[i] *= 0.93; any = true; } else sh[i] = 0;
      }
      S.shadeLive = any;
      S.dirty = true;
    }
    const ripple = S.trees.length && now - S.trees[S.trees.length - 1].born < 900;
    // ~30 fps is plenty for a shimmer.
    if ((S.animated && S.frame % 2 === 0) || S.dirty || ripple) {
      render(now);
      S.dirty = false;
    }
    requestAnimationFrame(loop);
  }

  function start() {
    if (S.running || !S.enabled || document.hidden) return;
    S.running = true;
    requestAnimationFrame(loop);
  }
  function stop() { S.running = false; }

  function toCell(clientX, clientY) {
    const r = S.canvas.getBoundingClientRect();
    return [Math.floor((clientX - r.left) / r.width * S.W), Math.floor((clientY - r.top) / r.height * S.H)];
  }

  // ---------- planner ----------
  function bestCell() {
    const { W, H, cool, pop } = S;
    let best = -1, bx = -1, by = -1;
    for (let y = 2; y < H - 2; y += 3) {
      for (let x = 2; x < W - 2; x += 3) {
        if (S.occupied[y * W + x]) continue;
        let g = 0;
        for (let k = 0; k < KERNEL.length; k += 3) {
          const xx = x + KERNEL[k], yy = y + KERNEL[k + 1];
          if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
          const j = yy * W + xx;
          const c = cool[j];
          g += pop[j] * (eff(c + KERNEL[k + 2]) - eff(c));
        }
        if (g > best) { best = g; bx = x; by = y; }
      }
    }
    return [bx, by];
  }

  const Heat = {
    init(canvas, opts = {}) {
      S.canvas = canvas;
      S.ctx = canvas.getContext('2d');
      S.animated = opts.animated !== false;
      S.enabled = opts.enabled !== false;
      build();
      render(performance.now());
      start();
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); render(performance.now()); }, 150); });
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
    },
    onStats(fn) { S.listeners.push(fn); fn(stats()); },
    stats,
    shadeAt(clientX, clientY) {
      const [x, y] = toCell(clientX, clientY);
      const R = 4;
      for (let dy = -R; dy <= R; dy++) {
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= S.W || yy >= S.H) continue;
          const j = yy * S.W + xx;
          S.shade[j] = Math.min(4.5, S.shade[j] + 0.9 * Math.exp(-(dx * dx + dy * dy) / 6));
        }
      }
      S.shadeLive = true;
    },
    plantAt(clientX, clientY) {
      const [x, y] = toCell(clientX, clientY);
      if (addTree(x, y, true)) emit();
    },
    async runPlanner(n = 25, step = 70) {
      if (S.busy) return false;
      S.busy = true;
      for (let i = 0; i < n; i++) {
        const [x, y] = bestCell();
        if (x < 0) break;
        addTree(x, y, true);
        emit();
        await new Promise(r => setTimeout(r, step));
      }
      S.busy = false;
      return true;
    },
    get busy() { return S.busy; },
    reset() {
      S.trees = [];
      S.cool.fill(0);
      S.occupied.fill(0);
      S.dirty = true;
      emit();
    },
    setAnimated(on) { S.animated = !!on; S.dirty = true; },
    // Only runs while it is the chosen wallpaper. Rebuild on enable, since the grid
    // is sized from the canvas, which has no size while hidden.
    setEnabled(on) {
      S.enabled = !!on;
      if (on) { build(); render(performance.now()); start(); } else stop();
    },
    get enabled() { return S.enabled; },
    get animated() { return S.animated; },
  };

  window.Heat = Heat;

  // Some ICU builds lack Europe/Tirana; Europe/Rome shares the same CET/CEST rules.
  window.TZ = (() => {
    for (const z of ['Europe/Tirana', 'Europe/Rome']) {
      try { new Intl.DateTimeFormat('en', { timeZone: z }); return z; } catch (e) {}
    }
    return undefined;
  })();
})();
