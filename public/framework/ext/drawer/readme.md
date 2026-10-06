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
- `rail.js` / `rail.css`: Phone bottom rail and voice sheet.
- `page.js`: Live interactive demo.

## Doc topics

- [`doc/decisions.md`](./doc/decisions.md) — Sizing tokens, push math, z-index, and traps.
- [`doc/tabs.md`](./doc/tabs.md) — Tab model, routing, and session header.
- [`doc/sheet.md`](./doc/sheet.md) — Mobile sheet resizing, gestures, and state.
- [`doc/inbox.md`](./doc/inbox.md) — Coordination inbox per page.
- [`doc/select.md`](./doc/select.md) — Element selection and AI context chips.
