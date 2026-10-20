# Tasks: what a task is, where it lives, who makes it, how to see it (2026-10-19)

Read this once instead of researching. Short index: [../tasks/readme.md](../tasks/readme.md). Plan and history: [one-state.md](one-state.md), [one-dashboard.md](one-dashboard.md), [task-folders.md](task-folders.md).

## 1. What a task is

A **task** is a folder with one file, `task.jsonl`: a log where each line is one fact ("started", "log this", "finished"). Its state is never stored; it is worked out by replaying the lines ([`core/Task/Task.js`](/framework/core/Task/), `class Task extends Item`). States: idle, running, paused, waiting, stopped, complete.

## 2. Where tasks live: two homes

| Home | Path | Count (10-19) | Made by |
|---|---|---|---|
| Session store | `ai/sessions/YYYY/MM/DD/<session>/<task>/` | about 1,100 | `new-task` / `TaskDirs`, or Servex when it spawns an agent |
| Module | `public/framework/<module>/tasks/<slug>/` | about 500 | the item tool (`tasks.add`), `Server/TaskMigrate.mjs`, `Server/UndoneToTasks.mjs` |

**Links between them.** A module task lists its sessions (`"sessions":[{id,task}]`); a migrated session task carries a `{"home": url}` line; a `tasks.add` through the item tool also files a `{"task": path}` pointer into the caller's own log (step 16). **Not linked:** the agent's own task, opened by Servex or `TaskDirs`, gets no pointer to its module, and a session does not record its tasks. So "open a fresh session in a module and see every past task" works only through [/tasks/](/tasks/) and `state.json`, not through the readme chain.

## 3. Who makes a task (the tooling)

| Who | Tool | What it does |
|---|---|---|
| A Servex agent (SDK) | nothing to run: `spawn_agent` with `task: {dir, brief}` (or none: `Agents.default_task` picks `ai/sessions/<day>/<caller's session>/<agent id>/`) | `open_task` in `Servex/agents/Agents.js` writes line 1 (`assign`) before the first turn. The agent's prompt says "your task is already open". |
| A Claude Code tab (VS Code) | `node Server/TaskDirs.mjs --new <slug> [--session <uuid>] [--parent <dir>]` (the `new-task` skill; there is no MCP tool called `new-task`) | makes the folder and prints it; you then append line 1 with `node .claude/hooks/append.mjs` |
| Any agent, a sub-task or a task for a module | the **item tool**, `item({path, delta:{"tasks":{"add":{title, module?}}}})` (`mcp__local__item` in-process, `mcp__servex__item` over MCP) | makes the child in `<module>/tasks/<slug>/` and files the pointers. Detail: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md) |
| Any script | `TaskDirs.dir({slug, session_id, parent})` | the one class that builds a path; never join a date by hand |

**A cloud voice agent** (`ai/sessions/YYYY/MM/DD/cloud-voice-<name>/`): the same tool works today, as `node Server/TaskDirs.mjs --new <slug> --parent public/framework/ai/sessions/YYYY/MM/DD/cloud-voice-<name>` (`--parent` takes any folder, so the session dir need not be a UUID), then line 1 by `append.mjs`; the `--session` flag alone cannot, because it accepts only a UUID and would name the folder `session-<id8>`. The cloud agent has the Servex `shell` and `write_file` tools, so it can run exactly that. What would make it one call: let `TaskDirs.dir` accept a session folder name (a `session_dir` argument) and expose it as a Servex tool; not built.

## 4. How the data is read

`class State` ([`Server/State.mjs`](/Server/State.mjs), [design](/Server/doc/state.md)) walks both homes, replays each log with `Task.replay`, and writes `ai/state.json` (plus a `state.jsonl` pulse). Servex's `TaskLoop.js` keeps it running. The browser reads it through `ai/rail/DashState.js`; nothing else counts tasks.

## 5. What you can open

- [/framework/ai/](/framework/ai/): the Inbox, one list over `state.json` with filter chips (class `Inbox.Rail extends Browse`, rows `DashRow`).
- [/framework/ai/tasks/](/framework/ai/tasks/) and [/tasks/](/tasks/): saved filters of the same list; [Lanes](/framework/ai/tasks/lanes/) has its own three-column view.
- One task: its own folder url, drawn by `TaskPage extends Page` and the older `AITask` viewer (the two are not merged).

## 6. Checked 2026-10-19

`state.json` was rewritten within minutes of the check; `check.ok` true; tasks 2,124 = sum 2,124 over 2,335 log files (211 aliases); landed today 15 by both counts. The Inbox shows `task 2124` and `Today 15`, the same numbers.
