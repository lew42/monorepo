# Tasks — what is in flight, queued and landed, live

See it: **[/framework/ai/tasks/](/framework/ai/tasks/)**. One list, three groups: **In flight** (a ⚠ when an agent has been quiet over 5 minutes), **Queued**, **Landed** (its landing line's first sentence; chips switch the window: Today, Yesterday, This week; the state carries seven days). Click a row and its task card opens beside the list.

- **Where the numbers come from:** `Server/TaskState.mjs` reads Servex's agent registry and every `task.jsonl`, and appends one line to `state.jsonl` when the picture changes. The page tails that file; nothing is counted by hand or by timer in the browser.
- **Run it:** `node Server/TaskState.mjs --watch` (nothing starts it yet: run it beside the dev server; a Servex hook is the next step); `--print` shows one snapshot.
- **Two views, same state:** the [List](/framework/ai/tasks/) (a `Browse`) and the [Lanes](/framework/ai/tasks/lanes/) (three columns side by side).
- **I recommend the List.** It keeps the detail beside you and reads in time order; Lanes is better only on a very wide screen, where all three groups fit at once.

## Watch out

- Until 10-17 the landed group walked only today's and yesterday's date folders and read only `assign.landed_at`: a task landed today in a session started days ago, or ended with a `finish` line, was invisible (0 of 27 showed). It now walks the whole sessions store, inside the window, and counts finish/complete lines; module `tasks/` homes are still not read here (`ai/doc/one-state.md`).

- `state.jsonl` is machine state (gitignored); if the last line is over 3 minutes old the page says it is not live instead of showing stale counts; the watcher writes at least one line a minute.
- The registry has no push, so `--watch` re-checks it every 5 seconds and writes only on a change.

## More

- [doc/architecture.md](doc/architecture.md): the classes and how they connect.
- [doc/week-2026-10-17.md](doc/week-2026-10-17.md): the week of 10-11 to 10-17, prioritized by hand (the list itself is computed; this is the judgment).
- [ai/doc/one-state.md](../doc/one-state.md): the one state of everything, why 10-17 showed 0 of 27 landed, and the plan.
