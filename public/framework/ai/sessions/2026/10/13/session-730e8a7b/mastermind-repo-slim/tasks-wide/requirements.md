# /tasks/ fills a wide screen, and the meter stays off the edge

Budget: $5. Sonnet. Load the `minion`, `code`, `layout` and `page` skills. The finding (this run's `../asks-to-tasks/task.jsonl`, 2026-10-17 00:19, from `layout-check` and `padding-check`): `/tasks/` is 99% empty at 2560 and 3440, and `span.task-meter-fill` sits at an edge at every width from 400 up. Read `core/Task/readme.md` ("TasksPage", "The row"), `core/Task/TasksPage.js`, `core/Task/TaskView.js` and `TaskView.css`, `ux/Browse/readme.md` (the list-and-detail view the AI pages use), CLAUDE.md "Presentation" (mobile to 3440; spacing doubles at 3440), and `code/performance` only if you touch rendering. Your log is this dir's `task.jsonl`.

## Deliverable

- [ ] **Wide screens.** At 1920 and up, `/tasks/` uses the width. Pick one: rows flow into 2–3 columns by module (CSS columns or grid), or the page becomes a Browse view (modules left, tasks right). Keep the row look identical with the least new code; name the other option in a `decision` line.
- [ ] **Checked at 400, 1200, 1920, 3440.** `check_page` passes; `node Server/padding-check.mjs <url>` shows no text at an edge and an empty share under 0.6 at 3440.
- [ ] **The meter.** `span.task-meter-fill` (the filled part of the bar) sits at the edge because the bar's own box has no inset. Give the bar, not the fill, the inset: one CSS change in `TaskView.css`.
- [ ] **Readme.** One line in `core/Task/readme.md` under "The row" or "TasksPage" saying how the page lays out wide.
- [ ] **Landing.** Worktree; `node --check`; `Server/smoke.mjs` clean; `merge.mjs` (`--no-review` if the gate cannot see this 2026-10-13 dir); `tail -1` the landing line; shots never committed; `git status` clean for your paths.

Never drive the owner's tabs; never restart servers.

Fence: `core/Task/TasksPage.js`, `core/Task/TaskView.css`, one readme line, this task dir. Not `TaskView.js` logic, not `ux/Browse`.
