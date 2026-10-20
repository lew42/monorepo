# A spawned agent's folder starts as session.jsonl (slice 3 of ai/doc/sessions-and-tasks.md)

Owner's decision (2026-10-19, ai/doc/sessions-and-tasks.md): an agent the SDK spawns is a **session** (it has a session id); a **task** is something to finish and lives inside a session. "We don't want to create a task for a session." Yesterday every spawned minion still got a folder with `task.jsonl` (for example `ai/sessions/2026/10/19/session-3db83139/task-mastermind-voice-opus/sheet-redesign/task.jsonl`, line 1 `{"assign":{"session_id":"56c7…","agent":"minion-sheet-redesign",…}}`). Fix that for every new spawn. Budget: $12.

## The rule to build

`SessionRecord.start_file(dir, first)` (Server/SessionRecord.mjs) today gives `session.jsonl` only to a folder directly under a day. New rule, at any depth:

- line 1 is a **spawn line** (`first.assign.session_id` AND `first.assign.agent`, which only Servex's `open_task` writes) → `session.jsonl`. That folder is a session (a sub-session when nested).
- line 1 has a `session_id` but no `agent` (a VS Code tab's task made by `node Server/TaskDirs.mjs --new` + `append.mjs`, per the new-task skill) → `task.jsonl`. That folder is a task inside the tab's session.
- a `{"session":{…}}` line 1 (cloud voice) → `session.jsonl`, as today.
- anything else → `task.jsonl`.

Keep `is_session_dir` for the day-level case. Update `Server/SessionRecord.test.mjs` (line 109 asserts the old rule: change it to the new one and add the three cases above). Run it.

## Readers to verify (most already ask SessionRecord; the task-system agent did that on 10-19)

A reader that types `"task.jsonl"` will not see a nested session. Check and fix only where a nested `session.jsonl` would be missed on a runtime path:

- `Server/Steps.mjs` lines ~139 and ~155 (`--show`, `--step` CLI paths) → `SessionRecord.log_or_old`.
- `.claude/hooks/prompt-relay.mjs` `mastermind_inbox()` (~line 181) and `.claude/hooks/naming-guard.mjs` `find_task_by_path()` (~line 41): use `SessionRecord.log_file(dir)`.
- `public/framework/core/Task/TaskPage.js` line 8 opens `this.url + "task.jsonl"` in the browser: make it try `session.jsonl` first, then `task.jsonl` (see how `AISessionDetail.js` ~line 237 uses `AITask.has(...)`), so a nested session folder still has a page.
- `Server/State.mjs`: already walks `SessionRecord.is_log_entry`; prove with its test (`node Server/State.test.mjs`) plus one new fixture of a nested `session.jsonl` counted once.
- `Servex/Landed.js`, `Servex/TaskLoop.js`, `Servex/cards/Cards.js`, `Servex/asks/tasks.js`, `.claude/hooks/ledger.mjs`, `Servex/agents/page_tools.js` line 57: read them, confirm the `SessionRecord.log_file(dir) ?? …task.jsonl` fallback covers a nested `session.jsonl`; list each in your report with yes/no.
- Module homes (`<module>/tasks/<slug>/task.jsonl`, written by the item tool's `tasks.add`) are tasks and keep `task.jsonl`. Do not touch them.

## Then

1. Run `node Servex/agents/open-task.test.mjs`, `node Server/SessionRecord.test.mjs`, `node Server/State.test.mjs`, `node Servex/agents/spawn-worktree.test.mjs`. All green before commit.
2. Update the two docs that state the rule: `ai/sessions/readme.md` ("How data gets in" row for a Servex agent's folder, and the sentence "only a folder directly under a day gets session.jsonl") and tick slice 3 in `ai/doc/sessions-and-tasks.md` with the date. One line each; no essays.
3. Commit, merge into michael/dev (`node Server/merge.mjs` from your worktree), then call `restart_servex` so `open_task` runs the new rule. After the restart, prove it: `list_agents` shows your own row, and the next spawn's folder (any new agent, or a `task:false`-less probe you spawn with Haiku and stop) holds `session.jsonl`. Put the proof path in your report.
4. Land with the `finish-task` skill. Report: one screen, the rule in one sentence, the proof folder, the readers table.

Not in scope: renaming the 1,100 old nested `task.jsonl` folders (slice 4, by script, later); `TaskDirs` → `SessionDirs` (slice 6); tasks as a line (slice 5).
