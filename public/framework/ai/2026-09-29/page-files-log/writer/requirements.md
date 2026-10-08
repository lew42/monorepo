# Writer: every folder's page.jsonl lists its own files (minion-pf-writer)

Load the `minion` skill first, then `code`. Read the owner's words: `../owner-words.md` and the
parent brief `../requirements.md` (the card's whole conversation is at
`public/framework/ai/2026/09/29/the-page-system-layout-navigation-new-pa/`).

> "each page.jsonl could just have all the directory data. And so when we load any page and we
> fetch the page's JSONL, we get all the file listings for free. And then whenever a new file or
> folder is created, it's just added, appended to that log." (the owner, 09-29)

**Work ONLY in the worktree `C:\Code\lew42\worktrees\page-files-log`** (branch
`worktree/page-files-log`, its server at http://localhost:53780/). Never edit the main tree.
Commit by exact path. Another minion (minion-pf-readers) works in the same worktree on the
browser side; do not touch its files.

## What exists
`Server/plugins/PageFiles.js` already appends `{"file": "x"}` / `{"file": "x", "gone": true}`
lines, replays the log before each append (latest line per first path segment wins), and catches
up on boot, but ONLY for folders that already have a page.jsonl and NO page.js.
Format doc: `public/framework/core/Page/doc/jsonl.md` ("Who writes the file lines").

## Deliverables
1. **The rule, in one place (a function in PageFiles.js):** a folder gets its own page.jsonl if it
   is under `public/` and is not: `node_modules`, a dot-folder, or INSIDE a task folder
   (`public/framework/ai/<YYYY-MM-DD>/<task>/<anything>/`; the task folder itself and the day
   folder DO get one). Also skip anything under a folder the rule skips. Keep the existing
   format exactly (`{file}`, `{file, gone: true}`, `kid/page.js` / `kid/page.jsonl` / `kid/`).
2. **Folders with a page.js are no longer skipped**: their page.jsonl is their listing. A page.js
   still wins as the page (the loader must not change); check `public/imagine/cms/json/`, which
   has both today, still renders.
3. **New folders get their log:** when a folder the rule covers appears, create its page.jsonl
   with its listing (and the parent gets its `{file: "kid/"}` line as now).
4. **Ignore its own writes, and never loop.** A page.jsonl event must not trigger an append that
   triggers another. On Windows a READ fires a change event: only append when the replayed state
   truly differs (it already does; keep it). Appends stay `fs.appendFileSync`, never a rewrite.
5. **The backfill: `Server/page-files-backfill.mjs`** — one-time node script that runs the same
   code path as the boot catch-up, creating missing logs, idempotent (a second run writes 0
   lines). Print: folders visited, logs created, lines appended, ms. Run it in the worktree, then
   run it again to prove 0. Commit the created page.jsonl files in their own commit.
   Boot catch-up time matters: report how long the server's boot walk takes over ~2,500 logs; if
   over ~2 s, make boot catch-up lazy or async so the server starts fast.
6. **`.gitattributes`: `page.jsonl merge=union`** (and `task.jsonl`, `day.jsonl`, other
   append-only `*.jsonl` if clearly safe) so two branches appending to the same log merge
   without a conflict. Prove it: a throwaway branch in the worktree, both sides append, merge,
   no conflict; then delete the throwaway branch.
7. **Docs:** update the "Who writes the file lines" section of `core/Page/doc/jsonl.md` (the
   rule, page.js folders, the backfill, merge=union) in plain sentences. Nothing else in that
   file: task-mastermind-page-system-2 owns the rest.

## Fence
`Server/plugins/PageFiles.js`, `Server/page-files-backfill.mjs` (new), `.gitattributes`,
`public/framework/core/Page/doc/jsonl.md` (that one section), and the page.jsonl files the backfill
creates. Nothing else. Every Node spawn sets `windowsHide: true`.

## Proof
Boot the worktree's server code on a private port (`PORT=<free> node server.js` from the worktree
root, windowsHide, in the background) and show: create a folder with a file → its page.jsonl
appears with the file line and the parent gets `kid/`; delete the file → a `gone` line; read the
file 5 times → 0 new lines. Paste the before/after line counts in your log.

## Log and land
Your task.jsonl is already open for you. Log decisions and measurements as they happen. End your
turn with a 5-line summary: what changed, counts, boot time, anything left.
Budget: about $3.

