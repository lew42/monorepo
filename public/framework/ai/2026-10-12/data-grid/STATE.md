# data-grid: state

Brief: [requirements.md](requirements.md). Worktree `C:\Code\lew42\worktrees\data-grid-2`, branch `worktree/data-grid-2`.
(An older branch `worktree/data-grid` from 2026-10-03 still exists; its content is already on dev. Left alone.)

## Decided
- Architecture: [ext/DataGrid/doc/architecture.md](/framework/ext/DataGrid/doc/architecture.md). ext/DataGrid is the base; ui/datagrid and ui/table fold in as statics with re-exports; table and rail are drawers picked by a `view` setting (url > PagePrefs > settings.jsonl > "table"); Page owns row → detail via `route(id)` + `columns()`.
- Seam with the sessions masterminds: page notes on /framework/ai/sessions/ (data and detail stay theirs; I take the grid drawing in AISessionsPage.js and the grid CSS).

## Steps
- ✅ Architecture page, shown on /framework/ext/DataGrid/ (Docs tab + link).
- ⬜ grid-core minion (Sonnet): fold, drawers, hooks, rail, view setting, demo. [brief](grid-core/requirements.md)
- ⬜ sessions-perf minion (Sonnet): before numbers + screenshots at 400/1200/1920/3440. [brief](sessions-perf/requirements.md)
- ⬜ Sessions adoption minion (after grid-core).
- ⬜ After numbers, review diff, smoke, merge, finish-task.
