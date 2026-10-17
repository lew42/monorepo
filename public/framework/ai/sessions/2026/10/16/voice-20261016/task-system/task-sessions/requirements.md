# Task sessions, source and cost: step 3d of the task system plan

Budget: $2 (Sonnet)

Read first: the [plan](../plan.md), **Amendments 4**, item 4. The plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`.

**Build only step 3d:** three fields on every task.

## What to build

1. **`sessions`**: every session that created or worked on the task, as `[{id, task}]`.
   - The field already exists: `Task.FIELDS` gained `sessions` and `home` (mastermind-task-migrate, `Server/TaskMigrate.mjs`). Keep that shape; don't add a second one.
   - Node fills it: when the item tool (`Servex/agents/page_tools.js`, `make_child` and the `set` path) writes to a task for a caller, add that caller's session to `sessions` if it is not there yet. One append line, never a rewrite.
   - A `Task` getter returns the list (empty when absent).
2. **`source`**: who asked: `voice-app`, `vscode`, `dictate` or `servex:<agent id>`.
   - Node fills it on line 1 of a new task, from the `as=` id (`ctx.caller`) or `SERVEX_AGENT`. An agent never types it.
   - Old lines used `source` for a doc path (e.g. `"/framework/.../plan.md"`). Never rewrite them. The getter tells the two apart: a value starting with `/` is a doc link, returned by a `doc` getter, and `source` is then `undefined`.
3. **`cost`**: computed, never stored. The sum of the `turn_cost` spend of the agents whose task is this task.
   - `Agents.logged_cost(id)` (`Servex/agents/Agents.js` ~line 547) already sums one agent's `turn_cost` lines. Reuse it; don't write a second summer.
   - An agent's task is the `dir` / `parent_task` on its `assign` line. Put the computation in node (a static on `Task` with a resolver, or a small method in `Servex/`), so the browser can read it later through the same call.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-sessions`, branch `worktree/task-sessions`, from `michael/dev`. Edit only inside it.
- **Your files:** `public/framework/core/Task/Task.js`, `Servex/agents/page_tools.js` (only where a task line is written), `Servex/agents/Agents.js` (only a cost-for-task reader if you need one), their tests, and one line in `public/framework/core/Task/readme.md`.
- mastermind-task-migrate also works on Task fields; don't touch `Server/TaskMigrate.mjs`.
- **One commit,** attributed `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not merge: `mastermind-task-system` reviews and merges.

## Check before the commit

- `node public/framework/core/Task/Task.test.mjs` and `node Servex/agents/item_tool.test.mjs` pass, with new tests for each field. (`page_tools.test.mjs` line 123 already fails on dev; not yours.)
- Report the hash and the test counts to `mastermind-task-system` with `send_to_agent`, in a few lines.
