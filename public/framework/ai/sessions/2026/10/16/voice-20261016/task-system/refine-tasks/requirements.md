# Refine makes tasks: step 8 of the task system plan

Budget: $4

Prompt refinement already splits each of the owner's prompts into asks. `Server/RefineQueue.mjs` makes them (one Haiku call per prompt), and `Server/AskIndex.mjs` `after_refine(ref, parsed)` records each ask and routes it. This step adds one thing after that: **each recorded ask also becomes a Task**, written through the item tool, so asks and tasks are one record. Read the [plan](../plan.md), section 6 ("Prompt refinement makes the tasks") and step 8; the plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`. **Build only step 8.**

## Decided scope (the smallest slice)

- **Add, don't replace.** The existing ledgers keep their writers today: `public/framework/ai/asks.jsonl` (Servex `Servex/asks/Asks.js`), `ext/Refine/queue/asks.jsonl` and AskIndex's records. This step adds the tasks and a **read-only view** that lists asks from tasks. Retiring the old writers touches a dozen callers, so it's a later step; write that down as one line in `Servex/asks/` docs.
- **No LLM.** Code turns an ask into a task; the Haiku call that made the ask is the only model call.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/refine-tasks`, branch `worktree/refine-tasks`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge; `mastermind-task-system` reviews and merges.
- **Your files:** `Server/AskIndex.mjs` (in `after_refine` and one small helper), `Servex/agents/page_tools.js` (only to export the `run_item` function, if it isn't exported), `public/framework/core/Task/Task.js` (only to add `source` to `FIELDS`, if needed), a new test `Server/AskIndex-tasks.test.mjs`, the view (see 3), and a few doc lines in `public/framework/ext/Refine/doc/asks.md` and `public/framework/core/Task/readme.md`.

## What to build

1. **One task per recorded ask.** In `after_refine`, for each row that `record()` actually wrote (not the ones it skipped as already there), call the item tool's function `run_item({path, delta}, {caller: "refine-queue"})` on **the session's task folder** (the folder of the session that heard the prompt; find how AskIndex or `Server/TaskDirs.mjs` locates a session's folder from its id). The delta is `{"tasks":{"add":{type:"Task", title, expected, module, priority, source}}}`:
   - `title`: the ask, shortened to one line.
   - `expected`: the ask restated as an outcome. Keep it to code: the ask text itself is fine for now.
   - `module`: the module the refiner named (already on the row).
   - `priority`: leave it out unless the row already carries one.
   - `source`: a link, not a copy: `{session, line, id}`, the same three that identify the ask row.
   - The task starts `idle`; don't start it.
   - If the session folder can't be found, skip that ask and count it as `no_folder`; never fail `after_refine` because of this.
2. **No duplicates:** a second `after_refine` on the same prompt must not add a second task for the same `{session, line, id}`. Check the folder's current tasks (replay it) before adding.
3. **The view:** a read-only function, a static on AskIndex (`AskIndex.tasks_view(dir)` or similar), that replays a session folder's `task.jsonl` and returns its asks-as-tasks: `{title, state, module, source}` for each task that has a `source`. That's the start of "asks.jsonl becomes a view".
4. **Field:** `source` must survive replay: if `Task.replay` drops it, add it to `FIELDS` in `Task.js`.

## Check before the commit

- The new test uses a temp session folder under `public/` with a `task.jsonl` line 1, calls `after_refine` with a fake `parsed` holding two asks, and asserts: two tasks added through the item tool (each line stamped `by` and `ts`), each with `source` and `state: "idle"`; a second call adds none; `tasks_view` returns both. Don't call Haiku and don't touch real session folders.
- `node Servex/agents/item_tool.test.mjs`, `node public/framework/core/Task/Task.test.mjs`, `node public/framework/core/Session/Session.test.mjs` and any existing AskIndex test still pass.
- If the worktree has no `node_modules`, borrow the main tree's through a resolver or `NODE_PATH`. Don't copy the folder in, because the git-guard then can't remove it.
- Don't run RefineQueue for real; don't restart Servex; never call `restart_servex`.

## Landing

- Log as you go: `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`, where the lines file is a JSON array.
- When the commit passes, send one message to `mastermind-task-system` with the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
