# Sessions, sub-sessions and tasks: proposed shape

A proposal only. Nothing is built until the owner approves it. Requirements: [requirements.md](requirements.md). Findings: [task.jsonl](task.jsonl).

## 1. The shape in one picture

```
sessions/2026/10/16/
  voice-call-3f2a9c1e/                 ← a ROOT session: <slug>-<first 8 of the SDK session id>
    session.jsonl                      ← line 1: {session:{id, parent:null, model, provider, started}}
    usage.jsonl                        ← one line per turn, written by Servex: tokens + claude_usd OR openrouter_usd
    digest.json                        ← the counted total from the transcript (AISessionDigest)
    tasks/
      accounting/task.jsonl            ← work this session did
    subsessions/
      helper-accounting-0f6b7ccf/      ← a CHILD session: same files, same rules
        session.jsonl  usage.jsonl  digest.json
        tasks/  subsessions/           ← grandchildren nest the same way
```

- **Primary key = the SDK session id.** The folder name is only a readable label. The full id is line 1 of `session.jsonl`, and an index maps id to folder.
- **Every session gets its own folder,** minions included, so nothing is crammed into the parent's file.
- **Children live under the root's day,** with no date split, even if they run past midnight; their own timestamps are in their files.
- **Servex already knows the id before the first turn.** For a fresh spawn it mints the id itself and passes it as `sessionId` (`Servex/agents/Agents.js`, `options()`), and it knows the parent from the spawn call, so it can make the folder in the right place at spawn time.
- **A resume** keeps its id and its folder.
- **A fork** gets a new id, so it becomes a child of the session it forked from.
- **VS Code and CLI tabs** are roots. Their folder is made from the transcript after the fact.

## 2. Accounting and roll-up

- **Two kinds of money, never added together.** Each `usage.jsonl` line carries either `claude_usd` (plan dollars, an estimate at list price) or `openrouter_usd` (billed).
- **Live:** Servex appends one line per turn from `Agent.result()`, the code that already sees each turn's usage.
- **Past sessions:** the same counter, `AISessionDigest`, runs over the raw `~/.claude/projects` transcripts.
- **Roll-up means walking the tree.** A session's total is its own lines plus the totals of every folder under `subsessions/`, kept separately for Claude and OpenRouter. A node script computes it (`spend-tree.mjs`, re-pointed at this tree); no AI writes it. Every total can be split back down to the session that spent it.

## 3. What a task is, and when one is not needed

- **A task is a named piece of work with an end.** It has a slug, a brief, a log, and a landing line saying what it produced.
- **It lives under the session doing the work:** `<session>/tasks/<slug>/`. A session does work; a task is what the work is about. One session can do several tasks.
- **Open a task when** the work changes files, will take more than a few minutes, or is something the owner will want to find again ("the accounting proposal", "fix the mic").
- **Do not open one for** a question answered in chat, a status check, a lookup, or a heartbeat reply. Those are turns, and they are already in the session's own log and usage.
- **A minion's brief is a task in the minion's own session.** The parent's task gets one link line pointing at it, never a copy.

## 4. Today's facts this builds on

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
