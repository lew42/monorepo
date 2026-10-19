# Tasks — what is in flight, queued and landed, live

See it: **[/framework/ai/tasks/](/framework/ai/tasks/)**. It is no list of its own: it opens the Inbox ([/framework/ai/](/framework/ai/)) with the **Live**, **Recent: Today** and **Kind: task** chips on (`?live&recent=today&kind=task`: in flight, plus landed today; `?landed=yesterday|week` becomes `recent=`). [/tasks/](/tasks/) is the same Inbox with `?kind=task&home` (every task a module keeps in its own `tasks/` folder). What stays here is what the Inbox has no view for: **[Lanes](/framework/ai/tasks/lanes/)** (in flight, queued and landed today as three columns) and **[Architecture](/framework/ai/tasks/architecture/)**.

- **Where the numbers come from:** `Server/TaskState.mjs` reads Servex's agent registry and every `task.jsonl`, and appends one line to `state.jsonl` when the picture changes. The page tails that file; nothing is counted by hand or by timer in the browser.
- **Run it:** `node Server/TaskState.mjs --watch` (nothing starts it yet: run it beside the dev server; a Servex hook is the next step); `--print` shows one snapshot.
- **One reader:** the Inbox and Lanes both read `ai/state.json` through `rail/DashState.js`; `DashChips.SAVED` holds the saved filters. Doc: [../doc/one-dashboard.md](../doc/one-dashboard.md).

## Watch out

- Until 10-17 the landed group walked only today's and yesterday's date folders and read only `assign.landed_at`: a task landed today in a session started days ago, or ended with a `finish` line, was invisible (0 of 27 showed). It now walks the whole sessions store, inside the window, and counts finish/complete lines; module `tasks/` homes are still not read here (`ai/doc/one-state.md`).

- `state.jsonl` is machine state (gitignored): `DashState` tails it as its pulse and refetches `state.json` on each line, so `TaskState.mjs --watch` must keep writing it (at least one line a minute).
- The registry has no push, so `--watch` re-checks it every 5 seconds and writes only on a change.

## More

- [doc/architecture.md](doc/architecture.md): the classes and how they connect.
- [doc/week-2026-10-17.md](doc/week-2026-10-17.md): the week of 10-11 to 10-17, prioritized by hand (the list itself is computed; this is the judgment).
- [ai/doc/one-state.md](../doc/one-state.md): the one state of everything, why 10-17 showed 0 of 27 landed, and the plan.
