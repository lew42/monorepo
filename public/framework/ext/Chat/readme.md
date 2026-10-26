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
- **The open bubble stays last**: while the owner keeps dictating into the same still-growing bubble, anything else that arrives (a reply, a task) never splits it — the bubble re-anchors below the new item and stays one, in both V1 (`Chat.js` `mergeable()`/`speak()`) and v2 (`v2/ChatV2.js` `patch()`) · [`doc/notes.md#bubble-order`](./doc/notes.md#bubble-order). **A closed Prompt is never merged into**: once a different, later Prompt starts, the earlier bubble stays exactly where it is — V1's `mergeable()` checks `dataset.prompt` (passed as `speak()`'s `prompt` option) and `last.isConnected`, the same rule v2's `patch()` gets from `last_prompt()`.
- **Two moving cursors on a live owner line** (2026-10-25): one ✓ after the newest FAST chunk (comma / period / question mark / !), one 🧠 after the newest finished SENTENCE (period / question / ! only) — gray until that seat has the line, colored once it does. There is never more than one of each on screen: V1 moves its pair onto whichever TRACKED piece is newest in the bubble (`Chat.js`'s `place_live_cursors()`), the same "newest only" rule v2's `place_cursors()` uses for the newest Prompt. The 🧠 is left out entirely while no sentence has finished yet, rather than drawn in front of the words. V1 and v2 share ONE maker and ONE CSS class set — `ext/Chat/cursors.js` (`cursor_el()`/`smart_cursor_el()`), `cursors.css` (`.chat-cursor`/`.chat-smart-cursor`) — never two copies. `chunks.js` is the shared splitter (`fast_chunks()`, `last_finished_sentence_end()`); the green Understand check is removed from V1 for now (the yellow `?` stays) — [`ux/Understand/readme.md`](/framework/ux/Understand/readme.md). Mock test: `chunks.test.mjs`; live proof: `ux/Dictate/test/chat-sent.mjs`.
- **Reactions & threads**: Emoji tap-backs and nested inline thread replies · [`doc/reactions.md`](./doc/reactions.md).

## Files that matter

- `Chat.js` / `Chat.css`: The message log, bubbles, and auto-scroll engine.
- `chunks.js`: pure text splitters for the two moving cursors — `fast_chunks()` (comma/period/question/!, not yet called from production — the ✓ cursor sits at the end of the piece's own text, which is always the newest fast chunk by definition), `last_finished_sentence_end()` (sentence boundary only, walks the split sentences forward so a repeated final sentence lands on the real last one); `chunks.test.mjs` is the mock test.
- `cursors.js` / `cursors.css`: the ONE ✓/🧠 element maker and class set, shared by `Chat.js` (V1) and `v2/ChatV2.js`.
- `Mic.js`: the composer's microphone (speech → sentences → sends). Gear settings `send_on_period`, `send_on_question`, `send_on_comma` (default: the first two on, comma off) pick which marks `cut_re()` cuts a send at — detail in [`doc/mic-notes.md`](./doc/mic-notes.md).
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
