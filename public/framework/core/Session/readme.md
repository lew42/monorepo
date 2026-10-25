# core/Session

A `Session` is one run of an agent or a tab. **It is a Task** (`Session extends Task`, since 2026-10-24): it has Task's states, completion and `tasks` list, and adds a dated folder of its own, `<root>/YYYY/MM/DD/<slug>/`. Its tasks can be plain tasks, projects, processes and child sessions. Decisions: [doc/architecture.md](doc/architecture.md); the move to a Task: [doc/session-is-a-task.md](doc/session-is-a-task.md).

Session is mainly an AI session class (not a web login session), so it probably belongs in the framework/ai module; not moved yet. (The owner, 2026-10-23.)

## Snapshot

```js
// Session.js (default export)
class Session extends Task                       // ../Task/Task.js (Task extends Item); registered as "Session"
  static days, slugs: Map   // id -> "YYYY/MM/DD" / folder name. A subclass declares its OWN (statics inherit by reference)
  static scanned: boolean   // true once scan() has read the tree
  static MENU, SETTINGS     // the session menu template and its settings form (doc/menu.md)
  menu(url), settings       // MENU with urls; {"settings":{…}} lines merged, a later line wins
  id                        // from the constructor, or line 1 of the log
  tasks: Task.List          // Task's list: add("a title"), add({title,…}), add({type: "Project"|"Process"|"Session", …}); each child knows created_at (its line's time)
  state, completion         // Task's getters; state comes from the record's own {"start"}/{"stop"} lines, completion = done / total of its tasks. Never stored
  progress(): {done,total,stopped}  // Task.progress_of(this._tasks), the one counting code; a stopped task counts in neither done nor total
  first_at, last_at, span_ms  // from the lines' own times, never stored
  static agents_resolver    // node wires it (Servex/agents/Agents.js agents_under): dir -> [{id, parent, role, state, cost, …}], the agent sessions whose task lives in that folder
  static replay(lines)      // Item's loop; replay_new takes the id from {"session":id}; replay_line applies one line
  static root_url(): URL    // ../../ai/sessions/ ; subclasses override
  static day(first_at)      // "YYYY/MM/DD" via Day.path, or null
  static dir_url(id, day?)  // sync: the dated folder, else the old flat <id>/
  static async scan()       // node: reads every dated folder once, learns id -> day/slug
  static async locate(id, first_at?, slug?)  // node: the folder to WRITE into; never makes a second one

// Day.js: class Day, static of(t) "YYYY-MM-DD", path(t) "YYYY/MM/DD" - the owner's LOCAL day, never UTC
```

- **Lines it replays:** `{"stop":{why}}` and `{"start":{}}` (the session's own state; a start clears the stop's why), `{"session":id}`, `{"tasks":{"add":…}}`, `{"task":"<ref>"}` (a live child task), `{"<task id>":{…}}` (goes to that task), `{"settings":{…}}` (merged into `settings`), `{"decide":{task,is}}` (the owner's Approve, Reject or Make it a project on a waiting task, [doc/prompt-tasks.md](doc/prompt-tasks.md)), and any other key is set on the session. `by`, `ts` and `at` are dropped.
- **Subclasses:** `AISession` (`ai/AISession/AISession.js`) adds cost, cache and transcript, and overrides `root_url()`. `RefineSession` is planned, not built.
- **Who calls it:** the item tool in `Servex/agents/page_tools.js` maps `session.jsonl` to `Session` and replays it; `ai/AIDashboard/SessionStore.js`, `AISessionIndex.mjs`, `AISessionLive.js`, `Server/State.mjs`, `Server/TaskDirs.mjs` and `Server/SessionDayMove.mjs` use it or `Day`.
- **How it loads:** a session's folder holds `session.jsonl`, written by `.claude/hooks/append.mjs`, `Agents.open_task` and the page tools, never by hand. Older folders are still found by `scan()` through `index.json`, `cache.jsonl` or the first `page.jsonl` line. Folder layout: [ai/sessions/readme.md](/framework/ai/sessions/readme.md).
- **Times are the lines' own.** While a line replays, `Task.clock` holds its `at`/`ts`, so a nested task's `completed_at` and duration are when it happened, not when the log was read.
- **Test:** `node Session.test.mjs` (tasks, progress, replay, `Day`); `node session-task.test.mjs` (a Session is a Task, `tasks.add` with a string or an object, totals from the children). Demo page: `page.js`.

## How work gets into a session

**An AI adds a task.** `item({path: "<session url>", delta: {"tasks": {"add": "Fix the tab bar"}}})` (a string, or an object with fields).
- The item tool (`Servex/agents/page_tools.js`) appends one line, `{"tasks":{"add":{"type":"Task","title":…,"id":…}}}`, to the session's `session.jsonl`, and answers `{ok, ids, line, now}` in milliseconds. It never returns the whole picture; a read (no delta) does that.
- `Session.replay` reads it. The session page's Overview (`ai/AISession/SessionFeed.js`) streams the same file, so the task shows at once.
- Test: `node Servex/agents/session_tasks.test.mjs`.

**An AI spawns a child session.** `spawn_agent` (Servex):
- `open_task` (`Servex/agents/Agents.js`) writes the child's line 1 into its task folder.
- `SessionRecord.link_parent` appends `{"task":"<child folder url>"}` to the parent's record.
- A child whose folder is **outside** the parent session's folder gets its line from `ChildLinks.link` (`Server/ChildLinks.mjs`, called by `open_task`): `{"task":"<child folder url>","as":"<agent id>"}` on the parent session's record, found by `parent_session`. `SessionRecord.add_ref` never writes the same reference twice. So the parent's numbers come from its own references, and a finished child moves its completion.
- `node Server/ChildLinks.mjs` is the backfill for children spawned before this: a dry run by default (one line per child: session, folder url, agent, and what it would do), `--apply` appends. It covers every registry row with `parent_session`, plus older rows matched by name for session-e00f55c9.
- Tests: `node Servex/agents/child-links.test.mjs`.
- The registry row records `parent_session`, the parent's session id at spawn.
- `Agents.agents_under` finds the child for the parent's cost and children. It matches `parent_session` exactly, and older rows by the parent's name within the parent's span.
- The child shows on the parent's page as the task it carries, with its model, cost and a link to its own session page.

**References.**
- A session is named by its **session id**: its page is `/framework/ai/sessions/<id>/`, and a child names its parent by `parent_session`.
- A task is named by its **path**: `{"task": "<folder url>"}`.
- `Session.locate(id)` turns an id into its folder.

**A session stays on the day it began.** `DatedFiles.session_dir` looks back 31 days for the session's folder before it makes one (4 until 2026-10-24, which split session-e00f55c9 across 10/20 and 10/24). `TaskDirs --new` uses it, so it never opens a second day's record. The session page also reads a session's folders on later days.

**One source of truth: the file.**
- The `.jsonl` record is the only truth.
- The dev server, Servex and the browser each replay it, and keep no edits of their own.
- Every write is an append: through the item tool, or `append.mjs` for a hook.
- A number (cost, counts, completion) is computed from the records when it is read, and never written down.

## What item() answers for a session

`item({path: <session url>})` replays the folder's `session.jsonl` as a `Session` (any record whose line 1 is `{"session":{…}}`, so VS Code tabs too), and `session_state` in `Servex/agents/page_tools.js` adds what node can compute. Nothing here is stored; every field is read from records on each call.

| Field | What it is | Read from (written by) |
|---|---|---|
| `cost.own` | the session's own Claude spend: `usd`, `parts` (in, out, cache read, cache write), `active_ms`, `models`, `through` (last transcript line's time), `read_to` (bytes read), `at` | the newest `{"summary"}` in the folder's `cache.jsonl` (`AISessionIndex` reads the transcript's new bytes, `ai/AISession/AISession.js`). `null` until that cache exists |
| `children` | child agent sessions as a tree: `{id, parent, role, state, cost, total, children}` (`total` = its own plus everything under it) | the Servex registry: every agent whose task folder is inside this folder, plus every agent the session spawned since it began (by `parent_session`, else its name and span) and their descendants (`Agents.agents_under`, wired as `Session.agents_resolver`), nested by `parent`. An agent's cost counts only its turns since the session began |
| `cost.children`, `cost.total` | the children's spend; own plus children | the agents' own logs (`turn_cost` lines, `Agents.logged_cost`) |
| `cost.tasks`, `biggest` | spend per task folder (each folder once), and the five costliest tasks | `Task.cost` (the agents of the task's `path`) |
| `counts.direct`, `counts.all` | `{created, started, complete, stopped}` for the session's own tasks, and for every task below it | the replayed tasks |
| `progress`, `completion` | done of total, stopped tasks left out | `Task.progress_of` |
| `first_at`, `last_at`, `span_ms` | when the record began and last changed | the lines' own times |

**Recompute only what changed.** A child record's parsed lines are kept by file and reused while the file keeps the same size and modified time (`lines_of` in `page_tools.js`, used by the node resolver). So a read re-reads and re-parses only the child files that changed. Every replay still builds fresh task objects from those lines, because a kept object would have the parent's lines addressed to it (`{"<child id>":{…}}`) applied again on each re-replay; the parent's totals (progress, completion, counts) are added up on every read from the children it holds. Time to answer `{"summary":{}}` on session-e00f55c9 (101 child records) right after one child file changed, measured back to back in the same conditions: about 140-285 ms without the cache, 76-99 ms with it. Keeping whole child objects measured 12-20 ms when the machine was quiet, but was dropped for the double-apply bug; it could return if a parent line that addresses a child evicted that child's entry. The cache holds at most 4000 files. Test: `node Servex/agents/ref-cache.test.mjs` (it builds a scratch tree in the OS temp folder: `SERVEX_PUBLIC` points the item tool's `public/` at it).

**Completion at once, for any session.** `item({path: "/framework/ai/sessions/<uuid>/", delta: {"completion": {}}})`, or the dated folder's url, answers `{ok: true, answer: {completion: {done, total, stopped, completion}}}`: the tally of its tasks' current states and the number. It only reads and writes nothing. It works for a past session too, as long as its folder holds a record; a folder with no record is refused, and nothing is written. On session-e00f55c9: `{done: 30, total: 132, stopped: 74, completion: 0.227}`.

Test: `node Servex/agents/session-state.test.mjs`.

## Rules (the owner, 2026-10-20, 16:15)

1. **A session has tasks**, plain tasks or projects (a project is a task with subtasks). A session gets a folder; a task is lines in the session's log. *Built:* `session.tasks`, and since 2026-10-24 a session is itself a Task.
2. **Its completion is computed from its tasks**, never typed in: `completion` is the share of tasks in state `complete`. *Built.* One gap: with no tasks it reads 0, and nothing marks the session itself finished.
3. **A session is never marked complete while a loose end exists.** If something is left over, add a task for it instead of closing. *Not built yet:* no code refuses a close. Queued as step 5, "Task as a line", in [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md).
4. **The session system should be portable** (the owner, 2026-10-20, session-e00f55c9 prompt line 1931): "a reusable, portable system, closer to a dev server than a Servex thing". *Not built yet:* `Session` and `Day` need only `Item` and a dated folder, but the writers (the SessionStart hook, `prompt-relay.mjs`, the item tool) live in this repo's `.claude/hooks` and `Servex/`, so another project cannot use it on its own.

## Open items

- Auditing the completion of every past session is later.

## More

- [doc/prompt-tasks.md](doc/prompt-tasks.md): each owner prompt's work arrives as proposed tasks on the session page, live, with Approve and Reject (`SessionTasks.js`, Servex's `PromptTasks`)
- [doc/prompt-breakdown.md](doc/prompt-breakdown.md): a prompt files as one outcome task with its asks as subtasks (`PromptRecords.file()`), the measure, and the gap in what the tab sees
- [doc/menu.md](doc/menu.md): the session menu, a template (`Session.MENU`, settings first) drawn at the right end of the session's name line; settings saved as lines in `session.jsonl`
- [doc/architecture.md](doc/architecture.md): decisions and why
- [Dated folders shared by sessions and projects](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md)
