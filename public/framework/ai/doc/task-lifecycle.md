# Task lifecycle: one design for prompt to landed change (proposal, 2026-10-19)

**Goal (the owner):** prompts become outcomes through tasks; tasks live in the session and, as they solidify, are findable from the module; subtasks and projects come from requirements, then investigation, planning, approval, then the start (worktree, mastermind); nothing duplicated and kept in sync, nothing lost, everything visible. What exists today and where it leaks: [tasks.md](tasks.md) sections 7 and 8. Nothing here is built.

## The design: the session folder is the log, the module is a query

- **Born:** in the session folder that owns it, `ai/sessions/YYYY/MM/DD/<session>/<task>/task.jsonl` (what `open_task` and `TaskDirs` already do). A subtask nests inside its parent. A task with no session yet (an idea from an ask) is born in the module's `tasks/` as today and gains a session reference when someone works it.
- **Line 1 carries `module`** (the nearest folder under `public/framework/` with a readme; `tasks.add` already computes it), written by `open_task` and `TaskDirs --new`. That is the one missing fact: today 0 of 1,586 session tasks have it.
- **Found from the module with no copy:** `load_module` and the module page ask `state.json` for `module = <this>`; `State` already reads every log. No pointer lines, no index to rebuild, no sync. "Solidifying" a task into the module never copies or moves it; it just means its `module` is set.
- **Found from the session:** the session folder holds its tasks; the Sessions grid asks `state.json` for `session = <id>` (State already has `sessions` rows with task counts).
- **Never lose:** append-only logs; the 211 duplicate migrated copies are the one place two files hold one task, and stay until a script (dry run first, undo) folds each old copy into a single `{"home": url}` stub.

## Lifecycle: six phases on the one Task state machine

| Phase | What it means | Recorded as |
|---|---|---|
| requirements | the owner's words and numbered asks | `requirements.md` beside the log; `phase: requirements`, state `idle` |
| investigation | read-only research (past work, code) | `phase: investigation`, state `running` |
| plan | the steps and subtasks, with estimates | `phase: plan` and the `steps` (Steps.mjs template) |
| approval | the owner (or a rule) says go | existing `wait` and `approve` verbs: state `waiting`, then `running`; `Needs you` already lists it |
| work | worktree, mastermind, minions | `phase: work`, state `running` |
| landed | merged and reviewed | `complete` (state `complete`) |

**A project is an upgraded task** (the owner's word): the same task, taken through all six phases and split into subtasks, each of which is itself a task with its own phase. There is no second kind of thing; "project" is what you call a task once it has requirements and subtasks.

Only **`phase`** is new: a plain field set with the item tool (`{"phase":"plan"}`), latest wins, replayed by `Task.js`; `State` copies it into each row. A project's progress is computed from its subtasks.

## The view

The Inbox's task rows group under headings by `phase` (Requirements, Investigating, Planned, Needs approval, Working, Landed) with the module on each row. This is also the fix for the tasks page being an unlabeled flat list ([tasks/readme.md](../tasks/readme.md), Known problems). One list, no new page.

## Why these joins: tested, not guessed

The handoffs that break today were each checked against real data (13 theories, 12 failed): [tasks.md](tasks.md) section 9, script `handoff-tests.mjs`. Build order below follows the worst failures.

## Smallest build, in order

1. `open_task` and `TaskDirs --new` write `module` on line 1 (a backfill script for the 1,586 existing tasks, from the folders and files named in their logs, dry run first).
2. `Task.js` reads `phase`; `State` adds it to the row.
3. `load_module` lists a module's open tasks from `state.json`.
4. The Inbox groups by phase.

## Alternative, named

**A pointer line in the module for each task** (`{"task": path}` in `<module>/tasks/`, as the item tool's `tasks.add` does today). It keeps the module readable without node, but it is a second list that must be written by every creator and goes stale when one forgets (the reason 0 session tasks are linked today). Rejected for session-born tasks; it stays for tasks born in a module. Also rejected: moving every task into its module folder (breaks 1,100 session paths, and a task with no module has no home).
