# Tasks — what is in flight, queued and landed, live

See it: **[/framework/ai/tasks/](/framework/ai/tasks/)**. It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with the **Live**, **Recent: Today** and **Kind: task** chips on (`?live&recent=today&kind=task`: in flight, plus landed today; `?landed=yesterday|week` becomes `recent=`). [/tasks/](/tasks/) is the same Inbox with `?kind=task&home` (every task a module keeps in its own `tasks/` folder). What stays here is what the Inbox has no view for: **[Lanes](/framework/ai/tasks/lanes/)** (in flight, queued and landed today as three columns) and **[Architecture](/framework/ai/tasks/architecture/)**.

- **Where the numbers come from:** `Server/TaskState.mjs` reads Servex's agent registry and every `task.jsonl`, and appends one line to `state.jsonl` when the picture changes. The page tails that file; nothing is counted by hand or by timer in the browser.
- **Run it:** `node Server/TaskState.mjs --watch` (Servex's `TaskLoop.js` runs it; run it by hand only without Servex); `--print` shows one snapshot.
- **One reader:** the Inbox and Lanes both read `ai/state.json` through `rail/DashState.js`; `DashChips.SAVED` holds the saved filters. Doc: [../doc/one-dashboard.md](../doc/one-dashboard.md).

## Watch out

- Until 10-17 the landed group walked only today's and yesterday's date folders and read only `assign.landed_at`: a task landed today in a session started days ago, or ended with a `finish` line, was invisible (0 of 27 showed). It now walks the whole sessions store, inside the window, and counts finish/complete lines; and since the one state (`ai/doc/one-state.md`) it also reads every module `tasks/` home.

- `state.jsonl` is machine state (gitignored): `DashState` tails it as its pulse and refetches `state.json` on each line, so `TaskState.mjs --watch` must keep writing it (at least one line a minute).
- The registry has no push, so `--watch` re-checks it every 5 seconds and writes only on a change.

## Known problems (2026-10-19, checked at 1200 wide)

- **The page is hard to read, yes.** It is the Inbox with `Live`, `Recent: Today` and `task` chips on at once, so it opens as a flat list of 17 rows with no headings, a status line like "TASK running starting", some titles that are a pasted prompt, and a detail pane showing the Worktree pool and Processes instead of a task. The chip names (Live, New, Recent, Older) are not defined anywhere on the page. **The one fix:** group the rows under headings by state (Running, Waiting for you, Landed today), put the module on each row, and show a task's title, not its prompt. Not built.
- **Verified working 2026-10-19:** `state.json` fresh (rewritten within minutes), `check.ok` true, 2,124 tasks = 2,124 bucket sum, landed today 15 by both counts, and the Inbox chips show the same 2,124 and 15.
- **Not linked:** an agent's own task gets no pointer to its module, so a fresh session in a module finds its past tasks only through [/tasks/](/tasks/). Plan and tooling: [../doc/tasks.md](../doc/tasks.md).

## More

- [../doc/tasks.md](../doc/tasks.md): what a task is, the two homes, who makes one, what to open.

- [doc/architecture.md](doc/architecture.md): the classes and how they connect.
- [doc/week-2026-10-17.md](doc/week-2026-10-17.md): the week of 10-11 to 10-17, prioritized by hand (the list itself is computed; this is the judgment).
- [ai/doc/one-state.md](../doc/one-state.md): the one state of everything, why 10-17 showed 0 of 27 landed, and the plan.
- **Known problem, asked 7 times:** the dashboard layout this list lives in: [../doc/dashboard-layout-asks.md](../doc/dashboard-layout-asks.md).
