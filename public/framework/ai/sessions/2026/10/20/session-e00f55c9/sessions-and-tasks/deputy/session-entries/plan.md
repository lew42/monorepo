# Plan: Session entries (items 31–33)

The deputy's design for [requirements.md](requirements.md). A builder may change a detail it finds wrong. It says which and why in its task log, and keeps the decisions below unless one fails a test.

## What exists (read these first)

- **Spawn:** `open_task` in `Servex/agents/Agents.js` writes the child's line 1, `{"assign": {session_id, agent, role, brief, title, model, worktree, parent_task, home, requested_at}}`, to `<dir>/session.jsonl` (a new session folder) or `task.jsonl`. It then calls `SessionRecord.link_parent` (`Server/SessionRecord.mjs`), which appends `{"task": "<child url>"}` to the parent's log (`parent_log`: the explicit `parent_task` folder's log first). A handoff (`task: {from, id}`) moves the subtask with `move_item` (`Servex/agents/page_tools.js`) instead.
- **Item 24 (merged 30bcff741):** children whose folder is outside the parent session get `{"task", "as"}` on the parent *session's* record (`ChildLinks`, spawn + backfill).
- **Replay:** `Task.replay_line` (`core/Task/Task.js`) turns `{"task": ref, "as": id}` into a child through `Task.from_ref(ref, as)`. That replays the child's own record and picks the class from line 1 (`class`, or `{session: …}` → Session). A nested line `{"<task id>": {…}}` is routed into that task's own `replay_line`, so `{"<task id>": {"task": ref, "as": id}}` already inserts a referenced child under that task.
- **Children and cost:** `Task.children` = child entries whose folder holds a session record (`session_resolver`). `session_state` (`page_tools.js`) computes cost as own (`own_cost(dir)`, the transcript) + children (`agents_under`: the Servex registry, by folder or `parent_session`).
- **The browser's one cost line:** `AICost.cost_line` (`ai/AITask/AICost.js`, merged with cost-line) draws own · with children from `summary.cost`. Keep that shape: `{total, own, children}`.

## Decisions

1. **The entry is the existing reference line, with a type and the configuration:**
   `{"task": "<child url>", "as": "<agent id>", "type": "Session", "spawn": {"role", "model", "effort", "role_readme", "brief", "session_id", "agent", "at"}}`.
   - It is nested under its cause with the existing routing: `{"<cause id>": {<that line>}}`.
   - *Alternative:* `tasks.add` with the configuration inlined and no reference. That loses the live replay of the child's own record, so its state and completion would go stale. Rejected.
2. **The cause, in order:**
   - (a) an explicit `task.cause` (a task id on the parent's record) given to `spawn_agent`;
   - (b) a handoff's `task.id`: the subtask is upgraded in place. Its entry stays where it was, with the same id, and becomes the Session entry pointing at the folder (`path`). Today's `move_item` copies it out; keep its history in the child's record, and leave the parent's line as the entry, not a removal;
   - (c) the parent record's most recently started task that is still running;
   - (d) top level.
   - Log which rule placed each entry (`by`).
3. **Class:** `from_ref` builds a `Session` when the entry says `type: "Session"`, whatever the child's line 1 is. `Session.replay_line` must then read an `{"assign": …}` line 1 as Task does (check `apply_line` against `Task.replay_line`, and test it on a real agent record).
4. **The child's own line 1 gains `effort` and `role_readme`.** Agents.js already knows them at spawn. Never retype a system prompt into the record: a role readme's path is enough, and a custom `prompt` is the brief.
5. **Children and cost come from the entries first.**
   - `children` = entries that are Sessions, recursively.
   - `cost.children` = the sum of each child Session's total. A child's own cost is its agent's registry cost (`Agents.log_cost`), and its total adds its own children.
   - An agent with no entry yet (not backfilled) still counts through `agents_under`, de-duplicated by agent id, so nothing counts twice.
   - The answer keeps `{total, own, children}`.
6. **Backfill: extend `Server/ChildLinks.mjs`; no new script.**
   - Every folder under the session's day folders that holds a record and has no entry gets one.
   - Every existing plain link line whose folder is an agent's gets a later line with the same id that adds `type` and `spawn` (a later reference with the same id replaces the earlier one in replay).
   - It places them at top level, not under a guessed cause: e00f55c9 has over 100 open tasks at once, so a guess by time would be wrong often. New spawns nest exactly (rule 2).
   - Dry run by default, a manifest file, `--apply` left to the deputy.
7. **Item 33 is words plus one check.** The readme states the defaults, and the backfill's dry run reports any folder that is neither a session nor a project (a folder that should have been a line). Moving those is not in this task.

## Not in this task

- **Item 21, `Prompt extends Task`** (prompts as entries, with asks nested under them): its own brief once this lands, because spawns and asks will then nest under the prompt that caused them.
- **Re-nesting old entries under their causes:** left at top level, for the reason in decision 6.
