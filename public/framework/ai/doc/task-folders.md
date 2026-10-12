# Task folders: one home, inside the sessions store (2026-10-12)

Decided by `mastermind-task-folders` (session e456f109), brief: [`requirements.md`](../2026-10-12/task-folders/requirements.md). The owner's words:

> "Having a folder for every day inside of the AI folder… is an anti-pattern. I thought we were moving to nesting them, and actually I kind of think they should all be in the sessions folder… We cannot be having two similar but different systems where we have redundant data."

## The decision

A task folder lives in the sessions store, under the session that ran it:

```
ai/sessions/YYYY/MM/DD/<session folder>/<task slug>/    a task whose session folder exists
ai/sessions/YYYY/MM/DD/<task slug>/                      a task with no known session (old ones, scripts)
ai/sessions/YYYY/MM/DD/day.jsonl                         the day's log (was ai/YYYY-MM-DD/day.jsonl)
```

- **One class builds the path:** `TaskDirs` (`Server/TaskDirs.mjs`). `TaskDirs.dir({slug, session_id, day})` says where a new task goes; `TaskDirs.find(slug)` finds an existing one; `TaskDirs.follow(old)` maps any old path to its new home. Nobody types `ai/<date>/` again.
- **A minion's task nests in its parent's task** (`parent/child/`), as before.
- **Old addresses keep working:** every move is in a manifest; the dev server and the router redirect an old `/framework/ai/YYYY-MM-DD/<task>/` URL to the new one, and `append.mjs` follows an old `task.jsonl` path to its new file, so an agent holding an old path keeps writing to the right log.

## The alternative, not taken

`ai/tasks/YYYY/MM/DD/<slug>/`: a second dated tree beside `ai/sessions/YYYY/MM/DD/`. Shorter URLs and no join, but it is exactly the "two similar but different systems" the owner named. Rejected.

Also not taken: putting a task's files straight into the session folder (no `<slug>/` level). A session's card already writes `page.jsonl` there, and one session can run several tasks.

## The history this settles

| When | What was asked or decided | Now |
|---|---|---|
| 2026-09-24 | Card folders by date, `ai/YYYY/MM/DD/` with index pages (`2026-09-24/card-folders/`) | the card tree; session cards moved to sessions on 10-09 |
| 2026-10-04 | Voice sessions in "the day folder", like VS Code sessions (`2026-10-04/voice-assistants/`) | superseded: sessions live in `ai/sessions/YYYY/MM/DD/` |
| 2026-10-08 | Sessions store chosen: `ai/sessions/YYYY/MM/DD/<id>/`; "no separate task folders, no second date layout" ([data-architecture.md](../sessions/doc/data/data-architecture.md)) | holds; this finishes it for tasks |
| 2026-10-08 | CLAUDE.md: "a child session or task lives inside its parent's directory" | holds: task inside session, minion task inside its parent task |
| 2026-10-09 | Session folders migrated; tasks held back because a moved task had no route ([layout.md](../sessions/doc/data/layout.md)) | the route is solved by redirect (below) |
| 2026-10-10 | 78 landed tasks moved to `<session>/task/` by `TaskDirs.mjs` ([tasks-in-sessions.md](../sessions/doc/data/tasks-in-sessions.md)); 994 without a session stayed | the 78 are renamed `<session>/<slug>/`; the rest move too |
| 2026-10-12 | The owner: no day folders in `ai/`, everything in sessions | this doc |

The conflict that needed settling: the 10-10 pass named every task `task/` (and `task-2/`), which loses the task's name in its URL. CLAUDE.md asks that tasks "get proper names", so the folder keeps its slug.

## How it was done (2026-10-12)

- **Code first** (merge `f616586a2`): `TaskDirs` builds every new task path (`node Server/TaskDirs.mjs --new <slug>`, `--day`); `append.mjs` and Servex `open_task` follow an old path to its new home; readers list both shapes; `ai/AISession/StoreFolder.js` routes the store by folder (`/framework/ai/sessions/2026/10/12/<session>/<task>/`).
- **The move** (`Server/TaskMove.mjs`, built by a Sonnet worker): dry-run plan committed (`aa29bbb54`), then `--apply` (`c15216adc`): 1,059 task folders, the 77 `task/` folders from 10-10 renamed to their slug, 77 `moved.json` stubs archived to `ai/archive/task-stubs/`, 138 loose day files. Every move is a line in `ai/sessions/task-moves.jsonl` with per-file sha1s in `task-moves-files.jsonl`; `--verify` re-hashes them and `--undo` moves them back.
- **The relink** (`02b42fe87`): 4,195 links in 1,612 md/js/html files, plus 67 relative imports fixed for the deeper folders. `.json` records, the generated `directory.json` and CLAUDE.md keep their old addresses, which redirect.
- **Old URLs:** the router reads `task-moves.jsonl` and sends `/framework/ai/YYYY-MM-DD/<task>/…` to the new folder. Production needs nothing more, because the site falls back to the app for unknown paths (`not_found_handling: single-page-application`). A Cloudflare `_redirects` file would need 1,269 wildcard rules against a limit of 100, so `ai/sessions/task-redirects.txt` is kept as the reference list instead.
- **Left for a sweep:** tasks still running at move time (`data-grid`, `style-system`, `refine-haiku-live`, this one) stay in `ai/2026-10-12/` until they land. Re-run `node Server/TaskMove.mjs --apply` then, and it moves only what is left. The dev server re-creates a `files.jsonl` with "gone" lines in an emptied day folder; the same sweep moves it. `ai/2026/MM/DD/a-*/` is the older card tree (09-19 to 09-24) and is not part of this move.
