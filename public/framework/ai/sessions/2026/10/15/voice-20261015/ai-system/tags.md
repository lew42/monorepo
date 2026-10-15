# Tags and query: what exists, was the in-memory query built, what to do

Ask: [ask-ea3d4c58](../ask-ea3d4c58.md), B3. It builds on the [past-work map](../past-work-map/map.md); checked 2026-10-15.

## On one screen

- **Yes, the in-memory dev-server query was built** (2026-10-12/13). [`Server/SessionIndex.mjs`](/Server/SessionIndex.mjs) holds one row per `task.jsonl` (1,610 today) and answers filters in plain JavaScript; [ext/Query](/framework/ext/Query/) is the generic socket query (`QueryServer` in node, `QueryClient` in the browser). It is loaded in `Server/run.js:16`. Doc: [Server/doc/session-index.md](/Server/doc/session-index.md).
- **Only half of it is used.** The `sessions` source feeds the [Sessions page](/framework/ai/sessions/) by default. The `tasks` source works (`new QueryClient("tasks").ask({where:[{field:"modules",op:"contains",value:"core/Page"}]})`) but no page asks it.
- **Tags are the missing part.** A row has `topics` and `modules`. `modules` is computed from the `action` file paths and the `Fence:` line, so it is real. `topics` is almost always empty. There is no `tags` field, and nothing tags asks, cards or pages.

## What exists today

| System | Holds | Query | Fresh? |
|---|---|---|---|
| `SessionIndex` + `ext/Query` (`tasks`) | 1,610 task rows, `modules`, `topics`, landed, cost | `module` prefix, text, since, any field `contains` | live (`fs.watch`, appended bytes only) |
| `AISessionTailer` (`sessions`) | every Claude session, newest first | same socket | live |
| `ai/asks.jsonl` | 279 routed asks (`title, owner, card, status`) | none; `PastWork` keyword score | appended by hand |
| `ai/doc/asks-outcomes.jsonl` (`AskTally`) | 316 features, 917 dictated asks with date and outcome | none; read by [`Server/Asked.mjs`](asked-for.md) | rebuilt by a script run |
| `ext/Refine/queue/asks.jsonl` | 1,224 refined asks, free-text `module` | none | 4 sessions only |
| `PastWork.mjs`, `ModuleLog.mjs` | read the above, per topic or per path, graded | command line | computed each run |
| `readme_modules` (Servex tool) | readme chain text for a module | by module name | read from disk |
| `files.jsonl` per folder | which files a folder holds | the page's own reader | live (`PageFiles.js`) |
| `directory.json` | frozen site listing | none | **off since 2026-10-09**, stale on purpose ([note](/Server/doc/directory-off.md)) |

## Recommendation: one way

**A tag is any string. It is computed when the index loads, never stored in a second file.** Concretely:

1. `SessionIndex.reduce` gives every row `tags: string[]`, the union of: its `modules` (so a path prefix tags everything under it), `group`, `topics`, every page URL in its `links`, and any explicit `{"tag":"core/Page"}` line an agent appends (new verb, one line in `jsonl-schema.mjs`).
2. A filter is the query that already exists: `{field:"tags", op:"contains", value:"core/Page"}`. A path tag also matches its children, the way `module` does.
3. Asks and cards become two more `QueryServer` sources next to `tasks` and `sessions`, each row with the same `tags`. "Everything tagged X" is then one fan-out over four sources, and the answer is never a stale file.
4. The generated index file is not needed: `session-index.json` (last built 2026-10-09) can stay as the static site's read path, as `session-index.md` already says.

## The risk to the dev server, with numbers

- **Memory:** the `tasks` rows cost 23 MB of heap; tags add a few MB. Four sources stay under about 60 MB. The index unloads after 24 h idle (`unload_after`).
- **A blocking first load:** loading 1,610 files takes 0.83 s of synchronous reads (it was 1.1–1.6 s on 10-13). During that time the same process serves live reload and every socket. This grows with the task count; at about 3 s it will be felt.
- **A crash takes the server with it.** An exception inside an index class is in the dev server's process. Every open page reloads and the owner sees it.
- **A watch storm:** `fs.watch` on `ai/` sees every log append. The memory note on the fan spin (chokidar flooded by watch events) is the same hazard; `SessionIndex` debounces 50 ms and reads only appended bytes, which is the right shape.
- **Each worktree dev server loads its own copy**, so counts differ and the memory repeats.

**The safe form:** keep it in the dev server (the owner asked for that), load it lazily on the first query (already done), keep the `{error:"no source"}` fallback to files (already done), and when the load passes about 3 s move the index into a `worker_thread` that the socket plugin asks. Do not move it to Servex: Servex is the always-on agent runner, and an index bug there stops agents, which is worse than a dev-server reload.

## What was not built

The `tags` field, the `tag` verb, and the `asks`/`cards` sources. They are about 40 lines in `SessionIndex.reduce` plus one source each, and they need a dev server restart to go live, so they stay a recommendation. First step if you want it: add `tags` to `SessionIndex.blank/seal`, run `node Server/SessionIndex.mjs --check`, restart.
