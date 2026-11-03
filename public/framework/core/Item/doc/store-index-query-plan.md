# One store, one dated index, one query: the plan (2026-10-20, no code yet)

**What this is:** the class plan for the owner's ask of 2026-10-20 18:50: everything dated (sessions, tasks, projects) is made, moved, indexed and queried by **one** system, built on `Item` and its `Store`, with JSONL as the first of several swappable stores. Nothing here is built. The owner's words: [ai/doc/owner-2026-10-20-who-makes-tasks.md](../../../ai/doc/owner-2026-10-20-who-makes-tasks.md) section 15, and [core/Task/doc/owner-2026-10-20-projects-and-completion.md](../../Task/doc/owner-2026-10-20-projects-and-completion.md) section 3. Brief: [requirements.md](../../../ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/requirements.md).

**In one picture:**

```
Item ── item.store ──▶ Item.Store ── backend ──▶ DevBackend | StaticBackend | MemoryBackend     (browser + node; core/Item)
                                                     │ writes on a server through
                                                     ▼
                                               FileJournal  (the ONE validated append; Server/)

Dated "sessions" ─┐   a collection filed by day:  <root>/YYYY/MM/DD/<slug>/   + <root>/YYYY/MM/DD/index.jsonl
Dated "projects" ─┤   create(spec) · move(item, to) · query(spec) · check()
                  └─▶ called by ONE set of adapters:  the SDK/MCP tool  and  the dev-socket rpc   (same methods)
ext/Query  runs a query over the rows Dated hands it (never imported by core)
```

Sections: [1 Inventory](#1-inventory-what-exists-today) · [2 Classes](#2-the-class-architecture) · [3 Coverage](#3-coverage-check-against-the-owners-words) · [4 Slices](#4-slices-smallest-first) · [5 One doc home](#5-one-doc-home-for-the-jsonl-store)

---

## 1. Inventory: what exists today

Facts read from the code on 2026-10-20. "Dup" names what does the same job somewhere else.

### Stores (one log ↔ one object)

| File:line | What it does | Dup |
|---|---|---|
| `core/Item/Store.js:22` `class Store` (`Item.Store`) | one `.jsonl` ↔ one live Item: `for(url)` :32, `open()` :44 tails through `ext/JSONL/live.js` `stream()`, `attach(host)` :118 records every `delta`, `append` :156 / `flush` :163 write through `FsFile.send` | `JSONL` below |
| `core/Page/Reader.js:14` `Page.Reader extends Store` | page.jsonl reader with its own `open`/`close` | Store.open |
| `ext/JSONL/JSONL.js:5` `class JSONL`, `:129` `TaskJSONL` | a second replayer: verbs (`assign`, `log`, `ask`, `decision`…), `live()` :51 through the same `stream()` | Store (the converge note) |
| `ext/filesystem/FsFile.js:94,108,160` | `append`/`write` over the dev socket (`rpc:append`, `rpc:write`) | — |
| `Server/plugins/SocketServer/Append.js:51` `rpc:append` | validates (`jsonl-schema.mjs`) and appends for the browser | the three below |
| `.claude/hooks/append.mjs` (the `log` tool) | validated append for agents, picks `session.jsonl` vs `task.jsonl` | Append.js |
| `Servex/agents/page_tools.js` `write_line()`, `item` tool :342, `tasks.add` :604 | page/item tools write one line each | Append.js |
| `core/Page/doc/storage.md` (2026-10-13) | **designed, not built**: `Store` + `Backend` (Dev/Static/Memory/Cloud) + server `Journal` (`FileJournal`, `RoomJournal`, `D1Journal`, `Archive`); slice 1 brief `storage-slice-1.md` never ran (`core/Item/backend/` does not exist) | — |

### The dated breakout (making and moving `YYYY/MM/DD/<slug>/`)

| File:line | What it does | Dup |
|---|---|---|
| `core/Session/Day.js:4` `class Day` | the one day rule (owner's local day); `of()`, `path()` | — |
| `core/Session/Session.js:12` `class Session extends Item` | `root_url` :44, `day` :46, `scan()` :53 (finds every dated folder and its id), `locate()` :72 | TaskDirs, AISessionIndex.session_dirs |
| `Server/TaskDirs.mjs:29` `class TaskDirs` | `dir()` :57 / `make()` :65 make a task folder; `normalize` :74, `find` :97, `follow`/`map` :100–118 (move redirects), `census` :157 | Session.scan |
| `Server/ProjectMove.mjs:21` | `git mv` a project into `<module>/projects/YYYY/MM/DD/<slug>/`, appends a `project` line to the day `index.jsonl` itself, undo | TaskMove, SessionDayMove |
| `Server/SessionDayMove.mjs:26` | re-files folders to the right local day; `patch_day()` :74 rewrites two day `index.json` files | ProjectMove |
| `Server/TaskMove.mjs:64` | the one-off port of `ai/YYYY-MM-DD/` into the store (done, reversible) | — |
| `Servex/agents/Agents.js:887` `open_task()` | makes a spawned agent's folder + line 1 through `TaskDirs.normalize` | TaskDirs.make |
| `Servex/ext/remote/RemoteMCP.js:170` `voice_session()` | makes `cloud-voice-<name>/` + its `session.jsonl` | TaskDirs.make |
| `.claude/hooks/session-page.mjs:28` | a VS Code tab's `session.jsonl` line 1 | TaskDirs.make |

### Indexes (four writers, three shapes)

| File:line | Writes | Read by |
|---|---|---|
| `Server/AIIndex.mjs:21` (`--watch`, kept alive by TaskLoop) | `ai/index.json` (2.4 MB: every task row with computed state, cards, asks, agents) + `ai/index.jsonl` (change lines, cut at 200 :29) | the AI board / Inbox (refetches the whole file per line) |
| `Server/AIIndexStream.mjs:10` | day `sessions/YYYY/MM/DD/index.jsonl`: one pointer line per created or changed task/session (`file()` :14, append :21); gitignored | browsers tailing today |
| `ai/AISession/AISessionIndex.mjs:32` | per-session `index.json` + `cache.jsonl`, day `index.json` (snapshots, `closed`), month/year `index.json` (`roll`), `record_snap` :106; calls AIIndexStream for sessions (`stream_line` :297) | sessions grid (files mode), `session-query.mjs` |
| `Server/SessionIndex.mjs:17` | nothing on disk: every `task.jsonl` in memory, `query()` :187, registers Query source `tasks` :209 | `QueryClient("tasks")`, PastWork, FollowUp |

### Query

| File:line | What it does |
|---|---|
| `ext/Query/Query.js:4` | a plain-JSON query (`where`, `sort`, `offset`, `limit`, `sum`) over an array; node and browser, no imports |
| `ext/Query/QueryServer.mjs:13` (`Server/run.js:39`) | named in-memory sources, `rpc:query`, pushes `query_row` / `query_stale`; dev server only |
| `ai/AISession/AISessionTailer.mjs:15` | source `sessions` |
| `Server/session-query.mjs:26` | CLI: reads every day `index.json` itself (a third reader of the same files) |

**What duplicates what, in one line each:** two replayers (`Store`, `JSONL`); four validated-append paths; three folder makers (`TaskDirs`, `Session`, the three creators that each write line 1 their own way); three movers with three manifest formats; four index writers with two day files (`index.json` snapshots and `index.jsonl` pointers) plus one global `index.json`; two query paths (Query sources and `session-query.mjs`).

---

## 2. The class architecture

Owner's names kept: **store**, **index** (never "state"), **query**, **project**, **session**, **task**, `session.jsonl` / `task.jsonl` / `project.jsonl`. The one new name is **`Dated`**, for what the owner called "the YYYY/MM/DD breakout" and "a chronological data set, a log" (no better name was given). Alternatives considered: `Chronicle` (pretty, but says nothing about folders), `Timeline` (a UI word), `DayTree`, `Log` (already means a `.jsonl`), `DatedStore` (collides with `Item.Store`). Rename is cheap until slice 1 lands.

```js
// ── core/Item: portable (browser + node, no node imports) ─────────────────────────────
class Item                         // EXISTS. one thing; set(delta); children save through their parent
  store: Item.Store                // EXISTS. one log ↔ one live object; replay, record, tail
    backend: Backend               // DESIGNED in core/Page/doc/storage.md, slice 1: how the lines are reached
      DevBackend | StaticBackend | MemoryBackend    // localhost live / production read-only / tests and demos
                                   // JSONL files are the first format; a Durable Object or D1 is another backend

class Dated                        // NEW. one collection filed by day: <root>/YYYY/MM/DD/<slug>/
  root, kind                       //   "ai/sessions/", "session" · "<module>/projects/", "project"
  path(day, slug)                  //   the folder rule (Day.path + slug); TaskDirs.dir and Session.day call this
  day(d): Dated.Index              //   the day's index, opened through Item.Store → live() for free
  month(m) / year(y)               //   roll-ups: load a month as one chunk (section 3's "archiving, filtering")
  rows(spec): rows[]               //   index rows for a range of days; ext/Query filters them (core never imports ext)
  static collections               //   registry: sessions, each module's projects

class Dated.Index extends Item     // NEW (helper class in Dated.js). <day>/index.jsonl replayed: one pointer row per item
  rows: List                       //   { id, kind, path, title, state, at }: points, never copies (section 10)
                                   //   it IS a JSONL log, so any page tails it like any other Item

// ── Server: node only (fs, git, watch) ──────────────────────────────────────────────────
class FileJournal                  // DESIGNED in storage.md, slice 2: the ONE validated append
                                   //   folds Append.js, append.mjs, page_tools write_line, Servex append_log

class DatedFiles extends Dated     // NEW, Server/DatedFiles.mjs. THE ORCHESTRATOR: the one set of operations
  create(spec)  → { dir, id }      //   mkdir + line 1 (session.jsonl | task.jsonl | project.jsonl) + the index row, one call
  move(item, to)→ { from, to }     //   git mv + an index row on BOTH days + one manifest line; undo(run)
  query(spec)   → { rows, total }  //   rows(spec) through Query.run (node may import ext/Query)
  check()       → { ok, diff }     //   rebuild from the folders, diff with the index; fails loudly (never out of sync)
  watch()                          //   safety net: a log written by any other path (state change) appends its row
  static tools()                   //   create/move/query as SDK + MCP tools (like ProjectMove.tool() today)
  static socket(socket)            //   the same three as rpc:dated_create / dated_move / dated_query
```

**What composes what:** a `Dated` holds many `Dated.Index` (one per day), each an `Item` read through `Item.Store`. `DatedFiles` extends `Dated` and writes through `FileJournal`. `Session`, `Task` and `Project` stay what they are (Items); each learns its home through one static, `static dated = "sessions"`, never by building a path itself.

**Who orchestrates:** `DatedFiles`. Servex keeps one instance per collection alive (`watch()`), and `TaskLoop` notices when its watcher dies (the 16:01 dead-watcher finding, section 10).

**Who calls it:** the `log`, `item`, `spawn_agent` (`open_task`), `register_session` (`voice_session`) and session hook paths call `create`; `ProjectMove` and `SessionDayMove` become `move`; the sessions grid, the Inbox, `session-query.mjs` and "everything in flight" call `query`.

**What becomes what:**

| Today | Becomes |
|---|---|
| `TaskDirs.dir/make`, `Session.root_url/day/scan/locate`, `AISessionIndex.session_dirs` | `Dated.path` / `DatedFiles.create` / `Dated.rows`; the old names stay as one-line shims (TaskDirs' redirect `map` stays) |
| `ProjectMove`, `SessionDayMove` | `DatedFiles.move` (one manifest format); `TaskMove` stays as the finished one-off port |
| `AIIndexStream` (day `index.jsonl`) | `Dated.Index` (same file, same pointer rows; the format already fits) |
| `AISessionIndex` day/month/year `index.json` | `Dated.month/year` roll-ups; AISessionIndex keeps only following transcripts (totals) |
| `SessionIndex` source `tasks`, `AISessionTailer` source `sessions` | Query sources over `DatedFiles.query` |
| `ai/index.json` (2.4 MB) | the Inbox asks a query; the file shrinks to `AIIndex`'s self-check (two independent counts must agree) |
| `ext/JSONL` `JSONL`/`TaskJSONL` | unchanged now; converges onto `Item.Store` later (its own task) |

**Where it lives** is decided, written by `Server/Decide.mjs` as `d-dated-home` in this task's [session.jsonl](../../../ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/session.jsonl): **core/Item** (portable `Dated.js`) + **Server** (`DatedFiles.mjs`), ranked over growing `core/Session` (a project is not a session), `ext/JSONL` (would tie the breakout to one store format; core cannot import ext) and Server-only (the static site could not read the rule or tail the index).

---

## 3. Coverage check against the owner's words

One row per ask in section 15 (the data/store parts; the voice-agent, skills and sessions-UI bullets belong to other tasks and are marked so) and section 3.

| The owner's ask | Where the plan covers it | Status |
|---|---|---|
| **15** Session data is the AI truth; "everything in flight" is a query, not memory | `DatedFiles.query({ state: "running" })` over sessions and tasks; slice 3 adds the query page | covered |
| **15** Track precisely, never duplicate the raw log; obvious the full version is in the raw log | index rows are pointers (`path`); a session row keeps its transcript path (as SessionIndex's `raw` does) | covered |
| **15** The index per path is managed by code, never out of sync | `create`/`move` write the row in the same call; `watch()` catches other writers; `check()` diffs and fails loudly | made stricter (a check, not only a watcher) |
| **15** "Probably" a portable system: the YYYY/MM/DD breakout as a class that creates indices by date and answers queries | `Dated` (portable) + `DatedFiles` (node) | covered |
| **15** One JSONL database: create sessions, tasks, projects through the SDK/MCP tools | `DatedFiles.tools()` | covered |
| **15** The UI route through the dev socket triggers the same operations | `DatedFiles.socket()`: the same three methods | covered |
| **15** Moves re-indexed | `move` writes a row on both days + a manifest line | covered |
| **15** Queries use the indexes | `rows(spec)` reads day/month indexes first; item logs only on demand | covered |
| **15** "Kind of feels like" core/Item; JSONL is one store, swappable | `Dated` in core/Item; swapping = `Item.Store` backends from storage.md (slice 4) | covered |
| **15** Any item gets real-time updates | already true for any Item opened through `Store.open()`; `Dated.Index` is an Item, so indexes stream too | covered |
| **15** Subscribe to a parent vs a child alone ("not really that important") | not planned | dropped for now: the owner ranked it low; noted in [next.md](next.md) |
| **15** One place for the JSONL docs (remembered in core/Page) | section 5 | covered |
| **15** Plan, check the plan against the prompt, then build | this document; this table | covered |
| **15** Voice agent speed, skills tracking, a live sessions UI | other tasks (cloud-voice-agent.md, system architect, sessions page) | out of scope here |
| **3** The YYYY/MM/DD breakout is one system, not two copies of the folder logic | one `Dated` class; sessions and projects are two instances | covered |
| **3** Archiving, loading a month as a chunk, filtering, indexing upgraded once for everything dated | `month()`/`year()` roll-ups, `query`, one index; archiving uses storage.md's `Archive` later | covered (archiving later) |
| **3** "Maybe an Item extension, like the page system's extensions" | made a collection class, not a `Page.use()`-style extension | changed: the breakout is about the collection (folders, index), not one item; each item only names its collection (`static dated`) |
| **3** (earlier note) "judged over-engineering for now" | superseded by section 15, which asks for it | superseded |
| **10** Names say the class; "index", never "state"; an index points, never copies | `index.jsonl` pointer rows; items keep `session.jsonl` / `task.jsonl` / `project.jsonl` | covered |
| **11** One log tool; agents never append by hand | `FileJournal` (slice 5) is the one append | covered |
| **12** Items save through their parent; breakout by need | unchanged (`Item`); `Dated` is only for items that own a folder | covered |
| **13** Indexing is the tool's job | `create`/`move` index themselves | covered |

How it could be better (the second half of the check): the plan still leaves two day files (`index.json` snapshots for the static site, `index.jsonl` pointers). Slice 6 decides whether the static site can read the pointer file plus each session's own summary instead; until then the snapshot file stays, because it is the only read path with no node behind it.

---

## 4. Slices, smallest first

Each is one Sonnet task in a worktree, merged after review. The first proves the whole chain on the smallest collection.

| # | Slice | Proof | Budget |
|---|---|---|---|
| 1 ✅ | **`Dated` + `DatedFiles` for projects only:** `create`, `move` (ProjectMove's body moves in), `query`, `check`; the tool and the socket rpc; doc home (section 5) | `Dated.test.mjs` (create → row → query finds it → move → both days → check ok); a page `/framework/core/Item/Dated/` that shows the projects query and updates live when a project is created | $6 |
| 2 ✅ (deviations: `Session.scan/locate` still walk names themselves; `SessionDayMove` keeps its manifest/apply/undo, so it is not yet `move`) | **Sessions on `Dated`:** `TaskDirs.dir/make`, `Session.scan/locate/day`, `open_task`, `voice_session`, the session hook call `create`; `SessionDayMove` becomes `move` | `TaskDirs.census()` and `Session.scan()` give identical output before and after; `check()` ok on the whole store | $6 |
| 3 ✅ (deviation: headline count is "working now" = last 5 min, not Servex working; live data needs a dev-server restart) | **Queries through `Dated`:** sources `sessions` and `tasks` read `DatedFiles.query`; `session-query.mjs` calls it; an "in flight" query page | the sessions grid in remote mode unchanged; `ext/Query/check.mjs` passes; in-flight count = `list_agents` working count | $5 |
| 4 | **Store backends** = storage.md slice 1, unchanged brief ([storage-slice-1.md](../../Page/doc/storage-slice-1.md)); independent, may run beside 1–3 | `Store.test.mjs` (its brief lists a–e) | $6 |
| 5 | **`FileJournal`:** one validated append for Append.js, append.mjs, page_tools, append_log (storage.md slice 2) | every writer's line passes the same schema check; a refused line refused everywhere | $5 |
| 6 | **Inbox off `ai/index.json`:** the board asks a query; `index.json` shrinks to AIIndex's self-check; decide the static-site day file | board identical with the 2.4 MB file absent from its fetches; AIIndex `--print` check passes | $5 |

Order: 1 → 2 → 3 → 6, with 4 and 5 alongside. The 539 module tasks (`<module>/tasks/` → `projects/`) move by script after slice 2, once the decision that [owner-2026-10-20-projects-and-completion.md](../../Task/doc/owner-2026-10-20-projects-and-completion.md) section 2 asks for is written.

---

## 5. One doc home for the JSONL store

**The page: [core/Page/doc/jsonl.md](../../Page/doc/jsonl.md)**, where the owner remembers it (Page extends Item, so it is the same system). Slice 1 gives it a short first section, "The store", that says what a `.jsonl` is, who writes it (`FileJournal`), who reads it (`Item.Store`), and links [storage.md](../../Page/doc/storage.md) (the classes) and this plan.

**The two pointers:**

- [core/Item/readme.md](../readme.md): its persistence lines become one line: "Saving to a `.jsonl`: [core/Page/doc/jsonl.md](../../Page/doc/jsonl.md)."
- [ext/JSONL/readme.md](../../../ext/JSONL/readme.md): its converge note becomes one line pointing there; the `TaskJSONL` verb reference stays, because it documents that class's API, not the store.

## The owner, 2026-10-20 19:20: one data system for every log kind

`ai/whisper/<date>.jsonl` is a second dated system, and that is the thing to stop: nobody rebuilds date folders, indexing or querying for a new kind of log. The sessions data system (JSONL records, the live tail, the streamed index, the server-side query, and the DataGrid that renders rows) is **one system**, and any new log kind (Whisper, a voice session, a project) is one more collection on it. The rendering belongs in the same system: one grid for any collection. Whisper is the first test case once slice 2 lands. For now the owner tolerates a demo with its own save folder if it works; the raw Whisper lines may prove useless once the flow is understood (perhaps only prompts get saved), so no persistence work beyond a temporary bucket per session.
