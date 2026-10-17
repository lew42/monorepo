# /tasks/ fills a wide screen, and the meter stays off the edge

Budget: $5. Sonnet. Load the `minion`, `code`, `layout` and `page` skills. The finding (this run's `../asks-to-tasks/task.jsonl`, 2026-10-17 00:19, from `layout-check` and `padding-check`): `/tasks/` is 99% empty at 2560 and 3440, and `span.task-meter-fill` sits at an edge at every width from 400 up. Read `core/Task/readme.md` ("TasksPage", "The row"), `core/Task/TasksPage.js`, `core/Task/TaskView.js` and `TaskView.css`, `ux/Browse/readme.md` (the list-and-detail view the AI pages use), CLAUDE.md "Presentation" (mobile to 3440; spacing doubles at 3440), and `code/performance` only if you touch rendering. Your log is this dir's `task.jsonl`.

## Deliverable

1. **Wide screens**: at 1920 and up `/tasks/` uses the width: either the rows flow into two or three columns by module (CSS columns or a grid on the module groups), or the page becomes a Browse view (modules on the left, the module's tasks on the right). Pick the one that keeps the row look identical and needs the least new code; say the alternative in a `decision` line. Check with `check_page` at 400, 1200, 1920, 3440 and `node Server/padding-check.mjs <url>` at the same widths: no text at an edge, empty share under 0.6 at 3440.
2. **The meter**: `span.task-meter-fill` is the filled part of the progress bar; it is at the edge because the bar's own box has no inset. Give the bar (not the fill) the inset so the fill can touch the bar's edges and the bar never touches the page's; one CSS change in `TaskView.css`.
3. `core/Task/readme.md` gets one line under "The row" or "TasksPage" saying how the page lays out wide. Worktree, `node --check`, `Server/smoke.mjs` clean, `merge.mjs` (name your review with `--no-review` if the gate cannot see this 2026-10-13 task dir), landing line checked with `tail -1`, shots in this dir never committed, `git status` clean for your paths. Never drive the owner's tabs; never restart servers.

Fence: `core/Task/TasksPage.js`, `core/Task/TaskView.css`, one readme line, this task dir. Not `TaskView.js` logic, not `ux/Browse`.
