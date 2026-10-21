# DatedFiles: make, move, query and check a collection filed by day

**What it is.** [`DatedFiles`](../DatedFiles.mjs) is the node half of [`Dated`](/framework/core/Item/Dated/) (`core/Item/Dated.js`). A collection is filed by day; each item is a folder, and each has one pointer row in that day's index. Today the only collection is **projects**. Plan: [store-index-query-plan.md](/framework/core/Item/doc/store-index-query-plan.md) (slice 1).

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
- `watch()` (the safety net for a log written by another path) is not built: it needs Servex to host it, which is slice 2.
- A restart of Servex (tools) and the dev server (rpc) loads the new doors; `check()` and the test do not need it. Test: `node public/framework/core/Item/Dated.test.mjs`.
