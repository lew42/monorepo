# Tasks — what is in flight, queued and landed, and how the board reads it

A **task** is a folder whose `task.jsonl` is a log, one fact per line; its state is never stored, it is replayed from the lines. This module is the **board**: the page `/framework/ai/tasks/` and the three classes behind it. What a task is, its two homes, who makes one: [../doc/tasks.md](../doc/tasks.md) (read that first). The state machine itself is [core/Task](/framework/core/Task/): `class Task extends Item`.

## On disk

```
ai/sessions/YYYY/MM/DD/<session>/<task>/      a task made from a session  (≈1,100)  task.jsonl, requirements.md, past-work.md, report.md
public/framework/<module>/tasks/<slug>/       a task that belongs to a module (≈500)  task.jsonl, …
ai/state.json                                 the whole picture: every task in a bucket (generated)
ai/tasks/state.jsonl                          one line per change of the picture (generated, gitignored; the pulse)
ai/tasks/                                     this module: the 87 old task folders kept here, plus the files below
```

Buckets in `state.json`: `landed`, `in_flight`, `queued`, `waiting`, `idle`, `stopped`, `stale`.

## How data gets in

| What | Writer, called from |
|---|---|
| a task folder and its line 1 `{"assign":{session_id,agent,title,model,requested_at,…}}` | `Agents.open_task()` (`Servex/agents/Agents.js`) when `spawn_agent` runs; or `node Server/TaskDirs.mjs --new <slug>` then `append.mjs` for a VS Code tab; or the item tool `tasks.add` for a module task |
| every later line (`log`, `decision`, `finish`, a landing `assign.landed_at`) | `node .claude/hooks/append.mjs <task.jsonl> <lines.json>` (validated by `.claude/hooks/jsonl-schema.mjs`) |
| `state.json` and `state.jsonl` | `Server/State.mjs`: replays every `task.jsonl` through `core/Task/Task.js`. `Server/TaskState.mjs --watch` is the thin caller that Servex's `TaskLoop.js` runs; it re-checks the agent registry every 5 s and writes only on a change. `--print` shows one snapshot. |

## How data is read

```js
class DashState extends TaskStateLog      // ai/rail/DashState.js: tails state.jsonl; each new line refetches state.json → DashRow.rows()
class TaskStateLog extends JSONL          // ai/tasks/TaskStateLog.js: the tail of state.jsonl, state = the last line
class TaskLanes                           // ai/tasks/TaskLanes.js: three columns (in flight, queued, landed today) over the same DashState
class SavedFilter extends Page            // ai/tasks/SavedFilter.js: forwards /framework/ai/tasks/ to the Inbox with the `tasks` chips on
```

`page.js` is a `SavedFilter` with `preset: "tasks"` (`DashChips.SAVED`); `lanes/` and `architecture/` are routed children; `/framework/ai/tasks/2026~10~19~…` opens an `AITask` page ([ai/AITask](/framework/ai/AITask/)). The list itself is the [Inbox](/framework/core/Page/ext/Inbox/) over `state.json`. A single task's page: `core/Task` `TaskPage` for module tasks, `AITask` for session tasks (two viewers, not merged).

## Overlaps

Two homes, one reader: `State.mjs` counts both. `task.jsonl` vs `session.jsonl` (the name in a session folder): [ai/sessions](/framework/ai/sessions/). `ai/handover.md` is computed from the same state; `board.jsonl` is retired.

## More

[doc/architecture.md](doc/architecture.md) · [../doc/tasks.md](../doc/tasks.md) · [../doc/one-dashboard.md](../doc/one-dashboard.md) · [../doc/task-folders.md](../doc/task-folders.md) · [doc/week-2026-10-17.md](doc/week-2026-10-17.md) · [../doc/dashboard-layout-asks.md](../doc/dashboard-layout-asks.md) · the readme before this rewrite, with its dated problems list: [doc/readme-before-2026-10-19.md](doc/readme-before-2026-10-19.md).
