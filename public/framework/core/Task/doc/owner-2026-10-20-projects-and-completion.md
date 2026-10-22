# The owner on projects, completion and dated folders (2026-10-20)

Notes for the next Task refactor, from a dictation to the VS Code mastermind. The whole dictation: [ai/doc/owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md). Nothing here is built yet.

## 1. `complete()` is the verb, `completion` is the number

Today `Task` has `complete()` (the method that finishes the task) and `completion` (a getter, 0..1, computed from subtasks). The owner's proposal keeps exactly that split and asks that no `complete` *property* ever appear: a task is completed by calling `complete()`, and how complete it is reads from `completion`. Keep it when refactoring.

## 2. A project is the unit a module keeps; a task is the unit a session keeps

- A **task** starts and gets completed. It may have subtasks; its `completion` is 0..1 from them. It lives in the session that does it.
- A **project** is a task that is substantial enough to name: a goal, a plan, requirements, investigation, review, subtasks. It is long-lived, can be referenced from anywhere, and is where work on a module is organised. `class Project extends Task` ([Project.js](../Project.js)) is the play class for this.
- A session may hold one or more projects. A task grows into a project when it needs structure or its own agent; a finished or substantial piece of session work moves into the module as a project, by script.
- So a module keeps **projects**, not a pile of micro tasks: `<module>/projects/YYYY/MM/DD/<slug>/` is the proposed shape, replacing `<module>/tasks/<slug>/` (539 tasks in 85 homes on 2026-10-20, 289 of them idle). Decision still to be written with options ranked (`Server/Decide.mjs`); the move is a script with a manifest.

## 3. The YYYY/MM/DD breakout as one shared system

Sessions use `ai/sessions/YYYY/MM/DD/<name>/`; projects would use the same. The owner wants this to be **one system**, not two copies of the same folder logic, so archiving, loading a month as a chunk, filtering and indexing can be upgraded once for everything dated. Maybe an Item extension, like the page system's extensions. Judged over-engineering for now: this note is the reminder, for the Task and the Session architecture ([core/Session/doc/architecture.md](/framework/core/Session/doc/architecture.md)).

## 4. Ongoing projects, and a plan checked against the prompt (the owner, 2026-10-20 18:50)

Words in the tab prompt log (`ai/2026/10/20/session-e00f55c9/page.jsonl`). Essence:

- **Plan first, check the plan, then build.** Sketch the thing (pseudocode, the class architecture), then cross-reference the sketch with the raw prompt and the requirements: is the essence captured, how could it be better. All before the code works. "We're building a lot of stuff without planning it." The system architect should build this step into how projects run, at least for projects. First use: the [store-index-query](/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/store-index-query/requirements.md) plan.
- **Tell simple tasks from projects**, and get better at it. Redesigning any system is an ongoing project, never "done".
- **An ongoing project type.** Proposal: the `type` field (the class name, as elsewhere) tells a default project (started, then completed) from an ongoing one (never completes; a place where work on a thing accumulates).
- **A class's architecture is an ongoing project** from the day the class is written: the core API, what things are called, the arguments, where the data saves, the hierarchy. Most of it turns out clear and simple; the forks are names, places to save and structure. "Maybe" a class-architecture skill; the owner is unsure skills are the right vehicle (skills are Claude-specific; see [ai/doc/owner-2026-10-20-who-makes-tasks.md](/framework/ai/doc/owner-2026-10-20-who-makes-tasks.md) section 15).

## 5. Processes: tasks with named phases, run by node (the owner, 2026-10-22)

- **A process is a workflow template** (maybe `class Process extends Task`): a task whose steps are named phases. A mastermind picks the process that fits (build, plan, audit…) and node moves the work from phase to phase, so nothing depends on the agent remembering its instructions (a role readme read once drifts out of mind).
- **The phases:** (1) **investigate**: read the context, ask the important questions and rank them; (2) **plan**: propose tasks, created but not launched; (3) **improve** the plan; (4) **approve**; (5) **launch** (through the spawn queue, which waits on RAM); then build, review, merge.
- **The right amount of planning.** Planning can waste tokens too; track each phase's share of a session's tokens so the balance is visible and can be tuned.
- **The mastermind plans while its workers build**, and launches the next tasks itself.
- **Updates are tool calls, not chat:** a spawned agent reports by logging (chat vanishes); chat is for the owner.

## 6. Where tasks and projects live (the owner, 2026-10-22)

- **A task or project is portable**: a folder (or one JSONL) that can move without losing anything.
- **Draft in the session, then move home.** While it is being planned it lives in the session's folder; once approved it moves to `<module>/tasks/<slug>/`, so every later agent working on that module sees its past work in one place. Projects go in the same `tasks/` folder: a project is a task, so one folder, not two.
- Moves go through the dated store's `move` (scripted, recorded, undoable); `new-task` already names `<module>/tasks/<slug>/` as a task's home.
