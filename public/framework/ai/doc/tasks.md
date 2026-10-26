# Tasks: what a task is, where it lives, who makes it, how to see it (2026-10-19)

Read this once instead of researching. Short index: [../tasks/readme.md](../tasks/readme.md). Plan and history: [one-state.md](one-state.md), [one-dashboard.md](one-dashboard.md), [task-folders.md](task-folders.md).

> **The rule (the owner, 2026-10-26): a task stays in the session that files it** (a nested line in that session's `session.jsonl`, or `<session>/<slug>/` when it needs files). A module folder `<module>/tasks/<slug>/` only when the owner explicitly asks, with `home: "<module>"` on the add. `module: "<module>"` is just a tag: a module's page finds its tasks through the index (`AIIndex` rows carry `module`), never a copy. The old module-primary tasks (about 539) stay where they are until the owner asks to move them.

## 1. What a task is

A **task** is a folder with one file, `task.jsonl`: a log where each line is one fact ("started", "log this", "finished"). Its state is never stored; it is worked out by replaying the lines ([`core/Task/Task.js`](/framework/core/Task/), `class Task extends Item`). States: idle, running, paused, waiting, stopped, complete.

## 2. Where tasks live: two homes

| Home | Path | Count (10-19) | Made by |
|---|---|---|---|
| Session store | `ai/sessions/YYYY/MM/DD/<session>/<task>/` | about 1,100 | `new-task` / `TaskDirs`, or Servex when it spawns an agent |
| Module | `public/framework/<module>/tasks/<slug>/` | about 500 | the item tool (`tasks.add`), `Server/TaskMigrate.mjs`, `Server/UndoneToTasks.mjs` |

**Links between them.** A module task lists its sessions (`"sessions":[{id,task}]`); a migrated session task carries a `{"home": url}` line; a `tasks.add` through the item tool also files a `{"task": path}` pointer into the caller's own log (step 16). **Not linked:** the agent's own task, opened by Servex or `TaskDirs`, gets no pointer to its module, and a session does not record its tasks. So "open a fresh session in a module and see every past task" works only through [/tasks/](/tasks/) and `index.json`, not through the readme chain.

## 3. Who makes a task (the tooling)

| Who | Tool | What it does |
|---|---|---|
| A Servex agent (SDK) | nothing to run: `spawn_agent` with `task: {dir, brief}` (or none: `Agents.default_task` picks `ai/sessions/<day>/<caller's session>/<agent id>/`) | `open_task` in `Servex/agents/Agents.js` writes line 1 (`assign`) before the first turn. The agent's prompt says "your task is already open". |
| A Claude Code tab (VS Code) | `node Server/TaskDirs.mjs --new <slug> [--session <uuid>] [--parent <dir>]` (the `new-task` skill; there is no MCP tool called `new-task`) | makes the folder and prints it; you then append line 1 with `node .claude/hooks/append.mjs` |
| Any agent, a sub-task or a task for a module | the **item tool**, `item({path, delta:{"tasks":{"add":{title, module?, home?}}}})` (`mcp__local__item` in-process, `mcp__servex__item` over MCP) | nests the child in the session's log (`module` is a tag; `home` makes `<module>/tasks/<slug>/`, only when asked) and files the pointers. Detail: [Servex/doc/item-tool.md](/Servex/doc/item-tool.md) |
| Any script | `TaskDirs.dir({slug, session_id, parent})` | the one class that builds a path; never join a date by hand |

**A cloud voice agent** (`ai/sessions/YYYY/MM/DD/cloud-voice-<name>/`): the same tool works today, as `node Server/TaskDirs.mjs --new <slug> --parent public/framework/ai/sessions/YYYY/MM/DD/cloud-voice-<name>` (`--parent` takes any folder, so the session dir need not be a UUID), then line 1 by `append.mjs`; the `--session` flag alone cannot, because it accepts only a UUID and would name the folder `session-<id8>`. The cloud agent has the Servex `shell` and `write_file` tools, so it can run exactly that. What would make it one call: let `TaskDirs.dir` accept a session folder name (a `session_dir` argument) and expose it as a Servex tool; not built.

## 4. How the data is read

`class AIIndex` ([`Server/AIIndex.mjs`](/Server/AIIndex.mjs), [design](/Server/doc/ai-index.md)) walks both homes, replays each log with `Task.replay`, and writes `ai/index.json` (plus a `index.jsonl` pulse). Servex's `TaskLoop.js` keeps it running. The browser reads it through `ai/rail/DashState.js`; nothing else counts tasks.

## 5. What you can open

- [/framework/ai/](/framework/ai/): the Inbox, one list over `index.json` with filter chips (class `Inbox.Rail extends Browse`, rows `DashRow`).
- [/framework/ai/tasks/](/framework/ai/tasks/) and [/tasks/](/tasks/): saved filters of the same list; [Lanes](/framework/ai/tasks/lanes/) has its own three-column view.
- One task: its own folder url, drawn by `TaskPage extends Page` and the older `AITask` viewer (the two are not merged).

## 6. Checked 2026-10-19

`index.json` was rewritten within minutes of the check; `check.ok` true; tasks 2,124 = sum 2,124 over 2,335 log files (211 aliases); landed today 15 by both counts. The Inbox shows `task 2124` and `Today 15`, the same numbers.

## 7. From a prompt to a landed change, today (one screen)

1. **A prompt arrives** (dictation, a voice agent, a VS Code tab). The master mastermind routes it: a line in `ai/asks.jsonl`, an Inbox card (`create_card`), its essence into the module's `inbox.jsonl` ([Servex/doc/module-inbox.md](/Servex/doc/module-inbox.md)).
2. **Work is handed to one task mastermind.** `spawn_agent` with `task: {dir, brief}` ([sdk.md](/Servex/doc/sdk.md)); `open_task` writes line 1 of `task.jsonl` and `PastWork` writes `past-work.md` beside the brief (`requirements.md`, the owner's words) before the first turn.
3. **It works** (skill `sub-mastermind`): a worktree for anything risky, minions only for parallel work, steps from `Server/Steps.mjs` (a node-driven checklist: smoke, commit and merge, `finish-task`; [steps.md](/Servex/doc/steps.md)); `TaskLoop` nudges a quiet agent ([task-loop.md](/Servex/doc/task-loop.md)); a fresh reviewer reads the result (`Server/review.mjs`).
4. **It lands:** `Server/merge.mjs` smoke-tests and merges, `finish-task` appends a `finish`/`complete` line, `on-landing.mjs` stops what the task started ([lifecycle.md](/Servex/doc/lifecycle.md)).
5. **It shows:** `State` folds the log into `index.json`; the Inbox lists it. No agent writes the counts.

What is missing is the steps before "work": requirements, investigation, plan and approval are today only habits of the skill, not recorded states. Proposal: [task-lifecycle.md](task-lifecycle.md).

## 8. Audit: is each task reachable from its session and each session from its tasks? (2026-10-19)

Counted by script over `public/framework/` and `index.json` (2,125 tasks: 1,586 in session folders, 539 in module homes).

| Link | Result | How it is reachable |
|---|---|---|
| session to its tasks | yes, by position; 37 of the 42 session logs that exist also name their task (test T6, section 9) | a task is a folder inside its session folder; the day `index.json` has `links.task: null` for all 87 of 10-19's sessions |
| task to its session | 1,498 of 1,586 session tasks, 478 of 539 module tasks | `assign.session_id` on line 1 (or the parent folder); 59 old task folders sit under a day with no session folder at all |
| task to its module | **0 of 1,586 session tasks** | only module-home tasks carry `module`, so "every task about this module" cannot be asked of a session task |
| module to its tasks | yes for module homes | `<module>/tasks/` plus the `public/tasks/task.jsonl` index; session tasks never appear there |
| session to module | no | nothing |

**Where data is duplicated (the hard rule says it must not be):**
- **The 211 migrated tasks:** the module home and the old session folder both hold the full log (112 old copies still have more than three lines); `State` counts them once through the `home` line, but two files hold one task.
- **`public/tasks/task.jsonl` (86 lines) and each `tasks/task.jsonl`:** an index of homes, rebuilt by `Server/TaskHomes.mjs`; a second list of what the folders already say.
- **`index.json`, the day `index.json`, `files.jsonl`:** derived and rebuilt by code (`index.json` and `index.json` are gitignored), so they are caches, not duplicates; fine as long as nothing reads them as the source.
- **The `sessions` field in a module home and the reverse `home` line:** one fact written in two logs, kept in sync only by the one migration script.

## 9. Where the handoffs break: theories, each tested (2026-10-19)

Each row is a guess about where prompt, session, task, agent and landed change come apart, and a check that reads real data. Run it yourself: [`handoff-tests.mjs`](../sessions/2026/10/19/cloud-voice-agent/task-system/handoff-tests.mjs) (`node handoff-tests.mjs`; it writes nothing; last output in `handoff-results.json` beside it). **FAIL means the theory is true: the handoff breaks.**

| # | Handoff | Theory | Result |
|---|---|---|---|
| T1 | prompt to ask to card | every ask names a card that exists | **FAIL 66 of 71** asks name a card that is not in `index.json` |
| T2 | ask to task | the ask's owner agent has a task | **FAIL 44 of 71**: the owner id on the ask matches no task's agent |
| T3 | spawn to task | a task born since 10-12 has `assign` with session and agent on line 1 | **FAIL 20 of 443** (line 1 is something else) |
| T3b | spawn to task | the same task has a title | **FAIL 234 of 436**: `open_task` writes no title |
| T4 | task to session | a session-store task names its session | **FAIL 88 of 989** |
| T5 | task to module | a session-store task names its module | **FAIL 989 of 989** |
| T6 | session to task | the session log names its task | **FAIL 5 of 42** (37 do) |
| T7 | merged change to task | a task whose commit is on `michael/dev` is `complete` | **FAIL 8 of 65**: merged, never closed |
| T8 | landed to record | a complete task has an outcome sentence | **PASS** 0 of 767 |
| T9 | work to ending | an open task was touched in the last 3 days | **FAIL 344 of 761** (319 stopped, 25 idle) |
| T10 | agent end to landing | an agent that "ended without landing" later lands | **FAIL 163 of 313** |
| T11 | parent to sub-task | a nested task is named in its parent's log | **FAIL 33 of 378** |
| T12 | task to card | a card is done when all its agent's tasks are | **FAIL 18 of 19** cards stay open |
| T13 | migration | one task is in one file | **FAIL 211 of 2,127** |

**What it says.** The one thing that works is the end of the chain: a task that lands has an outcome (T8). The breaks are at the joins: a task has no module (T5), an ask has no card or owner task (T1, T2), a finished agent leaves its task open (T9, T10, T7), and a landed task leaves its card open (T12). These are the same joins [task-lifecycle.md](task-lifecycle.md) closes; it is proposal only, so none is fixed.

**Instrument notes.** T1 and T2 use the latest line per ask title (the file is append-only); T9 counts "last line older than 3 days", so a quiet but meant-to-wait task also fails; T3 skips review tasks.

## 10. Built, working, wired, or only a concept (verified against the code, 2026-10-19)

| Piece | Status | Evidence |
|---|---|---|
| `core/Task/Task.js` state machine and replay | built, works | `Task.test.mjs` 53 of 53 |
| `Server/TaskDirs.mjs` (`dir`, `--new`, `find`, `follow`) | built, works, wired (Servex `open_task`, `append.mjs`) | `TaskDirs.test.mjs` ok |
| `Server/TaskState.mjs` and `State.mjs` to `index.json` | built, works, wired (`TaskLoop`, the Inbox) | `TaskState.test.mjs` ok; self-check true |
| `Server/TaskHomes.mjs` (index of module homes) | built, works; dry run says the index lists every home | `node Server/TaskHomes.mjs` |
| `Server/TaskMigrate.mjs` | built, one-off; dry run only unless `--apply` | `TaskMigrate.test.mjs` |
| `Server/UndoneToTasks.mjs` | built; makes idle tasks in module homes from undone asks | `--plan` |
| `module` on a session task | concept: written by nobody | T5, 989 of 989 lack it |
| `phase`, `Project extends Task` | concept | [task-lifecycle.md](task-lifecycle.md) |

**The three gaps, confirmed by reading the code.**
- **(a) Module placement is never automatic, and since 2026-10-26 never the item tool's default either:** only an explicit `home` puts a task in a module. `TaskDirs.dir({slug, session_id, parent, day})` and `Agents.open_task` have no `module` argument. A task reaches `<module>/tasks/<slug>/` only when an agent calls the item tool's `tasks.add` with `home` (the owner asked for it), when `TaskMigrate` is run once, or when `UndoneToTasks` files an idle task for an undone ask.
- **(b) Sessions do not list their tasks.** Corrected: the task is a folder inside the session folder, and 37 of the 42 session logs that exist also name it, but no session field lists tasks and the day `index.json` has `links.task: null`; "this session's tasks" is a query on `index.json` (`session`).
- **(c) No single page said how a prompt becomes a task:** section 7 above does, and [task-lifecycle.md](task-lifecycle.md) proposes the missing phases.
