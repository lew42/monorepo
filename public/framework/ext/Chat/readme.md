# Chat — a scrolling chat log, composer, and conversation widget

Follows new messages while scrolled to bottom, formats Markdown bubbles with avatar icons, and supports threading and reactions.

`Chat.js` is a function bag used by the voice chat (`ux/Dictate/Widget.js`), the sheet's `ChatView`, a card's chat (`ai/cards/CardChat.js`) and the session page's Claude-transcript chat (`ai/AISession/AISessionConversation.js`). The three versions (v1 default, [v2](./v2/readme.md), [v3](./v3/readme.md)), who reads which line shape, and the proposal to make Chat one class: [ai/system-map.md](/framework/ai/system-map.md) · [ai/system-proposal.md](/framework/ai/system-proposal.md).

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
- **Nothing on screen moves for a later arrival** (V1, the owner, 2026-11-01): a reply that lands below the owner's open bubble closes it (`Chat.js` `answered_below()`, read by `mergeable()`), so the owner's next words start a new bubble below the reply; the reply never ends up above a line it arrived after. v2 (`v2/ChatV2.js` `patch()`) still re-anchors its open bubble · [`doc/notes.md#bubble-order`](./doc/notes.md#bubble-order). **A closed Prompt is never merged into**: once a different, later Prompt starts, the earlier bubble stays exactly where it is — V1's `mergeable()` checks `dataset.prompt` (passed as `speak()`'s `prompt` option) and `last.isConnected`, the same rule v2's `patch()` gets from `last_prompt()`.
- **Two moving cursors on a live owner line** (2026-10-25): one ✓ after the newest FAST chunk (comma / period / question mark / !), one 🧠 after the newest finished SENTENCE (period / question / ! only) — gray until that seat has the line, colored once it does. There is never more than one of each on screen: V1 moves its pair onto whichever TRACKED piece is newest in the bubble (`Chat.js`'s `place_live_cursors()`), the same "newest only" rule v2's `place_cursors()` uses for the newest Prompt. The 🧠 is left out entirely while no sentence has finished yet, rather than drawn in front of the words. V1 and v2 share ONE maker and ONE CSS class set — `ext/Chat/cursors.js` (`cursor_el()`/`smart_cursor_el()`), `cursors.css` (`.chat-cursor`/`.chat-smart-cursor`) — never two copies. `chunks.js` is the shared splitter (`fast_chunks()`, `last_finished_sentence_end()`); the green Understand check is removed from V1 for now (the yellow `?` stays) — [`ux/Understand/readme.md`](/framework/ux/Understand/readme.md). Mock test: `chunks.test.mjs`; live proof: `ux/Dictate/test/chat-sent.mjs`.
- **Reactions & threads**: Emoji tap-backs and nested inline thread replies · [`doc/reactions.md`](./doc/reactions.md).
- **A Question card moves to the end when it is answered** (2026-10-25, round 2 of the review): the card's on-screen position, a plain move with no transition, ordered by WHEN it was answered (`answer.at`), not when it was asked. V1 is already one flat list, so "the end" is simply `ux/Dictate/Widget.js`'s `show_task` dropping the row where it was just built (the end of `$bubbles`) instead of moving it back, when `chat.js`'s `draw_task` says `moved`. v2 is nested (replies/questions/tasks under their Prompt), so an answered Question SURFACES at the ROOT of the whole chat, not just the end of its own prompt's nest — live (`v2/ChatV2.js`'s `surface_answered()`, called from `apply_one()`) and a cold reload (`ChatV2Model`'s `roots()`/`children()`) place it identically, carrying `data-from` as the one hint back to its prompt (no new label system). Both views read the one shared signal, `v2/ChatV2Model.js`'s `newly_answered(model, line)` (a Question with no answer before this line — never a Task, never a repeat edit). One static switch, `ChatV2Model.RESURFACE`, turns all of this off (the old, never-moved behaviour) for every reader at once. **The data never reorders**: a card's true position in time is always `created_at` (when asked) and `answer.at` (when answered) — a log view reading that real order does not exist yet; this is only where the live card sits on screen. Node test (no browser, incl. live-vs-reload parity): `v2/resurface.test.mjs`.

## Files that matter

- `Chat.js` / `Chat.css`: The message log, bubbles, and auto-scroll engine.
- `chunks.js`: pure text splitters for the two moving cursors — `fast_chunks()` (comma/period/question/!, not yet called from production — the ✓ cursor sits at the end of the piece's own text, which is always the newest fast chunk by definition), `last_finished_sentence_end()` (sentence boundary only, walks the split sentences forward so a repeated final sentence lands on the real last one); `chunks.test.mjs` is the mock test.
- `cursors.js` / `cursors.css`: the ONE ✓/🧠 element maker and class set, shared by `Chat.js` (V1) and `v2/ChatV2.js`.
- `Mic.js`: the composer's microphone (speech → sentences → sends). Gear settings `send_on_period`, `send_on_question`, `send_on_comma` (default: the first two on, comma off) pick which marks `cut_re()` cuts a send at — detail in [`doc/mic-notes.md`](./doc/mic-notes.md).
- `ChatPanel.js`: Combined view wrapping log, composer, and drill-in shell.
- `Composer.js`: Text buffer, input autosizing, and audio controls.
- `Mic.js` / `strip.js`: the composer's mic (`ComposerMic`) and its pure already-sent word-dedup (`strip_words`, `strip_sent`), node-testable in `strip.test.mjs` with no browser.
- `Drill.js`: Deep-dive modal shell for inspecting sub-cards.
- [`list/`](./list/readme.md): the simplest live view of a session's real chat list, `session.messages` ([core/Session/Chat](/framework/core/Session/Chat/readme.md)): one bubble per message, in the list's order, drawn from the list's lines alone; demo at `/framework/ext/Chat/list/`.
- [`v2/`](./v2/readme.md): Chat v2, a session's chat drawn from its `tasks` list (prompts at the root, replies and cards nested under them), written by Servex as the owner speaks; shown as V2 in the version dropdown of the ✦ sheet and the drawer, and a chip on the session page's Chat tab, live demo at `/framework/ext/Chat/v2/`.
- **Links in a chat bubble** (`md.js` `site_path()`): a link to this site, under any of its hosts, becomes a site path with no new tab, so `core/Router` opens it in place and dictation keeps running; the gateway key is dropped; other sites open in a new tab.
- [`v3/`](./v3/readme.md): Chat v3: a card per Prompt from `session.messages` ([core/Session/Chat](/framework/core/Session/Chat/readme.md)), with the Replies that answer it (found by `re.to`) inside it, the reply being written, pause-based paragraphs, and the unsent words in gray; V3 in the version dropdown; demo at `/framework/ext/Chat/v3/`. The one chat view ([views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md) step 1 of 6; step 2 makes v2 its subclass).
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
- [Design decisions 2026-10-27](/framework/ai/design-decisions-2026-10-27.md) — the chat is ONE stored list ("the spine"), Servex appends the chat entry in the same write as the sentence; reverses the Option A recommendation.

## Next

- ⬜ `v3/ChatV3.test.mjs` dropped the old `main_tree`/`served` check: its live checks pass only when `base` serves the same tree that wrote the live fixture copy (the worktree's own server, or the main tree after merge), not `monorepo.localhost` from a worktree. Say this in `v3/readme.md`'s Test line, or bring the check back.
- ⬜ Every v3 card's muted first-words title repeats the first line of its body right under it (kept as the owner's earlier choice); worth a second look at [views-on-messages.md](/framework/core/Session/Chat/doc/views-on-messages.md) step 4 (one view).
- ⬜ `ChatV3` is a changed class with no page showing its live instances or their state (`dirty`, `partial`, `limit`); the demo page shows only its output.
