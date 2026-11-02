# drawer — the right rail for context, tools, and assistance beside the page

Pushes the document instead of covering it; opened by any caller, resized by dragging its edge, and shut only by its own ✕.

This folder holds four things: the desktop drawer, the phone **sheet** (`Sheet.js`), the tabs, and the chat version dropdown (`ChatView.js`). The sheet borrows the drawer's `tabs.js` and mounts the chat. How it fits with dictation and chat: [ai/system-map.md](/framework/ai/system-map.md); the proposal to move the Sheet to a generic `ux/Sheet` and the chat chips to `ext/Chat`: [ai/system-proposal.md](/framework/ai/system-proposal.md).

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
- `tabs.js`: Tab switcher routing (`AI`, `Debug`, `Docs`, `Settings`, `Element`); `tabs/debug.js` draws Debug (`?drawer=dictation` still opens it); `tabs/docs.js` draws Docs, the `ux/Dictate` readme and docs ([doc](/framework/ux/Dictate/doc/docs-tab.md)).
- `ChatView.js` / `ChatView.css`: the **chat version dropdown** (`Chat V1 ▾`: V1, V2, V3; the same `drawer-ai-switch-btn` and `ux/Popover` menu as the session dropdown beside it) and the Chat v2 / Chat v3 box it switches on, one class used by `Sheet.js` (head) and `tabs/ai.js` (beside the session switcher); `lew42.sheet.chat_view` (none for V1, "v2" or "v3") in localStorage rules both. V1, the bubbles, stays mounted underneath, so the mic keeps recording across a switch.
- `Sheet.js` / `rail.css`: the phone's bottom strip and the voice sheet it raises, `export default class Sheet extends View` (`Sheet.of(app)`). It was `rail.js` / `DrawerRail` until 2026-10-16; `rail.js` now only re-exports it, so old imports keep working. **The mobile sheet for dictation is `Sheet.Panel`** (`class SheetPanel extends View`, one class since 2026-10-16; the old four-class chain `DrawerRailSheetV1` → `DrawerRailSheetChat` is kept in [`archive/sheet-chain-2026-10-16.js`](./archive/sheet-chain-2026-10-16.js), opt-in). Its sizes are one machine, `Sheet.Size`: ✦ opens the **strip** (about 100 px, above the bottom bar, the last line said and ⌃), drag up to **split**, past 90% to **full** (✕ and the drawer tabs); a drag down on the head steps one size down, and back steps down too Open means the url is `<path>/ai/`, an [`AIPage`](./AIPage.js) (`class AIPage extends Page`, minted by `Page.child()` for any page without a real `ai/` child; its views chat, live, sessions, debug and settings were the drawer's tabs). Old `?sheet=` and `?drawer=` links are rewritten once. On a desktop, `Sheet.Dock` opens the drawer docked by default at 1920 px and wider. [`AIFeed`](./AIFeed.js) streams the page's `ai/log.jsonl` events into the chat as one stream. The version dropdown in the sheet's head (`ChatView.sync()`) shows [Chat v2](../Chat/v2/readme.md) (`ChatV2`) in place of the bubbles, on the same session file. [doc/sheet.md](doc/sheet.md).
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
- [Design decisions 2026-10-27](/framework/ai/design-decisions-2026-10-27.md) — the sheet shows the chat spine (one stored list of entries that reference sentences, cards, tasks); decided or leaning, not built.
