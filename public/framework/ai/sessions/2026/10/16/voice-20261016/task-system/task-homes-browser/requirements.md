# Task homes, browser side: step 14b of the task system plan

Budget: $3

Read these first:
- The [plan](../plan.md)'s **Amendments 2**, item 6, plus its Names table and Clarifications. The plan is at `C:/Code/lew42/monorepo/public/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md`.
- The step 14a brief, [task-homes/requirements.md](../task-homes/requirements.md).

Step 14a landed: `tasks.add` through the item tool gives each new task its own folder (`<module>/tasks/<slug>/`, or `<parent>/<slug>/`). The parent's log gets one `{"task": "<app path>"}` reference line, and node resolves it through `Task.resolver` (`Servex/agents/page_tools.js` `link_refs`; `Task.from_ref` in `core/Task/Task.js`).

**Build only step 14b,** in three parts:
1. The browser follows those references.
2. A module's task list.
3. A Tasks tab on every Doc page.

## What to build

### 1. The browser follows references, and the child stays live

- In the browser `Task.resolver` is null today, so `Task.from_ref` returns a `missing` stub.
- Make the browser open the child's own `task.jsonl` through the same Store path `core/Task/TaskPage.js` uses (`Task.Store.for(url).open()`, then attach). The child Task then replays and tails live, so the parent's `completion` updates when the child changes.
- Keep **one** `from_ref`. Two ways to do that:
  - node keeps `resolver` (sync, read from disk), and the browser gets an async attach;
  - or `from_ref` returns a stub with `path`, and a browser-only hook opens the store.
- While loading, the stub shows its path's last segment as its title. It shows `missing` only after a 404.

### 2. A module's task list

- When step 14a's `make_child` homes a task under `<module>/tasks/<slug>/`, it also appends `{"task": "<child path>"}` to `<module>/tasks/task.jsonl`. That is a second reference, not a copy.
- The first time, it also writes that file's line 1, `{"id": "tasks", "path": "/framework/<module>/tasks/", "title": "<module> tasks", "mode": "parallel"}`.
- Write through `write_line`, as 14a does. Never hand-write JSON.
- Every module then has one list Task that holds all of its tasks.

### 3. A Tasks tab on every Doc page

- `ext/Doc/Doc.js` gives every Doc page an Inbox tab (`inbox_section()`, around line 127). Add a `tasks_section()` beside it, in the same pattern.
- The tab renders the module's `tasks/task.jsonl` list Task with `Task.View`, loaded through the Store.
- With no file, it says "No tasks yet" in one line.
- Add `"tasks"` to the section order before `"inbox"`.
- Opt out with `no_tasks: true`, the same as `no_inbox`.
- Don't make it fetch on every page load if Doc already lazy-renders sections. Render it when the tab opens.

### 4. Each child folder routes

- `make_child` also writes a two-line `page.js` in the new folder that instantiates `TaskPage`, so `/framework/<module>/tasks/<slug>/` opens the task full-size.
- Check how the Router reaches a folder that no parent `children:` names. If it can't, say so in your report and link the child from the Tasks tab instead. Don't edit module `page.js` files.

## Where you work

- **Worktree:** `C:/Code/lew42/worktrees/task-homes-browser`, on branch `worktree/task-homes-browser`, made from `michael/dev`. Edit only inside it.
- **One commit.** Do not merge: your mastermind (`mastermind-task-system`) reviews the diff and merges it.
- **Your files:**
  - `core/Task/Task.js`, `core/Task/TaskView.js` and `core/Task/TaskPage.js`
  - `ext/Doc/Doc.js` (only the new section and the order list)
  - `Servex/agents/page_tools.js` (only `make_child`) and `Servex/agents/item_tool.test.mjs`
  - one line each in `core/Task/readme.md` and `ext/Doc/readme.md`

## Check before the commit

**Node:**
- `node Servex/agents/item_tool.test.mjs`: a module add also writes `<module>/tasks/task.jsonl`, with line 1 once and one reference per child, plus the child's `page.js`.
- These must also pass: `Task.test.mjs` 47/47, `Session.test.mjs`, `Item.test.mjs`, and `node Server/AskIndex-tasks.test.mjs`.
- Temp dirs only; delete what the tests made.

**Headless only.** Never drive the owner's tabs. The site at `http://monorepo.localhost` serves `michael/dev`, not your worktree, so serve the worktree's `public/` on a private static port, or intercept in Playwright, and stop the server after.
- Make a fixture module tasks list in the temp tree with two child folders, one running and one complete.
- Load its route: the list shows both children, with their states, from their own files.
- Load `/framework/core/Task/`: the Tasks tab shows "No tasks yet" and there are no console errors except the live-reload WebSocket.
- Load one other Doc page, for example `/framework/core/Item/`, to show nothing else broke.

Don't restart Servex, and never call `restart_servex`.

## Landing

- **Log as you go:** append `log` lines to your own `task.jsonl` with `node .claude/hooks/append.mjs <your task.jsonl> <lines.json>`, where the lines file is a JSON array.
- **When the commit passes, send one message to `mastermind-task-system`:** the hash, what you checked, and what you left undone. Then stop. If it isn't reachable, write the report as a `log` line in your own `task.jsonl`.
- Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
