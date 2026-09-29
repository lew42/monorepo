# Minion A — spawn opens the task, roles carry a skill list

Load the `minion` skill first. Parent task: `public/framework/ai/2026-09-28/task-loop/` (read its requirements.md and interfaces.md). The design and the owner's words: `public/framework/ai/2026/09/28/skills-as-a-workflow-tasks-chased-by-nod/design.md`. The owner's own sentence: "consider the skills system kind of a workflow process" in `.claude/prompts/2026-09-28.jsonl`.

**Work only in the worktree `C:/Code/lew42/worktrees/task-loop`** (branch `worktree/task-loop`). Commit there. Never touch `C:/Code/lew42/monorepo` except to append to your own log `C:/Code/lew42/monorepo/public/framework/ai/2026-09-28/task-loop/spawn-line1/task.jsonl` (open it with a line-1 assign per the new-task skill; append with `node .claude/hooks/append.mjs`).

## Deliverables

1. **Open by node.** `spawn_agent` (Servex/agents/tools.js) and `Agents.spawn()` (Servex/agents/Agents.js) take `task: {dir, card, brief}`. Before the agent's first turn, write `<dir>/task.jsonl` line 1: `{"assign": {"session_id", "agent": <agent id>, "card", "brief", "model", "requested_at", "now": "starting", "steps": [], "step": 1}}` (local-offset ISO time; `dir` is repo-relative or absolute; create the dir). If task.jsonl already has lines, append one assign with those fields instead of rewriting. If the SDK session id is not known before the first turn, find out whether the Agent can preset it (a `sessionId` option on the SDK query, as `claude --session-id` does); if it can, preset it; if not, write line 1 without it and append `{"assign": {"session_id"}}` the moment it is known. Say which in your log. Add a sentence to the agent's first turn: "Your task is already open at <dir>/task.jsonl; don't run new-task, log there."
2. **The role's skills.** `Servex/agents/roles.js`: each row may carry `skills: [..]` (keep `skill` working for old callers). `opening()` names all of them in the first turn: "Load the `a` and `b` skills, then: …". Give `task-mastermind` and `manager` `["sub-mastermind", "page"]`; leave the rest as one skill.
3. **new-task skill, one line** (`.claude/skills/new-task/SKILL.md`, in the worktree): near the top, "If your brief names a task dir, Servex already opened it: log there and skip step 1."

## Proof (put the output in your log)

Boot a private Servex from the worktree root, hidden, on its own ports: `SERVEX_PORT=8193 SERVEX_PROXY_PORT=8194 SERVEX_NO_GATE=1 SERVEX_NO_LAYERS=1 LOCALAPPDATA=<your scratch dir> node Servex/index.js` (as a background process; every spawn sets `windowsHide: true`, never show a window). Call its `spawn_agent` over `http://127.0.0.1:8193/mcp` with a Haiku minion, `task: {dir: "<scratch>/probe-task", card: "test/probe", brief: "say hi"}`, prompt "say hi and stop". Show task.jsonl line 1 with session_id and agent. Stop that private Servex when done. Never restart or touch the live Servex on port 80.

## Fence

Yours: `Servex/agents/Agents.js` (spawn only), `Servex/agents/tools.js` (spawn_agent only), `Servex/agents/roles.js`, `.claude/skills/new-task/SKILL.md` (one line). NOT `Servex/Servex.js` — another minion owns it. Budget: under 120 changed lines. Land by appending a landed_at + outcome to your log, then stop.
