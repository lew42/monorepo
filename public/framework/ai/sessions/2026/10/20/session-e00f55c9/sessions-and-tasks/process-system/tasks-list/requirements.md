Budget: $6

# /tasks/ lists tasks again

**Problem.** `/tasks/` (`public/tasks/page.jsonl`, class `/framework/ai/tasks/SavedFilter.js`, preset `all-tasks`) forwards to `/framework/ai/?kind=task&home` (`DashChips.saved`, `public/framework/ai/rail/DashChips.js`). Since 6feb47b6f the bare `/framework/ai/` draws the AIDashboard (sessions by origin), which ignores `kind`/`home`, so `/tasks/` shows no tasks. The old Inbox lives at `/framework/ai/inbox/`; a headless shot of `/framework/ai/inbox/?kind=task&home` came back blank, so check whether that rail honours the chips at all.

**Do (smallest working fix, in this order of preference):**
1. If the Inbox rail at `/framework/ai/inbox/` lists tasks with those chips, change `DashChips.saved` (or `DashChips.AI` as used there) to forward to `/framework/ai/inbox/`; check the other preset (`tasks`, `/framework/ai/tasks/`) still lands on a working list.
2. Otherwise drop the forward for `/tasks/` and draw `TasksPage` there (`/framework/core/Task/TasksPage.js`, already used on module `tasks/` paths; `public/tasks/page.jsonl` line 3 already names it). Keep the change in that file only; record the decision with its alternative in the task log.
Update `core/Task/TasksPage.test.mjs` (or whichever test checks `/tasks/`) to prove tasks are listed (count of task rows > 0), and the one-line note in `public/framework/ai/doc/one-dashboard.md` if the forward changes.

**Prove it:** `check_page` with a shot of `/tasks/` on your worktree's url at 1200 showing task rows; no console errors.

**Land:** work in a worktree (`take_worktree`), commit, then run `node Server/review.mjs <this task dir> <your worktree>` FROM THE WORKTREE, answer every finding, confirm `node Server/review.mjs --status <this task dir>`, then log `ready: <branch> <sha>` here and stop. Do not merge; vscode-mastermind merges.
