# Tasks — the one system (proposal, 2026-10-08)

Not built yet. A task is a [`core/Task`](/framework/core/Task/) (an `Item` with a `List` of subtasks) with a `task.jsonl` for state facts and a page for presentation, linked by reference. State is computed by replaying the log; sessions create tasks and own their cost; agents drive it with in-process tools.

- [design](2026-10-08/task-system-design/design.md) — the proposal, seven points
- [inventory](2026-10-08/task-system-design/inventory.md) — every task store we have today
- [plan](2026-10-08/task-system-design/plan.md) — next steps in order
- [mcp.md](mcp.md) — which tools are in-process vs network
