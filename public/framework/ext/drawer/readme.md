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

## The ☰ and its tabs

Every page has a ☰ at its top right (`menu.js`, called once in `app.js`). It opens this drawer on five routed tabs — AI, Sessions, Dictation, Settings, Admin (`tabs.js`, `tabs/*.js`), plus Element while something is selected; off the dev server only AI, Sessions and Dictation show; `?drawer=sessions` opens on Sessions. The tab model, `send()` and `drawer.page()` · [doc/tabs.md](./doc/tabs.md)

While it is open, a click selects any content on the page (`select.js`): its properties show on the Element tab, which appears only while something is selected, and "Ask about this" adds it to the AI tab's input as a chip that rides along as context · [doc/select.md](./doc/select.md)

**Every page has an inbox**, at the top of the AI tab: notes any agent (Servex's `drop` tool) or you (**Leave a note**) left on this page, each with a Clear; the tab reads **AI · 2** while two are open (`inbox.js`) · [doc/inbox.md](./doc/inbox.md)

## On a phone

Below 52em a page with its own left-side sidebar (`core/Sidebar`) draws its own ☰ in that same top-right corner, so this drawer's fixed ☰ steps aside there instead of covering it. A small bar pinned to the bottom of the screen (`rail.js`, `rail.css`) is this drawer's other way in on a phone: an **✦** button opens a small sheet — the same log-plus-composer-plus-mic widget the desktop drawer's AI tab builds (`ext/Chat`'s `ChatPanel`) — and an **⋯ "More"** button opens this same drawer on its tabs, not a second ☰, since the page's own ☰ already lives at the top of the screen there. The sheet's header always names the page it is about ("Ask, by voice · /framework/", kept current as you navigate) and carries a **New session** button beside its other links. On a **plain page**, a finished sentence goes into a real [voice session](/framework/ext/Session/) — one per browser tab, followed from page to page, answered by a fast and a smart assistant — and "New session" drops it so the next thing said starts fresh. On a **card page** (`/framework/ai2/…`) the sentence still goes straight into that card's own persisted thread, unchanged, and "New session" only resets that card's own assistant. The old ☰ "Menu" look stays reachable as `DrawerRail.V1` — screenshots, the seam and the layout decision behind it: [Mobile bottom rail](/framework/ext/drawer/rail/). **The sheet's own top edge is a resize handle** (`ext/grip`'s `axis: "y"`) — drag it to change how much of the screen it takes; the size you let go of is remembered per device and read back on the next open (`grip-everywhere`, 2026-09-29 — `ext/grip/doc/decisions.md`). **Swipe it to the top and it becomes a page**: the whole screen, its own url (`?sheet=full`) and a ‹ Back; the phone's own back steps it down (full → open → closed) and never leaves the site · [doc/sheet.md](./doc/sheet.md)

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
- The sheet's state is the url (`?sheet=open`, `?sheet=full`), one history entry per step up. Show or hide it through `rail.to(mode)`, never by toggling `.on` yourself, or the phone's back and the url stop agreeing · [doc/sheet.md](./doc/sheet.md)
- The ✦ sheet is never given a measured height on open: it grows with its content up to half the screen. A measure taken at open ran before the chat panel was built and froze the sheet at about 150 px, header and links only (sheet-regression, 2026-09-30). A dragged height is kept, but never below 40% of the screen. The links sit behind **More** in the sheet's header, so the conversation and the mic come first
- Below `26rem` the rail is the whole sheet; that breakpoint mirrors `--rail-floor`'s default by hand · [doc/decisions.md](./doc/decisions.md)
- `drawer()` runs on every redraw — a listener on the returned rail is wired once, behind a flag · [doc/decisions.md](./doc/decisions.md)
- `z-index: 40`: over `.demo.max` (30), under the mode button (60); it docks beside DevBar (`--devbar`), not under it · [doc/decisions.md](./doc/decisions.md)
- Below 52em, the ☰ hides itself when the page has its own `.sidebar` (`core/Sidebar`) — that panel draws a native ☰ in the same corner, and the two used to fight for every tap. `.drawer-menu-v1` on `.app` brings this one back there too · [doc/decisions.md](./doc/decisions.md)

## More

- [Walkthrough](/framework/ext/drawer/walkthrough/) — seven screenshots, click Next through the whole rail
- [Mobile bottom rail](/framework/ext/drawer/rail/) — the ✦ button, the listening sheet, and why it's a plain flex row instead of `position: fixed`
- [Overview](/framework/ext/drawer/) · [doc/decisions.md](./doc/decisions.md) — the split from `ext/layout`, why only the ✕ closes it, every trap in full · [Files](/framework/ext/drawer/files/) — one note per file
- Files that matter: `drawer.js` (shell, push, ✕, the width, `page()`), `drawer.css` (strip, sheet, z-index, the ☰), `menu.js` (the ☰), `tabs.js` + `tabs/` (the tabs), `select.js` (selecting on the page), `rail.js` + `rail.css` (the mobile bottom rail and its sheet), `page.js` (live demo)
- The resize edge is `ext/grip`, shared with `dev/DevBar` — mounted inside the rail's box, so a shut rail takes it with it
