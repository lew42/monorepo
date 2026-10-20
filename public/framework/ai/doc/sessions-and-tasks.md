# Sessions and tasks: a spawned agent is a session, a task is something to finish

**Decision (the owner, 2026-10-19).** The naming was the bug. An agent the SDK spawns is a **session**: it has a session id. It is not a task. We used to call it one, and that is where the system got confused. A **task** is something that needs to happen and can be finished. They are different things; tasks live inside sessions.

> "Every SDK session should be a session. It should be clear that this represents the session. Then you can have tasks within them. But we shouldn't be calling a session a task."
> "We don't want to create a task for a session."

This page is the plan and the record of what landed. It folds in [task-lifecycle.md](task-lifecycle.md) (its phases and the module-placement choice) and builds on [tasks.md](tasks.md) (how it works today).

---

## The new shape

```
ai/sessions/YYYY/MM/DD/<session>/            a session: session.jsonl
ai/sessions/YYYY/MM/DD/<session>/<sub>/      a sub-session (a spawned helper): session.jsonl, no second YYYY/MM/DD
```

- **Session** = one spawned agent. Folder + `session.jsonl`, nested for helpers. What we call a "task dir" today is a sub-session.
- **Task** = a thing to finish. It lives **inside** a session, and may start as one line in the parent's `session.jsonl` (data embedded, `class Task` replays it), so it needs no folder. A big task (planning, building, investigating) may get a folder or a `<name>.md` beside the log to write into; the task points at what it made and at the prompt (raw or refined) that caused it. A task may or may not spawn an agent.
- **Completion.** A task has `completed` from 0 to 1, with its start and complete times shown. A session may use the same pattern.
- **Project** = a task with subtasks and a requirements stage. `class Project extends Task` is a play class on branch `task/project-class` (a class and a test, nothing wired in).

## What is true already (verified against code, 2026-10-19)

The top half of this is done. `Server/SessionRecord.mjs` (2026-10-17) renamed `task.jsonl` to `session.jsonl` in **top-level session folders** (1,287 folders hold `session.jsonl`). Every reader goes through `SessionRecord.file/log_file`, which accepts both names. What is left is the **sub-session folders**: 1,100 still hold `task.jsonl`. `SessionRecord.start_file(dir, first)` decides the name for a new folder, and only a folder directly under a day gets `session.jsonl`.

## The two questions

**What is `TaskDirs`, and why a class?** `Server/TaskDirs.mjs` is the one path builder: `dir({slug, session_id, parent, day})` makes a folder's path, and `find`, `follow`, `redirect`, `alias`, `refuse`, `census`, `plan/apply/verify/undo` keep old addresses working. It is a class because it holds the rules of the store in one place. The owner's read is right: it is a path resolver that absorbed three folder-shape changes (`ai/<date>/` into the sessions tree, UTC day into local day via `SessionDayMove`, and card moves), each one recorded in a moves manifest. It survives the rename as `SessionDirs`; the old name stays as an alias like every other old address.

**What writes `<module>/tasks/` today?** Three things, not two:
1. the item tool's `tasks.add` / `make_child` (`Servex/agents/page_tools.js`), indexed by `Server/TaskHomes.mjs`;
2. `Server/TaskMigrate.mjs`, a one-off that moved 211 tasks;
3. `Server/UndoneToTasks.mjs`, which makes idle tasks for asks verified undone (manifest `ai/asks/undone-to-tasks.jsonl`).

`AskIndex` is not a writer here: it writes `asks.jsonl` and the module inbox only.

## What renames, what stays

| Renames | Stays |
|---|---|
| spawned-agent folder log: `task.jsonl` to `session.jsonl` (new spawns first, then old folders by script) | `class Task` and the verbs (`assign`, `log`, `wait`, `approve`…) |
| `open_task` / `default_task` language to session | the append-only, one-verb-per-line log |
| `TaskDirs` to `SessionDirs` (old name kept as alias) | `State`, `ai/state.json` (it folds sessions and tasks) |
| a task that is only a line: no folder at all | module homes `<module>/tasks/` until the placement decision is made |

## What breaks if done carelessly (counts are a snapshot of 2026-10-19; `node Server/SessionRecord.mjs --plan` recounts)

189 code files outside the store mention `task.jsonl`. Heaviest: `Servex/agents/page_tools.js` (16), `Agents.js` (16), `Server/review.mjs` (15), `TaskMigrate.mjs` (15), `Servex/asks/tasks.js` (12), `SessionRecord.mjs` (10). Also hooks (`append.mjs`, `jsonl-schema`, `ledger`, `naming-guard`, `prompt-relay`, `reply-relay`, `step-prompt`, `hold-guard`), four skills, and 221 `.md` files. A reader that types `"task.jsonl"` instead of asking `SessionRecord` will not see a new sub-session. So the order matters: readers first, writers last.

## Slices (each merged the moment it works; old paths keep resolving)

1. ✅ This plan, merged.
2. ✅ mostly (2026-10-19, the task-system agent): runtime readers go through `SessionRecord.log_file` with a `task.jsonl` fallback; left over were `Steps.mjs --show/--step`, two hooks (`prompt-relay`, `naming-guard`) and the browser `TaskPage`, folded into slice 3.
3. ⏳ **New sub-sessions write `session.jsonl`** (2026-10-20, [session-record/](../sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/session-record/requirements.md)). The rule is sharper than "any session_id": a VS Code tab's task also carries its session's id on line 1 (the `new-task` skill requires it) and must stay `task.jsonl`. A folder is a session when line 1 is a **spawn line**, `assign.session_id` **and** `assign.agent`, which only Servex's `open_task` writes.
4. ⬜ **Old folders by script.** Extend `SessionRecord` plan/apply/undo to the 1,100 sub-session folders (dry run, manifest, reversible).
5. ⬜ **Task as a line.** `completed` 0–1 plus start/complete times in `Task.replay`; a task with no folder; a session lists its tasks (closes gap b).
6. ⬜ **`SessionDirs`** rename with alias; module placement per task-lifecycle (option A or B).

## Guiding principle for the whole AI system

**Effective parallel work between sessions.** A parent decides whether to answer itself or hand off; helpers are reused; tasks get created, tracked, logged and finished. Everything above serves that: a session is who is working, a task is what must be done.
