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

Every page has a ☰ at its top right (`menu.js`, called once in `app.js`). It opens this drawer on three routed tabs — AI, Dictation, Settings (`tabs.js`, `tabs/*.js`), plus Element while something is selected; off the dev server only AI and Dictation show; `?drawer=sessions` opens the AI tab (the old Sessions tab merged into it — see below). The tab model, `send()` and `drawer.page()` · [doc/tabs.md](./doc/tabs.md)

**The AI tab is `ux/Dictate/chat.js`'s one mount** (one-dictation, 2026-09-30), full height, no model picker, on a plain page AND a card alike — the same call the ✦ sheet makes, below. The OLD tab (its own model picker, its own private session wiring) is kept reachable as `aiV2` (`tabs/ai.js`). **A header strip sits above it** (drawer-chat, one-dictation, 2026-10-02 — the owner: "which session we're on should be abundantly clear; which agents are listening should be abundantly clear"): the session's name and a link to its raw log, the fast/smart assistants as live-state chips (working/idle/asleep, read from `GET /api/agents`), a short switcher listing the project's other recent voice sessions, and the shared "+ New session" button (`chat.new_session_button`, also on `/framework/ai/`'s own Inbox dashboard beside "+ New card"). This strip IS the old Sessions tab's own content, folded up here — `tabs/sessions.js` still exists for its `threads()`/`load()` exports (`dev/DevBar/ask.js` reads them) but is no longer routed to.

**Admin is a section of Settings**, not its own tab (`tabs/settings.js` calls `tabs/admin.js`'s own function directly) — purely so the tab row fits one line at the drawer's 19rem default width.

While it is open, a click selects any content on the page (`select.js`): its properties show on the Element tab, which appears only while something is selected, and "Ask about this" adds it to the AI tab's input as a chip that rides along as context · [doc/select.md](./doc/select.md)

**Every page has an inbox**, at the top of the AI tab (and, round 4, above the ✦ sheet's own widget on a phone too), for coordination, never chat: notes any agent (Servex's `drop` tool) or you (**Leave a note**, desktop only — the button is left off the phone sheet on purpose, less to tap through) left on this page, each with a Clear, or the mastermind coordinating this module, who gets them instead; the tab reads **AI · 2** while two are open (`inbox.js`) · [doc/inbox.md](/framework/ext/drawer/doc/inbox/)

## On a phone

Below 52em a page with its own left-side sidebar (`core/Sidebar`) draws its own ☰ in that same top-right corner, so this drawer's fixed ☰ steps aside there instead of covering it. A small bar pinned to the bottom of the screen (`rail.js`, `rail.css`) is this drawer's other way in on a phone: an **✦** button opens a small sheet — `DrawerRail.Sheet`, now `DrawerRailSheetChat`, which builds the same [`ux/Dictate/chat.js`](/framework/ux/Dictate/) mount the desktop drawer's AI tab does — and an **⋯ "More"** button opens this same drawer on its tabs, not a second ☰, since the page's own ☰ already lives at the top of the screen there. The sheet's header always names the page it is about ("Ask, by voice · /framework/", kept current as you navigate) and carries a **New session** button beside its other links. **The session is GLOBAL** (one-dictation, 2026-09-30 — the owner: "we're not doing per directory assistants anymore… we're doing global dictation assistance"): one per browser tab, on the identical `sessionStorage` slot, never a different one per page or card — a card is only a hint for the very first sentence ever said, and a conversation begun on the phone continues at the desk, whatever page or card is open there. "New session" drops it so the next thing said starts fresh. `DrawerRailSheetPanel` — the earlier, private-session-pair version this replaced — is kept reachable as `DrawerRail.SheetPanel`, unchanged. The old ☰ "Menu" look stays reachable as `DrawerRail.V1` — screenshots, the seam and the layout decision behind it: [Mobile bottom rail](/framework/ext/drawer/rail/). **The sheet's own top edge is a resize handle** (`ext/grip`'s `axis: "y"`) — drag it to change how much of the screen it takes; the size you let go of is remembered per device and read back on the next open (`grip-everywhere`, 2026-09-29 — `ext/grip/doc/decisions.md`). **Dragged low, it collapses to one line** — just the box, the mic and Send, nothing else — instead of closing outright, so a quick glance or a quick reply never costs a full reopen (`rail.js`'s `collapse()`). **Swipe it to the top and it becomes a page**: the whole screen and its own url (`?sheet=full`); the phone's own back steps it down (full → open → closed) and never leaves the site. **No ‹ Back button in the head** (voice-sheet-header, 2026-10-01 — the owner: "we have the X, the X makes much more sense to me") — the ✕ already closes the sheet from any height, full screen included, so the phone's own hardware back is the one way to step a full sheet down to "open" instead · [doc/sheet.md](/framework/ext/drawer/doc/sheet/)

## Sharing it

One box, any number of callers — `ext/layout` fills it with a selected element's words, `ext/Panel` with a panel's properties, and whoever filled last owns what is showing.

- **Fill, don't hold.** Every call replaces the contents, and the old DOM, its listeners and its closures are collected together — 1,700 rebuilds measured flat on nodes, listeners and heap. What leaks is a fill that subscribes to something longer-lived (`item.on(…)`, an observer, a document listener): unbind when your element leaves · [doc/decisions.md](./doc/decisions.md)
- **`dock()` once at load, then only fill.** Forcing it open on selection reads as jumpy · [doc/decisions.md](./doc/decisions.md)
- **Re-announce your subject to redraw it — not `drawer.refresh()`**, which replays the last fill function, possibly another module's · [doc/decisions.md](./doc/decisions.md)
- **Claim your own clicks.** `ext/layout` keeps one permanent click listener on the rail and hears everyone's, so a caller's rows `stopPropagation` · [doc/decisions.md](./doc/decisions.md)

## Watch out

- **Width and open/shut are two tokens.** `close()` clears `--drawer`, so a dragged width would go with it — the width lives in `--drawer-w` (one `localStorage` key) and `--drawer` reads through to it · [doc/decisions.md](./doc/decisions.md)
- [`dev/DevBar`](/framework/dev/DevBar/) is the OTHER rail at this edge and both can be open at once — this one offsets by `--devbar`, and `.app` reserves the sum · [doc/decisions.md](./doc/decisions.md)
- Mount inside `.app`, never on `<body>` — colour-scheme, `--drawer` and the Montserrat font are read there. `build()` can run before `.app` exists; it then re-parents into `.app` once `app.ready` resolves · [doc/decisions.md](./doc/decisions.md)
- **`--drawer` and `--drawer-w` are written only by `token()`** (drawer.js). It writes on the current `.app` and clears any copy on `<body>`. Before it, a reload with the drawer open (`?drawer=ai`) wrote them on `<body>`, `close()` cleared only `.app`, and the page stayed squeezed with the ☰ out of its corner (drawer-close, 2026-10-02) · [regression test](/framework/ai/2026-10-02/drawer-close/regression.mjs)
- `rem`, not `em`: an `em` width reserves the wrong strip · [doc/decisions.md](./doc/decisions.md)
- `position: fixed` opts out of the push — `.page.layout-full` reads the shared `--rail-push` token (`.app`, drawer.css) instead of restating the reservation; `.app`'s own copy in framework.css is still the direct formula · [doc/decisions.md](./doc/decisions.md)
- The sheet's state is the url (`?sheet=open`, `?sheet=full`), one history entry per step up. Show or hide it through `rail.to(mode)`, never by toggling `.on` yourself, or the phone's back and the url stop agreeing · [doc/sheet.md](/framework/ext/drawer/doc/sheet/)
- Closing the sheet (✕, drag down, phone back) keeps its mic running now — only the window widening past 52em still stops it. `hide({ keep_mic })` is the seam · [doc/sheet.md](/framework/ext/drawer/doc/sheet/)
- The ✦ sheet is never given a measured height on open: it grows with its content up to half the screen. A measure taken at open ran before the chat panel was built and froze the sheet at about 150 px, header and links only (sheet-regression, 2026-09-30). A dragged height is kept, but never below 40% of the screen. The links sit behind **More** in the sheet's header, so the conversation and the mic come first
- **A `max-block-size` cap must be turned off at EVERY level it was set, not just the outer one.** `Widget.css`'s card and its thread each carry their own separate cap (sized for a standalone widget on a normal page); turning off only the card's left the thread stuck at 22em in fullscreen, with the leftover space sitting as a void below the composer buttons instead of inside the growing thread (fullscreen-rail-void, 2026-10-01) · `rail.css`'s own comment
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
