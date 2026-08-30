# DevBar — a right-docked rail of dev chrome on every page, behind `Ctrl + \`, for whoever is building the site

## Use

```js
import devbar from "./framework/dev/DevBar/DevBar.js";   // public/app.js — the one caller

render(){ …; devbar(this); },
navigated(){ devbar.refresh(); },
```

## Watch out

- [`ext/drawer`](/framework/ext/drawer/) is the OTHER rail at this edge and both can be open at once — `.app` reserves the sum, and the drawer offsets itself by `--devbar` to sit beside this one: [`doc/docking.md`](./doc/docking.md)
- Below 34em the rail is a bottom sheet, not a side rail — 17rem is 70% of a 390px window, and `.app` declines to push there: [`doc/decisions.md`](./doc/decisions.md)
- A **closed** rail is `visibility: hidden` (delayed 0.18s, so the close still animates) — without it, resizing across 34em interpolates `translateX(100%)` → `translateY(100%)` straight across the screen and the rail flickers: [`doc/docking.md`](./doc/docking.md)
- `dev-open` on `<html>` is the entire open state; react to that class or a token, never a property on this module: [`doc/docking.md`](./doc/docking.md)
- The resize edge is `ext/grip` now, shared with [`ext/drawer`](/framework/ext/drawer/) — `DevBar.js` mounts it (`write: rail`), and this rail's own `grip.js`/`grip.css` are gone (2026-08-18): [`doc/docking.md`](./doc/docking.md)
- A preset or a drag drops `--rail-floor` to 0 for the session, so a later drag can squeeze the page below 26rem; `MIN` (200px) is the only guard: [`doc/sizing.md`](./doc/sizing.md)
- The rail renders during `App.render()`, before the router and the socket — everything it shows is read at render time, so `navigated()` must call `refresh()`: [`doc/method/refresh.md`](./doc/method/refresh.md)
- The `layout` readout is a snapshot with no age (`measure` is the honest answer), and two of the eleven taste bands are knowingly uncalibrated and say so: [`doc/measuring.md`](./doc/measuring.md)
- The `structure` section draws twice, 400ms apart: until the page's own stylesheets land every child computes `block`: [`doc/structure.md`](./doc/structure.md)
- The `ai` section builds after a fetch — the captor trap it dodges, and why naming a thread is a native `prompt()`: [`doc/threads.md`](./doc/threads.md)
- The `ai` turn is bound to THIS tab and sends what you have selected; the selected text is remembered, because clicking into the chat box clears it: [`doc/threads.md`](./doc/threads.md)

## More

- [Overview](/framework/dev/DevBar/) · [`doc/decisions.md`](./doc/decisions.md) — every decision, trap and open item, verbatim (moved 2026-08-17)
- [`doc/docking.md`](./doc/docking.md) — mounts on `<body>`, one custom property, pushes instead of covering, summed with `ext/drawer`'s rail
- [`doc/sizing.md`](./doc/sizing.md) — four presets, `innerWidth - target`, the floor they clear, why the lit button reads a setting
- [`doc/threads.md`](./doc/threads.md) — the `ai` section: a chat is a task, the directory listing is the index
- [`doc/structure.md`](./doc/structure.md) — the `structure` section: the nested `.page` chain, the children, and why the display is computed
- [`doc/measuring.md`](./doc/measuring.md) — the `layout` tab: `.app` as root, the 200ms settle, panel retargeting, the hidden-page trap
- Files that matter: `DevBar.js` (shell, toggle, refresh) · `tools.js` (sections array, no registry) · `settings.js` (one localStorage document) · `ext/grip` (the resize edge, shared)
