# files.jsonl: a folder's file list moves out of page.jsonl, unless the folder IS a jsonl page (minion-pf-files)

Load the `minion` skill first, then `code`. The task: `../requirements.md` and the owner's words
`../owner-words.md` ("when we load any page and we fetch the page's JSONL, we get all the file
listings for free"). The card's directory: `public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`.

## Why (a clash with a decision already on michael/dev)
This task gave EVERY covered folder a `page.jsonl` holding `{"file": …}` lines, including the
~1,275 folders that have a `page.js`. task-mastermind-page-system-2 has decided that a
`page.jsonl` means "this folder is a jsonl page" for the loader, and that a page.js folder keeps
its own data in separate files (`weight.jsonl`, `settings.jsonl`); see
`public/framework/core/Page/jsonl/doc/writers.md` and `core/Page/weight/doc/design.md` (line ~81).
The Servex mastermind asked for three things: (1) keep the file list for page.js folders somewhere
else, e.g. `files.jsonl`; (2) never create a folder from a url; (3) delete the page.jsonl files
and empty folders written since 18:05, only ours, and say which.

## The new rule (decided)
- **A jsonl page** (a folder whose `page.jsonl` first line is NOT a `{"file"}` line: it names a
  title or class, e.g. every AI card, `core/Page/jsonl/`) keeps its file lines in its own
  `page.jsonl`, exactly as now. That is the owner's "for free".
- **Every other covered folder** (it has a `page.js`, or it is a plain folder like `doc/`) gets its
  list in **`files.jsonl`**, same line format (`{"file"}`, `{"file", "gone": true}`, `kid/`,
  `kid/page.js`, `kid/page.jsonl`), and never gets a `page.jsonl` from us.
- **No log for an empty folder.** A folder with no entries gets no `files.jsonl`. This is why the
  url-shaped empty folders under `core/Page/doc/file/**` got a log: something else made them (not
  PageFiles, which has no mkdir); our log made them visible. Don't make one there.
- `files.jsonl` and `page.jsonl` are never listed as entries and never trigger their own appends
  (no loop). Keep: append-only, replay then write only on a real change, the task-interior
  exclusion, `directory.json` skipped.

## Deliverables
1. **`Server/plugins/PageFiles.js`**: the rule above, one function deciding which file a folder's
   list lives in. The parent line for a child stays `kid/page.jsonl` only for a jsonl page.
2. **A migration, `Server/page-files-migrate.mjs`** (idempotent; prints counts): for each covered
   folder that is not a jsonl page: if its `page.jsonl` holds ONLY `{"file"}` lines, `git mv` it
   to `files.jsonl` (or merge its lines into an existing `files.jsonl`). If it holds other lines
   too (e.g. `imagine/cms/json/page.jsonl`, CMS data), leave that file alone and write the list
   to `files.jsonl`. Delete our `page.jsonl` from empty folders, and remove those folders if they
   are then empty. Print every path deleted. Run it in the worktree, then run it again: 0.
   Then run `Server/page-files-backfill.mjs`: it must create `files.jsonl` where needed and pass
   0/0 on a second run.
3. **Readers**: `Page.listing(url)` in `core/Page/Log.js` reads `files.jsonl`; for a jsonl page
   whose log is already loaded, it uses that (`listed`) with no fetch; else it falls back to
   `page.jsonl`, then to `directory.json`. Check each reader switched earlier still works:
   `core/Page/Markdown.js`, `ai2/groups.js`, `ai2/tasks.js`, `ext/files/fs.js`,
   `ext/drawer/tabs/sessions.js`, `dev/DevBar/ask.js`, and `Page.child()` in `Page.class.js`.
   Keep request counts low: the card page must not make more listing requests than before.
4. **Docs**: the "Who writes the file lines" section of `core/Page/doc/jsonl.md` and
   `writers.md`'s file-watcher row: one plain paragraph each saying which file holds the list.
5. **Proof** on a private port (the worktree server or `PORT=<free> node server.js`, windowsHide):
   create/delete in a page.js folder → lines go to `files.jsonl`; create in a card folder → lines
   go to its `page.jsonl`; an empty new folder → no log; 5 reads → 0 lines. Headless (never the
   owner's tabs): `/framework/core/Page/md/`, `/framework/ext/files/fs/`, `/framework/ai2/`, one
   card, `/imagine/cms/json/`: 0 console errors, 0 directory.json on the card page.

## Where
Worktree `C:\Code\lew42\worktrees\page-files-log` (branch `worktree/page-files-log`). FIRST
`git merge michael/dev` there. Commit by exact path; the migration's renames in their own commit.
Don't merge into michael/dev; I do. Every spawn sets `windowsHide: true`.

## Fence
`Server/plugins/PageFiles.js`, `Server/page-files-migrate.mjs` (new), `Server/page-files-backfill.mjs`,
`core/Page/Log.js`, the seven reader files above, `core/Page/doc/jsonl.md` (that section),
`core/Page/jsonl/doc/writers.md` (that row), and the page.jsonl/files.jsonl files the migration moves.

## Land
Log decisions as they happen in your task.jsonl. End with 5 lines: commits, migration counts
(renamed / kept / deleted, with the deleted paths in your log), proof counts, the card page's
listing requests, anything left. Budget about $4.

