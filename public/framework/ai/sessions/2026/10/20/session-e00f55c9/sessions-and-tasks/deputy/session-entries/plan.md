# Plan: Session entries (items 31–33)

The deputy's design for [requirements.md](requirements.md). A builder may change a detail it finds wrong. It says which and why in its task log, and keeps the decisions below unless one fails a test.

## The picture

```
parent record (task.jsonl)
└── task "x"  (running)                  ← the cause
    └── Session entry  {"task": <child folder>, "type": "Session", "spawn": {role, model, effort, ...}}
        └── child's own record, replayed live (state, completion, cost)
```

## What exists (read these first)

- **Spawn:** `open_task` in `Servex/agents/Agents.js` writes the child's `{"assign": …}` line 1, then `SessionRecord.link_parent` (`Server/SessionRecord.mjs`) appends `{"task": "<child url>"}` to the parent's log. A handoff moves the subtask with `move_item` (`Servex/agents/page_tools.js`).
- **Replay:** `Task.replay_line` (`core/Task/Task.js`) turns `{"task": ref, "as": id}` into a child via `Task.from_ref`. A nested `{"<task id>": {…}}` routes into that task, so a reference can already nest under a cause.
- **Cost:** `session_state` (`page_tools.js`) adds own (`own_cost`) and children (`agents_under`, the registry). Keep `AICost.cost_line`'s shape: `{total, own, children}`.

## Decisions

1. **The entry is the existing reference line, with a type and the configuration:**
   `{"task": "<child url>", "as": "<agent id>", "type": "Session", "spawn": {"role", "model", "effort", "role_readme", "brief", "session_id", "agent", "at"}}`.
   - It is nested under its cause with the existing routing: `{"<cause id>": {<that line>}}`.
   - Rejected: inlining the configuration with no reference; the child's state and completion would go stale.
2. **The cause, in order:**
   - (a) an explicit `task.cause` (a task id on the parent's record) given to `spawn_agent`;
   - (b) a handoff's `task.id`: the subtask is upgraded in place, keeping its id, and becomes the Session entry pointing at the folder (not removed as `move_item` does today);
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
   - They go at top level: with 100+ open tasks at once, a guessed cause would often be wrong. New spawns nest exactly (rule 2).
   - Dry run by default, a manifest file, `--apply` left to the deputy.
7. **Item 33 is words plus one check.** The readme states the defaults, and the backfill's dry run reports any folder that is neither a session nor a project (a folder that should have been a line). Moving those is not in this task.

## Not in this task

- **Item 21, `Prompt extends Task`:** its own brief once this lands.
- **Re-nesting old entries under their causes:** left at top level, for the reason in decision 6.
