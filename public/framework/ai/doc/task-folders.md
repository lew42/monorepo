# Task folders: one home, inside the sessions store (2026-10-12)

> The whole picture (two homes, tooling, links, what to open) is [tasks.md](tasks.md); this page is the history of the session-store folder shape. Module `tasks/` homes came later (2026-10-16) and are described there.

Decided by `mastermind-task-folders` (session e456f109), brief: [`requirements.md`](../sessions/2026/10/12/session-e456f109/task-folders/requirements.md). The owner's words:

> "Having a folder for every day inside of the AI folder… is an anti-pattern. I thought we were moving to nesting them, and actually I kind of think they should all be in the sessions folder… We cannot be having two similar but different systems where we have redundant data."

## The decision

A task folder lives in the sessions store, under the session that ran it:

```
ai/sessions/YYYY/MM/DD/<session folder>/<task slug>/    a task whose session folder exists
ai/sessions/YYYY/MM/DD/<task slug>/                      a task with no known session (old ones, scripts)
ai/sessions/YYYY/MM/DD/day.jsonl                         the day's log (was ai/YYYY-MM-DD/day.jsonl)
```

**Which day (2026-10-18):** `YYYY/MM/DD` is the owner's **local** day, the same as `State.day`: one rule, `TaskDirs.day()` (it calls `Day.of` in [core/Session/Day.js](../../core/Session/Day.js)). Until 10-17 folders were filed by the UTC day, so a session started after 19:00 local sat under the next day. [`Server/SessionDayMove.mjs`](/Server/SessionDayMove.mjs) re-filed the 116 folders from 10-17 on (`--plan`, `--apply`, `--undo`; every move is a line in [session-day-moves.jsonl](../sessions/session-day-moves.jsonl), and `TaskDirs.follow()` reads it); older days stay as filed. A bare `YYYY-MM-DD` (a `finish` line's `at` written without a time) is a local day, kept as is by `Day.of`, never read as UTC midnight; `.claude/hooks/append.mjs` fills a missing or date-only `at` on `finish`/`complete`/`stop`/`start`/`log`/`decision` lines with the current local time.

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
- **Left for a sweep:** tasks still running at move time (`data-grid`, `style-system`, `refine-haiku-live`, this one) stay in `ai/2026-10-12/` until they land. Re-run `node Server/TaskMove.mjs --apply` then, and it moves only what is left. The dev server re-creates a `files.jsonl` with "gone" lines in an emptied day folder; the same sweep moves it. `ai/2026/MM/DD/a-*/` was the older card tree (09-19 to 09-24); it moved with every other card on 2026-10-13 (below).

## 2026-10-13: the day folder came back, and one tree

The owner found an Inbox link to `/framework/ai/2026-10-13/…` and asked, again, for one data structure ([requirements-8.md](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-8.md)). What was done ([audit](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/doc/why-the-day-folder-came-back.md)):

- **The writers that still made `ai/<date>/`** (`Server/plugins/Start.js`, `Crawl.mjs`, `Council.mjs`, `on-landing.mjs`) now build every path with `TaskDirs`. **The guard:** `TaskDirs.refuse()` throws on a new `ai/YYYY-MM-DD/` path and names the right place; `append.mjs` calls it; `node Server/TaskDirs.mjs --census` lists any day folder or hand-joined writer, and `Server/TaskDirs.test.mjs` fails on one.
- **The link the owner clicked** was a reader guessing `/framework/ai/<date>/<slug>/` from the day log. Such a url now finds the task in the store and redirects (`StoreFolder.lookup`; `TaskDirs.redirect()` is the node twin).
- **The last day folders moved:** `ai/2026-10-12/` (6 tasks) and `ai/2026-10-13/`, by `TaskMove` (`--undo` and `--relink` now act on one run, never the whole ledger).
- **One tree, decided:** Inbox cards move from `ai/YYYY/MM/DD/<card>/` into `ai/sessions/YYYY/MM/DD/cards/<card>/`. Applied the same day (next section); at the time of this line it was not yet applied: card ids are paths kept in records, so the readers need one resolver first ([one-tree.md](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store/doc/one-tree.md)). The alternative, the store moving up to `ai/YYYY/MM/DD/`, is fifteen times larger and was rejected.

## 2026-10-13: one tree, applied

Every Inbox card folder now lives inside the sessions store. `framework/ai` has one year tree: `ai/sessions/YYYY/MM/DD/`, holding that day's sessions, their tasks, `day.jsonl`, and `cards/`.

```
ai/sessions/2026/10/13/cards/<card>/page.jsonl    was ai/2026/10/13/<card>/page.jsonl
ai/sessions/2026/10/13/cards/page.jsonl           the day's card index (was ai/2026/10/13/page.jsonl)
ai/sessions/2026/cards/page.jsonl                 the year's index; a month's is ai/sessions/2026/10/cards/
```

- **Why cards sit beside the sessions, not inside one:** a card belongs to a day (the owner's Inbox), not to the one session that made it; a task belongs to its session. Don't confuse `ai/sessions/<day>/cards/` (data) with `ai/cards/` (the code that draws a card).
- **What did not change:** a card's id (`2026/10/13/<card>`, carried by 656 records that are never rewritten) and its page, `/framework/ai/2026/10/13/<card>/`, which is the Inbox route. Old card links keep working with no redirect.
- **The one rule:** [`cards/CardDir.js`](../cards/CardDir.js) puts `cards` after the date. Servex's `Cards.dir(id)` uses it and falls back to the old folder when only that one exists (a card written by a Servex not yet restarted). Every reader goes through it: `Cards`, `Layers`, `Sessions`, `on-landing.mjs`, `smoke.mjs`, `DayPromptsRefine.mjs`, the card page, the Inbox scans. The dev server serves an old file url (`/framework/ai/2026/10/13/<card>/report.md`) from the new folder.
- **The move:** `node Server/TaskMove.mjs --apply --manifest <dry run> --ledger card-moves`, with the dry run written by [`card-move-plan.mjs`](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/card-move-plan.mjs). Two runs in the worktree moved 557 card folders and 24 index files; `--verify` found 0 bad. The ledger is `ai/sessions/card-moves.jsonl` (with `card-moves-files.jsonl`, the sha1 snapshot).
- **The undo, proven first** on a worktree copy: apply, verify, `--undo`, 0 tracked files changed, apply again ([undo-proof.txt](../sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/one-store-apply/undo-proof.txt)). To undo the real move: `node Server/TaskMove.mjs --undo --ledger card-moves --run <stamp>`, newest run first. Each line of `ai/sessions/card-moves.jsonl` carries its run's `run` stamp; with no `--run`, `--undo` takes the last one.
- **The relink:** `--relink --ledger card-moves` rewrote 165 mentions in 122 md/js files: file paths and file links into the moved folders, and relative links inside them. Page links stay, because the page address did not change.
- **Git-ignored cards** (`session-<id8>`, the owner's session pages) are not in git, so a merge cannot carry them. They move in the main tree by a third run after the merge, and stay ignored in their new place: `node <task dir>/card-move-plan.mjs --out <dry run>`, then `node Server/TaskMove.mjs --apply --manifest <dry run> --ledger card-moves`, then `--verify --run last --ledger card-moves`. Its run stamp is in the same ledger.
- **Watch out:** a dev server watching the tree (`Server/plugins/PageFiles.js`) appends listing lines into `page.jsonl` files while their folders move. Run a move with no server watching that checkout, or expect a `files.jsonl` to reappear in an emptied old folder.
