# core/Task: an approved task with an `agent` spawns itself (templates, first slice)

Budget: $6. Sonnet, medium effort. Parent: `mastermind-checkup-task-system` (message it when you land).

## What to build

The design is [core/Task/doc/templates.md](/framework/core/Task/doc/templates.md): read it first, then the readme chain down to `public/framework/core/Task/readme.md`. The owner's ask: [owner-2026-10-17-node-driven.md](/framework/core/Task/doc/owner-2026-10-17-node-driven.md). Build only "The first slice":

1. **`Task.TEMPLATES`** (static, in `core/Task/Task.js`): `code`, `doc`, `scan`, each a few plain fields (`worktree`, `commit`, `review`, `model`, `permission_mode`), as the table says. Add `template` and `agent` to `Task.FIELDS` so replay keeps them in `data`.
2. **`TaskLoop.launch(file)`** (`Servex/TaskLoop.js`): reads the task with `Task.replay`. It does nothing unless the state is `running`, `data.agent` is set and there is no `spawn` line yet. Then it runs `node Server/PastWork.mjs --task <dir>` (skip quietly if that script is missing), checks the slot (Servex's monitor hot flag; on hot it appends `{"queue":{"at","why"}}` and returns), and calls `this.servex.agents.spawn({...})` with the role, model and effort from `data.agent` (filled from `Task.TEMPLATES[template]` where unset), `task: {dir, brief: data.agent.brief}`, and `parent` = line 1's `by` when that is a live agent id. Then it appends `{"spawn":{"at","agent","session_id","by":"TaskLoop","author","approved_by"}}`, every value from node, none typed. Writes go through TaskLoop's own per-file write chain (`this.queues`).
3. **The trigger:** the `item` tool (`Servex/agents/page_tools.js`, the `item` tool around line 700), right after it writes a delta that contains `approve`, calls `servex.task_loop?.launch(file)` and does not await a failure into the tool's answer. TaskLoop's tick also calls `launch` on files with a `queue` line and no `spawn` line (the retry).
4. **Tests:** a unit test beside `Servex/TaskLoop-state.test.mjs` with a fake `servex` (agents.spawn records its spec): a waiting task with `agent` + `approve` spawns once and writes one `spawn` line; a second `launch` is a no-op; a task with no `agent` spawns nothing; a hot flag writes `queue`, not `spawn`. Then the proof the design names: one dummy task on a **private Servex port** (`SERVEX_PORT`, never port 80 or 8090; read `Servex/readme.md` for how a test Servex starts) with `agent.role: "echo"` or the Echo agent (`Servex/agents/Echo.js`) so it costs nothing; show `list_agents` on that port with the spawned id matching the `spawn` line. Stop that private Servex after.

## Rules

- Work in your pool worktree; commit there; the parent reviews the diff and merges. Never restart the real Servex: the change goes live at the next restart, so write `{"log":{"at":"NOW","msg":"…","needs_restart":"TaskLoop.launch"}}` in your task.jsonl.
- Do not change behaviour for tasks without `agent`: every old task must replay and loop exactly as before (`node public/framework/core/Task/Task.test.mjs` and `node Servex/TaskLoop-state.test.mjs` still pass; `TaskLoop-steps.test.mjs` already fails with a cleanup EPERM on dev, so leave that one as it is).
- Out of scope (later slices): the `code` worktree step (Servex's pool already gives every fresh minion a worktree), the review gate at `complete`, the `doc` link check.
- Land: one-line readme mention in `core/Task/readme.md` ("Templates") pointing at templates.md, a landing line in this dir's task.jsonl, then message `mastermind-checkup-task-system` with the commit hash and the private-port proof.
