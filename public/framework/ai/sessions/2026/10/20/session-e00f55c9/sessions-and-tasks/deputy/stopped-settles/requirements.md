# Task: a dropped subtask no longer blocks its parent's completion

**What is wrong:** `Task.complete()` refused while any subtask was not `complete`, and a `stopped` subtask counted as open. But `Task.progress_of` already leaves stopped subtasks out ("17 dropped (not counted)"), so a task could read 4 of 4 done, completion 1, and still refuse to complete.

It bit on 2026-10-24. "This session's page opens and lists every task" had four subtasks complete. A fifth, "fold the 10/24 folders back", was stopped on purpose, with its reason. The parent could never complete.

**The change** (`core/Task/Task.js`, `complete()`):
- A `stopped` subtask is settled and does not block the parent; an open one still blocks.
- The readme rule says so.
- `core/Session/session-task.test.mjs` checks both cases.

**Alternative, and why not:** complete the dropped subtask instead. That would record work as done that was deliberately not done, and the completion check exists to stop exactly that. The parent's `caveats` is where a dropped piece is named.
