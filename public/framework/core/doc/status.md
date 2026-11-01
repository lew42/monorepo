# The Item system: what's built, what isn't, what's next (2026-11-01)

**In one line:** the save-and-stream work from the persistence research is in the real classes on `michael/dev`, about half of the planned Phase 1 is done, and replaying all 3,931 session and task records with the new code gives the same states, titles and children as before.

**What the Item system is.** An `Item` is an object that saves itself: every change becomes one line appended to a `.jsonl` file, and reading the file back ("replay") rebuilds the object. `List`, `Page`, `Task` and `Session` are all built on it, so the AI session and task records under `ai/sessions/` are Items too. The research ([persistence & sync](/framework/research/2026/10/29/persistence-sync/)) asked whether to keep this or adopt a library; the answer was keep it and fix it. What was built and merged: [build.md](/framework/research/2026/10/29/persistence-sync/build.md). The API in short: [overview.md](overview.md).

## How far the plan got

The research planned six phases ([design/phase-1.md](/framework/research/2026/10/29/persistence-sync/design/phase-1.md), §16). The MVP was the owner's "build a simple Item MVP": most of Phase 1, one piece of Phase 2, and some things no phase listed.

| Phase | Status |
|---|---|
| **0. Stop silent losses** ([design/fixes.md](/framework/research/2026/10/29/persistence-sync/design/fixes.md) 1–5: a newline guard before appends, a client id in the twin key, readers kept through a server restart, crash-safe rewrites, the `add` envelope) | **Not done as a set.** Check each one before building more on the save path. |
| **1. Solid streaming, robust data, bindings** | **About half.** Done: every saved line is numbered per tab (`{client, n}`), acknowledged, resent after a reconnect and deduplicated; unsent lines survive a reload; a heartbeat; saving no longer breaks when a view throws; `act()` mutes only its own object; `set()` refuses values that can't be saved; the new line spelling is *read* everywhere, and an unknown `name()` or `#id` is refused with a warning; `view.bind` (views redraw themselves). Built but off: *writing* the new spelling (`Store.marked_lines`, below). Not built: recovery after a file is rewritten (`reset`/`epoch`, gap check), the `unset` verb, the `source` tag and `batch()` (one line per action), merging keystrokes while typing, `Room` + `FileJournal`. |
| **2. The cloud, and more than one person** | **One piece:** snapshots (`<file>.snapshot.json`, loaded as snapshot + the lines after it; made by hand with `Server/Snapshots.mjs`). Not built: presence and soft locks, a schema line, a Durable Object journal, a SQLite journal. |
| **3–5. Scale and history; throwaway streams; merging** | Not started. |
| **Built, in no phase** | The Replay Lab on the real classes; visual tests (`test(name, fn)`); `set_<key>` hooks; `as_call` (a method saved as one call); the Files tab (list, create, upload, rename, move with undo); deploy safety tests. |

**"Marked lines" in plain words.** A saved line can spell a key three ways: `title` is data, `start()` is a method call, `#c3` is the list item with id `c3`. The `()` and `#` marks make a line say exactly what it means. Every reader understands both the old bare spelling and the marked one; writers still use the bare spelling until the switch `Item.Store.marked_lines` is turned on (one line in `Store.js`; steps: [Item/doc/line-format.md](../Item/doc/line-format.md)). Nothing on disk has to change either way.

## Sessions and tasks: does the merge break them? (checked 2026-11-01)

The owner's worry: the session and task system is the biggest body of work, it barely works, and it rests on the old Item code. Checked four ways, old code (`9bc81edc4`, `michael/dev` just before the merge) against new (`michael/dev` after it):

- **Every record replayed with both versions:** `node Server/ReplayCompare.mjs <old checkout>` replays all 3,931 `session.jsonl` and `task.jsonl` files under `public/framework/` with both. **None throws. State, title and child count are identical for all 3,931.** The only difference: 1,038 tasks now carry a `ran_since` field (when a running task started its current run). It's empty on every finished, stopped, idle or waiting task, and set on 4 running ones; before, that time was lost on reload.
- **The tests:** the session, task and index tests (`core/Session`, `core/Task`, `ai/AISession`, `ai/AITask`, `Server/AIIndex`, `SessionRecord`, the item tool): 20 of 21 pass with the new code, 19 of 20 with the old; the one failure, `TasksPage.test.mjs`, fails on both (it needs the live site).
- **The task index** (`node Server/AIIndex.mjs --print`), which folds every task through `Task.replay`: its self-check passes with both versions (2,948 tasks before, 2,951 after: this session's own new tasks).
- **The pages, in a cloud copy:** the sessions list, a session page, a task page, `/framework/ai/`, and the Session and Task pages load with no script errors. They can't show real data there: the session indexes and the Claude transcripts exist only on the PC. (The old code showed blank pages in the cloud copy: its `ext/Markdown` import has the wrong capital letter, which this merge fixed.)

**So: no data migration is needed now.** Nothing on disk changed shape, and the new code reads every old line the same way. A migration would only be needed if the record format itself changes later; `ReplayCompare.mjs` is how to find out before merging.

**Not checked from the cloud:** the live UI with real data (the sessions page's lists and costs, a running task, voice sessions, Servex's live copy of a record). That has to be done on the PC.

## Next steps, in order

1. **On the PC:** pull `michael/dev`, restart Servex and the dev server, then open `/framework/ai/sessions/`, a recent session, a task page and `/framework/ai/`; start and stop a task and check its `.jsonl` gets the line. Anything wrong: compare with `9bc81edc4`.
2. **Phase 0:** the five small "stop silent losses" fixes ([design/fixes.md](/framework/research/2026/10/29/persistence-sync/design/fixes.md) 1–5), each with its failing test first.
3. **Turn on marked lines** after step 1 looks right (steps in [line-format.md](../Item/doc/line-format.md)).
4. **The rest of Phase 1:** `unset`; a warning for unknown bare keys; `source` + `batch()`; `reset`/`epoch` and the gap check; typing coalesce.
5. **The owner's open calls** (ten small decisions): end of the task record's `plan.md` (`ai/sessions/2026/10/31/session-e3fd9043/item-mvp/plan.md`, dev server only), summarized in [build.md](/framework/research/2026/10/29/persistence-sync/build.md#asked-for-or-planned-not-done-nothing-here-was-started).

**Where the classes live today:** `core/Item`, `core/List`, `core/Page`, `core/Task` and `core/Session` are still in `core/`. The AI-only parts are in `ai/AISession/` and `ai/AITask/`. The owner has asked whether Session and Task belong under `ai/` (they're mostly AI sessions and tasks) or should stay core with an AI layer on top; open, in [framework tasks](../../tasks/readme.md).
