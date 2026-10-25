# drawer — the right rail for context, tools, and assistance beside the page

Pushes the document instead of covering it; opened by any caller, resized by dragging its edge, and shut only by its own ✕.

## Use

```js
import { drawer } from "/app.js";

drawer(($slot, $body) => {
    $slot.empty(() => { span("What this is about"); });   // pinned head, beside ✕
    $body.empty(() => { /* controls */ });                // scrolls
});
drawer.refresh();     // re-runs last fill fn
drawer.close();       // closes rail
drawer.showing();     // boolean
```

## Core concepts

- **The ✦ button** (was ☰ until 2026-10-16; ☰ now always means navigation): Opens the drawer on routed tabs (AI chat, Debug, Settings, and contextual Element). **Debug** (was Dictation until 2026-10-24) shows dictation layer by layer, live, with real errors; on a phone the sheet routes it as `<path>/ai/debug/` so a reload keeps it ([ux/Dictate/doc/debug-tab.md](/framework/ux/Dictate/doc/debug-tab.md)) · [`doc/tabs.md`](./doc/tabs.md).
- **Mobile rail**: A pinned bottom bar on phones offering voice chat sheet and drawer access · [`doc/sheet.md`](./doc/sheet.md).
- **Page inbox**: Per-page note drops for agent coordination (`inbox.js`) · [`doc/inbox.md`](./doc/inbox.md).
- **Selection**: Selecting page content inspects element attributes (`select.js`) · [`doc/select.md`](./doc/select.md).

## Files that matter

- `drawer.js` / `drawer.css`: Shell, push layout, ✕ close, and `--drawer-w` token.
- **One chat, one feed** (2026-10-17): the sheet, the dock and the routed `AIPage` never mount two. `AIPage.holder()` names who holds them (the sheet below 52em, the dock when its AI tab is open, else the page); the others mount nothing · [`doc/sheet.md`](./doc/sheet.md#one-chat-one-feed).
- `menu.js`: The top-right ✦ button. On a phone the strip's ☰ Menu opens the page's Sidebar tree from the bottom (`Sheet.open_nav()`).
- `tabs.js`: Tab switcher routing (`AI`, `Debug`, `Settings`, `Element`); `tabs/debug.js` draws Debug (`?drawer=dictation` still opens it).
- `Sheet.js` / `rail.css`: the phone's bottom strip and the voice sheet it raises, `export default class Sheet extends View` (`Sheet.of(app)`). It was `rail.js` / `DrawerRail` until 2026-10-16; `rail.js` now only re-exports it, so old imports keep working. **The mobile sheet for dictation is `Sheet.Panel`** (`class SheetPanel extends View`, one class since 2026-10-16; the old four-class chain `DrawerRailSheetV1` → `DrawerRailSheetChat` is kept in [`archive/sheet-chain-2026-10-16.js`](./archive/sheet-chain-2026-10-16.js), opt-in). Its sizes are one machine, `Sheet.Size`: ✦ opens the **strip** (about 100 px, above the bottom bar, the last line said and ⌃), drag up to **split**, past 90% to **full** (✕ and the drawer tabs); a drag down on the head steps one size down, and back steps down too Open means the url is `<path>/ai/`, an [`AIPage`](./AIPage.js) (`class AIPage extends Page`, minted by `Page.child()` for any page without a real `ai/` child; its views chat, live, sessions, dictation and settings were the drawer's tabs). Old `?sheet=` and `?drawer=` links are rewritten once. On a desktop, `Sheet.Dock` opens the drawer docked by default at 1920 px and wider. [`AIFeed`](./AIFeed.js) streams the page's `ai/log.jsonl` events into the chat as one stream. [doc/sheet.md](doc/sheet.md).
- `page.js`: Live interactive demo.

## Doc topics

- [`doc/architecture.md`](./doc/architecture.md) — the design record: every decision that holds today, each as *Decided · Why · Instead*. Start here.
- [`doc/decisions.md`](./doc/decisions.md) — Sizing tokens, push math, z-index, and traps.
- [`doc/tabs.md`](./doc/tabs.md) — Tab model, routing, and session header.
- [`doc/sheet.md`](./doc/sheet.md) — Mobile sheet resizing, gestures, and state.
- [`doc/owner-2026-10-16-sheet.md`](./doc/owner-2026-10-16-sheet.md) — the owner's 2026-10-16 asks for the sheet, the ☰ and a routed `<path>/ai/`; links the audit and the proposal.
- [`doc/inbox.md`](./doc/inbox.md) — Coordination inbox per page.
- [`doc/select.md`](./doc/select.md) — Element selection and AI context chips.
- [`doc/rail-notes.md`](./doc/rail-notes.md) — comments pruned from `rail.js`: history, lessons and design reasons, verbatim.
- [`doc/ai-tab-notes.md`](./doc/ai-tab-notes.md) — comments pruned from `tabs/ai.js`, verbatim.

## Also here (readme audit, 2026-10-13)
- [walkthrough](./walkthrough/)
