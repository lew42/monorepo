# Tasks — the class architecture

```
Server/TaskState.mjs   class TaskState          computes the picture, appends it to state.jsonl
ai/tasks/state.jsonl                              one line per change (machine state)
ai/tasks/TaskStateLog.js  class TaskStateLog extends JSONL    the browser's tail; .state = the last line
ai/tasks/TasksPage.js     class TasksPage extends Browse      List: the three groups; a row opens the task card in the detail pane
ai/tasks/TaskLanes.js     class TaskLanes                     Lanes: the same state as three columns
ai/tasks/page.js                                              tabs + routes (a row id is the task's folder below sessions/, "/" as "~")
```

- **`TaskState`** is the only place that counts. In flight = registry state `working`; quiet minutes = now minus the newest of the registry's `last_at` and the task's last log line; queued = registry state `queued`; landed today = a `task.jsonl` under today's session folders with a `landed_at` after local midnight.
- **Reuse:** the detail pane is `AITask`, the same card as everywhere; the shell is `Browse`; the stream is `JSONL`.
- **Decision:** the registry has no push, so `TaskState --watch` polls it (5 s) and the file is what streams to the browser. A Servex hook that calls `TaskState.write()` on each registry change would remove the poll.
- **Decision:** the second view is its own three-column board, not `AITask`'s `Lanes`: that one draws a task's subtask nesting, not today's state.
