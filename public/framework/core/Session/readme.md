# core/Session

A `Session` is one run of an agent or a tab: an Item that lives in its own dated folder, `<root>/YYYY/MM/DD/<slug>/`, and owns a list of tasks. Decisions: [doc/architecture.md](doc/architecture.md).

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
  progress(): {done,total}  // Task.progress_of(this._tasks), the one counting code (core/Task/Task.js)
  static replay(lines)      // Item's loop; replay_new takes the id from {"session":id}; replay_line applies one line
  static root_url(): URL    // ../../ai/sessions/ ; subclasses override
  static day(first_at)      // "YYYY/MM/DD" via Day.path, or null
  static dir_url(id, day?)  // sync: the dated folder, else the old flat <id>/
  static async scan()       // node: reads every dated folder once, learns id -> day/slug
  static async locate(id, first_at?, slug?)  // node: the folder to WRITE into; never makes a second one

// Day.js: class Day, static of(t) "YYYY-MM-DD", path(t) "YYYY/MM/DD" - the owner's LOCAL day, never UTC
```

- **Lines it replays:** `{"session":id}`, `{"tasks":{"add":…}}`, `{"task":"<ref>"}` (a live child task), `{"<task id>":{…}}` (goes to that task), `{"settings":{…}}` (merged into `settings`), and any other key is set on the session. `by`, `ts` and `at` are dropped.
- **Subclasses:** `AISession` (`ai/AISession/AISession.js`) adds cost, cache and transcript, and overrides `root_url()`. `RefineSession` is planned, not built.
- **Who calls it:** the item tool in `Servex/agents/page_tools.js` maps `session.jsonl` to `Session` and replays it; `ai/AIDashboard/SessionStore.js`, `AISessionIndex.mjs`, `AISessionLive.js`, `Server/State.mjs`, `Server/TaskDirs.mjs` and `Server/SessionDayMove.mjs` use it or `Day`.
- **How it loads:** a session's folder holds `session.jsonl`, written by `.claude/hooks/append.mjs`, `Agents.open_task` and the page tools, never by hand. Older folders are still found by `scan()` through `index.json`, `cache.jsonl` or the first `page.jsonl` line. Folder layout: [ai/sessions/readme.md](/framework/ai/sessions/readme.md).
- **Test:** `node Session.test.mjs` (tasks, progress, replay, `Day`). Demo page: `page.js`.

## Rules (the owner, 2026-10-20, 16:15)

1. **A session has tasks**, plain tasks or projects (a project is a task with subtasks). A session gets a folder; a task is lines in the session's log. *Built:* `session.tasks`.
2. **Its completion is computed from its tasks**, never typed in: `completion` is the share of tasks in state `complete`. *Built.* One gap: with no tasks it reads 0, and nothing marks the session itself finished.
3. **A session is never marked complete while a loose end exists.** If something is left over, add a task for it instead of closing. *Not built yet:* no code refuses a close. Queued as step 5, "Task as a line", in [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md).

## More

- [doc/menu.md](doc/menu.md): the session menu, a template (`Session.MENU`, settings first) drawn at the right end of the session's name line; settings saved as lines in `session.jsonl`
- [doc/architecture.md](doc/architecture.md): decisions and why
- [Dated folders shared by sessions and projects](/framework/core/Task/doc/owner-2026-10-20-projects-and-completion.md)
