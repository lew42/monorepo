# Owner notes, 2026-10-16 (late): the node side of tasks (dictated; decisions by voice-app where left open)

Fifth note of the day. Facts verified 2026-10-16 ~20:30: `Servex/TaskLoop.js` and `Server/TaskState.mjs` import `core/Task/Task.js` and replay task.jsonl into real `Task` instances (steps 1-2). `Servex/agents/page_tools.js` (page_set) does NOT instantiate Page; it deep-merges plain objects into the file. So the item tool is the first node code to hold live Items for pages.

## One class, both sides

`Task` (DOM-free) loads client side and server side. `Task.View` is the UI. Node drives tasks with the same class; if node needs more, it is `class ServerTask extends Task` or a driver that holds Tasks, never a second Task. **Decided:** no ServerTask until a concrete need; the driver is `Item.Store` plus TaskLoop.

## One instance in memory

Any item tool call that names a task reaches the same instance: `Item.Store.for(url)` is already one store per JSONL file; node keeps a cache of instantiated roots keyed by file, so two calls on the same path see one object. Creating a task is `parent.set({tasks:{add:{type:"Task", ...}}})` on the instantiated parent; the parent and the child work out where and how to save (the child's store is the parent's store unless the child has its own file). The tool passes deltas; it knows no implementation.

## Subtasks: one file

**Decided:** a task.jsonl holds any number of child tasks as nested deltas (`{"tasks":{"add":{...}}}`, then `{"<child id>":{...}}`), exactly as a page.jsonl holds its content. A child gets its own folder only when something gives it its own file (a page.jsonl, proofs, requirements.md); that folder is created on demand and the parent records `{"file":"<child>/task.jsonl"}` for it, the same two storage variants subpages already have (`core/Page/doc/subpages.md`). One way by default, the second only when needed.

## Naming, clashes, dates

- A task folder is `<module>/tasks/<slug>/`. **Decided:** flat slugs; the tool REFUSES a slug that exists (never overwrites) and offers `<slug>-2`; the `created` line gives chronology; dated subfolders are not used for module tasks (session folders are dated already). Whether anything today overwrites on a clash is to be checked once (TaskDirs.new).
- App path vs file path: the tool takes the app path (`/framework/core/Task/`); node maps it to the file. Same path on both sides.

## Discovery

`files.jsonl` already exists in every directory (written by `Server/ModuleLog.mjs` and friends); a new `tasks/<slug>/` is one more line in the parent's files.jsonl, and node rebuilds `ai/tasks/` from those. No hand-kept index.

## Context card

The task renders inside the context card of its home module (icon + title the module already has). Seeing the card says what the task is about before reading it. Most tasks should be module tasks for this reason.

## Stages and icons

The owner wants to see what stage a task is in at a glance: raw prompt (not handled yet) → task (planned, `idle`) → `waiting` (proposal, approval) → `running` → `complete`; plus `paused`, `stopped`. Each state gets one icon in `Task.View`. A task that is not complete stays unchecked and in view.

## Tasks and sessions, both ways, no copies

- A task carries `sessions`: every session that created or worked on it (a task survives many sessions over months). A session carries `task` reference lines. Each side is a reference; neither copies the other's data.
- Cost on the task = the sum of its sessions' spend attributed to it (agents whose task is this task, `turn_cost` lines since 2026-10-13). Shown on the task.
- `source`: who asked, as distinct from who builds. Values like `voice-app` (Claude mobile/web via MCP), `vscode` (a sidebar tab), `dictate` (the widget), `servex:<agent id>`. Node fills it from what it knows (the `as=` id on the MCP call, SERVEX_AGENT in a spawned agent's env); an agent that cannot tell what it is says so in its first turn rather than guessing.

## Where to see them

Besides the module Tasks tab and /live: the dev shell (`core/Shell`, hotkey, header + two sidebars + footer around any page) gets a Tasks tab, so every page can show the tasks for its path. Filed to core/Shell's inbox.
