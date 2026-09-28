/* ============================================================
   Window manager
   ============================================================ */
(function () {
  'use strict';

  const MIN_W = 320, MIN_H = 220;
  const wins = new Map();
  let layer, taskList, ghost, z = 20, cascade = 0;

  const mobile = () => matchMedia('(max-width: 720px)').matches;
  const taskbarH = () => document.querySelector('.taskbar')?.offsetHeight || 48;
  const area = () => ({ w: window.innerWidth, h: window.innerHeight - taskbarH() });

  const CTRL = {
    min: '<svg viewBox="0 0 12 12" width="12" height="12"><path d="M2 6.5h8" stroke="currentColor" stroke-width="1.4"/></svg>',
    max: '<svg viewBox="0 0 12 12" width="12" height="12"><rect x="2" y="2" width="8" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>',
    close: '<svg viewBox="0 0 12 12" width="12" height="12"><path d="M2.5 2.5l7 7M9.5 2.5l-7 7" stroke="currentColor" stroke-width="1.4"/></svg>',
  };

  function apply(w) {
    const s = w.el.style;
    s.left = w.x + 'px'; s.top = w.y + 'px'; s.width = w.w + 'px'; s.height = w.h + 'px';
  }

  function snapRect(kind) {
    const a = area();
    if (kind === 'left') return { x: 0, y: 0, w: Math.round(a.w / 2), h: a.h };
    if (kind === 'right') return { x: Math.round(a.w / 2), y: 0, w: a.w - Math.round(a.w / 2), h: a.h };
    return { x: 0, y: 0, w: a.w, h: a.h };
  }

  function setSnap(w, kind) {
    if (kind) {
      if (!w.snap) w.prev = { x: w.x, y: w.y, w: w.w, h: w.h };
      Object.assign(w, snapRect(kind));
      w.snap = kind;
    } else if (w.snap) {
      Object.assign(w, w.prev || {});
      w.snap = null;
    }
    w.el.classList.toggle('max', w.snap === 'max');
    w.el.classList.toggle('snapped', !!w.snap);
    apply(w);
  }

  function showGhost(kind) {
    if (!kind) { ghost.classList.remove('on'); return; }
    const r = snapRect(kind);
    Object.assign(ghost.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' });
    ghost.classList.add('on');
  }

  function topWindow(exclude) {
    let best = null;
    wins.forEach(w => { if (w !== exclude && !w.min && (!best || +w.el.style.zIndex > +best.el.style.zIndex)) best = w; });
    return best;
  }

  function focus(w) {
    if (!w) { syncFocus(null); return; }
    w.el.style.zIndex = ++z;
    syncFocus(w);
    w.onFocus && w.onFocus();
  }

  function syncFocus(w) {
    wins.forEach(x => {
      x.el.classList.toggle('focused', x === w);
      x.task.classList.toggle('active', x === w);
      x.task.classList.toggle('minimized', x.min);
    });
    WM.focused = w;
    try {
      const h = w ? '#/' + w.id : location.pathname + location.search;
      if (location.hash !== (w ? '#/' + w.id : '')) history.replaceState(null, '', h);
    } catch (e) {}
    WM.onChange && WM.onChange();
  }

  function minimize(w) {
    w.min = true;
    w.el.classList.add('minimized');
    w.el.setAttribute('aria-hidden', 'true');
    focus(topWindow(w));
  }
  function restore(w) {
    w.min = false;
    w.el.classList.remove('minimized');
    w.el.removeAttribute('aria-hidden');
  }

  function close(w) {
    if (typeof w === 'string') w = wins.get(w);
    if (!w) return;
    try { w.onClose && w.onClose(); } catch (e) {}
    wins.delete(w.id);
    w.task.remove();
    w.el.classList.add('closing');
    setTimeout(() => w.el.remove(), 180);
    focus(topWindow(w));
  }

  function wire(w) {
    const { el } = w;
    const bar = el.querySelector('.win-bar');
    el.addEventListener('pointerdown', () => { if (WM.focused !== w) focus(w); }, true);

    el.querySelector('.wc.min').addEventListener('click', () => minimize(w));
    el.querySelector('.wc.max').addEventListener('click', () => setSnap(w, w.snap === 'max' ? null : 'max'));
    el.querySelector('.wc.close').addEventListener('click', () => close(w));
    bar.addEventListener('dblclick', e => { if (!e.target.closest('.win-ctrl')) setSnap(w, w.snap === 'max' ? null : 'max'); });

    // Drag
    bar.addEventListener('pointerdown', e => {
      if (e.button !== 0 || e.target.closest('.win-ctrl')) return;
      const sx = e.clientX, sy = e.clientY;
      let ox = w.x, oy = w.y, moved = false, snap = null;
      bar.setPointerCapture(e.pointerId);
      const move = ev => {
        const dx = ev.clientX - sx, dy = ev.clientY - sy;
        if (!moved) {
          if (Math.hypot(dx, dy) < 4) return;
          moved = true;
          el.classList.add('dragging');
          document.body.classList.add('is-dragging');
          if (w.snap) {
            const ratio = (sx - w.x) / w.w;
            const pw = (w.prev && w.prev.w) || 640;
            setSnap(w, null);
            w.x = sx - pw * ratio; w.y = Math.max(0, sy - 18);
            ox = w.x; oy = w.y;
          }
        }
        const a = area();
        w.x = Math.min(a.w - 90, Math.max(-w.w + 90, ox + dx));
        w.y = Math.min(a.h - 40, Math.max(0, oy + dy));
        apply(w);
        // Side snapping makes no sense on a phone; dragging to the top still maximises.
        snap = !mobile() && ev.clientX <= 6 ? 'left' : !mobile() && ev.clientX >= window.innerWidth - 6 ? 'right' : ev.clientY <= 4 ? 'max' : null;
        showGhost(snap);
      };
      const up = () => {
        bar.removeEventListener('pointermove', move);
        bar.removeEventListener('pointerup', up);
        bar.removeEventListener('pointercancel', up);
        el.classList.remove('dragging');
        document.body.classList.remove('is-dragging');
        showGhost(null);
        if (snap) setSnap(w, snap);
      };
      bar.addEventListener('pointermove', move);
      bar.addEventListener('pointerup', up);
      bar.addEventListener('pointercancel', up);
    });

    // Resize
    const grip = el.querySelector('.win-grip');
    grip.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      e.stopPropagation();
      if (w.snap) { w.snap = null; el.classList.remove('max', 'snapped'); }
      const sx = e.clientX, sy = e.clientY, ow = w.w, oh = w.h;
      grip.setPointerCapture(e.pointerId);
      document.body.classList.add('is-resizing');
      const move = ev => {
        const a = area();
        w.w = Math.min(a.w - w.x, Math.max(MIN_W, ow + ev.clientX - sx));
        w.h = Math.min(a.h - w.y, Math.max(MIN_H, oh + ev.clientY - sy));
        apply(w);
      };
      const up = () => {
        grip.removeEventListener('pointermove', move);
        grip.removeEventListener('pointerup', up);
        document.body.classList.remove('is-resizing');
      };
      grip.addEventListener('pointermove', move);
      grip.addEventListener('pointerup', up);
    });
  }

  function addTask(w) {
    const t = document.createElement('button');
    t.className = 'task';
    t.title = w.app.title;
    t.innerHTML = `${Icons.html(w.app.icon, 22)}<span>${w.app.label || w.app.title}</span>`;
    t.addEventListener('click', () => {
      if (w.min) { restore(w); focus(w); }
      else if (WM.focused === w) minimize(w);
      else focus(w);
    });
    taskList.appendChild(t);
    w.task = t;
  }

  const WM = {
    focused: null,
    init({ layer: l, taskList: t }) {
      layer = l; taskList = t;
      ghost = document.createElement('div');
      ghost.className = 'snap-ghost';
      layer.appendChild(ghost);
      window.addEventListener('resize', () => {
        const a = area();
        wins.forEach(w => {
          if (w.snap) { Object.assign(w, snapRect(w.snap)); apply(w); return; }
          w.w = Math.min(w.w, a.w - 16); w.h = Math.min(w.h, a.h - 16);
          w.x = Math.min(Math.max(0, w.x), a.w - w.w); w.y = Math.min(Math.max(0, w.y), a.h - w.h);
          apply(w);
        });
      });
    },
    open(id) {
      const app = Apps.get(id);
      if (!app) return null;
      if (app.external) { window.open(app.external, '_blank', 'noopener'); return null; }
      if (wins.has(id)) {
        const w = wins.get(id);
        if (w.min) restore(w);
        focus(w);
        return w;
      }
      const el = document.createElement('section');
      el.className = 'win opening';
      el.setAttribute('role', 'dialog');
      el.setAttribute('aria-label', app.title);
      el.innerHTML = `
        <header class="win-bar">
          <span class="win-ico">${Icons.html(app.icon, 18)}</span>
          <span class="win-title">${app.title}</span>
          <div class="win-ctrl">
            <button class="wc min" aria-label="Minimize">${CTRL.min}</button>
            <button class="wc max" aria-label="Maximize">${CTRL.max}</button>
            <button class="wc close" aria-label="Close">${CTRL.close}</button>
          </div>
        </header>
        <div class="win-body"></div>
        <div class="win-grip" aria-hidden="true"></div>`;
      const a = area();
      const ww = Math.min(app.w || 640, a.w - 32), hh = Math.min(app.h || 480, a.h - 32);
      const off = (cascade++ % 6) * 30;
      const w = {
        id, app, el, min: false, snap: null,
        w: ww, h: hh,
        // Keep clear of the desktop icon columns when there's room.
        x: Math.max(a.w - ww > 620 ? 300 : 12, Math.min(a.w - ww - 12, Math.round((a.w - ww) / 2) - 60 + off)),
        y: Math.max(12, Math.min(a.h - hh - 12, Math.round((a.h - hh) / 2) - 40 + off)),
      };
      if (mobile()) {
        // Phones: a large floating card with a margin all round and the desktop peeking out above.
        // The maximize button makes it full screen.
        w.w = a.w - 24;
        w.h = Math.round(a.h * 0.86);
        w.x = 12;
        w.y = Math.max(12, a.h - w.h - 12 - (off / 30) * 14);
      }
      apply(w);
      layer.appendChild(el);
      wire(w);
      addTask(w);
      wins.set(id, w);
      try { app.mount(el.querySelector('.win-body'), w); } catch (err) { console.error(err); el.querySelector('.win-body').textContent = 'This app failed to start.'; }
      WM.onOpen && WM.onOpen(id, app.title);
      focus(w);
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('opening')));
      return w;
    },
    close,
    get(id) { return wins.get(id); },
    list() { return [...wins.values()]; },
    minimizeAll() { wins.forEach(w => { if (!w.min) { w.min = true; w.el.classList.add('minimized'); } }); focus(null); },
  };

  window.WM = WM;
})();
