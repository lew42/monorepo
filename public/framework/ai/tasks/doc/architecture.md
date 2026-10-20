# Tasks — the class architecture

```
Server/TaskState.mjs   class TaskState          computes the picture, appends it to index.jsonl
ai/index.jsonl                              one line per change (machine state)
ai/tasks/TaskStateLog.js  class TaskStateLog extends JSONL    the browser's tail; .state = the last line
ai/tasks/SavedFilter.js   class SavedFilter extends Page       the list: forwards to the Inbox with DashChips.SAVED chips on (rail/DashChips.js)
ai/tasks/TaskLanes.js     class TaskLanes                     Lanes: today as three columns, read from ai/index.json through rail/DashState.js
ai/tasks/page.js                                              tabs + routes (a row id is the task's folder below sessions/, "/" as "~")
```

- **`TaskState`** is the only place that counts. In flight = registry state `working`; quiet minutes = now minus the newest of the registry's `last_at` and the task's last log line; queued = registry state `queued`; landed today = a `task.jsonl` under today's and yesterday's session folders (a session may start a day before its tasks land) with a `landed_at` after local midnight.
- **Reuse:** the list is the Inbox (`AIRail`, `DashState`, `DashChips`, `DashRow`); the detail pane is `AITask`; the stream is `JSONL`. Step 3 of [one-dashboard](../../doc/one-dashboard.md) deleted `TasksPage` (a second reader and row component).
- **Decision (2026-10-19):** redirect, not mount. Mounting `AIRail` under another url needs its detail pane to work with this page's routes; a redirect keeps one list and every old url still lands on the same rows. `TaskState --watch` keeps writing `index.jsonl`: `DashState` tails it as its pulse.
- **Decision:** the registry has no push, so `TaskState --watch` polls it (5 s) and the file is what streams to the browser. A Servex hook that calls `TaskState.write()` on each registry change would remove the poll.
- **Decision:** the second view is its own three-column board, not `AITask`'s `Lanes`: that one draws a task's subtask nesting, not today's state.
