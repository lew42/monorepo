# drawer — the right rail, for anything that needs a place beside the page: one per document, opened by any caller, shut only by its own ✕; it pushes the page, never covers it.

## Use

```js
import { drawer } from "/app.js";

drawer(($slot, $body) => {
    $slot.empty(() => { span("What this is about"); });   // pinned head, beside the ✕
    $body.empty(() => { /* the controls */ });            // scrolls
});
// Drag its inline edge to resize — the width you let go of is remembered in `--drawer-w`.
drawer.refresh();     // re-runs the LAST fill fn — read "Sharing it" first
drawer.close();       // what the ✕ calls
drawer.showing();     // is it open
```

## Sharing it

One box, any number of callers — `ext/layout` fills it with a selected element's words, `ext/Panel` with a panel's properties, and whoever filled last owns what is showing.

- **Fill, don't hold.** Every call replaces the contents, and the old DOM, its listeners and its closures are collected together — 1,700 rebuilds measured flat on nodes, listeners and heap. What leaks is a fill that subscribes to something longer-lived (`item.on(…)`, an observer, a document listener): unbind when your element leaves · [doc/decisions.md](./doc/decisions.md)
- **`dock()` once at load, then only fill.** Forcing it open on selection reads as jumpy · [doc/decisions.md](./doc/decisions.md)
- **Re-announce your subject to redraw it — not `drawer.refresh()`**, which replays the last fill function, possibly another module's · [doc/decisions.md](./doc/decisions.md)
- **Claim your own clicks.** `ext/layout` keeps one permanent click listener on the rail and hears everyone's, so a caller's rows `stopPropagation` · [doc/decisions.md](./doc/decisions.md)

## Watch out

- **Width and open/shut are two tokens.** `close()` clears `--drawer`, so a dragged width would go with it — the width lives in `--drawer-w` (one `localStorage` key) and `--drawer` reads through to it · [doc/decisions.md](./doc/decisions.md)
- [`dev/DevBar`](/framework/dev/DevBar/) is the OTHER rail at this edge and both can be open at once — this one offsets by `--devbar`, and `.app` reserves the sum · [doc/decisions.md](./doc/decisions.md)
- Mount inside `.app`, never on `<body>` — colour-scheme and `--drawer` are read there · [doc/decisions.md](./doc/decisions.md)
- `rem`, not `em`: an `em` width reserves the wrong strip · [doc/decisions.md](./doc/decisions.md)
- `position: fixed` opts out of the push — `.page.layout-full` reads the shared `--rail-push` token (`.app`, drawer.css) instead of restating the reservation; `.app`'s own copy in framework.css is still the direct formula · [doc/decisions.md](./doc/decisions.md)
- Below `26rem` the rail is the whole sheet; that breakpoint mirrors `--rail-floor`'s default by hand · [doc/decisions.md](./doc/decisions.md)
- `drawer()` runs on every redraw — a listener on the returned rail is wired once, behind a flag · [doc/decisions.md](./doc/decisions.md)
- `z-index: 40`: over `.demo.max` (30), under the mode button (60); it docks beside DevBar (`--devbar`), not under it · [doc/decisions.md](./doc/decisions.md)

## More

- [Overview](/framework/ext/drawer/) · [doc/decisions.md](./doc/decisions.md) — the split from `ext/layout`, why only the ✕ closes it, every trap in full · [doc/file/](./doc/file/) — one note per file
- Files that matter: `drawer.js` (shell, push, ✕, the width), `drawer.css` (strip, sheet, z-index), `page.js` (live demo)
- The resize edge is `ext/grip`, shared with `dev/DevBar` — mounted inside the rail's box, so a shut rail takes it with it
