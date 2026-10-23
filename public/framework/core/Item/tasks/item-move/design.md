# Moving an item to a new home

**The goal.** A task can live in three places: as lines inside its parent's log, in its own file, or in its own folder. A move takes it from one home to another. Afterwards it has the **same id** and its **whole history**, and the old home holds **one reference line** that points to the new one. The first move needed is a subtask written into a parent `session.jsonl` moving into a child session's folder, `<parent session>/<agent id>/` (handoff-by-task, built by mastermind-system-architect on top of this).

## What exists (2026-10-22)

| Mover | Where | Keeps id | Keeps history | Leaves a reference |
|---|---|---|---|---|
| `{"folder":"<id>"}` | `Servex/agents/page_tools.js` `give_folder` | yes | no, a snapshot | `{"file":"<id>/task.jsonl"}` |
| `move_nested_home` (an approved proposal goes to its module) | `page_tools.js` | yes | no, a snapshot | `{"task":url,"moved_from":…}` |
| `move_home` (a whole folder goes to its module, `git mv`) | `page_tools.js` | yes | yes (the file moves) | `{"task":url,"moved_from":…}` + ledger |
| `move_project` / `dated_move` (folders between dated stores) | `Server/DatedFiles.mjs` | yes | yes (`git mv`) | index row + manifest |
| A later `{"task":url}` line with the same id | `Task.replay_line` | yes | yes | it *is* the reference |

Every physical move records one line in `ai/sessions/task-moves.jsonl` (`Server/TaskMove.mjs`). `TaskDirs.follow()` uses that ledger to send an old path to the new one.

## The gaps this fixes

1. **History.** The two movers that pull a task out of a parent's log write only a snapshot of its current data. The task's own lines (`start`, `complete`, notes) stay behind in the parent.
2. **Id.** A reference's id is its folder's name (`Task.ref_id`). A child session's folder is named after its agent, so the moved task would come back under a different id. The parent would then show the task twice.
3. **Any folder.** `move_nested_home` can only move a task to its module's home. Handoff needs a folder the caller names.
4. **One call.** The item tool has no `move` key.

## The design

**One function, `move_item({ from, id, to, by })`**, in `Servex/agents/page_tools.js`. `from` is the parent's url, `id` is the subtask, and `to` is the destination folder's url.

1. Replay the parent. Find the child by `id`. Refuse if it has no such child, or the child already lives in its own file.
2. **Collect its history.** Take every line in the parent's log that addresses the child, in order:
   - `{"tasks":{"add":{…id…}}}` becomes the new file's first line: `{id, path: to, parent: from, set: {fields}, moved_from}`.
   - `{"tasks":{"<id>":X}}` and `{"<id>":X}` become `X`.
   - Each keeps its original `by` and `ts`.
3. **Check before writing.** Replay those lines in memory and compare the result with the live child. Compare the state and the data, ignoring `path`, `parent` and `moved_from`. If anything differs, append one `{"set":{…}}` line with the snapshot, so the moved task is never wrong.
4. **Write the new home.** The file is the one `SessionRecord.start_file(dir, first)` picks; that function stays the one place that names a log file. If the folder already has a log (for example `open_task` wrote its assign line first), the history is appended after it. The move also makes `page.js` if the folder has none. Both orders work.
5. **Write the old home.** One line: `{"task": to, "as": id, "moved_from": "<from>#<id>", by, ts}`. `as` is the id the task had here. `Task.from_ref` and `Session.replay_line` use it instead of the folder name, so the reference replaces the embedded child, which keeps the same id. (The key is `as`, not `id`: an `id` key on a parent line already means "this is the task's own line 1" in `Task.replay_line`.)
6. **Write the ledger.** One line in `task-moves.jsonl`: `{at, kind: "task", from: "<file>#<id>", to: "<dir>", session, by}`.

**Two callers, one function:**
- **Node:** `open_task` (`Servex/agents/Agents.js`) calls `move_item` when `spawn_agent` is given `task: {from, id}`.
- **The item tool:** the key `{"<id>":{"move":{"to":"<url>"}}}` (or the same under `tasks`) is a thin wrapper over the same function.

`move_nested_home` becomes `move_item` aimed at the module home, plus its module-list line. So there is still one mover for "out of a parent's log".

## Not in this slice

- **Verbs sent to a moved child.** After a move, a verb sent to the task through the old parent (`{"<id>":{"start":{}}}`) is written to the parent's log, not the task's own file. The live view looks right, but the history splits. The fix is that the item tool writes it to the child's own file instead. Logged as the next subtask.
- **Moving back** (folder → lines in the parent) and **cloud homes**: not needed yet.
