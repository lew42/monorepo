# Item system: a UI action is a saved delta every listener gets

Estimate: $12. Opus, medium effort. You are the **item mastermind**: you own `core/Item` (and read `core/Page`, which is built on it). Parent: `vscode-mastermind`. Spawn Sonnet builders in worktrees; review their work yourself; merge when it is reviewed, checks out and is not dangerous (autonomous by default). Ask `mastermind-system-architect` about anything on the AI side.

## The owner (2026-10-22, tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

Agents already change items through the `item` tool, which writes a delta line to the item's JSONL. The browser does not: a button click (start, pause, stop, approve, check off) should save that change as a delta to the same JSONL, so everyone listening (the page, node's instance, subscribed agents) gets it at once. Today nothing in the UI does this reliably.

## Read first

`core/Item/readme.md`, its `doc/` ([map.md](../../doc/map.md), [one-stream.md](../../doc/one-stream.md), [owner-2026-10-21-items-hold-items.md](../../doc/owner-2026-10-21-items-hold-items.md), [store-index-query-plan.md](../../doc/store-index-query-plan.md)), `core/Page/readme.md`, `core/Task/readme.md`, `ext/JSONL/readme.md` (the `live()` tail).

## Do

1. **Map** (into `doc/map.md`, short): how an item saves in the browser today (Store, the socket, `Server/` writers), how the item tool saves on the server, and where they differ (stamping, author, validation).
2. **Smallest slice:** a button on a task view (start/pause/stop and approve, on the session page's tasks) calls the item's own method in the browser; the store appends that delta to the task's JSONL through one server writer (node stamps time and author `owner`); the page and a subscribed agent see it at once. Prove it with a test and a 400px shot.
3. **Keep it one system:** the same delta grammar and writer as the `item` tool; no second save path. Write the decisions in `doc/` (conclusions only), update the readme.

Land with `finish-task`; the outcome says what the owner can press and where.
