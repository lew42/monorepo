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
