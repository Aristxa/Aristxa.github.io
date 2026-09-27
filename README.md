# AristeaOS

Portfolio of **Aristea Gjokthomi**, a data scientist and ML engineer, built as a desktop that runs in the browser.

**Live:** https://aristxa.github.io

- The **wallpaper is a live toy CoolCity model**. Hover to cast shade, click to plant a tree, or run the lazy-greedy planner.
- There is **one app per project**, each with an interactive view of its real published results. The Hugging Face Spaces run live inside the windows.
- It's a real **window manager**: drag, snap to the left/right/top edge, resize, minimize, and maximize by double-clicking the title bar.
- The **start menu has search** (`Ctrl`/`⌘` + `K`), and right-clicking the desktop opens a context menu.
- The **terminal** has tab completion and history (`help`, `neofetch`, `plant 40`, `open fiskal`, …).
- Every app has a **deep link**, e.g. `/#/fiskal`, `/#/coolcity`, `/#/terminal`.
- It includes light/dark themes, reduced-motion support, and a phone layout where windows open as draggable floating cards.

It's plain HTML, CSS and JavaScript with no framework, no build step and no web fonts (it uses the visitor's OS font).

App icons are original tiles with glyphs from [Microsoft Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) (MIT, see `assets/ICONS-LICENSE.txt`).

## Structure

```
index.html        shell markup (boot screen, desktop, taskbar, start menu)
css/style.css     all styles and theme tokens
js/heat.js        wallpaper heat-field simulation + greedy planner
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
