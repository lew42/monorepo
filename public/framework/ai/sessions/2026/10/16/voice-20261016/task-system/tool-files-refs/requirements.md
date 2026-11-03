# The item tool files the references: step 16 of the task system plan

Budget: $2

Read the [plan](../plan.md)'s **Amendments 3**, item 3, at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`, and the owner's note `public/framework/core/Task/doc/owner-2026-10-16-ui.md`, "Where, and the session reference" and "Group, do not scatter".

Steps 14a and 14b have landed:
- `tasks.add` through `run_item` (`Servex/agents/page_tools.js`) makes the child's folder (`make_child`), writes the parent's `{"task": path}` line, and adds a reference to `<module>/tasks/task.jsonl`.
- `Task.from_ref` resolves references.

**Build only step 16.**

## What to build

1. **The caller's own log gets a reference.**
   - On every create, `run_item` also appends `{"task": "<child app path>", "by", "ts"}` to the caller's own log.
   - **Whose log:** the caller is `ctx.caller`, the agent id the MCP call carries. Its log is that agent's task dir `task.jsonl`.
   - **Finding the task dir:** `Servex/agents/Agents.js` has `task_dir_for(row)` and the registry (`reg().read()[id]` with `task_dir`). Look up the dir through what is already there, and pass it to `run_item` as `ctx.caller_log` (or a resolver function) from where the tool is registered. `page_tools` stays importable in node without Servex.
   - **When to skip:** no caller, no task dir, or the caller's log is the parent itself. In those cases write nothing extra: never a duplicate line, never an error.
2. **The module from the path.**
   - When an add names no `module`, but the path the call was made on is inside a module, that module is the home. For example, a call on `/framework/core/Task/` or anywhere under it gives `core/Task`.
   - Use the nearest folder under `public/framework/` that has a `readme.md`. Never a dated `ai/sessions/` folder.
   - A session or task path outside a module keeps 14a's rule: the parent's folder.
3. **The grouping rule in the first-call instructions.**
   - `instructions_for` (page_tools) returns, beside `describe()`, a short `rules` list. Put the owner's words in plain sentences:
     - A refinement of an existing task goes into that task (add to its `tasks`, or set its fields). It does not become a new task.
     - New tasks are only for new asks.
     - One goal task per module holds the long-lived work, and new related work goes under it.
     - An idea to keep beside a module while designing is a note, not a task.
     - The tool files the session reference and picks the home folder; never write either by hand.
   - Also add these rules in one place in `Servex/doc/item-tool.md`.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/tool-files-refs`, on branch `worktree/tool-files-refs`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges it.
- **Your files:**
  - `Servex/agents/page_tools.js` and `Servex/agents/item_tool.test.mjs`
  - `Servex/agents/Global.js` or `Agents.js` (only where the tool's `ctx` is built)
  - `Servex/doc/item-tool.md`

## Check before the commit

Node tests, in temp dirs only:
- A create with `ctx.caller_log` set appends exactly one reference line there.
- No caller log: nothing extra is written.
- A caller log that is the parent: no duplicate line.
- A create on a path inside a fixture module, with no `module`, homes under that module's `tasks/`.
- The first call's instructions include `rules`.

These must also pass:
- `Task.test.mjs`, `Session.test.mjs` and `Item.test.mjs`
- `item_tool.test.mjs`
- `node Server/AskIndex-tasks.test.mjs`
- `node Servex/agents/item-local.test.mjs` (the in-process tool path from step 12 must pass the same `ctx`)

Don't restart Servex, and never call `restart_servex`.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`, where the lines file is a JSON array.
- **When the commit passes, send one message to `mastermind-task-system`:** the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
