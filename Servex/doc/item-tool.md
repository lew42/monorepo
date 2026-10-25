# The item tool

`item({path, delta})` in `Servex/agents/page_tools.js`: `page_set` generalised to any Item class. `delta` is one log line, the object `Item.set()` takes. A key naming a method calls it, a key naming a child walks into it, anything else assigns (`set_one` in `core/Item/Item.js`; there is no second apply).

- **Which log:** a url's folder holds `task.jsonl` (Task), else `session.jsonl` (Session, `core/Session/Session.js`), else `page.jsonl` (Page). `task.jsonl` beside a `page.jsonl` means a task folder. A `class` key on line 1 wins.
- **`improvements.jsonl`** (2026-10-22): a url naming `<folder>/improvements.jsonl` is a Task list; `tasks.add` always nests there (no folder). The rule for writing one is in `Servex/agents/roles/mastermind.md`, "Improvements".
- **Item vs log, settled 2026-10-22** ([code-shape.md](/framework/ai/doc/code-shape.md)): `item` is for files a class reads (Task, Session, Process, Page, improvements): node replays the class, checks the delta or method against it, writes, and answers with what it wrote (`{ok, ids, line, size, now: {state, completion}}` for a Task, Session or Process; a Page write still answers its page). The full computed state is a read, with no delta. `log` (the Servex MCP `log` tool) is the plainly named raw append for any other JSONL record: node adds time, author and session and checks the line against the log's schema. Neither makes the model write bookkeeping.
- **No delta** returns the state; Task: `{class, state, completion, data, tasks}` from `Task.replay`.
- **Dot paths:** `"now.preview": x` becomes `{now: {preview: x}}`.
- **Refusals (Task):** `_` keys and keys that are no method, field or child return `{ok:false, why, exists}`.
- **Instructions:** first call per caller and class returns `Item.describe()` (plus first comment lines); `{"help":{}}` repeats them.
- **Decision:** the `jsonl-schema.mjs` check is skipped for Task lines (the tool validates them; the schema forbids `by`/`ts`).
- Test: `node Servex/agents/item_tool.test.mjs`. Servex must restart to load the tool.
- **In-process (step 12):** Servex-spawned agents also get this tool as `mcp__local__item` (same function, no HTTP; the `mcp__servex__` twin is disallowed). Off with `SERVEX_LOCAL_TOOLS=0`; test `Servex/agents/item-local.test.mjs`.
- **Step 3c supersedes the folder-by-default below:** `tasks.add` NESTS in the parent's file (`{"tasks":{"add":{…,"id"}}}`, later `{"<child id>":{…}}`); a folder is made only with a real module home, then listed in the module's `files.jsonl`. `{"folder":"<child id>"}` moves a nested child out. An existing slug or nested id is refused with `suggest: "<slug>-2"`. One cached root per file (`Item.Store.for`), re-read when the file changes on disk; `page_set/call/add/log` on a task folder take the same path.
- **Task homes (step 14a):** on a Task or Session, `{"tasks":{"add":{title, module?, …}}}` makes a child folder (`<module>/tasks/<slug>/` if the module folder exists, else `<parent>/<slug>/`, `-2`, `-3` on a repeat) with its app path on line 1, and writes only `{"task": path}` on the parent. The answer lists `homes`. Replay resolves references (`Task.from_ref`, `link_refs`). Tests: `item_tool.test.mjs`.
- **Filing (step 16):** every `tasks.add` also appends the same `{"task": path}` line to the caller's own task log (`ctx.caller_log`, or `resolve_log(caller)` from `page_tools(resolve_log)`; skipped with no caller, no task dir, or when that log is the parent). With no `module`, the module is the nearest folder under `public/framework/` that has a `readme.md`, taken from the path the call was made on (never a dated `ai/sessions/` folder).
- **Grouping rules** (returned as `rules` beside `describe()` on the first call; `RULES` in `page_tools.js`):
  - A refinement of an existing task goes into that task (add to its `tasks`, or set its fields). It does not become a new task.
  - New tasks are only for new asks.
  - One goal task per module holds the long-lived work; new related work goes under it.
  - An idea to keep beside a module while designing is a note, not a task.
  - The tool files the session reference and picks the home folder; never write either by hand.

## Queries: ask without writing (2026-10-23)

A **query** is a method or getter that only reads. A class lists them in `static queries` (`core/Item/Item.js`; `Item.describe()` returns them). A delta whose keys are ALL queries is answered at once and **writes no line**: `{ok, answer:{<key>:value}}`. The grammar is the same one ("a key naming a method calls it"): there is no `get` key. `target` walks into a child first (`target:["a"]`), then asks. A delta that mixes a query with a change (`{"cost":{},"title":"x"}`) is refused with `{ok:false, why}` and writes nothing: send two calls. The item tool holds one live replayed instance per file, so a query is a method call on memory (a 132-task session answers in about 135 ms).

```
item({path:"/framework/ai/sessions/2026/10/20/session-e00f55c9/", delta:{"summary":{}}})
item({path, delta:{"progress":{}, "cost":{}}})            // several queries in one call
item({path, target:["a"], delta:{"progress":{}}})          // the same, on the child "a"
```

`Task.queries` = `progress`, `cost` (this folder's agents, USD), `total_cost` (plus every child that has a folder), `duration` (ms, from the start/stop lines), `children` (child **sessions**: tasks whose `path` folder holds a session record), `summary` (id, title, state, completion, progress, counts by state, the open tasks only as id/title/state, cost, duration, children). Cost is computed by `Task.cost_resolver`, which `Agents.js` wires; with no Agents instance (a plain script) it reads 0.

**Session or Task? A session folder stays a Task with queries (decided 2026-10-23).** `core/Session` is the page-level view of a run (menu, settings, `AISession` cost and transcript), and `Session.completion` and `Task.completion` count the same thing with the same code. `class_of` already replays a session folder as a Task (`SessionRecord.log_file`), because the log holds task lines, `start`/`stop` spans and verbs that only Task understands. Switching to `Session` would lose those and need a second copy of `duration`, `cost` and `summary`. So `summary` and `children` live on Task and answer for a session's `session.jsonl` too (line 1's `{"session":{id,kind,…}}` is kept as `record`, so the summary reports the session id and kind). The alternative, a `Session` loader that extends Task, stays open if the view needs menu or settings through the tool.

Tests: `item_tool.test.mjs` (a query writes no line, a mixed delta is refused, the session summary with inline and referenced children, an array `tasks.add` is two tasks).

## A real Page, and lines refused before they are written (2026-10-23)

- **Page files** (`page.jsonl`): `page_tools.js` `page_class()` loads the real `core/Page/Page.class.js` in node, once. `Servex/agents/site-hooks.mjs` is a node resolve hook that maps site-absolute imports (`/framework/…`) to `public/`, so no DOM stub is needed; the few import-time browser touches (`location`, `document`, `Element`) are guarded in `Reader.js`, `View.js`. `Page.replay(lines)` replays a log (its `replay_new` marks the page as replaying, so a `file` line only records itself).
- **One list of part types:** `core/Page/parts/kinds.js` imports every part class and exports `PART_TYPES`. The browser (`Parts.js`, `ai/AISession/AISessionDetail.js`), the tool and `Page.test.mjs` all import it. A new part type is one import and one name there.
- **Refused before the write** (`page_refusal`, used by `item`, `page_set`, `page_add`, `page_call` on a page file): a key starting `_` (or `constructor`, `prototype`) anywhere in the delta; a `part-*` type that is not registered (the answer lists the real ones); a line that makes `Page.replay` throw. Only `part-*` types are checked: pages also hold plain data typed `card`, `note`, `request`, `task`, `question` that no class claims (the alternative, checking every type, would refuse all of those).
- **Any task line that would break replay is refused too** (`try_line`, `Refused`): the line is replayed on the live root BEFORE it is appended. A throw (for example `commits` in a child add: the getter has no setter) returns `{ok:false, why:"this line would not replay (…). Nothing was written."}` and the cached root is dropped. A `tasks.add` array is checked member by member on an empty root before any member is written.
- **A query key given a value is refused:** `{"summary":"text"}` is not an ask and cannot set; the answer says `summary is a query: it only reads and cannot be set`. `{}`, `true`, `null`, an array or an object are arguments.
- Tests: `node public/framework/core/Page/Page.test.mjs` (replay, unknown type reported, the tool refuses), `node Servex/agents/item_tool.test.mjs`, `node Servex/agents/page_tools.test.mjs`.
- **Subpage parent:** a `page.js` parent is never edited; `Subpages.js` notes the child in the parent's `page.jsonl` and `Page.child` reads it (17c696fa6, 645ccbe33). The old test that expected a `children:` edit in `page.js` was stale and now asserts this.
