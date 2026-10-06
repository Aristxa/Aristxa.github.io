# AristeaOS

My portfolio, built as a desktop that runs in the browser. I'm Aristea Gjokthomi, a data scientist and ML engineer.

Live: https://aristxa.github.io

Each project has its own app on the desktop, with an interactive view of its published results. The Hugging Face Spaces run live inside their windows.

The wallpaper is [NeuroDrive](https://github.com/Aristxa/neurodrive): four cars driving around a city, all controlled by the same pretrained network, running on the real engine. Switch the panel to "Drive yourself" to get your own car (WASD or arrows, touch pedals on a phone, `P` for autopilot, `R` to restart). It always starts back on autopilot. From the desktop's right-click menu or Settings you can switch to two other wallpapers: the daedalOS galaxy (WebGL), or a small CoolCity heat map where you can plant trees or run the greedy planner.

The rest works like a normal desktop:

- windows can be dragged, snapped to the edges, resized, minimized and maximized
- drag on the desktop to select icons, right-click for a context menu
- start menu with search (`Ctrl`/`⌘` + `K`)
- a terminal with tab completion and history (`help`, `neofetch`, `plant 40`, `open fiskal`, …)
- every app has its own link, e.g. `/#/fiskal`, `/#/coolcity`, `/#/terminal`
- light and dark themes, reduced motion, and a phone layout with floating windows

Plain HTML, CSS and JavaScript: no framework, no build step, and the system font instead of web fonts.

The galaxy wallpaper comes from [daedalOS](https://github.com/DustinBrett/daedalOS) (MIT) and the animated icons are adapted from [itshover](https://itshover.com) (Apache-2.0). See `THIRD-PARTY-NOTICES.md`.

## Files

```
index.html        boot screen, desktop, taskbar, start menu
css/style.css     styles and theme tokens
js/drive.js       NeuroDrive wallpaper (uses js/vendor/neurodrive.js)
js/galaxy.js      galaxy wallpaper (wraps js/vendor/daedalos-galaxy.js)
js/heat.js        heat map wallpaper and greedy planner
js/apps.js        icons, app registry and the content of every app
js/terminal.js    terminal commands
js/wm.js          window manager
js/main.js        boot, desktop, start menu, context menu, routing, CONFIG
```

Contact details are in `CONFIG` at the top of `js/main.js`, desktop icons in the `DESKTOP` array there, and all app content in `js/apps.js`. After changing CSS or JS, bump the `?v=` number on the tags in `index.html` so phones don't keep old cached files.

## Updating the NeuroDrive engine

`js/vendor/neurodrive.js` is the engine from the `neurodrive` repo, bundled into one file. To rebuild it from a checkout next to this folder:

```bash
N=../neurodrive
{ echo "/* NeuroDrive engine (https://github.com/Aristxa/neurodrive @ $(git -C $N rev-parse --short HEAD)), MIT, Aristea Gjokthomi. */"
  echo "(function () {"
  for f in core/math core/geometry core/spatial-grid core/graph core/theme world/items world/world world/presets ai/network ai/evolution sim/sensor sim/car data/pretrained; do
    sed "s/^'use strict';$//" $N/js/$f.js; echo; done
  echo "  window.NeuroDrive = { World, Presets, NeuralNetwork, Car, Sensor, THEME, Random, MathUtil, PRETRAINED_BRAINS };"
  echo "})();"; } > js/vendor/neurodrive.js
```

## Running locally

```bash
npx http-server -p 5173 -c-1
# http://localhost:5173
```

It's deployed with GitHub Pages from the `main` branch.
