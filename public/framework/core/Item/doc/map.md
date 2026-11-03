# The item system: every class, store, tool and writer that makes or saves items (map, 2026-10-22)

An **item** is a thing kept as one JSONL log: line 1 says what it is, later lines are deltas, `Item.set(delta)` replays them. The same class runs in the browser and in node (`Servex`), so one validation serves both. Principles and API: [readme.md](../readme.md), [architecture.md](architecture.md), the tool: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md). This page is only the map: who makes an item, who saves it, who reads it back. Checked against the code on 2026-10-22; `grep -rn "extends Item" public/framework` lists the classes again.

## The classes (what an item is)

| Class | File | Is | Log file |
|---|---|---|---|
| **Item** | `core/Item/Item.js` | id, data bag, `set(delta)` (a method key calls it, a child key walks in, else assigns), `store`, `live()` | any `*.jsonl` |
| **List** | `core/List/List.js` | an ordered, announcing collection of Items | inside its parent's log |
| **Page** | `core/Page/Page.class.js` (+ parts, `PageInbox.js`, `Reader.js`) | an Item with a url, parts and layout | `page.jsonl` |
| **Task** | `core/Task/Task.js` | state machine, subtasks nested in the parent's log or a child folder, `Task.replay`, `from_ref` | `task.jsonl` |
| **Project** | `core/Task/Project.js` | a Task with six stages and a folder | `project.jsonl` |
| **Session** | `core/Session/Session.js` (+ `Day.js`) | a time-based record in its own dated folder | `session.jsonl` (older: `task.jsonl`) |
| **Panel**, **Block** | `ext/Panel/`, `ext/editor/blocks.js` | layout and editor pieces | in a page |
| **Dated** | `core/Item/Dated.js` | not an Item: a collection filed `<root>/YYYY/MM/DD/<slug>/` with an index of pointer rows | `<root>/YYYY/MM/DD/index.json` or `.jsonl` |

## The stores and writers (how it is saved)

| Piece | File | Job |
|---|---|---|
| **Item.Store** | `core/Item/Store.js` | replays, appends and tails one JSONL file; `Item.Store.for(file)` is the one cached root per file in node, re-read when the file changes |
| **RecordWriter** | `core/Item/RecordWriter.js` | the caller's side of the one writer for a `session`, `task`, `page` or `improvements.jsonl` line. In the browser the default road (`Store.channel = "item_api"`) posts to Servex's `POST /api/item` (`record_lines` or `run_item`), which applies it to the live root, runs its hooks, then appends; what Servex did not take goes over the dev server socket (numbered, acked, resent, [transport.md](transport.md)), and `Store.channel = "socket"` sends all of it there. Node callers (the hooks, `append.mjs`) still post to `/api/item` ([one-writer.md](one-writer.md)) |
| **FsFile** | `ext/filesystem/FsFile.js` | the browser's one file API (`FsFile.send`): the store's write for a file that is not a record, and its fallback for one that is |
| **LogLine** | `Server/LogLine.mjs` | the one node writer of a JSONL line: validated against `.claude/hooks/jsonl-schema.mjs`, stamped, appended. Callers: `append.mjs` (CLI), the `log` tool, `dir_log`. In Servex a record file's line goes through `LogLine.writer` = `record_lines`; `LogLine.raw` is Servex's own whole lines (alerts, worktree assigns) by the same road |
| **SessionRecord** | `Server/SessionRecord.mjs` | which file is a folder's record (`session.jsonl` or old `task.jsonl`), the tag verbs, the move script |
| **TaskDirs** | `Server/TaskDirs.mjs` | where a task folder lives (inside its session, dated by the owner's local day) |
| **TaskHomes** | `Server/TaskHomes.mjs` | the index of every module's `tasks/` folder (`/tasks/task.jsonl`) |
| **DatedFiles** | `Server/DatedFiles.mjs` (extends Dated) | node half of Dated: creates, moves, queries and checks dated collections (projects, sessions) and keeps the day-index rows |
| **ProjectMove** | `Server/ProjectMove.mjs`, tool `move_project` | `git mv` a project into its module, rows on both days, a manifest |
| **Subpages**, **Promote** | `Servex/agents/Subpages.js`, `Promote.js` | page tools: make a subpage folder; promote a nested task to a folder |
| **page_tools** | `Servex/agents/page_tools.js` | `run_item` (the `item` tool), `record_lines` (raw lines), `serve_item` (`POST /api/item`), `page_set/add/call/log/read`; `RULES` for task grouping; `link_refs` |
| **Local twin** | `Agents.js` `local_page_tools` | the same functions in-process as `mcp__local__*` |

## The tools that make or change items (agents call these)

- `item({path, delta})`: any Item class by the folder's log; no delta reads. Tasks: `tasks.add` files the task and its reference in the caller's own log.
- `page_set`, `page_add`, `page_call`, `page_log`, `page_read` (the same machinery, scoped to pages), `page_note`/`page_reply` (inbox).
- `log({path, line})` (a stamped line into a log through `LogLine`), `append_log` (Servex's own event logs), `dir_log`, `session_line`, `owner_note`, card tools (`create_card`, `card_set`: cards are page items).
- Shell route: `node .claude/hooks/append.mjs <file> <lines.json>`; direct `>>` into a `.jsonl` is blocked by `jsonl-guard.mjs`.

## Gaps and overlaps (for the plan)

- Two ways to write a line (`log`/`LogLine` for stamped event lines, `item` for deltas the class replays) and a third for pages (`page_*`). `page_*` is `item` on a page path; the aliases can go once callers move.
- `run_item` maps `task.jsonl`, `session.jsonl`, `page.jsonl` and `improvements.jsonl` to Task, Session, Page and Improvements (`FILE_CLASS`, `page_tools.js`), or line 1's `class` when `Item.types` registers it; every one gets the same live root and one-line write (build I, 2026-10-28, [Servex/doc/item-tool.md](/Servex/doc/item-tool.md)). Earlier, `item-tool.md` said Session was "class not built yet" (stale; fixed there). A Session folder made by `AISession` keeps its words in `page.jsonl`, so which class wins is decided by the files present.
- Cards, inbox, follows and claims are written by their own tools (`Cards.js`, `Follow.js`, `claims.js`, `ModuleInbox.js`) and are not Item classes; they are the groups the compacted-tools proposal would move behind `item` ([tools-map.md](/Servex/doc/tools-map.md)).

## How a change is saved: the browser and the item tool

The browser's road for every file but a record is the dev server socket: `Store.flush` → `Outbox` (`{client, n}`, ack, resend) → `Append.js` ([transport.md](transport.md)). A record file's lines (`Store.channel = "item_api"`, the default) go first to Servex's `POST /api/item`, the entry point the item tool uses, so its hooks run ([one-writer.md](one-writer.md)); the socket is their fallback. The task [ui-actions-as-deltas](../tasks/ui-actions-as-deltas/requirements.md) made a click send the verb.

| | Browser (a click on a page) | Item tool (an agent) |
|---|---|---|
| Who calls | `Item.set()` or a verb such as `task.start()`; the Store hears the `"delta"` event (`Store.attach`) | `item({path, delta})` → `run_item` (`Servex/agents/page_tools.js`) |
| What the line says | the **result**: `{"state":"running","started_at":…}` (`Task.start` calls `set`) | the **verb**: `{"start":{}}`, replayed by the class |
| Process and writer | `Store.flush` → `RecordWriter.post` → Servex `serve_item` → `run_item` (a task or session verb) or `record_lines` (a page line); fallback `FsFile.send` → `Append.js`, which skips a line already in the file | Servex: `write_line` → `fs.appendFileSync` |
| Validation | the file's JSONL schema only (`jsonl-schema.mjs` `check`) | the class: a key must be a method, a field or a child (`validate`) |
| Stamping | `by` = `owner`, `ts` = `RecordWriter.stamp()` (made in the tab, so a late fallback finds its own line) | `by` = the caller (`owner` for the owner), `ts` = now |
| After the write | the tab's own echo is skipped; other tabs get the line through `Tail.js` | node's live instance advances; `hooks.approved` (starts a templated task's agent) and `hooks.changed` (steps a process) fire; Follow tells subscribed agents |

So a click never starts the agent an approval should start, and a reader cannot tell who pressed it.
