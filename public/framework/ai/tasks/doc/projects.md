# Projects: a folder with project.jsonl, moved into its module by one tool

A **task** is a line in its session's log. A **project** is a task with subtasks, requirements or a review, so it gets a folder holding `project.jsonl`. It starts inside its session and can move to `<module>/projects/YYYY/MM/DD/<slug>/`. Decision: [sessions-and-tasks.md](/framework/ai/doc/sessions-and-tasks.md) "The decided shape".

## The pieces

```js
class Project extends Task      // core/Task/Project.js: Project.from_lines(lines) replays a project.jsonl; .completion is 0..1, the mean of its subtasks
class ProjectMove               // Server/ProjectMove.mjs: plan(), move(), undo(), tool() (the Servex tool move_project)
```

```
node Server/ProjectMove.mjs <folder> <module>            dry run (default)
node Server/ProjectMove.mjs <folder> <module> --apply    move + index
node Server/ProjectMove.mjs --undo [--run <id>]          put the last move back
```

One `--apply` writes four things, all by the tool (nobody indexes by hand):
1. `git mv` of the folder (plain rename if untracked).
2. A `project` line (`{id,path,url,title,state,completion,moved_from,at}`) in the day stream `ai/sessions/YYYY/MM/DD/index.jsonl` of the **start day** and of **today** ([AIIndexStream](/Server/AIIndexStream.mjs)).
3. One `log` line in the owning session's record file (nearest ancestor with `session.jsonl` / `task.jsonl`): `project <slug> moved to <url> (was <path>)`.
4. One line in `ai/sessions/project-moves.jsonl` (the manifest: run id, from, to). `--undo` moves the folder back and appends mirror lines everywhere; it rewrites nothing.

Proof (2026-10-20): `plan-539-tasks` moved from its session to `core/Task/projects/2026/10/20/plan-539-tasks/`, both lines and the pointer appeared, `--undo` restored it.

## Plan for the module tasks (not moved in this task)

`AIIndex.homes()` (what `Server/TaskHomes.mjs` counts) found **497** task folders in **85** `<module>/tasks/` homes on 2026-10-20 (the brief's 539 counted an older walk). Biggest: ai/tasks 86, ext/Figma 73, core/Page 45, ux/Dictate 36, servex 29, ext/Refine 27.

| Becomes | Rule | Roughly |
|---|---|---|
| a **project** in `<module>/projects/…` | has subtasks (`{"task": ref}` or `tasks` lines), or a `requirements.md` / `report.md` beside the log | 5 have subtasks; count the rest when writing the script |
| a **log line** in its origin session | only a log, one goal, landed or idle: the line says title, state, landed_at, and links the commit | the rest |

How it will run (a later task, scripted, never retyped): a node script plans with the rule above, writes a manifest of old to new paths, dry run first, `git mv` for projects, an appended line for the others, and a `home` pointer in the old folder so old links still open. Alternative considered: move all 497 as projects. Rejected: it keeps micro tasks in modules, which the owner ruled out.
