# AristeaOS

Portfolio of **Aristea Gjokthomi**, a data scientist and ML engineer, built as a desktop that runs in the browser.

**Live:** https://aristxa.github.io

- The default **wallpaper is [NeuroDrive](https://github.com/Aristxa/neurodrive)**: four self-driving cars touring a city, all driven by one pretrained neural network, running on the real engine.
- Switch it (right-click the desktop or Settings) to the **daedalOS galaxy** (WebGL), which turns slowly and tilts with the mouse, or to a **live toy CoolCity heat map**: hover to cast shade, click to plant a tree, or run the lazy-greedy planner.
- Drag on the desktop to **rubber-band select** icons, like a real PC.
- There is **one app per project**, each with an interactive view of its real published results. The Hugging Face Spaces run live inside the windows.
- It's a real **window manager**: drag, snap to the left/right/top edge, resize, minimize, and maximize by double-clicking the title bar.
- The **start menu has search** (`Ctrl`/`⌘` + `K`), and right-clicking the desktop opens a context menu.
- The **terminal** has tab completion and history (`help`, `neofetch`, `plant 40`, `open fiskal`, …).
- Every app has a **deep link**, e.g. `/#/fiskal`, `/#/coolcity`, `/#/terminal`.
- It includes light/dark themes, reduced-motion support, and a phone layout where windows open as draggable floating cards.

It's plain HTML, CSS and JavaScript with no framework, no build step and no web fonts (it uses the visitor's OS font).

The galaxy wallpaper is from [daedalOS](https://github.com/DustinBrett/daedalOS) (MIT) and the animated icons are adapted from [itshover](https://itshover.com) (Apache-2.0). See `THIRD-PARTY-NOTICES.md`.

## Structure

```
index.html        shell markup (boot screen, desktop, taskbar, start menu)
css/style.css     all styles and theme tokens
js/drive.js       default wallpaper: NeuroDrive cars on js/vendor/neurodrive.js
js/galaxy.js      optional wallpaper: wrapper around js/vendor/daedalos-galaxy.js
js/heat.js        optional wallpaper: heat-field simulation + greedy planner
js/apps.js        icons, app registry and every app's content
js/terminal.js    terminal commands
js/wm.js          window manager (drag, snap, resize, taskbar)
js/main.js        boot, desktop, start menu, context menu, routing, CONFIG
```

## Edit

- **Contact details:** set `email` / `linkedin` in the `CONFIG` object at the top of `js/main.js`.
- **About text:** the `text` array in `mountAbout` in `js/apps.js`. It's written in first person, so make it sound like you.
- **Projects and text:** everything lives in `js/apps.js`, one `mount…` function per app.
- **Desktop icons:** the `DESKTOP` array in `js/main.js`.
- **After changing CSS/JS:** bump the `?v=` number on the `<link>`/`<script>` tags in `index.html`, so phones don't keep serving old cached files.

## Update the NeuroDrive engine

`js/vendor/neurodrive.js` is the engine from the `neurodrive` repo, concatenated into one closure. After changing that repo (for example retraining the brains), rebuild it from a checkout next to this folder:

```bash
N=../neurodrive
{ echo "/* NeuroDrive engine (https://github.com/Aristxa/neurodrive @ $(git -C $N rev-parse --short HEAD)), MIT, Aristea Gjokthomi. */"
  echo "(function () {"
  for f in core/math core/geometry core/spatial-grid core/graph core/theme world/items world/world world/presets ai/network ai/evolution sim/sensor sim/car data/pretrained; do
    sed "s/^'use strict';$//" $N/js/$f.js; echo; done
  echo "  window.NeuroDrive = { World, Presets, NeuralNetwork, Car, Sensor, THEME, Random, MathUtil, PRETRAINED_BRAINS };"
  echo "})();"; } > js/vendor/neurodrive.js
```

## Run locally

```bash
npx http-server -p 5173 -c-1
# open http://localhost:5173
```

## Deploy (free, GitHub Pages)

1. Create a **public** repo named exactly `Aristxa.github.io`.
2. Push this folder to its `main` branch.
3. In the repo, go to **Settings → Pages → Build and deployment**, choose *Deploy from a branch*, then `main` / `root`.
4. After about a minute, the site is live at https://aristxa.github.io.
