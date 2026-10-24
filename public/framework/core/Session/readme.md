# core/Session

A `Session` is one run of an agent or a tab: an Item that lives in its own dated folder, `<root>/YYYY/MM/DD/<slug>/`, and owns a list of tasks. Decisions: [doc/architecture.md](doc/architecture.md).

Session is mainly an AI session class (not a web login session), so it probably belongs in the framework/ai module; not moved yet. (The owner, 2026-10-23.)

## Snapshot

```js
// Session.js (default export)
class Session extends Item                       // ../Item/Item.js; registered as "Session"
  static days, slugs: Map   // id -> "YYYY/MM/DD" / folder name. A subclass declares its OWN (statics inherit by reference)
  static scanned: boolean   // true once scan() has read the tree
  static MENU, SETTINGS     // the session menu template and its settings form (doc/menu.md)
  menu(url), settings       // MENU with urls; {"settings":{…}} lines merged, a later line wins
  id                        // from the constructor, or line 1 of the log
  tasks: List<Task>         // made on first use; setter allowed
  completion: number        // getter, 0..1 = done / total, 0 when there are no tasks. Never stored
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
- **Test:** `node Session.test.mjs` (tasks, progress, replay, `Day`). Demo page: `page.js`.

## What item() answers for a session

`item({path: <session url>})` replays the folder's `session.jsonl` as a `Session` (any record whose line 1 is `{"session":{…}}`, so VS Code tabs too), and `session_state` in `Servex/agents/page_tools.js` adds what node can compute. Nothing here is stored; every field is read from records on each call.

| Field | What it is | Read from (written by) |
|---|---|---|
| `cost.own` | the session's own Claude spend: `usd`, `parts` (in, out, cache read, cache write), `active_ms`, `models`, `through` (last transcript line's time), `read_to` (bytes read), `at` | the newest `{"summary"}` in the folder's `cache.jsonl` (`AISessionIndex` reads the transcript's new bytes, `ai/AISession/AISession.js`). `null` until that cache exists |
| `children` | child agent sessions as a tree: `{id, parent, role, state, cost, total, children}` (`total` = its own plus everything under it) | the Servex registry: every agent whose task folder is inside this folder (`Agents.agents_under`, wired as `Session.agents_resolver`), nested by `parent` |
| `cost.children`, `cost.total` | the children's spend; own plus children | the agents' own logs (`turn_cost` lines, `Agents.logged_cost`) |
| `cost.tasks`, `biggest` | spend per task folder (each folder once), and the five costliest tasks | `Task.cost` (the agents of the task's `path`) |
| `counts.direct`, `counts.all` | `{created, started, complete, stopped}` for the session's own tasks, and for every task below it | the replayed tasks |
| `progress`, `completion` | done of total, stopped tasks left out | `Task.progress_of` |
| `first_at`, `last_at`, `span_ms` | when the record began and last changed | the lines' own times |

Test: `node Servex/agents/session-state.test.mjs`.

## Rules (the owner, 2026-10-20, 16:15)

1. **A session has tasks**, plain tasks or projects (a project is a task with subtasks). A session gets a folder; a task is lines in the session's log. *Built:* `session.tasks`.
2. **Its completion is computed from its tasks**, never typed in: `completion` is the share of tasks in state `complete`. *Built.* One gap: with no tasks it reads 0, and nothing marks the session itself finished.
3. **A session is never marked complete while a loose end exists.** If something is left over, add a task for it instead of closing. *Not built yet:* no code refuses a close. Queued as step 5, "Task as a line", in [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md).
4. **The session system should be portable** (the owner, 2026-10-20, session-e00f55c9 prompt line 1931): "a reusable, portable system, closer to a dev server than a Servex thing". *Not built yet:* `Session` and `Day` need only `Item` and a dated folder, but the writers (the SessionStart hook, `prompt-relay.mjs`, the item tool) live in this repo's `.claude/hooks` and `Servex/`, so another project cannot use it on its own.

## More

- [doc/prompt-tasks.md](doc/prompt-tasks.md): each owner prompt's work arrives as proposed tasks on the session page, live, with Approve and Reject (`SessionTasks.js`, Servex's `PromptTasks`)
- [doc/menu.md](doc/menu.md): the session menu, a template (`Session.MENU`, settings first) drawn at the right end of the session's name line; settings saved as lines in `session.jsonl`
- [doc/architecture.md](doc/architecture.md): decisions and why
- [Dated folders shared by sessions and projects](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md)
