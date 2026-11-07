# Plan: honest score + no silent endings

## 1. Honest score (core/Task)
Now: `Task.js:324 completion_score()` returns 0 or 1 for a session with nothing to score; `tally()` (Task.js:347) has no unscored count; `Prompt.js:~121` has its own mean.
Change:
- `completion_score()` returns `null` when `is_session` and there are no score parts, no steps, no numeric `completion`, and the owner has not checked it off. A plain leaf task keeps 1 or 0.
- A parent's mean skips null parts; all parts null makes the parent null (a `Prompt` mean the same).
- `tally()` gains `unscored` (child sessions that score null).
- Callers that do arithmetic or formatting on `completion` get a null guard: Server/session-query.mjs:79, DatedFiles.mjs, PromptTrace.mjs, TaskMigrate.mjs, core/Task/TaskView.js, ai/AITask/AITask.js, core/Session/InFlight*.js, ai/AISession/SessionStats.js, core/Task/page.js, Servex/agents/page_tools.js (about 7 places), and the dashboard and session page. They print "needs review".
- Alternative rejected: counting it as 0 (it punishes a missing record like undone work).
Test: core/Task/completion.test.mjs (null cases, mean, tally.unscored); old 0/1 assertions reviewed.
Proof: shots of /framework/ai/ and one no-task session page at 400 and 1200, before and after.

## 2. No silent endings
Rule lives in the Task class: `Task#closeout_line()` (pure) returns the ONE line that files a waiting task (`id: open-items`, `waiting_on: owner`, `waiting_what` listing each open item's id and title) when the node's score is under 1 or null, or null when there is nothing to file or an open one already exists. That task is left out of the score, of `reopened()` and of the "complete refuses with an open child" check, so it never reopens or blocks the record it was filed on.
Node side: `Servex/OpenItems.js` `after_write(file, line, append)`: for a closing line only (stop, complete, finish, unclosed, closed_by, landed_at), replay the file without and with the line, and for each node that became settled, append its `closeout_line()` at its path.
Chokepoints that call it: `page_tools.js write_line` (the item tool, record_lines, append.mjs, the log tool, StaleClose, Unclose, PromptRecords, CloseLoop's complete) and `TaskLoop.write_line` (close_task, Dropped, chase lines). ProcessRunner is checked and wired if it writes on its own.
`list_waiting` (Servex/cards/Cards.js) reads cards only; it is extended to list owner-waiting tasks from the task index too (the brief's test needs it; law 5 already says it does).
Test: Servex/OpenItems.test.mjs: close a session with one open and one done task gives exactly one waiting task listed; a 100% close gives none; the same close replayed or written twice gives one.
