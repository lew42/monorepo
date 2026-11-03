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
2. **F7, reworded 2026-11-02 (vscode-mastermind, CLAUDE.md "ask before" a core API's meaning changes, and the owner was asleep): today, `list.ref(item)` is the explicit way to link an item another list already owns** — same file → `{path}`, other file → `{url, path}` — built in `core/List/List.js`. **`list.add(item)`'s own default is UNCHANGED**, still a silent re-parent exactly as on `michael/dev` (today's gap 8: the item's `parent` moves, but the first list still lists it too). `move_to(dest)` stays the only real move. Switching `add()`'s own default to build a Ref automatically (the original F7) is a SEPARATE, later merge — only once the census below shows no caller relies on the move, and only with the owner's sign-off (a core API's meaning is "ask before", not a minion's call).

   **F7 evidence — census of every caller of `List.add` / `.adopt()` / `Item.adopt_slot` that could pass an already-parented item (`rg` over `public/framework` and `Servex`, 2026-11-02):**
   - Every `.add(x)` call found passes either a *freshly constructed* item (`new Task(...)`, `new Panel(...)`, `new Section()`, a plain literal) or is a `Set`/`Map`-style `.add()` on a plain collection (`this.seen.add(key)`, `this.listeners.add(fn)`, etc.) — not `List.add` at all. None adds an item that already belongs to another list.
   - `public/framework/ext/Draggable/page.js:61-63` (`todo.items.add(kid)`, `root.items.add(kid)`): builds the DEMO tree once, every `kid` fresh from `card()`/`node_item()`. The actual drag-between-columns path never calls `add()` — `Sortable.js:55` already uses `.move(this.item, {before, from})`. **Meant-ref/move: neither — not a live caller.**
   - `public/framework/ext/editor/page.js:202,332-333` (`into.items.add(made)`, `section.items.add(new Text())`, `doc.items.add(section)`): `made`/`section`/the `Text` are all `new Class()` right above the call. `cut()` (the only place an existing block leaves its parent) uses `item.remove()`, not `add`. **Not a live caller.**
   - `public/framework/ext/Panel/Panel.js:31` (`add(...kids){ kids.forEach(kid => this.items.add(kid)); }`) and every caller of `panel.add(...)` (`page.js:68,100,116`, `random.js:17`): every argument is `new Panel(...)` built inline. `Panel.split()` (`Panel.js:154-155`) adds the fresh mirror (`this.items.add(mine)`) but already uses `.move()` for the existing `made`. **Not a live caller.**
   - `public/framework/ext/Panel/flow.js:102` (`root.items.items = [...fresh.items].map(kid => root.items.adopt(kid))`): calls `List.adopt()` directly (bypassing `add()`/`insert()` entirely) to move a whole tree's members in one assignment. Untouched by either F7 wording (it never goes through `add()`). **Not affected either way.**
   - `public/framework/ext/Chat/Mic.js:198` defines its own, unrelated `adopt(box)` (a DOM textarea, not `List`/`Item`). **Not a List caller at all.**
   - `Item.adopt_slot` (`core/Item/Item.js:362`) is called only from `set_one()` during a line replay (always a fresh hydrate) and `Item.restore()`'s own walk — never from a caller handing it an item already parented elsewhere.

   **Conclusion: no caller anywhere in `public/framework` or `Servex` relies on `add()`'s move side-effect for an item it got from somewhere else.** Flipping `add()`'s default later looks safe on this evidence, but stays the owner's decision, not assumed from a grep.
3. **Step 3 writes Refs for every session record**, not only voice sessions: when a task or child session is created at a session's root, Servex appends `{"messages":{"add":{"type":"Ref","path"|"url",…,"by":"servex","at":…}}}` right after the line that created it. Alt: voice sessions only (fewer lines; but then an agent session's chat has no children). Nested subtasks get no Ref.
4. **Prompt upgrade lives on `Prompt`**, no new Card class: a Prompt gains `kind` (`"task"|"request"|"question"`; absent = a plain prompt) and `items: List` (sub-items, each `{title, sentences:[ids]}`, or a Ref). A Prompt with a `kind` is drawn as a card: title → items → raw text. Alt: `class Card extends Prompt` (synthesis has a Card); wins when an agent-made card with no owner sentences needs its own fields (image, rows).
5. **The raw prompt is rebuilt, never stored:** `Prompt.raw` joins its sentences' `text` in order, by the same rule Whisper's chunks were joined (one space, no trimming of the sentence's own text). Checked against V1's `{chat}` owner lines of real `v-u48msei`.
6. **Session completion = Task's own rule over the session's root tasks**, shown in the session page's stats bar. Alt: count child sessions' tasks too (the brief says "from its open tasks"; a child session's own completion is its own number).

## Steps (one merge each, in order)

Worktree `task/chat-model`. One Sonnet builder works the steps in sequence (same files, warm context); after each it commits, runs `node Server/review.mjs <task dir> <worktree>`, answers findings; I read the diff and merge. Each step is a child task on [session.jsonl](session.jsonl).

1. **Phase 0, fixes 1–5:** for each, prove done (a test that fails on the old code) or build it (failing test first). Every test runs under `TestRunner.mjs`; a test that never runs is a finding, logged.
2. **F7 + Ref as a chat member:** census of `add`-moves (in decision 2); explicit `list.ref(x)` makes a Ref, `add()` unchanged; `Chat.resurface`; `Message.hydrate` builds `Ref` in `messages`; a test.
3. **Tasks and child sessions as Refs in `session.messages`**, written by Servex; a replay test.
4. **List view hooks:** `List.View` updates on add, remove, move, order (keyed by id, no full redraw); `ChatList` becomes "render the list".
5. **`Sentence.at` always written; `Prompt.raw`**; a test on real `v-u48msei` lines.
6. **Prompt `kind` + `items`**, item-tool operations, a test.
7. **Session completion** computed and on the session page; a test.
8. **V1 side-by-side check** (`Server/ChatV1Compare.mjs`, read-only) plus the switch-over plan in `core/Session/Chat/doc/pseudo-properties.md`. No migration run, no V1 change.

## Fences

Never edit `ext/Chat/v3/`, `ext/Chat/v2/`, `ux/Dictate/` or V1's renderers (`ext/Chat/Chat.js`, `ux/Dictate/chat.js`). `ext/Chat/list/` is ours.
