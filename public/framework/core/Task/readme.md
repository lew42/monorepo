# Task — a DOM-free unit of work: id, title, a state machine, a computed duration and progress, a List of subtasks

## Status (verified 2026-10-19 against the code)

- **Built and tested:** the state machine, subtasks, replay of `task.jsonl` (`node Task.test.mjs`, 53 of 53 pass), `TaskView`, `TaskPage`, `TasksPage`, references between tasks (`Task.from_ref`), module homes made by the item tool's `tasks.add`.
- **Wired in:** `Server/AIIndex.mjs` replays every task through `Task.replay` into `ai/index.json`; Servex `open_task` and `TaskDirs --new` make the session-store folders that `Task` reads; the Inbox shows the result.
- **Wired in (2026-10-20):** [Project.js](Project.js) (`Project extends Task`: six stages, `completion` 0..1 = mean of subtasks, `Project.from_lines`; `node Project.test.mjs`, 9 of 9). `Server/ProjectMove.mjs` moves a project folder into a module and indexes it: [ai/tasks/doc/projects.md](/framework/ai/tasks/doc/projects.md).
- **Process:** [Process.js](Process.js) (`Process extends Task`: named steps node runs in series; `next()` decides, `Servex/ProcessRunner.js` writes the line and launches each step's session; one `tasks.add {process: "build"}` call creates one; or give your own `steps`). Templates, one subclass each in [processes/](/framework/servex/fs/?file=public/framework/core/Task/processes/): `build` (investigate to merge), `design` (Figma variants coded as pages), `investigate` (questions, scout, findings). The page, with a real run replayed live: [process/](process/). Design and status: [doc/process.md](doc/process.md); the names, decided: [doc/process-names.md](doc/process-names.md). Tests: [Process.test.mjs](Process.test.mjs), `node Servex/ProcessRunner.test.mjs`.
- **Concept only:** `AITask extends Task` (below), a `phase` field ([ai/doc/task-lifecycle.md](/framework/ai/doc/task-lifecycle.md)). **Not automatic:** a module home. `TaskDirs.dir()` does not know modules; only the item tool (an agent's choice), `TaskMigrate` (one-off) and `UndoneToTasks` (idle tasks from undone asks) put a task in `<module>/tasks/`.

## What it is

A `Task` is anything with a start, a middle and an end — a build step, a chore, a
process. It's an `Item` (core/Item/) plus six states (`idle running paused waiting stopped
complete`), timestamps, a running-time clock that pauses with the task, and a
`tasks: List` of subtasks whose own completion gates the parent's.

## Using tasks (the owner, 2026-10-21)

- **What becomes a task, and how it ends** (done with evidence, or documented): [doc/resolution.md](doc/resolution.md); where tasks get lost today: [doc/cracks.md](doc/cracks.md).

- **File each ask the first time it is heard.** When an owner prompt asks for something, the agent that reads it adds it to its session's record as a task (`tasks.add` with the item tool), or writes it as a one-line note in the readme it concerns when it is a rule or a preference rather than work.
- **A task is a proposal until accepted:** accepted, optional, an option (one of several ways), back-burner, or rejected, each with a one-line reason. Nothing is accepted only because it was asked.
- **A plan with several tasks to check off is a project** ([Project.js](Project.js)), not one big task; it lives in the session's record until it has a module home ([projects](/framework/ai/tasks/doc/projects.md)).
- **Plan before building:** list the tasks (or the project's steps) and check them against [past work](/framework/servex/fs/?file=public/framework/ai/past-work-index.md) before the first edit.
- **Loose ends found later stay apart:** the [prompt audit](/framework/ai/doc/prompt-audit.md) writes them beside the session, never into a finished session's tasks.

## Use

```js
import Task from "/framework/core/Task/Task.js";

const build = new Task({ id: "build", data: { title: "Build the thing" } });
const step1 = new Task({ id: "s1", data: { title: "Compile" } });
build.tasks.add(step1);

build.start();
step1.start(); step1.complete({ outcome: "step 1 done", evidence: ["Task.test.mjs"] });
build.complete({ outcome: "built", evidence: ["a1b2c3d"] });   // only works once every subtask is complete, and needs evidence

build.progress();         // { done: 1, total: 1 } — computed from tasks, never stored
build.duration();         // ms of RUNNING time — pausing stops the clock

build.tasks.add("Write the readme");                  // a string: a Task with that title (id "write-the-readme", Task.slug)
build.tasks.add({ title: "Shoot it", expected: "…" }); // an object with no type: a Task
build.tasks.add({ type: "Project", title: "Next" });  // a typed object: that class (Project, Process, Session)
```

The item tool takes the same three forms: `item({path, delta: {"tasks": {"add": "Write the readme"}}})`. It writes the object form. A **Session is a Task** too ([core/Session](../Session/readme.md), "How work gets into a session").

Watch it live: [core/Task/live/](/framework/core/Task/live/).

## Replay, waiting, subtasks

- `Task.replay(lines)` is `Item.replay` (inherited): `Item.Store.read` runs the same `replay_line` per entry in the browser. Task only overrides `replay_new`, `replay_line` and `replay_end` for the legacy mapping. It builds a task from parsed `task.jsonl` objects, using each line's own time (`at`, `assign.at|landed_at|requested_at`), never the wall clock, so the same file always gives the same task. Explicit lines (`{"start":{}}`, `pause`, `resume`, `stop`, `complete` (old `finish` too), `wait`, `approve`, `improve`, `reject`) call the method of that name; once one appears, they decide the state.
- No explicit line (an old file): `landed_at` alone is `complete`, `closed_by` is `stopped`, anything else is `running`. `assign` fields merge into `data` (latest wins; `session_id` becomes `session`).
- `waiting` is a sixth state: `wait({on, what})` (from idle, running, paused), then a verdict, each stored as `verdict: {is, note, by}`: `approve(note?)` (to running; a queue that delays it to idle does not exist yet), `improve(note)` (to running, to revise and wait again), `reject(note)` (to stopped). `stop` and `complete` accept it.
- **Homes and references (step 14a):** `tasks.add` through the item tool makes the child its own folder, `<module>/tasks/<slug>/` when `public/framework/<module>/` exists (never created), else `<parent folder>/<slug>/`. Line 1 is `{id, path, parent, title, module, …}`; the parent gets one `{"task": "<app path>"}` line and no copied data. Replay turns each such line into a live child with `Task.from_ref(path)`, using `Task.resolver` (node sets it, `page_tools.link_refs`); a missing file gives a stub child with `state: "missing"`. Old inline `{"tasks":{"add":…}}` lines still replay inline. A reference may carry `as`, the id the child had before it moved (`{"task": url, "as": "x"}`, written by the item tool's `move` key); replay then uses that id instead of the folder name, so a moved child keeps its id ([core/Item, moving](../Item/doc/architecture.md#an-item-moves-home-with-its-id-its-history-and-one-reference)). The browser Store resolving them is step 14b.
- `tasks` is made on first use, so a task with no subtasks costs no `List`.
- **Migration:** [`Server/TaskMigrate.mjs`](/Server/TaskMigrate.mjs) gives an old session task whose module is clear a home here. The home's `sessions` field (`[{id, task}]`) names the old folder, and the old folder gains one `{"home":"<url>"}` line, kept as `data.home`. It runs as a dry run by default and never deletes. [Plan](/framework/servex/fs/?file=public/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/plan.md) · [dry run](/framework/servex/fs/?file=public/framework/ai/sessions/2026/10/16/voice-20261016/task-migrate/dry-run.md).

## State: counting across tasks

`Task.js` decides one task's state. Counting across all of them (how many landed today, what is in flight) is done once, in node, by [`Server/AIIndex.mjs`](/Server/AIIndex.mjs): it replays every task in both stores (the sessions store and every `tasks/` home) through `Task.replay` and writes `public/framework/ai/index.json`, with a self-check that a second, separate count must agree with. Nothing else counts tasks. Design: [Server/doc/ai-index.md](/framework/servex/fs/?file=Server/doc/ai-index.md). The three rules State's self-check found wrong are fixed (see Watch out).

## render() and TaskView

`task.render()` returns `new Task.View({task})`. `Task.js` stays DOM-free: [`TaskView.js`](./TaskView.js) (`class TaskView extends View`) sets `Task.View` when a browser loads it; in node `render()` warns once and returns `undefined`. `TaskView.chip(task)`, `.row(task)`, `.card(task)` draw the three sizes (icon + title; + state and complete %; + expected, priority, commits, session, module, link). A view reads the live task and redraws on its `change` events; a card also redraws on `tasks` add/remove/reorder. A subclass overrides `render()` to draw itself. This retires the display `Task` that was in `ai/objects.js`.

**The row** (`TaskView.row`, `TaskView.css`) is the one look everywhere: one stage checkbox (`TaskView.STAGE`: unchecked, hourglass, play, check, …), title link, one bar segment per child, coloured by state: green done, amber running (it pulses), red waiting or paused, grey not started (past `TaskView.SEGMENTS` = 8, one stacked meter and a "19/24" count, so the title keeps the room). The bar is `TaskView.draw_bar(states, max)`, a static, so any view with child states draws the same one ([ai/sessions/v/mobile/](/framework/ai/sessions/v/mobile/) does); a parent is bigger, previews 3 open children, and a click expands them all. The card shows its children as rows. **Buttons:** a row and a card show Start, Pause, Resume, Stop and Approve, but only the verbs the task's state allows (`task.can(verb)`, read from the same `CAN` map the verbs check; `Task.can(state, verb)` is the same check for a row that has only a state). Each is a 44px icon button. A click calls `task.act(verb)`, which saves the verb through the item tool, stamped `owner` ([core/Item readme](../Item/readme.md)), and does not expand the row. Used by TasksPage (and so every Doc's Tasks tab). The `/live/` Tasks card (`live/LiveTasks.js`) draws no rows: it is one line, "Tasks · N open · M running" (`TasksPage.counts`), linking to [/tasks/](/tasks/). "+ N more open" expands the row, like a click on its head.

## TaskPage

[`TaskPage.js`](./TaskPage.js) (`class TaskPage extends Page`) is the thin route for a task folder: it opens that folder's `task.jsonl` (or `session.jsonl`, for a spawned agent's folder) and shows `Task.View` full-size, with no task logic of its own. It asks the server which file exists, likely one first, so a page makes no 404: `task.jsonl` first in a `<module>/tasks/<slug>/` folder, `session.jsonl` first anywhere else. A step folder inside it (a `session.jsonl` or `task.jsonl` and no `page.js`, e.g. a run's `review/`) opens as a TaskPage too: `route(sub)` asks `is_record_folder` of [core/Router/listing.js](/framework/core/Router/listing.js), the same rule `AITask.route` uses. Demo: [core/Task/page/](/framework/core/Task/page/). The legacy `ai/AITask` viewer is unchanged.

## TasksPage

[`TasksPage.js`](./TasksPage.js) (`class TasksPage extends Page`) is the page for a `tasks/` **directory** (TaskPage is one task folder). `Page.child` mounts it on any `tasks/` with no page of its own; a Doc module's Tasks tab draws the same view (`TasksPage.into`). It shows every task as `TaskView.row`, grouped by module, ranked by `Task.rank`. Each group shows `TasksPage.SHOW` (5) open rows, then one "+ N more open · + M done" line that expands the group. `/tasks/` itself is a saved filter that forwards to the Inbox (`ai/tasks/SavedFilter.js`, 2026-10-19, one dashboard); its `public/tasks/task.jsonl` is still the index of every task home (`TasksPage.groups('/tasks/')` reads it, and the `/live/` Tasks card counts from it). It holds one reference per home, found by walking files.jsonl (`node Server/TaskHomes.mjs --write`; the item tool adds a new home itself). `TasksPage.counts()` gives the open and running counts the `/live/` Tasks card shows. Wide screens: `.tasks-page` is CSS columns (`columns: 28em`), so module groups flow into as many columns as fit (one when narrow) and each row looks the same; the alternative, a Browse view with modules on the left, needs more code and was not taken. Test: `node TasksPage.test.mjs [site url]` (headless). A module list's reference id is `core-Task-tasks` (`Task.ref_id`), so lists side by side never collide. Not the same as `ai/tasks/TasksPage.js`, the AI board's task browser, which keeps its own `page.js`.

## Watch out

- **Three replay rules, set by `Server/AIIndex.mjs`'s self-check** ([Server/doc/ai-index.md](/framework/servex/fs/?file=Server/doc/ai-index.md), "Decision"): a line's time is `at`, else the item tool's `ts`; `landed_at` alone means `complete` (outcome or not); during replay `complete()` never refuses a recorded finish because a filed `{task: ref}` child is idle (live calls still refuse). Each has a test in `Task.test.mjs`.
- **Abandoned tasks are closed by script:** [`Server/StaleClose.mjs`](/Server/StaleClose.mjs) appends a `stop` line (`by: StaleClose`) to every `stale` task silent over 24 h, daily from `Servex/TaskLoop.js`; the manifest is `ai/stale-closes.jsonl`, `--undo` appends `start` (`resume` is refused from `stopped`). [Server/doc/stale-close.md](/framework/servex/fs/?file=Server/doc/stale-close.md)
- **`complete()` needs evidence** (2026-10-22, [resolution.md](doc/resolution.md) section 6): `{outcome, evidence: [file | commit | shot | test], confidence: "high" | "medium" | "low" (default medium), caveats: [] }`. No evidence, or a plain string, is refused and the message says what to pass; the item tool refuses before it writes a line. Caveats are appended to the parent's log (`tell_parent_caveats` in `Servex/agents/page_tools.js`). Exempt: replaying a recorded finish (old logs have none), the automatic completion when the last child completes (`complete({auto: true})`), and node-written closes, which use `stop` (`StaleClose`) or the legacy `landed_at`. **`approve()` makes the task accepted (`idle`)**; the agent's own `start()` begins it.
- **`complete()` refuses while a subtask is open** — it warns ("… isn't complete yet —
  complete that first") and leaves the state unchanged, never throws. A stopped subtask (dropped,
  with its reason) is settled and does not block, the same way progress leaves it out. Every illegal
  transition (`pause()` on an idle task) behaves the same way.
- **Every transition is one `set()` call**, so it's one replayable delta line and
  fires the same `change`/`delta` events `Item.set_one()` already does — nothing
  hand-rolls a second emit path.
- **`duration()` counts running time only.** Time spent paused never counts; the
  open running span lives in memory (`_ran_since`), not in the saved data, so a
  reload mid-run loses only that open span's few seconds, never the banked total.
- **`progress()` is always computed**, never a stored number (CLAUDE.md law 7). No
  subtasks yet reads as `{done: 0, total: 1}` (or `1/1` once complete), so a progress
  bar still means something before the first subtask exists.
- **This is the base class only.** `AITask extends Task` (brief, asks, agents,
  sessions, cost vs budget, review) is a later pass — see
  `ai/sessions/2026/10/03/list-events/task-class/requirements.md` for what's deliberately left: folding
  in `ai/objects.js`'s display `Task`, `ai/AITask`'s page renderer, `ext/JSONL`'s
  `TaskJSONL`, and `ai/AITask/nested.js`'s `TaskTree`.
- **Fields** (getters that read data, never stored numbers): `expected`, `module`, `session` (`session ?? session_id`), `priority` (latest `{priority:{score,why,by}}` line or `null`), `commits` (short hashes from `{"commit":"…"}` lines, no duplicates; `commit(hash)` appends one). Replay reads both lines without leaving the legacy mapping. `sessions` ([{id, task}], node appends it), `source` (voice-app | vscode | dictate | servex:<id>; an old `/` doc path reads as `doc`) and `cost` (USD, computed from the agents on this task via `Task.cost_resolver`, wired in `Servex/agents/Agents.js`).
- **`completion`** (0 to 1): `checked_by` set (`check({by})`, final) is 1; else the share of complete subtasks (the only computed form); else old `steps`/`step` logs; else the agent's `data.completion`, or 1 when complete. New tasks no longer write `steps`.

## More

- **Templates** (`template: "code" | "doc" | "scan"` on line 1; an approved task with an `agent` spawns itself): [doc/templates.md](doc/templates.md) (proven live 2026-10-17: approve to spawn in about 1.5 s) · the owner's ask, and whether `task.jsonl` became `session.jsonl`: [doc/owner-2026-10-17-node-driven.md](doc/owner-2026-10-17-node-driven.md)
- **The owner's words, 2026-10-16:** [task system](doc/owner-2026-10-16-task-system.md) · [composition](doc/owner-2026-10-16-composition.md) · [top-down](doc/owner-2026-10-16-top-down.md) · [UI](doc/owner-2026-10-16-ui.md) · [node side](doc/owner-2026-10-16-node-side.md) · [migration](doc/owner-2026-10-16-migration.md)
- [Overview](/framework/core/Task/) · [Live](/framework/core/Task/live/) — start, pause,
  stop and complete a task with subtasks, live, no reload
- [`Task.js`](./Task.js) · [`Task.test.mjs`](./Task.test.mjs) — the state machine, the
  subtask-blocks-complete rule, duration math; `node Task.test.mjs`, 53/53 passing
- [Item](/framework/core/Item/) — the base class · [List](/framework/core/List/) — what `tasks` is

## Composition (step 3b)

- **`complete`** replaces `finished`: state `complete`, verb `complete()`, field `completed_at`. Replay reads old `finish` lines, `finished_at`, `state: "finished"` and a numeric `complete`; `finish()` is an alias.
- **`mode`**: `"parallel"` (default) or `"series"`. `start()` on a parent starts its children (series: the first not complete; parallel: every idle one). A parent hears each child's state change (wired when a child joins `tasks`): a series parent starts the next child, and the last child completing completes the parent. No polling.
- **`tags`** (getter): `[module, ...own tags, ...the parent task's tags]`, no duplicates or empties; own tags are a `tags` string array. **`expected`** is a string or an array of strings (the card draws one line each).
- **`content`**: a `List` made on first use; a replay line `{"content":{"add":{"text":"…"}}}` adds to it, as on a Page. The card draws each item's `text` or `title`.
- **`settled()`**: a Promise that resolves with the task at `complete` or `stopped`.
- **The `item` tool** writes a Task: `item({path, delta})` appends one `task.jsonl` line (`{"start":{}}`, `{"tasks":{"add":{…}}}`) and answers with what it wrote: `{ok, ids, line, size, now: {state, completion}}`. The full state is a read: `item({path})` with no delta (2026-10-24: answering with the whole picture made a write on a big session take 20 s). Refuses `_` keys and unknown keys. See [Servex/doc/item-tool.md](/framework/servex/fs/?file=Servex/doc/item-tool.md). `Task.replay` reads the same lines (`tasks`, `content`, and the plain fields in `Task.FIELDS`), so a tool write and a file read run the same code.

- **Commits are computed:** a task's `commit` lines come from the `post-commit` git hook via `SERVEX_TASK`, never typed by hand. See `Server/readme.md`, "Git hooks".

- **`source`** field: `{session, line, id}`, set on a Task made from a refined ask (`Server/AskIndex.mjs`, `AskIndex.tasks_view`).

- **References in the browser (step 14b):** `Task.from_ref` returns a "loading" stub that opens the child's own `task.jsonl` through the Store and tails it live ("missing" only after a 404); `Task.rank(list)` sorts by recency x weight.

- **Owner notes, 2026-10-20:** `complete()` the verb, `completion` the number; a module keeps projects (`projects/YYYY/MM/DD/`), a session keeps tasks; the dated breakout as one shared system: [doc/owner-2026-10-20-projects-and-completion.md](doc/owner-2026-10-20-projects-and-completion.md).
