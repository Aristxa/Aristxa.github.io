/* ============================================================
   Galaxy: a slowly turning spiral galaxy, drawn as point sprites
   with plain WebGL (no libraries). Warm bulge, blue-white arms,
   a sprinkle of pink star-forming regions and far background stars.
   ============================================================ */
(function () {
  'use strict';

  const VS = `
    attribute vec3 aPos;
    attribute vec3 aCol;
    attribute float aSize;
    uniform mat4 uProj;
    uniform float uRot;
    uniform vec2 uTilt;
    uniform float uScale;
    uniform vec2 uShift;
    varying vec3 vCol;
    void main() {
      float c = cos(uRot), s = sin(uRot);
      vec3 p = vec3(c * aPos.x - s * aPos.z, aPos.y, s * aPos.x + c * aPos.z);
      // Incline the disc towards the camera, plus a little mouse tilt.
      float ax = 0.64 + uTilt.y, cx = cos(ax), sx = sin(ax);
      p = vec3(p.x, cx * p.y - sx * p.z, sx * p.y + cx * p.z);
      float az = -0.32 + uTilt.x, cz = cos(az), sz = sin(az);
      p = vec3(cz * p.x - sz * p.y, sz * p.x + cz * p.y, p.z);
      p.z -= 3.4;
      gl_Position = uProj * vec4(p, 1.0);
      gl_Position.xy += uShift * gl_Position.w; // move the galaxy clear of the icons
      gl_PointSize = aSize * uScale / -p.z;
      vCol = aCol;
    }`;

  const FS = `
    precision mediump float;
    varying vec3 vCol;
    void main() {
      vec2 d = gl_PointCoord - 0.5;
      float r2 = dot(d, d) * 4.0;
      if (r2 > 1.0) discard;
      float a = exp(-r2 * 4.0);
      gl_FragColor = vec4(vCol * a, 1.0);
    }`;

  const S = { gl: null, canvas: null, prog: null, n: 0, u: {}, running: false, enabled: false, animated: true,
    rot: 0.6, last: 0, tilt: [0, 0], target: [0, 0], dpr: 1, ok: false };

  const gauss = () => {
    let u = 0, v = 0;
    while (!u) u = Math.random();
    while (!v) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

  function generate(N) {
    const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), size = new Float32Array(N);
    const R = 1.3, ARMS = 2, TWIST = 4.6;
    const WARM = [1.0, 0.9, 0.74], WHITE = [0.95, 0.96, 1.0], BLUE = [0.6, 0.72, 1.0];
    const PINK = [1.0, 0.38, 0.62], ORANGE = [1.0, 0.68, 0.38];
    const nGlow = 260, nBulge = Math.floor(N * 0.1), nBg = Math.floor(N * 0.035);
    for (let i = 0; i < N; i++) {
      let x, y, z, c, b, sz;
      if (i < nGlow) {
        // Big, faint sprites that make the soft core glow.
        const r = Math.abs(gauss()) * 0.12;
        const th = Math.random() * Math.PI * 2;
        x = Math.cos(th) * r * 1.4; z = Math.sin(th) * r * 1.4; y = gauss() * 0.03;
        c = WARM; b = 0.012 + Math.random() * 0.012; sz = 90 + Math.random() * 110;
      } else if (i < nGlow + nBulge) {
        // Bulge: a squashed ball of old, warm stars.
        const r = Math.abs(gauss()) * 0.16;
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        x = r * Math.sin(ph) * Math.cos(th) * 1.45; z = r * Math.sin(ph) * Math.sin(th) * 1.45; y = r * Math.cos(ph) * 0.55;
        c = mix(WARM, [1, 0.97, 0.9], Math.random()); b = 0.05 + Math.random() * 0.12; sz = 5 + Math.random() * 5;
      } else if (i < nGlow + nBulge + nBg) {
        // Background stars on a far shell.
        const th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1), r = 9 + Math.random() * 6;
        x = r * Math.sin(ph) * Math.cos(th); y = r * Math.cos(ph); z = r * Math.sin(ph) * Math.sin(th);
        c = mix(WHITE, BLUE, Math.random() * 0.6); b = 0.25 + Math.random() * 0.6; sz = 16 + Math.random() * 22;
      } else {
        // Disc: two logarithmic-ish arms with scatter that grows outwards.
        const r = Math.min(R * 1.35, 0.09 + -Math.log(1 - Math.random() * 0.985) * 0.3);
        const arm = i % ARMS;
        const theta = arm * (Math.PI * 2 / ARMS) + r * TWIST;
        const spread = 0.05 + 0.07 * r;
        const off = gauss();
        x = Math.cos(theta) * r + gauss() * spread + off * spread * 0.4;
        z = Math.sin(theta) * r + gauss() * spread;
        y = gauss() * 0.022 * (1.3 - Math.min(1, r / R) * 0.7);
        const t = Math.pow(Math.min(1, r / R), 0.7);
        c = mix(mix(WARM, WHITE, Math.min(1, t * 1.6)), BLUE, Math.max(0, t - 0.35));
        // Stars pile up near the centre, so dim them there or the core burns out to white.
        b = (0.07 + Math.random() * 0.26) * (0.3 + 0.7 * Math.min(1, r / 0.55)); sz = 4 + Math.random() * 5;
        const roll = Math.random();
        if (r > 0.28 && Math.abs(off) < 0.9 && roll < 0.022) { c = PINK; b = 0.28 + Math.random() * 0.25; sz = 7 + Math.random() * 6; }
        else if (roll > 0.99) { c = ORANGE; b = 0.4; sz = 6 + Math.random() * 4; }
      }
      pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
      col[i * 3] = c[0] * b; col[i * 3 + 1] = c[1] * b; col[i * 3 + 2] = c[2] * b;
      size[i] = sz;
    }
    return { pos, col, size };
  }

  function shader(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }

  function setup() {
    const gl = S.canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, powerPreference: 'low-power' });
    if (!gl) return false;
    S.gl = gl;
    const p = gl.createProgram();
    gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, VS));
    gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    gl.useProgram(p);
    S.prog = p;
    const small = matchMedia('(max-width: 720px), (pointer: coarse)').matches;
    S.n = small ? 22000 : 60000;
    const data = generate(S.n);
    const attr = (name, arr, n) => {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(p, name);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0);
    };
    attr('aPos', data.pos, 3);
    attr('aCol', data.col, 3);
    attr('aSize', data.size, 1);
    ['uProj', 'uRot', 'uTilt', 'uScale', 'uShift'].forEach(k => (S.u[k] = gl.getUniformLocation(p, k)));
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE); // additive: dense regions glow
    gl.clearColor(0.012, 0.012, 0.02, 1);
    resize();
    return true;
  }

  function resize() {
    const { gl, canvas } = S;
    if (!gl) return;
    S.dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = Math.max(1, Math.round(w * S.dpr));
    canvas.height = Math.max(1, Math.round(h * S.dpr));
    gl.viewport(0, 0, canvas.width, canvas.height);
    // Perspective projection; on tall (phone) screens widen the view so the galaxy fits.
    const aspect = canvas.width / canvas.height;
    const fov = (aspect < 1 ? 70 : 45) * Math.PI / 180, f = 1 / Math.tan(fov / 2), near = 0.1, far = 60;
    gl.uniformMatrix4fv(S.u.uProj, false, new Float32Array([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) / (near - far), -1,
      0, 0, (2 * far * near) / (near - far), 0,
    ]));
    // Phones: below the icon grid. Desktop: nudged right of the icon columns.
    gl.uniform2f(S.u.uShift, aspect < 1 ? 0 : 0.08, aspect < 1 ? -0.32 : 0);
    gl.uniform1f(S.u.uScale, canvas.height / 900 * 3.4 * (aspect < 1 ? 0.8 : 1));
    draw();
  }

  function draw() {
    const { gl } = S;
    gl.uniform1f(S.u.uRot, S.rot);
    gl.uniform2f(S.u.uTilt, S.tilt[0], S.tilt[1]);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, S.n);
  }

  function loop(now) {
    if (!S.running) return;
    const dt = Math.min(0.05, (now - (S.last || now)) / 1000);
    S.last = now;
    S.rot += dt * 0.035;
    S.tilt[0] += (S.target[0] - S.tilt[0]) * 0.04;
    S.tilt[1] += (S.target[1] - S.tilt[1]) * 0.04;
    draw();
    requestAnimationFrame(loop);
  }

  function start() {
    if (S.running || !S.ok || !S.enabled || document.hidden) return;
    if (!S.animated) { draw(); return; }
    S.running = true;
    S.last = 0;
    requestAnimationFrame(loop);
  }
  function stop() { S.running = false; }

  const Galaxy = {
    init(canvas, { animated = true, enabled = true } = {}) {
      S.canvas = canvas;
      S.animated = animated;
      S.enabled = enabled;
      try { S.ok = setup(); } catch (e) { console.warn('Galaxy wallpaper unavailable:', e); S.ok = false; }
      if (!S.ok) return false;
      let rt;
      window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 120); });
      document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); stop(); S.ok = false; });
      canvas.addEventListener('webglcontextrestored', () => { try { S.ok = setup(); start(); } catch (e) {} });
      start();
      return true;
    },
    get ok() { return S.ok; },
    setEnabled(on) { S.enabled = !!on; on ? (resize(), start()) : stop(); },
    setAnimated(on) { S.animated = !!on; stop(); start(); },
    // x, y in -1..1 relative to the screen centre.
    look(x, y) { S.target = [x * 0.06, y * 0.05]; },
  };

  window.Galaxy = Galaxy;
})();
