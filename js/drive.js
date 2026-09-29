/* ============================================================
   NeuroDrive wallpaper: a few self-driving cars touring the
   Downtown city from github.com/Aristxa/neurodrive, all driven
   by the same pretrained brain (js/vendor/neurodrive.js).
   There is no scripted traffic: the brain was trained without
   it and drives the city crash-free for hours, while traffic
   makes it crash within a minute. The cars can't see each other,
   but same brain + same start = same path, so they keep their spacing.
   ============================================================ */
(function () {
  'use strict';

  const STEP = 1 / 60;   // the engine's fixed timestep
  const PACE = 0.7;      // sim seconds per real second: calmer than the app
  const CARS = 4;
  const GAP = 5;         // seconds between cars leaving the start
  const WARMUP = 24;     // sim seconds run before the first frame, so the cars are spread out

  const S = { canvas: null, ctx: null, enabled: false, animated: true, ok: false, world: null, brain: null, cars: [], t: 0, next: 0, acc: 0, last: 0, raf: 0, cam: null, dpr: 1, w: 0, h: 0 };

  function build() {
    const ND = window.NeuroDrive;
    S.world = ND.World.fromJSON(ND.Presets.get('downtown').build()).generate();
    S.brain = ND.NeuralNetwork.fromJSON(ND.PRETRAINED_BRAINS.downtown.brain, ND.Car.brainLayout());
    S.env = { borderGrid: S.world.borderGrid, traffic: [], buf: [] };
    for (let i = 0; i < WARMUP / STEP; i++) step();
    S.cam = target();
  }

  function spawn() {
    const { x, y, angle } = S.world.start;
    const car = new window.NeuroDrive.Car(x, y, angle, { brain: S.brain });
    car.born = S.t;
    S.cars.push(car);
  }

  function step() {
    if (S.t >= S.next && S.cars.length < CARS) { spawn(); S.next = S.t + GAP; }
    for (const c of S.cars) c.update(STEP, S.env);
    // Safety net: a car that crashes or parks fades out and a fresh one leaves the start.
    for (const c of S.cars) {
      c.slow = c.alive && c.speed < 5 && S.t - c.born > 4 ? (c.slow || 0) + STEP : 0;
      if (c.slow > 2) c.alive = false;
      if (!c.alive && c.died === undefined) c.died = S.t;
    }
    S.cars = S.cars.filter(c => c.alive || S.t - c.died < 1.5);
    S.t += STEP;
  }

  function size() {
    const el = S.canvas.parentElement;
    S.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    S.w = Math.max(1, el.offsetWidth);
    S.h = Math.max(1, el.offsetHeight);
    S.canvas.width = Math.round(S.w * S.dpr);
    S.canvas.height = Math.round(S.h * S.dpr);
  }

  // Camera: fit the city on big screens and follow the lead car on small ones, blending
  // between the two by how much of the city the zoom leaves out.
  function target() {
    const b = S.world.bounds, bw = b.maxX - b.minX, bh = b.maxY - b.minY;
    const contain = Math.min(S.w / bw, S.h / bh);
    const scale = Math.min(0.8, Math.max(0.36, contain * 1.18));
    const k = Math.min(1, (1 - Math.min(1, contain / scale)) * 1.8); // ~0.3 on a laptop, 1 on a phone
    const lead = S.cars.find(c => c.alive);
    const cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
    let x = cx, y = cy;
    if (lead) { x += (lead.x - cx) * k; y += (lead.y - cy) * k; }
    // Phone layout: the icon grid fills the top, so frame the followed car in the open space below it.
    if (S.w <= 720) y -= S.h * 0.2 / scale;
    // Keep the view over the city when it's bigger than the screen.
    const hw = S.w / 2 / scale, hh = S.h / 2 / scale;
    if (hw * 2 < bw) x = Math.min(b.maxX - hw, Math.max(b.minX + hw, x));
    if (hh * 2 < bh) y = Math.min(b.maxY - hh, Math.max(b.minY + hh, y));
    return { x, y, scale };
  }

  function render(dt) {
    const ctx = S.ctx, T = window.NeuroDrive.THEME;
    const aim = target();
    const k = dt ? 1 - Math.exp(-dt * 0.8) : 1;
    S.cam.x += (aim.x - S.cam.x) * k;
    S.cam.y += (aim.y - S.cam.y) * k;
    S.cam.scale = aim.scale;
    const { x, y, scale } = S.cam;

    ctx.setTransform(S.dpr, 0, 0, S.dpr, 0, 0);
    ctx.fillStyle = T.ground;
    ctx.fillRect(0, 0, S.w, S.h);
    const s = scale * S.dpr;
    ctx.setTransform(s, 0, 0, s, (S.w / 2 - x * scale) * S.dpr, (S.h / 2 - y * scale) * S.dpr);
    const view = { minX: x - S.w / 2 / scale, minY: y - S.h / 2 / scale, maxX: x + S.w / 2 / scale, maxY: y + S.h / 2 / scale };

    ctx.strokeStyle = T.groundGrid;
    ctx.lineWidth = 1 / scale;
    ctx.beginPath();
    for (let gx = Math.floor(view.minX / 100) * 100; gx <= view.maxX; gx += 100) { ctx.moveTo(gx, view.minY); ctx.lineTo(gx, view.maxY); }
    for (let gy = Math.floor(view.minY / 100) * 100; gy <= view.maxY; gy += 100) { ctx.moveTo(view.minX, gy); ctx.lineTo(view.maxX, gy); }
    ctx.stroke();

    S.world.drawRoads(ctx);
    for (const c of S.cars) {
      if (c.alive) {
        c.sensor.draw(ctx, c);
        c.draw(ctx, 'hero');
      } else {
        ctx.globalAlpha = Math.max(0, 1 - (S.t - c.died) / 1.5);
        c.draw(ctx, 'crashed');
        ctx.globalAlpha = 1;
      }
    }
    S.world.drawItems(ctx, { x, y }, view);
  }

  function frame(ts) {
    S.raf = 0;
    if (!running()) return;
    const dt = S.last ? Math.min(0.1, (ts - S.last) / 1000) : 0;
    S.last = ts;
    S.acc += dt * PACE;
    while (S.acc >= STEP) { step(); S.acc -= STEP; }
    render(dt);
    S.raf = requestAnimationFrame(frame);
  }

  const running = () => S.enabled && S.animated && !document.hidden;
  function sync() {
    if (!S.enabled) return;
    if (!S.world) { try { build(); } catch (e) { console.warn('NeuroDrive wallpaper unavailable:', e); S.enabled = false; S.ok = false; return; } }
    if (running()) { if (!S.raf) { S.last = 0; S.raf = requestAnimationFrame(frame); } }
    else render(0); // still frame
  }

  const Drive = {
    init(canvas, { animated = true, enabled = true } = {}) {
      S.canvas = canvas;
      S.ctx = canvas.getContext('2d');
      S.animated = animated;
      S.ok = !!(window.NeuroDrive && S.ctx && window.Path2D);
      if (!S.ok) return false;
      size();
      window.addEventListener('resize', () => { size(); if (S.enabled && S.world) render(0); }, { passive: true });
      document.addEventListener('visibilitychange', sync);
      Drive.setEnabled(enabled);
      return true;
    },
    get ok() { return S.ok; },
    setEnabled(on) {
      S.enabled = !!on && S.ok;
      if (S.enabled) size();
      sync();
    },
    // With animation off the cars hold still where they are.
    setAnimated(on) { S.animated = !!on; sync(); },
  };

  window.Drive = Drive;
})();
