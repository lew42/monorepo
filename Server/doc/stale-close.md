# StaleClose: a task nobody will resume gets a `stop` line, with a reason

`Server/StaleClose.mjs` reads the one state ([ai-index.md](ai-index.md)) and, for every task in the `stale` bucket (started, never landed, no working agent holds it) whose last log line is over 24 hours old, appends `{"stop":{"at","why","by":"StaleClose"}}` to its log. `Task.replay` then makes it `stopped`, so the follow-up ([follow-up.md](/framework/ai/doc/follow-up.md)) stops calling it "quiet".

```
node Server/StaleClose.mjs --plan     list them, count by age, append the plan to ai/stale-closes.jsonl
node Server/StaleClose.mjs --apply    append the stop lines (through .claude/hooks/append.mjs), then one `close` row each to the manifest
node Server/StaleClose.mjs --undo     append a `start` line to every log the manifest closed and nobody undid
```

## Rules

- **Skipped, never closed:** `waiting` tasks (a wait on the owner is its own bucket), anything silent for under 24 h (`StaleClose.HOURS`, the one constant), a folder whose **child task folders** wrote within 24 h or hold an agent at work or a wait on the owner (a VS Code tab often keeps its work in child folders, so its own log stays one line), a session whose **transcript** (`~/.claude/projects/<cwd>/<id>.jsonl`, the id from its log's line 1) was written within 24 h (the owner's own VS Code tab is never in the registry), a task whose log names an agent that is `working` or `queued` in the registry, and everything when Servex's registry is empty or down (then every running task would look abandoned).
- **Checked before writing:** the log plus the stop line is folded through `Task.replay`; if it would not end `stopped` the log is left alone and the manifest gets a `refused` row.
- **Append-only both ways:** no log line is rewritten and the manifest `public/framework/ai/stale-closes.jsonl` only grows (`plan`, `close`, `refused`, `undo` rows).
- **Undo is `start`, not `resume`:** the state machine allows `resume` only from `paused`; a stopped task restarts with `start` (`CAN.start` in `core/Task/Task.js`), which puts it back in `running`, so it is `stale` again.
- **A closed task keeps its branch.** A stop line says no agent is on it; it does not merge or delete anything. A closed task whose branch has unmerged commits is still findable by branch name in the follow-up's full table.

Test: `node Server/stale-close.test.mjs` (in a temp root, never the real store). A new task folder counts as its parent's task: [Session → task → child session](/framework/ai/sessions/doc/session-record.md). The child-folder and transcript rules come from a real miss on 2026-10-22: a live VS Code tab's session was closed because its own log had one line and all its work sat in a child folder.

## Runs daily

`Servex/TaskLoop.js` `follow_up_daily()` runs `--apply` just before `FollowUp.mjs --write`, and the session-links backfill beside it ([session-record.md](/framework/ai/sessions/doc/session-record.md)). It takes effect at the next Servex restart.
