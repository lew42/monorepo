# Task system: the plan (approved, building)

One `Task` class tracks the progress of all work. A task **has** a page and **belongs to** a session; it is neither of them. Approved whole, steps 1 to 11, on 2026-10-16 (voice-app, on the owner's standing rule: "if it looks good, do it"), with two improvements folded in below: `complete` comes only from subtasks, and the item tool also serves local SDK agents in-process (step 12). Sources: [the owner's words](/framework/core/Task/doc/owner-2026-10-16-task-system.md) · [tool notes](/Servex/doc/owner-2026-10-16-tools.md) · [d-render-method](/framework/core/doc/decisions.md) · the 2026-10-08 [task-system-design](/framework/ai/sessions/2026/10/08/task-system-design/task-system-design/design.md), which this plan builds on and updates (the item tool replaces its seven `task_*` tools).

## 1. The classes

- `class Task extends Item extends Events(Object)`: the one task class ([core/Task](/framework/core/Task/)). It already has states, subtasks and a duration; today nothing uses it.
- `class Session extends Item extends Events(Object)`: today `Session` is a plain class. It becomes an Item, as the accounting task proposed ([R13](../accounting/requirements.md)). A session **has** `tasks`, and its progress is computed from them.
- `class AISession extends Session`: no change beyond the new base class.
- `class AITask extends Page`: the page that renders a task folder. It keeps its name for now (115 files use it), but its state comes from `this.task`, a `Task` replayed from `task.jsonl`, instead of its own reading of the lines. A scripted rename to `TaskPage` comes later, as a separate step.
- `ai/objects.js` `Task`: this display class retires. Its chip, row and panel become `Task.View`.

## 2. The fields

| Field | What it is |
|---|---|
| `expected` | The outcome the task should produce, written before it starts. A new name, because `outcome` already means the landing report (1,499 lines use it). |
| `complete` | A getter, never a stored number (law 7). The only computed form is from subtasks: the share of subtasks that are finished. `steps` ([Server/Steps.mjs](/Server/Steps.mjs)) stays only as a fallback for old folders; no new task writes `steps`. Otherwise a value from 0 to 1 set by the agent, which `finish()` sets to 1. When the owner checks a task off, that is final (`checked_by`). |
| `state` | `idle running paused waiting stopped finished`. `waiting` is new, and `waiting_on` names who it waits for (`owner`, or an agent id). It comes from lines in the log, never from timestamps. |
| `priority` | The existing `{"priority":{score,why,by}}` line ([reprioritise_task](/Servex/agents/tools.js)), read as the field. |
| `commits` | Short git hashes (12 characters), one `{"commit":"…"}` line each, so a task's actual changes can be traced from the task. |
| `session` | The session the task is registered to: the existing `session_id`, renamed as a field and read from both names. |
| `module` | The module or modules the task concerns (`core/Task`), so the module's page can list its tasks. |
| `tasks` | A `List` made on first use (`get tasks(){ return this._tasks ??= new List(...) }`), not in the constructor. |
| `render()` | Returns `new Task.View({task: this})`. A subclass overrides `render()` to draw its own kind of task. A card listens to `tasks` only for add, remove and reorder; each subtask redraws itself. |

## 3. Where tasks live

**A task is a folder with a `task.jsonl` log.** It may also have a `page.jsonl` for its page. The log works like `page.jsonl` ([core/Page/doc/jsonl.md](/framework/core/Page/doc/jsonl.md)): each line is one `set()` call, and a key that names a method calls that method. So `{"wait":{"on":"owner"}}` calls `task.wait()`, and replaying the file rebuilds the task.

There are three homes, and all three use the same folder shape:
1. **In a session:** `ai/sessions/YYYY/MM/DD/<session>/<slug>/`, as today ([TaskDirs](/Server/TaskDirs.mjs)). This is the default for work a session does.
2. **In a module:** `<module>/tasks/<slug>/`, for work no session has picked up yet. When a session starts the task, it records `session`. The task does not move.
3. **On a page:** a task's own page is its `page.jsonl`. A page lists its tasks through the index ([open-work line](/framework/ai/sessions/2026/10/12/session-a2bdd14b/page-context-asks/)).

A subtask is a child folder (`<task>/<sub>/`). The task index (`ai/tasks/`, written by [TaskState](/Server/TaskState.mjs)) is computed from the logs and never edited by hand.

## 4. The item tool

One tool: `item({path, delta})`. `path` is an app path (`/framework/ai/sessions/…/task-system/`), and `delta` is **one JSONL line**: the exact object `Item.set(delta)` takes and `page.jsonl` holds. With no `delta`, the tool returns the item's current state. One system, not two: a delta from a file and a delta from a tool go through the same code ([the owner's correction](/Servex/doc/owner-2026-10-16-tools.md), "The item tool is set()").

- **What a key does:** this is `set_one`'s grammar, unchanged. A key that names a method calls it, with the value as its arguments. A key that names a child Item walks into it. Any other key assigns.
- **Build it from `page_set`, don't write a second apply.** `page_set` is already this tool for pages. Generalise its resolve step to any Item class: `task.jsonl` means `Task`, `session.jsonl` means `Session`, `page.jsonl` means `Page`, or a `class` key on line 1. Then append the line, stamped with `by` and `ts`, and call `set`. `page_set` becomes an alias of `item`.
- **Dot paths:** `{"now.preview": x}` may be accepted as shorthand. It expands to `{"now": {"preview": x}}` before `set`, never as a second code path.
- **Refusals:** a key that names a method starting with `_` is refused. So is a key that names no method and no property on the class. Each refusal lists what exists.
- **Examples:** `item({path: <task>, delta: {"start": {}}})`, `{"wait": {"on": "owner"}}`, `{"commit": "9deda921e"}`, `{"tasks": {"add": {title, expected, priority, module}}}` (TaskDirs makes the folder and writes line 1), and `{"content": {"add": {…}}}`.

**Tool instructions on the first call.** The first `item` call an agent makes on each class returns `instructions` beside the result. The instructions are computed from the class by `Item.describe()`: its fields, its methods with the first comment line of each, and the delta grammar. Later calls return only the result, and `{"help": {}}` returns the instructions again.

## 5. TaskLoop and TaskState

Whether a task is open comes from its replayed `state`, never from timestamps:
- **running:** chased when quiet, exactly as today.
- **idle** and **paused:** never chased. A paused task was stopped on purpose, and an idle task is backlog, ordered by `priority`.
- **waiting** with `waiting_on: owner` (this plan, for example): this is "follow up with the owner".
  - **After 2 hours:** one reminder to the parent agent, plus a `Note:` card on the AI board.
  - **After that:** one line a day in the daily follow-up (`follow_up_daily`).
  - **Never** a wake that starts the build. Each reminder is a `{"follow_up":{n,to}}` line, so a restart loses no count.
  - **When the owner approves:** the card button or `approve` sets the state back to `idle` and messages the owning agent.
- **stopped** and **finished:** closed.

TaskState adds a `waiting` group to `state.jsonl`, so `/framework/ai/tasks/` shows what is waiting on the owner.

## 6. Prompt refinement makes the tasks

[ext/Refine](/framework/ext/Refine/) already turns each prompt into asks, each with the sentences it came from ([refine-queue](/framework/ext/Refine/doc/refine-queue.md)). The new step comes after that:
- **One task per ask:** code, not an LLM, turns each ask into a task. Its `expected` is the ask restated as an outcome. Its `source` is a link to the prompt line and the sentence ids (a link, not a copy).
- **Module and priority:** the module tag comes from `readme_modules`, and the priority from how hard the owner pressed.
- **Status:** each task starts `idle`, in the session that heard the prompt.
- **The asks ledger:** [asks.jsonl](/framework/ai/asks.jsonl) becomes a view of these tasks rather than a second record.

## 7. Migration

- **No folder is rewritten:** 1,636 `task.jsonl` folders exist, and 1,220 of them have landed. `Task.replay()` reads the old fields: `landed_at` with an `outcome` means `finished`, `closed_by` means `stopped`, `steps` and `step` become step progress, and `session_id` becomes `session`. Old folders stay readable forever, and new lines just append.
- **The accounting rename** (a session folder's `task.jsonl` becomes `session.jsonl`, [shape.md](../accounting/shape.md)) is separate from this plan and fits it: a session folder holds `session.jsonl`, and its task folders hold `task.jsonl`.

**The smallest first step** is `Task.replay()` plus the `waiting` state, with TaskLoop using them. That one commit stops the chasing of deliberately idle tasks, and this plan's own wait becomes its first real use.

## 8. Build sequence (one commit each)

| # | Step | Model | Budget |
|---|---|---|---|
| 1 | `core/Task`: `replay(lines)` with legacy mapping, the `waiting` state, `wait()` and `approve()`, `tasks` made on first use; tests | Sonnet | $3 |
| 2 | TaskLoop and TaskState read state through `Task.replay`; idle, paused and waiting are not chased; the waiting follow-up; tested on fixture folders | Sonnet | $3 |
| 3 | Fields `expected`, `priority`, `commits`, `session`, `module`, and the `complete` getter; tests | Sonnet | $2 |
| 4 | `render()` returns `Task.View` (chip, row, card); the `ai/objects.js` Task retires to it; `AITask` gets `this.task` | Sonnet | $4 |
| 5 | The item tool `item({path, delta})`: `page_set`'s resolve step generalised to any Item class, then the same `set()`; dot-path shorthand, refusals, `Item.describe()` instructions on the first call, `page_set` as an alias ([section 4](#4-the-item-tool), corrected 2026-10-16) | Sonnet | $5 |
| 6 | Commits: Servex sets `SERVEX_TASK` on spawn, and a post-commit hook appends `{"commit":…}` to that task | Sonnet | $2 |
| 7 | `class Session extends Item`, with `tasks` and a computed progress (coordinated with the accounting task) | Sonnet | $3 |
| 8 | Refine to tasks: the refine queue calls `tasks.add` through the item tool; `asks.jsonl` becomes a view | Sonnet + Haiku runs | $4 |
| 9 | Module homes: `<module>/tasks/`, listed on the module's page | Haiku | $1 |
| 10 | The skills (`new-task`, `finish-task`) and the readmes move to the item tool | Haiku | $1 |
| 11 | Scripted rename `AITask` to `TaskPage`, with a dry run and a manifest | Sonnet | $2 |
| 12 | The item tool in-process for local SDK agents: same function, same name, no network ("one toolset, two pathways", [tools note](/Servex/doc/owner-2026-10-16-tools.md)); run right after step 5 | Sonnet | $3 |

The total is about $33, inside a $35 budget. Steps 1 and 2 landed as `8935e1c77`; each later step's commit is a `commit` line in this folder's `task.jsonl`.

## Amendments (2026-10-16, evening)

Two owner notes arrived after steps 1 to 4 landed: [card-types.md](/framework/ext/Refine/doc/card-types.md) (the vocabulary and the lifecycle prompt → plan → proposal → approval → task → complete) and [owner-2026-10-16-composition.md](/framework/core/Task/doc/owner-2026-10-16-composition.md) (series vs parallel, content, events). Step 3 had already merged, so they become **step 3b**, built next, before step 5. The names below are decided.

**1. The word is complete.**
- The state `finished` becomes `complete`, and `finish()` becomes `complete()`; `finished_at` becomes `completed_at`.
- The 0-to-1 getter that was called `complete` is renamed `completion`, because `complete()` is now the verb. `progress()` stays `{done, total}`.
- Old folders keep working: replay reads `{"finish":…}` lines, `state: "finished"`, `finished_at` and a numeric `complete` as the new names. `finish()` stays as an alias that calls `complete()`; nothing new writes it.

**2. Proposals and verdicts.** A proposal is a task that waits for approval (`wait({on})`, `waiting_on`). There are three verdict methods, and each one is a log line `{"verdict":{"is","note","by"}}`:
- `approve(note?)`: waiting → idle. Approval with a caveat is `approve(note)`.
- `improve(note)`: waiting → running, back to whoever proposed it, to revise and then `wait()` again.
- `reject(note)`: waiting → stopped, with the note as the reason.

**3. Children run in series or in parallel.**
- Children are `tasks`, recursive. There is no step type.
- The field `mode` is `"parallel"` (the default) or `"series"`, and modes nest.
- `start()` on a parent starts its children: in series, the first child that isn't complete; in parallel, every idle child.
- **Node drives every step.** A parent listens to each child's change events. When a child completes, a series parent starts the next child. When the last child completes, the parent completes itself.
- **Tracking across async parallel children.** `completion` is computed on read (the share of children that are complete) and never stored, so there is no counter to race. Events within one process run one at a time. Across processes, each child is its own folder and log, and TaskState recomputes the parent by replaying the children.

**4. A task has content.** `task.content` is a `List`, like `Page.content`, made on first use. The same `{"content":{"add":{…}}}` line grammar as `page.jsonl` adds a note, a decision or a log line to a task. A Decision (a ranked List of Options) can sit in it; building Decision is not part of this plan. The card view draws the content below the task's facts.

**5. Events, plus one promise.** Events are the mechanism. `task.settled()` returns a Promise that resolves with the task when it completes or stops, for a caller that wants to `await`. Task is not made thenable: that breaks when a task is returned from an async function.

**6. Two rules become tests.**
- **Never drop a task:** every state is either closed (`complete`, `stopped`) or in one of TaskState's open groups. A test fails if any state is in neither.
- **Node drives every step:** a test runs a series parent with three children and a parallel parent with two, completing each child, and checks that the next child starts and the parent completes, without any other call.

| # | Step | Model | Budget |
|---|---|---|---|
| 3b | `finished` → `complete`, `completion`, the verdicts, `mode` (series/parallel) with node-driven starts, `content`, `settled()`; callers: TaskLoop, TaskState, TaskView, AITask, `core/Task/live`; tests | Sonnet | $4 |

The budget stays $35 in total. Step 3b is paid for out of what steps 1 to 4 came in under.

## Amendments 2 (2026-10-16, night): the task system read top-down

Source: [owner-2026-10-16-top-down.md](/framework/core/Task/doc/owner-2026-10-16-top-down.md), with voice-app's decisions where the owner left a point open. Steps 1 to 7 and 12 had landed; step 8 was building. What changes:

1. **TaskPage, not AITask.** Nothing on the AI side extends Page to be a task. `AITask extends Page` becomes `TaskPage extends Page`, which **has** a `task`. The AI system uses `core/Task` directly, and there is no `AITask extends Task` until a concrete need appears. The scripted rename (old step 11) moves up to step 11 below, and new code never uses the name AITask.
2. **Item owns replay.** `replay` lives on `Item` / `Item.Store` (one store per JSONL file, streamed by `ext/JSONL/live.js`), the same for every Item. `Task` only adds the legacy field mapping for old folders. Steps 1 and 3b put `replay` on Task, so step 13 moves it and keeps every test.
3. **`expected` is `string | string[]`** for now; a List of cards later. At `complete()`, the reviewer checks each string as a yes/no.
4. **`tags`**, hierarchical: a parent's tags apply to its children. `module` stays a field (old folders have it) and is always the first tag.
5. **Creating is the parent's add.** `item({path: <parent>, delta: {"tasks": {"add": {"type": "Task", …}}}})`; there is no separate create. Step 8 already creates tasks this way, so it keeps building.
6. **One home, references elsewhere.**
   - A task with a module lives at `<module>/tasks/<slug>/`. A task with no module lives in its parent's folder (`<parent>/<slug>/`).
   - The parent, a session or a task, gets a `{"task": "<app path>"}` line, which is a reference with no copied data. Replay resolves it to the live child.
   - Every new task's line 1 carries its app path, so the node-built index (`ai/tasks/`) finds it. This absorbs old step 9.
7. **Approval starts the task.** `approve(note?)` goes waiting → running at once, unless a queue delays it (then idle). This replaces item 2's waiting → idle above.
8. **`Task.View` is a checkbox row.** A row with children expands in place, and a row without children opens its page.
9. **A task's content lives in its `task.jsonl`,** never in a `page.jsonl`. TaskPage reads the task's log.

**Plan small:** each step is planned once the step before it has landed and works.

### Names (the vocabulary from now on; the code is the truth)

| Name | Type | What it is |
|---|---|---|
| `Task` | class, `extends Item` | One unit of work, in `core/Task/Task.js`. Generic: it also runs a plain project list. |
| `TaskPage` | class, `extends Page` | The page over one task; it **has** a `task`. Was `AITask`. |
| `Task.View` | class (`TaskView`) | The task drawn as a checkbox row (also chip and card). |
| `Session` | class, `extends Item` | One working session; it references its tasks. |
| `title` | string | The task in a few words. |
| `expected` | string \| string[] | Outcomes the review checks, yes or no, at `complete()`. |
| `state` | `idle` `running` `paused` `waiting` `stopped` `complete` | Where the task is; the truth is its log. |
| `mode` | `parallel` (default) \| `series` | How its `tasks` run. |
| `tasks` | List of Task | Its children, which may be references to their own folders. |
| `task` | log line, app path | A reference to a task that lives elsewhere. |
| `content` | List | Notes, decisions, forms on the task, stored in its `task.jsonl`. |
| `tags` | string[] | Hierarchical labels; `module` first; inherited from the parent. |
| `module` | string | The module the work belongs to, and the task's home. |
| `priority` | number | How soon. |
| `session` | string | The session that worked on it (was `session_id`). |
| `source` | `{session, line, id}` | The prompt and ask it came from: a link, not a copy. |
| `commit` | log line, hash | One per commit, written by the post-commit hook. |
| `now` | string | What it is doing right now. |
| `waiting_on` | string | Who it waits for, when `waiting`. |
| `verdict` | `{is, note, by}` | The last approve / improve / reject. |
| `checked_by` | string | Who confirmed it complete. |
| `completion` | getter, 0..1 | The share of its `tasks` that are complete, computed on read. |
| `progress()` | `{done, total}` | The same count, as numbers. |
| `start` `pause` `resume` `stop` `complete` `wait` | methods | Move the state. `finish` is an old alias for `complete`. |
| `approve(note?)` `improve(note)` `reject(note)` | methods | The verdicts on a waiting task. |
| `settled()` | Promise | Resolves when the task is complete or stopped. |

### The sequence from here

| # | Step | Model | Budget |
|---|---|---|---|
| 8 | Refine makes tasks through the parent's `tasks.add` (building) | Sonnet | $4 |
| 13 | `replay` moves to Item / Item.Store, and Task keeps only the legacy mapping; `tags`, `expected` as `string \| string[]`, `approve()` starts the task | Sonnet | $3 |
| 11 | Scripted rename `AITask` → `TaskPage extends Page` with a `task`, with a dry run and a manifest (moved up) | Sonnet | $2 |
| 14 | Homes: `tasks.add` on any parent makes `<module>/tasks/<slug>/` (or `<parent>/<slug>/`) with its app path on line 1, and writes a `task` reference line on the parent; replay resolves references; a module page lists its tasks (absorbs 9) | Sonnet | $4 |
| 15 | `Task.View` as a checkbox row: expands in place, or opens the page | Sonnet | $2 |
| 10 | The skills (`new-task`, `finish-task`) and the readmes use the item tool and these names | Haiku | $1 |

The budget stays $35 in total. Steps have come in well under budget so far.

### Clarifications (2026-10-16, late)

- **TaskPage holds no task logic.** It is only the route that mounts `Task.View` full-size, because routing goes through Page subclasses today. `Task.View` renders the task everywhere: list row, expanded in place, full-size. A task's `page.jsonl` is made on demand, only when someone adds page content. Steps 11 and 15 follow this. Source: [owner-2026-10-16-top-down.md](../../../../../../../core/Task/doc/owner-2026-10-16-top-down.md), "Page vs view".
- **The item tool takes both forms:** a dot path (`"now.preview": "Now"`) and a nested object. The dot path expands to the nested form before `set()`, so there is one apply. Both stay. Source: `Servex/doc/owner-2026-10-16-tools.md`, "Dot paths and nested objects".
- **Step 11 changes (mastermind, after the clarification above):** no 134-file rename. A thin `core/Task/TaskPage.js` mounts `Task.View` full-size; `ai/AITask/AITask.js` stays the legacy viewer for old AI task folders, unedited. Renaming it would have put its 300 lines of AI viewer logic into TaskPage, which the clarification rules out. Brief: [task-page/requirements.md](task-page/requirements.md).
- **Step 14 splits in two:**
  - **14a, node, $3** ([brief](task-homes/requirements.md)): the home, the `task` reference line, and resolving references in node.
  - **14b, browser, $2:** the Store resolves references, and a module's `tasks/` page lists its tasks.
  - A module folder that doesn't exist is never created; the task falls back to its parent's folder.
