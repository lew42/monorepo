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

- **The ☰ menu**: Opens the drawer on routed tabs (AI chat, Dictation, Settings, and contextual Element) · [`doc/tabs.md`](./doc/tabs.md).
- **Mobile rail**: A pinned bottom bar on phones offering voice chat sheet and drawer access · [`doc/sheet.md`](./doc/sheet.md).
- **Page inbox**: Per-page note drops for agent coordination (`inbox.js`) · [`doc/inbox.md`](./doc/inbox.md).
- **Selection**: Selecting page content inspects element attributes (`select.js`) · [`doc/select.md`](./doc/select.md).

## Files that matter

- `drawer.js` / `drawer.css`: Shell, push layout, ✕ close, and `--drawer-w` token.
- `menu.js`: The top-right ☰ button.
- `tabs.js`: Tab switcher routing (`AI`, `Dictate`, `Settings`, `Element`).
- `Sheet.js` / `rail.css`: the phone's bottom strip and the voice sheet it raises, `export default class Sheet extends View` (`Sheet.of(app)`). It was `rail.js` / `DrawerRail` until 2026-10-16; `rail.js` now only re-exports it, so old imports keep working. **The mobile sheet for dictation is `DrawerRailSheetChat`** (the name its title shows; it extends `DrawerRailSheetPanel` > `DrawerRailSheet` > `DrawerRailSheetV1`).
- `page.js`: Live interactive demo.

## Doc topics

- [`doc/decisions.md`](./doc/decisions.md) — Sizing tokens, push math, z-index, and traps.
- [`doc/tabs.md`](./doc/tabs.md) — Tab model, routing, and session header.
- [`doc/sheet.md`](./doc/sheet.md) — Mobile sheet resizing, gestures, and state.
- [`doc/owner-2026-10-16-sheet.md`](./doc/owner-2026-10-16-sheet.md) — the owner's 2026-10-16 asks for the sheet, the ☰ and a routed `<path>/ai/`; links the audit and the proposal.
- [`doc/inbox.md`](./doc/inbox.md) — Coordination inbox per page.
- [`doc/select.md`](./doc/select.md) — Element selection and AI context chips.
- [`doc/rail-notes.md`](./doc/rail-notes.md) — comments pruned from `rail.js`: history, lessons and design reasons, verbatim.
- [`doc/ai-tab-notes.md`](./doc/ai-tab-notes.md) — comments pruned from `tabs/ai.js`, verbatim.

## More
- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)

## Also here (readme audit, 2026-10-13)
- [walkthrough](./walkthrough/)
