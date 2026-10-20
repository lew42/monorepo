# The task system, in plain words (2026-10-19)

**Headline:** a task is a folder with a log file. Tasks live in two places that are only half linked: 1,097 in the session store, 497 in module folders. The owner's ideal is about 80% built; the missing piece is that a fresh agent in a directory is never *pointed* at that module's tasks.

## 1. What a task is today
- **A folder with one file, `task.jsonl`**: a log where each line is one fact ("started", "log this", "finished"). The current state is computed by replaying the lines ([core/Task](/framework/core/Task/), `Task.js`). States: idle, running, paused, waiting, stopped, complete.
- **Home A, the session store:** `public/framework/ai/sessions/YYYY/MM/DD/<session>/<task>/` ([task-folders.md](/framework/ai/doc/task-folders.md)). Made by `node Server/TaskDirs.mjs --new <slug>` (the `new-task` skill) or by Servex when it spawns an agent. 1,097 today.
- **Home B, the module:** `public/framework/<module>/tasks/<slug>/` (497 today). Made by the item tool (`tasks.add`), by `Server/TaskMigrate.mjs` (211 old tasks moved here) and `Server/UndoneToTasks.mjs` (229 idle tasks from asks never built).

## 2. What happened recently, and where to look
"One state" (10-17): `Server/State.mjs` reads **every** task in both homes and writes one file, `public/framework/ai/state.json`, so every count comes from one place and double-checks itself ([why](/framework/ai/doc/one-state.md)). "One dashboard, steps 1-3" (10-19): the Inbox, [/framework/ai/](/framework/ai/), now reads that file and filters it with chips (Live, New, Recent, Older, Needs you); the two old task pages became saved filters of it ([doc](/framework/ai/doc/one-dashboard.md)). Open [/framework/ai/tasks/](/framework/ai/tasks/) (live and today's tasks), [/tasks/](/tasks/) (module tasks) and [Lanes](/framework/ai/tasks/lanes/). Now: 1,353 landed, 289 idle, 473 stopped, 1 running.

## 3. The classes
```
class Task extends Item            core/Task/Task.js        one task: state machine, subtasks, replay of its log
class TaskView extends View        core/Task/TaskView.js    draws one task (chip, row, card)
class TaskPage extends Page        core/Task/TaskPage.js    the page of one task folder
class TasksPage extends Page       core/Task/TasksPage.js   a tasks/ folder, grouped by module (/tasks/)
class State                        Server/State.mjs         node: folds all tasks into state.json (no browser)
class AITask (template)            ai/AITask/AITask.js      the older viewer of a session task (log, chat, costs)
class DashState / DashChips        ai/rail/                 the Inbox list that reads state.json, with the filter chips
class Inbox.Rail extends Browse    core/Page/ext/Inbox/     the list-and-detail shell the Inbox uses
```
(AITask does not extend Task yet: two viewers remain.)

## 4. How data is pulled, and the split
`State` walks both homes with the same replay rules. **There is a split** (session store vs `<module>/tasks/`), linked by data in *one direction at a time*: a migrated module task lists its old sessions (`"sessions":[{id,task}]`, true for 493 of 497), and 117 old session tasks got a `{"home": url}` line pointing at the module. Everything created afterwards is linked only if the creator remembers.

## 5. Against the owner's ideal
- ✅ A task beside its module, surviving sessions: built for migrated and idle tasks.
- ✅ Task → sessions: built (`sessions` field). ⬜ Session → tasks: not recorded in the session; only inferred by scanning.
- ⚠ **Gap: a task an agent runs today is born in the session store**, not at the module, and nothing copies a pointer to the module. So 1,097 session tasks are mostly unlinked from modules.
- ⬜ **Gap: nothing shows an agent the module's tasks on arrival.** The readme chain, `load_module` and the module inbox (`inbox.jsonl`) do not mention `<module>/tasks/`. Agents find them only through `/tasks/`.

## 6. Smallest change, no second system
Use what exists: make `Server/TaskDirs.mjs --new` (and Servex's task opener) also append the one `{"task": ...}` reference line to the module's `tasks/` folder (the module is already known from the brief; `Task.from_ref` already follows it), and have `load_module` print that module's open tasks from `state.json` (one filter, `module=`). That gives task→module→session, and arrival visibility, with zero new files or pages.
**Alternative, rejected:** make every task be born in the module folder. It is purer, but it re-moves 1,097 folders and breaks every session path; the pointer gets the same result with none of that.

*Fixed in passing:* two stale lines in [ai/tasks/readme.md](/framework/ai/tasks/readme.md) (it said module homes were not read and nothing starts TaskState).
