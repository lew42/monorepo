# Tasks live inside their session (2026-10-10)

**Superseded 2026-10-12** by [`ai/doc/task-folders.md`](../../../doc/task-folders.md): every task (not only finished, joined ones) moves into the store, the folder keeps the task's name (`<session>/<slug>/`, not `task/`), and `Server/TaskMove.mjs` did the move. The record below is the first pass.

**Ask (owner):** if a task belongs to a session, put it in the session's folder; lose nothing. Brief: `2026-10-10/tasks-into-sessions/requirements.md`.

## What happens

`node Server/TaskDirs.mjs` (class `TaskDirs`) moves a finished task from `ai/<date>/<task>/` to `ai/sessions/YYYY/MM/DD/<session>/task/` (a second task of the same session goes to `task-2/`). It joins by the `session_id` in `task.jsonl`, using the same join as `session-migrate.mjs`.

| Command | What it does |
|---|---|
| (none) | dry run: counts, and why each held-back task stays |
| `--apply` | snapshot every file (size, sha1), move the folders, leave a stub, write `ai/sessions/task-manifest.json` |
| `--verify` | every snapshot file exists at its new path with the same sha1 |
| `--undo` | move everything back from the manifest (tested: apply, undo, apply again gave identical hashes) |

First run: 78 folders, 2,320 files, 170 MB, zero missing or changed. 12 tasks stay because they are not landed; 994 stay because no session in the store names them; 10 name several sessions and move with the first.

## Old addresses keep working

- The old folder stays, holding `moved.json` (`{moved_to, session}`), so a day listing still shows the task.
- Browser: `Server/Server.js` serves `/framework/ai/<date>/<task>/<file>` from the new place (`TaskDirs.alias`); the page route at the old URL still renders (checked headless on `/framework/ai/sessions/2026/10/08/f74e9f54-7e5e-4567-b09f-9b6fee492350/task-audit/`). Restart the dev server to load it.
- Node readers: `task-cost`, `spend-tree`, `page-ai-cost`, `ai2-overview` call `TaskDirs.follow(dir)` and read the moved folder. Other readers that scan old dated folders for a `task.jsonl` skip a moved task; they look at recent days, and only landed tasks move.

## Decisions and the alternative

- Applied in the main tree, not a worktree: 800 of the 2,320 files are untracked or ignored (screenshots, caches) and a worktree would not carry them.
- Session folders keep their uuid names here. Renaming them to slugs (`session-migrate.mjs`, 1,451 collisions) is a separate step; it moves `task/` along, and `TaskDirs.map()` would then need `--relink` (not built; the manifest paths would be stale).
- Alternative not taken: a junction at the old path. Git does not track Windows junctions and production is static.
- Production (static) has no alias: an old task URL would not resolve there. A Cloudflare `_redirects` file generated from the manifest is the fix if it matters.
