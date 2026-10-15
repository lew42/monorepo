# Tasks — what is in flight, queued and landed today, live

See it: **[/framework/ai/tasks/](/framework/ai/tasks/)**. One list, three groups: **In flight** (a ⚠ when an agent has been quiet over 5 minutes), **Queued**, **Landed today** (its landing line's first sentence). Click a row and its task card opens beside the list.

- **Where the numbers come from:** `Server/TaskState.mjs` reads Servex's agent registry and every `task.jsonl`, and appends one line to `state.jsonl` when the picture changes. The page tails that file; nothing is counted by hand or by timer in the browser.
- **Run it:** `node Server/TaskState.mjs --watch` (the dev server's side keeps it fresh); `--print` shows one snapshot.
- **Two views, same state:** the [List](/framework/ai/tasks/) (a `Browse`) and the [Lanes](/framework/ai/tasks/lanes/) (three columns side by side).
- **I recommend the List.** It keeps the detail beside you and reads in time order; Lanes is better only on a very wide screen, where all three groups fit at once.

## Watch out

- `state.jsonl` is machine state (gitignored); with no dev server running the page says so instead of showing stale counts.
- The registry has no push, so `--watch` re-checks it every 5 seconds and writes only on a change.

## More

- [doc/architecture.md](doc/architecture.md): the classes and how they connect.
