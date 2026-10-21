# DatedFiles: make, move, query and check a collection filed by day

**What it is.** [`DatedFiles`](../DatedFiles.mjs) is the node half of [`Dated`](/framework/core/Item/Dated/) (`core/Item/Dated.js`). A collection is filed by day; each item is a folder, and each has one pointer row in that day's index. Two collections: **projects** (slice 1) and **sessions** (slice 2, below). Plan: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md) (slice 1).

## On disk

```
public/framework/<module>/projects/YYYY/MM/DD/<slug>/project.jsonl      the item (line 1: {id, title, module, at})
public/framework/ai/sessions/YYYY/MM/DD/index.jsonl                     the day's index: {"project": {id, path, url, title, state, completion, at, moved_from?, moved?, moved_back?}}
public/framework/ai/sessions/project-moves.jsonl                        the move manifest: {run, at, from, to, module, slug, day, session} and {undone, from, to}
<owning session>/session.jsonl                                          a one-line `log` pointer when a project moved out of it
```

A later row for the same `id` updates the earlier one. The day index is the same file [`AIIndexStream`](../AIIndexStream.mjs) writes for tasks and sessions ([ai-index.md](ai-index.md)).

## Who writes, who reads

| Method | What it does | Called by |
|---|---|---|
| `create({module, slug, title})` | folder, line 1, index row | tool `dated_create`, rpc `dated_create` |
| `move({from, module, apply})` | `git mv` into the module, rows on the start day and today, manifest line, session pointer (dry run unless `apply`) | tool `move_project`, rpc `dated_move`, CLI `node Server/ProjectMove.mjs` |
| `undo({run})` | puts the last (or named) move back, with mirror rows | same three |
| `query({from, to, where, sort, limit})` | rows of a day range (default last 30 days), run by [ext/Query](/framework/ext/Query/) | tool `dated_query`, rpc `dated_query` |
| `check()` | rebuilds from the folders, diffs with the index: `{ok, missing, stale}` | tests; run it by hand |

Reads in the browser go through `Dated.Index.open(url)`, which tails the day file ([the page](/framework/core/Item/Dated/)). The doors: `DatedFiles.tools()` is registered in `Servex/Servex.js`; `DatedFiles.setup(socket)` in `Server/run.js`. [`ProjectMove`](../ProjectMove.mjs) is only a thin caller now.

## Decisions

- `move` takes one object (`{from, module, apply}`) rather than the plan's `move(item, to)`, so the existing `move_project` tool keeps its exact inputs.
- `watch()` for sessions is started in `Servex/Servex.js` next to the tools; a **Servex restart** activates it. It indexes top-level folders only (a nested task is a task row, `AIIndex`'s) and ignores `cache.jsonl`/`index.json` writes. `sync(dir)` is the manual door.
- The sessions `check()` is weaker than the projects one on purpose: a folder with no row is not a fault (old sessions never had rows), and a folder whose only clue to its day is the disk birth time is not judged.
- `SessionDayMove` keeps its manifest, `--apply` and `--undo`; only its date rules moved into `DatedFiles.sessions` (`start`, `misfiled`). Folding apply/undo into `move` is left.
- A restart of Servex (tools) and the dev server (rpc) loads the new doors; `check()` and the test do not need it. Test: `node public/framework/core/Item/Dated.test.mjs`.

## The sessions collection (slice 2)

`new DatedFiles("sessions")` = the store itself: `ai/sessions/YYYY/MM/DD/<session or task folder>/`, record `session.jsonl` (old `task.jsonl`), index = the same day file. [`TaskDirs`](../TaskDirs.mjs) is a thin alias; it keeps the old-path manifests (`follow`, `resolve`) and nothing about dates.

| Method | What it does | Called by |
|---|---|---|
| `day_dir(day)`, `session_dir(id, day)` | the day's folder; a session's folder (`session-<id8>`, up to 3 days back) | `TaskDirs`, `Agents.default_task`, the SessionStart hook |
| `home({slug, session_id, parent, day})`, `make(dir)` | where a new task goes; make it, refusing a folder that already holds a record | `TaskDirs.dir/make` (`node Server/TaskDirs.mjs --new`) |
| `day_folders()`, `start(dir)`, `misfiled({since})` | every day folder; a folder's own start time; folders under the wrong day | `TaskDirs.list`, `SessionDayMove` (keeps apply/undo and its manifest) |
| `session_row(dir)`, `sync(dir)`, `watch()` | the row built from the record (id, path, url, title, state open/done); written when new or changed; `fs.watch` on the store | tests; start-up call pending |
| `check()` | no folder under the wrong day since 2026-10-18 (older history stays UTC-filed), no row whose folder is gone | tests; run by hand |

`Session.scan/locate` (core/Session) still walk the tree themselves: they are browser-portable and only read names; the day they build is `Day.path`.
