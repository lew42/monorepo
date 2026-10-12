# data-grid: state

Brief: [requirements.md](requirements.md). Worktree `C:\Code\lew42\worktrees\data-grid-2`, branch `worktree/data-grid-2`.
(An older branch `worktree/data-grid` from 2026-10-03 still exists; its content is already on dev. Left alone.)

## Decided
- Architecture: [ext/DataGrid/doc/architecture.md](/framework/ext/DataGrid/doc/architecture.md). ext/DataGrid is the base; ui/datagrid and ui/table fold in as statics with re-exports; table and rail are drawers picked by a `view` setting (url > PagePrefs > settings.jsonl > "table"); Page owns row → detail via `route(id)` + `columns()`.
- Seam with the sessions masterminds: page notes on /framework/ai/sessions/ (data and detail stay theirs; I take the grid drawing in AISessionsPage.js and the grid CSS).

## Steps
- ✅ Architecture page, shown on /framework/ext/DataGrid/ (Docs tab + link).
- ✅ grid-core (minion-grid-core): ui/datagrid + ui/table folded in with re-exports, DataGridTable/DataGridRail drawers, hooks, view setting, paging, saved widths, demo with live debug view. Smoke: all seeds ok (linked-page failures are older layout lint). Merged `137750706`. [table](grid-core/table-1200.png) · [rail](grid-core/rail-1200.png)
- ✅ sessions-perf (minion-sessions-perf): before medians, first row 1.7–2.2 s, 5,930 DOM nodes, 200 rows, long tasks 344–523 ms; [script](sessions-perf/perf-sessions.mjs), [results](sessions-perf/results.jsonl) (first 3 lines are from a run cut by a Servex restart; baseline = last 12).
- ⬜ sessions-adopt (minion-sessions-adopt, worktree `data-grid-3`): Sessions on DataGrid, rail view, after numbers. [brief](sessions-adopt/requirements.md)
- Worktree note: `data-grid-2` had no server entry; work moved to `data-grid-3` (made by worktree-up, merged with data-grid-2).
- ⬜ After numbers, review diff, smoke, merge, finish-task.
