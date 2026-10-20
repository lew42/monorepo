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

## 7. From a prompt to a landed change, today (one screen)

1. **A prompt arrives** (dictation, a voice agent, a VS Code tab). The master mastermind routes it: a line in `ai/asks.jsonl`, an Inbox card (`create_card`), its essence into the module's `inbox.jsonl` ([Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md)).
2. **Work is handed to one task mastermind.** `spawn_agent` with `task: {dir, brief}` ([sdk.md](/Servex/doc/sdk.md)); `open_task` writes line 1 of `task.jsonl` and `PastWork` writes `past-work.md` beside the brief (`requirements.md`, the owner's words) before the first turn.
3. **It works** (skill `sub-mastermind`): a worktree for anything risky, minions only for parallel work, steps from `Server/Steps.mjs` (a node-driven checklist: smoke, commit and merge, `finish-task`; [steps.md](/Servex/doc/steps.md)); `TaskLoop` nudges a quiet agent ([task-loop.md](/Servex/doc/task-loop.md)); a fresh reviewer reads the result (`Server/review.mjs`).
4. **It lands:** `Server/merge.mjs` smoke-tests and merges, `finish-task` appends a `finish`/`complete` line, `on-landing.mjs` stops what the task started ([lifecycle.md](/Servex/doc/lifecycle.md)).
5. **It shows:** `State` folds the log into `state.json`; the Inbox lists it. No agent writes the counts.

What is missing is the steps before "work": requirements, investigation, plan and approval are today only habits of the skill, not recorded states. Proposal: [task-lifecycle.md](task-lifecycle.md).

## 8. Audit: is each task reachable from its session and each session from its tasks? (2026-10-19)

Counted by script over `public/framework/` and `state.json` (2,125 tasks: 1,586 in session folders, 539 in module homes).

| Link | Result | How it is reachable |
|---|---|---|
| session to its tasks | yes, by position only | a task is a folder inside its session folder; nothing in `session.jsonl` names it; the day `index.json` has `links.task: null` for all 87 of 10-19's sessions |
| task to its session | 1,498 of 1,586 session tasks, 478 of 539 module tasks | `assign.session_id` on line 1 (or the parent folder); 59 old task folders sit under a day with no session folder at all |
| task to its module | **0 of 1,586 session tasks** | only module-home tasks carry `module`, so "every task about this module" cannot be asked of a session task |
| module to its tasks | yes for module homes | `<module>/tasks/` plus the `public/tasks/task.jsonl` index; session tasks never appear there |
| session to module | no | nothing |

**Where data is duplicated (the hard rule says it must not be):**
- **The 211 migrated tasks:** the module home and the old session folder both hold the full log (112 old copies still have more than three lines); `State` counts them once through the `home` line, but two files hold one task.
- **`public/tasks/task.jsonl` (86 lines) and each `tasks/task.jsonl`:** an index of homes, rebuilt by `Server/TaskHomes.mjs`; a second list of what the folders already say.
- **`state.json`, the day `index.json`, `files.jsonl`:** derived and rebuilt by code (`state.json` and `index.json` are gitignored), so they are caches, not duplicates; fine as long as nothing reads them as the source.
- **The `sessions` field in a module home and the reverse `home` line:** one fact written in two logs, kept in sync only by the one migration script.
