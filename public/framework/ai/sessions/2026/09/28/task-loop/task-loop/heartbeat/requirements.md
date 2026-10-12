# Minion brief: the heartbeat (task-loop, part 4)

Load the `minion` skill first. The whole task: `public/framework/ai/2026-09-28/task-loop/` (read its requirements.md, the owner's words at the end: "if it has been silent for 5 minutes, the harness prompts it for an update. If it's still silent, escalate").

**Why:** this task's first mastermind was lost because its minions sat in Servex's memory queue (the spawn gate, `Servex/agents/Global.js` `admit()`, min_free_mb 4096) and nobody noticed for a day.

**Worktree:** `C:/Code/lew42/worktrees/task-loop` (branch worktree/task-loop). Work only there.

## Step 0: finish the merge that is in progress
`git merge michael/dev` stopped with conflicts in `.claude/hooks/ledger.mjs`, `Server/README.md`, `Server/on-landing.mjs` (4 hunks), `Servex/Servex.js` (3 hunks, all "keep both sides": TaskLoop and Usage/Pool). Read every hunk; keep both sides' intent; never take ours/theirs wholesale. `node --check` each .mjs/.js, commit the merge, then log it in your task.jsonl.

## Deliverables
1. **`Servex/Heartbeat.js`** (new, plain node, no Claude-SDK specifics, so it works on any harness): tracks, per live agent, the time of its last sign of life. Use the agent events Servex already emits (turn ended, message/tool use, `card()` updates: read `Servex/agents/Agents.js`), with a once-a-minute tick only as the backstop.
2. **Silent 5 minutes → prompt.** A task mastermind (role `task-mastermind`/`mastermind`, or any agent with a task dir) that has been `working` or `idle`-with-an-unlanded-task and silent for 5 min gets `agents.send(id, "status? land, or say why", {from:"servex-heartbeat"})`. Once per silence, not every minute.
3. **Still silent 5 more minutes, or its agent is gone/stopped/errored → escalate:** post on the task's card (`card_ask` in-process if registered, else `card_reply`; see how `Servex/TaskLoop.js` `escalate()` does it and reuse it). Log each prompt and escalation into the task's task.jsonl (`{log:{heartbeat:..., msg}}`) via the same appender TaskLoop uses.
4. **A dropped queued minion.** An agent queued at the spawn gate for more than 5 minutes, or queued and then never admitted (dropped from the queue without starting): wake its `parent` with one message naming the minion, how long it waited and why (the gate's reason). Once per minion.
5. Wire it into `Servex.js` next to the TaskLoop (`SERVEX_NO_HEARTBEAT=1` skips it; env `SERVEX_HEARTBEAT_SILENT_MIN` default 5 so a test can shorten it), plus a `heartbeat_status` MCP tool listing each watched agent's silence.
6. A short section in `Servex/doc/task-loop.md`: "The heartbeat", one paragraph + one line per rule.

## Proof (required, on a PRIVATE Servex only)
Boot one from the worktree root, hidden (`windowsHide: true`, or Start-Process -WindowStyle Hidden): `SERVEX_PORT=8197 SERVEX_PROXY_PORT=8198 SERVEX_NO_GATE=1 SERVEX_NO_LAYERS=1 SERVEX_HEARTBEAT_SILENT_MIN=0.5` and its own `LOCALAPPDATA` in your scratchpad (see `spawn-line1/task.jsonl` for how the last minion did it; `task.dir` must be a `C:/...` path). Show: (a) a Haiku agent told to sleep silently gets the status prompt, then an escalation line; (b) a queued minion's parent gets woken (force the gate: e.g. `SERVEX_MIN_FREE_MB=999999` without NO_GATE). Paste the log lines into your task.jsonl. Kill the private Servex by PID after; never touch the live one on port 80. Never let any process show a window.

**Fence:** `Servex/Heartbeat.js`, `Servex/Servex.js` (wiring + tool only), `Servex/doc/task-loop.md` (one section), the merge in step 0. Nothing else. Budget ~200 lines. Commit in the worktree; do not merge into michael/dev. Land with a task.jsonl `landed_at` + outcome in `heartbeat/task.jsonl`.
