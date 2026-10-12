# STATE — task-folders (mastermind-task-folders, session e456f109) — LANDED

- ✅ Decision: [`ai/doc/task-folders.md`](../../doc/task-folders.md). Tasks live at `ai/sessions/YYYY/MM/DD/<session folder>/<slug>/` (or `<day>/<slug>/` when there is no known session). Rejected alternative: `ai/tasks/YYYY/MM/DD/`.
- ✅ Code merged (`f616586a2`, `3586c7ca2`): the `TaskDirs` path helper; `append.mjs` and Servex `open_task` follow old paths; `StoreFolder` routes the store; old URLs redirect; day pages stay dashboards and read the store's `day.jsonl`.
- ✅ Servex restarted on the new code (`sustain.mjs --restart`); the dev server was proven first on the worktree's private port (3112).
- ✅ Move: dry-run plan `aa29bbb54`; move `c15216adc` (1,059 tasks, 77 renames, 77 stubs archived, 138 day files); relink `02b42fe87` (4,195 links in 1,612 files); sweep `c47a3e8bd`. Dispatch was paused and live reloads held throughout.
- ✅ `--verify`: 0 files missing. The 1,059 "changed" files are the relink's own link edits plus the dev server's appends.
- ✅ Smoke of `/framework/ai/`, the store, and old URLs one link deep: no new 404s.
- ⬜ Sweep: `data-grid`, `style-system`, `refine-haiku-live` and this task are still in `ai/2026-10-12/`. Once they land, run `node Server/TaskMove.mjs --apply`, then `--relink`, then `--pages`, and commit.
