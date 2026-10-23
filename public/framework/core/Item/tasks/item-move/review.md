verdict: fix
1. [fix] The handoff call fails. If `spawn_agent` gets `task: {from, id}` with no `dir`, the default task is skipped (Servex/agents/Agents.js:201 only fills it in when `task` is undefined), so `open_task` hits `path.isAbsolute(undefined)` (Agents.js:927) and throws before `move_item` runs. The design names the destination as `<parent session>/<agent id>/`, so `open_task` should merge `{from, id}` into `default_task(spec, id)` when `dir` is missing. Add a test for this; nothing tests the open_task path today.
2. [fix] The ledger and the old-home reference do not name the spawner. At Agents.js:944, `by` is `task.by ?? "spawn"`, but the brief asks for `by: <spawner>`. `spec.parent` is available where `open_task` is called (Agents.js:202), so pass it through.
3. [note] `open_task` starts `move_item` and does not wait for it (Agents.js:944). The new agent can start before its history is written, and if the move is refused, only the console hears about it. Awaiting it, or writing the refusal into the new task's log, would make a failed handoff visible.
4. [note] The `spawn_agent` tool description (Servex/agents/tools.js:345) does not mention `task: {from, id}`, so no agent can find out that handoff-by-task exists.
5. [note] In the browser, `Task.open_ref` always opens `<ref>/task.jsonl` (public/framework/core/Task/Task.js:345). A move into a session folder that already has a log appends to `session.jsonl` (the test at item_tool.test.mjs, "agent-c"). Check that the dev server serves `session.jsonl` when `task.jsonl` is asked for; otherwise the moved child shows "missing" in the browser while node shows it correctly. Brief item 2's "open_ref keeps the id" has no test, though nothing in open_ref changes the id.
6. [note] `move_item` writes the new file before the parent's reference line (Servex/agents/page_tools.js:600–604). If the second write fails, the task exists in both places. That is acceptable for now, but it is worth one comment in the code.
7. [note] What works: the tests pass when run in the worktree (item_tool 71, Task 54/54, Session 7/7, Item 15, prompt-tasks 21). History moves in order with the original `ts`, there is one `as` reference, refusals write nothing, and `move_nested_home` is now a thin wrapper, so there is still one mover. The item-tool key, the snapshot check and the Session replace all match the design.

## Requirements
- 1 "move_item … steps 1–6 of the design exactly" — yes — page_tools.js:563–608; tests "new file: x's lines in order", "original ts kept", "one ledger line", refusals write nothing
- 2 "`as` on a reference" (from_ref, Task.replay_line, Session.replay_line, open_ref) — yes, with one gap — Task.js:316/385, Session.js:57; open_ref is unchanged and untested (note 5)
- 3 "move_nested_home becomes move_item aimed at the module home" — yes — page_tools.js:546; prompt-tasks.test.mjs 21 passing
- 4 "The item tool key … returns {ok, moved, state} or {ok:false, why}" — yes — page_tools.js:770–779; test "moved through the tool key"
- 5 "open_task … when the spawn's task carries {from, id}, call move_item" — no — it crashes without `dir`, and `by` is not the spawner (fixes 1, 2)
- Prove it: all four listed test files plus prompt-tasks pass; the open_task path has no test
## Words
- Comments are plain and point to design.md — yes — page_tools.js:559–563
