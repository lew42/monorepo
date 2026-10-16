# Today's facts behind the session-folder proposal

Detail moved out of [shape.md](shape.md), unchanged.

- **(a) How tasks are made.**
  - Two ways: the `new-task` skill runs the node script `Server/TaskDirs.mjs --new <slug>`, or Servex's `spawn_agent` calls `open_task()` (`Servex/agents/Agents.js:775`).
  - Lines are stamped by code, not the AI: `.claude/hooks/append.mjs` replaces `"NOW"` with the clock, adds `at` when it is missing, and refuses lines in the wrong shape. Servex's `append_log` is the other writer.
- **(b) The quiet-task reminder exists:** `Servex/TaskLoop.js`, documented in `Servex/doc/task-loop.md`.
  - Every 5 minutes it checks every open task from today and yesterday. If a task has been quiet for 10 minutes, it sends the owning agent a status check, and sends another 15 minutes later. After that, it raises a card for the owner.
  - Gaps: it only sees tasks, so a session with no task is never chased, and it only looks back two days.
- **(c) SDK spawn options** (`Agent.options()` in `Servex/agents/Agents.js`):
  - The basics: model, effort, cwd, permissionMode, allowedTools / disallowedTools, settingSources, systemPrompt.
  - Starting and resuming: resume, forkSession, and `sessionId`, which Servex mints itself.
  - Wiring: `includePartialMessages`, `forwardSubagentText`, the Servex MCP door (`mcpServers.servex` with `?as=<agent id>`), the OpenRouter `env`, and `spawnClaudeCodeProcess` (Servex starts `claude.exe` itself).
  - Role defaults fill in the model, effort and permission mode.
  - The docs `Servex/doc/sdk.md`, `lifecycle.md` and `processes.md` exist, but none says where a session's files and accounting go. That is the doc this proposal adds: `Servex/doc/session-folders.md`.
- **(d) Migration cost.**
  - Today the day level holds 12,647 folders: 4,118 session folders, 757 tasks with a `task.jsonl`, and 7,770 older task folders.
  - The registry has 2,950 agents, and 1,061 of them have a parent, so up to about 1,000 child sessions would move under their parents.
  - Proposal: move nothing old by hand. New sessions use the new shape from the day it ships. One scripted, reversible `git mv` pass (dry run first, plus a manifest) can nest the child sessions later.
  - Old paths keep working: `TaskDirs.follow()` / `resolve()` already chain through `task-moves.jsonl` (1,457 recorded moves) and `task-manifest.json`. The index reads both shapes.
