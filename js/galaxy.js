/* ============================================================
   Galaxy wallpaper: a thin wrapper around the daedalOS Galaxy
   renderer (js/vendor/daedalos-galaxy.js, MIT, Dustin Brett),
   set up the same way daedalOS does it.
   ============================================================ */
(function () {
  'use strict';

  const S = { canvas: null, r: null, stopInput: null, enabled: false, animated: true, visible: true, ok: false };

  const size = () => {
    const el = S.canvas.parentElement;
    S.canvas.width = Math.max(1, el.offsetWidth);
    S.canvas.height = Math.max(1, el.offsetHeight);
  };
  const sync = () => S.r && S.r.setVisible(S.enabled && S.animated && S.visible && !document.hidden);

  function create() {
    size();
    S.r = window.DaedalGalaxy.createGalaxyRenderer(S.canvas, {});
    sync();
  }

  const Galaxy = {
    init(canvas, { animated = true, enabled = true } = {}) {
      S.canvas = canvas;
      S.animated = animated;
      S.enabled = enabled;
      if (!window.DaedalGalaxy || typeof WebGLRenderingContext === 'undefined') return false;
      try { create(); S.ok = true; } catch (e) { console.warn('Galaxy wallpaper unavailable:', e); return false; }
      S.stopInput = window.DaedalGalaxy.listenGalaxyInput({
        onTilt: (x, y) => S.r && S.r.setTilt(x, y),
        onVisibility: v => { S.visible = v; sync(); },
      });
      window.addEventListener('resize', () => { if (!S.r) return; size(); S.r.resize(S.canvas.width, S.canvas.height); }, { passive: true });
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); S.r && S.r.destroy(); S.r = null; });
      canvas.addEventListener('webglcontextrestored', () => { try { create(); } catch (e) {} });
      return true;
    },
    get ok() { return S.ok; },
    setEnabled(on) {
      S.enabled = !!on;
      if (on && S.r) { size(); S.r.resize(S.canvas.width, S.canvas.height); }
      sync();
    },
    // With animation off the galaxy holds still on its last frame.
    setAnimated(on) { S.animated = !!on; sync(); },
    look() {}, // the daedalOS renderer tracks the mouse and device tilt itself
  };

  window.Galaxy = Galaxy;
})();
