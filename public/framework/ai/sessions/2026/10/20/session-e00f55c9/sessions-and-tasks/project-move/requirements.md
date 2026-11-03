# Projects: a project folder, and one tool that moves it into its module and re-indexes

Budget: $10. Sonnet, medium effort. Queued by the system architect, 2026-10-20. Start after [index-stream](../index-stream/requirements.md) lands (the move appends to it).

## The owner's decided shape (16:30, [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md) "The decided shape"; dictation section 9)

A task is a line in its session's log, never a folder. A **project** (a task with subtasks, a goal, requirements, review) gets a folder with `project.jsonl`. It starts inside its session and may be moved into `<module>/projects/YYYY/MM/DD/<slug>/` by a tool that moves AND re-indexes. No module accumulates micro tasks: modules organise projects.

## Build

1. `class Project extends Task` (a play class exists on branch `task/project-class`; start from it) replays `project.jsonl`; `completion` 0..1 from its tasks.
2. A node tool (and its Servex MCP door) `move_project({from, module})`: `git mv` the folder to `<module>/projects/<YYYY/MM/DD of its start>/<slug>/`, append a moved line to both day streams (`index.jsonl`), leave a one-line pointer in the session's `session.jsonl`, dry run first, manifest, `--undo`.
3. Only write a plan (a short `doc/*.md`) for the 539 tasks that already sit in `<module>/tasks/` (`Server/TaskHomes.mjs` counts them): which become projects, which become log lines. Do not move them in this task.

## Done when

- [ ] `class Project` replays a `project.jsonl` and reports `completion`.
- [ ] `move_project` moves one real project, dry run first, and `--undo` puts it back.
- [ ] The move shows in both days' `index.jsonl`, and the session's `session.jsonl` holds a one-line pointer.
- [ ] The plan for the 539 tasks is written and linked from the `ai/tasks` readme.

Land with `finish-task`; `core/Task` and `ai/tasks` readmes updated.
