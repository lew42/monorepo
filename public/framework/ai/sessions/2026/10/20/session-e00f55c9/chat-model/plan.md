# Plan: the chat data model, next phase

The brief: [requirements.md](requirements.md). The owner's words: [../night-2026-11-01/requirements.md](../night-2026-11-01/requirements.md), points 1–4, 8, 9.

## What exists (checked 2026-11-01)

- **`session.messages`** (`core/Session/Chat/`: `Chat extends List`, `Message`, `Prompt`, `Reply`, `Sentence`), written by `Servex/agents/ChatWriter.js` beside V1's `{chat}` lines. Test: `node Servex/agents/chat-messages.test.mjs`.
- **`Ref`** (`core/Item/Ref.js`, `RefView.js`, `Ref.test.mjs`, doc `core/Item/doc/ref.md`): resolves by `{url, path}`, follows `moved_to` forwards, backlinks within a file, re-paths on a move. Used today only in memory by `SessionTasks`. **F7 is not built:** adding an item that already has a parent still re-parents it (`List.adopt`, `Item.adopt_slot`).
- **List view:** `List.render()` draws through `List.View` (`ux/Content/Object/DefaultView.js`). `ext/Chat/list/ChatList.js` is the 60-line demo view over `session.messages`.
- **Phase 0** of the Item plan = fixes 1–5 of [persistence-sync/design/fixes.md](/framework/research/2026/10/29/persistence-sync/design/fixes.md); [core/doc/status.md](/framework/core/doc/status.md) says "not done as a set". Fix 2 (client id) may already be covered by Phase 1's `{client, n}`.
- **Tests:** `core/Test/TestRunner.mjs` runs `*.test.mjs`, passing `SITE_URL` (this checkout's dev server) to browser tests.
- **Completion:** `Task.completion` (`core/Task/Task.js:314`); `Session` is a Task, so it inherits one. Not shown on the session page.
- **Migration:** `Server/ChatToMessages.mjs` (dry run by default) already writes `session.messages` for old sessions. Step 8 adds only the side-by-side check.

## Decisions (each with its alternative)

1. **One generic Ref in the chat**, not a `RefMessage` class. A Ref in `session.messages` carries `by` and `at` as data. Alt: `class Ref extends Message` (synthesis §2); wins if a Ref ever needs Message behaviour (render with a speaker). Law 6 picks one class.
2. **F7: `List.add(item)` of an item that already has a parent in another list adds a `Ref` to it**, same file → `{path}`, other file → `{url, path}`. `move_to(dest)` stays the only move. Alt: throw (safer, but breaks every caller that adds an owned item); silent re-parent (today; loses the item from where it lived). Every existing caller that relies on add-moves is found by a census first and switched to `move_to`.
3. **Step 3 writes Refs for every session record**, not only voice sessions: when a task or child session is created at a session's root, Servex appends `{"messages":{"add":{"type":"Ref","path"|"url",…,"by":"servex","at":…}}}` right after the line that created it. Alt: voice sessions only (fewer lines; but then an agent session's chat has no children). Nested subtasks get no Ref.
4. **Prompt upgrade lives on `Prompt`**, no new Card class: a Prompt gains `kind` (`"task"|"request"|"question"`; absent = a plain prompt) and `items: List` (sub-items, each `{title, sentences:[ids]}`, or a Ref). A Prompt with a `kind` is drawn as a card: title → items → raw text. Alt: `class Card extends Prompt` (synthesis has a Card); wins when an agent-made card with no owner sentences needs its own fields (image, rows).
5. **The raw prompt is rebuilt, never stored:** `Prompt.raw` joins its sentences' `text` in order, by the same rule Whisper's chunks were joined (one space, no trimming of the sentence's own text). Checked against V1's `{chat}` owner lines of real `v-u48msei`.
6. **Session completion = Task's own rule over the session's root tasks**, shown in the session page's stats bar. Alt: count child sessions' tasks too (the brief says "from its open tasks"; a child session's own completion is its own number).

## Steps (one merge each, in order)

Worktree `task/chat-model`. One Sonnet builder works the steps in sequence (same files, warm context); after each it commits, runs `node Server/review.mjs <task dir> <worktree>`, answers findings; I read the diff and merge. Each step is a child task on [session.jsonl](session.jsonl).

1. **Phase 0, fixes 1–5:** for each, prove done (a test that fails on the old code) or build it (failing test first). Every test runs under `TestRunner.mjs`; a test that never runs is a finding, logged.
2. **F7 + Ref as a chat member:** census of `add`-moves; `List.add` makes a Ref; `Message.hydrate` builds `Ref` in `messages`; a test.
3. **Tasks and child sessions as Refs in `session.messages`**, written by Servex; a replay test.
4. **List view hooks:** `List.View` updates on add, remove, move, order (keyed by id, no full redraw); `ChatList` becomes "render the list".
5. **`Sentence.at` always written; `Prompt.raw`**; a test on real `v-u48msei` lines.
6. **Prompt `kind` + `items`**, item-tool operations, a test.
7. **Session completion** computed and on the session page; a test.
8. **V1 side-by-side check** (`Server/ChatV1Compare.mjs`, read-only) plus the switch-over plan in `core/Session/Chat/doc/pseudo-properties.md`. No migration run, no V1 change.

## Fences

Never edit `ext/Chat/v3/`, `ext/Chat/v2/`, `ux/Dictate/` or V1's renderers (`ext/Chat/Chat.js`, `ux/Dictate/chat.js`). `ext/Chat/list/` is ours.
