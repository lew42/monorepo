# Chat — a scrolling chat log, composer, and conversation widget

Follows new messages while scrolled to bottom, formats Markdown bubbles with avatar icons, and supports threading and reactions.

## Use

```js
import { chat } from "/framework/ext/Chat/Chat.js";
import { ChatPanel } from "/framework/ext/Chat/ChatPanel.js";

// Standalone message log
const talk = chat({ source: () => entries, keep: e => true });

// Complete unified panel with composer and mic
const panel = new ChatPanel({ source: () => entries, deliver: post });
```

## Core concepts

- **Unified composer**: Full-width buffer on top with single control row below (mic, Send, gear menu) · [`doc/decisions.md`](./doc/decisions.md).
- **Drill-in**: Clicking a card or topic drills into its sub-conversation shell · [`doc/drill.md`](./doc/drill.md).
- **Smart scrolling**: Tracks bottom stickiness without jumping while inspecting history · [`doc/scroll.md`](./doc/scroll.md).
- **Reactions & threads**: Emoji tap-backs and nested inline thread replies · [`doc/reactions.md`](./doc/reactions.md).

## Files that matter

- `Chat.js` / `Chat.css`: The message log, bubbles, and auto-scroll engine.
- `ChatPanel.js`: Combined view wrapping log, composer, and drill-in shell.
- `Composer.js`: Text buffer, input autosizing, and audio controls.
- `Drill.js`: Deep-dive modal shell for inspecting sub-cards.
- [`v2/`](./v2/readme.md): Chat v2, a session's chat drawn from its `tasks` list (prompts at the root, replies and cards nested under them), written by Servex as the owner speaks; shown under a v2 chip in the session page's Chat tab and the ✦ sheet, live demo at `/framework/ext/Chat/v2/`.
- `roles.js`: Sender avatars and badges.

## Doc topics

- [`doc/decisions.md`](./doc/decisions.md) — Unified composer layout, settings menu, and selection contracts.
- [`doc/drill.md`](./doc/drill.md) — Sub-card drill-in mechanics and URL hash navigation.
- [`doc/scroll.md`](./doc/scroll.md) — Follow-bottom scroll logic and resize observers.
- [`doc/reactions.md`](./doc/reactions.md) — Emoji tap-backs and threaded replies.
- [`doc/floor.md`](./doc/floor.md) — Minimum height constraints and layout sizing.
- [`doc/duplicate-bubbles.md`](./doc/duplicate-bubbles.md) — why a dictated line showed 2-4 times in one bubble, the three fixes, and the proofs in `doc/proof/`.
- [`doc/panel-composition-2026-10-08.md`](./doc/panel-composition-2026-10-08.md) — the owner's idea: one Chat panel owning the whole window, dictation built into it (open design).
- [`doc/one-input-2026-10-12.md`](./doc/one-input-2026-10-12.md) — textarea vs single-line `<input>` decided; every mic ticks `/api/refine/live` (`Mic.js`'s `refine_tick`/`refine_final`); the Refine demo moved onto `composer()`.
- [`doc/notes.md`](./doc/notes.md) and [`doc/mic-notes.md`](./doc/mic-notes.md) — comments pruned from `Chat.js` and `Mic.js`, verbatim.

- Notes: [doc/ChatPanel-notes.md](doc/ChatPanel-notes.md) — history and lessons moved out of the code comments.

- Notes: [doc/Composer-notes.md](doc/Composer-notes.md) — history and lessons moved out of the code comments.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
