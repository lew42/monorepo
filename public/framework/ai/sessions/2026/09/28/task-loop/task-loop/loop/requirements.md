# Minion B — the task loop in Servex

Load the `minion` skill first. Parent task: `public/framework/ai/2026-09-28/task-loop/` (read its requirements.md and **interfaces.md** — the agreed calls). The design: `public/framework/ai/2026/09/28/skills-as-a-workflow-tasks-chased-by-nod/design.md`.

The owner's ask, as briefed: "every 5 minutes, find open tasks (no `landed_at`) that have been quiet for 20 minutes, or whose agent ended without landing. Wake the owning agent with 'land, or say why', at most twice, 30 minutes apart; then put the task on the Waiting-on-you list (a `card_ask` if that task has landed, else a card message). Log each chase in the task's own task.jsonl. Only a landing or the owner closes a task."

**Work only in the worktree `C:/Code/lew42/worktrees/task-loop`** (branch `worktree/task-loop`). Commit there. Your own log: `C:/Code/lew42/monorepo/public/framework/ai/2026-09-28/task-loop/loop/task.jsonl` (open it per the new-task skill; append with `node .claude/hooks/append.mjs`).

## Deliverables

1. **`Servex/TaskLoop.js`**, started from `Servex/Servex.js` the way `Monitor.js` is (copy its shape: a class, `start()`, an unref'd `setInterval`, never throws out of a tick). Timers from env with these defaults: `SERVEX_TASKLOOP_EVERY_MIN=5`, `SERVEX_TASKLOOP_QUIET_MIN=20`, `SERVEX_TASKLOOP_GAP_MIN=30`; `SERVEX_NO_TASKLOOP=1` turns it off. Its root is the Servex repo root (so a worktree's Servex scans the worktree).
2. **Find open tasks:** every `public/framework/ai/<date>/<slug>/task.jsonl` for today and yesterday. Merge its `assign` lines. Open = no `landed_at` with a non-empty `outcome` (a landing with no outcome does not count), and no `closed_by`. Chase when the file's last line is older than QUIET, or its owning agent (line-1 `agent`, else the live agent whose `session_id` matches) is stopped or gone.
3. **Chase:** wake the owner with `agents.send(id, "Task <slug> has been quiet since <time>. Land it (append landed_at + outcome to <path>), or reply with why not.")` — `send` revives a stopped agent. If no Servex agent can be found, the chase is still logged as "could not wake: <why>". Log each chase in the task's task.jsonl: `{"log": {"at", "msg": "task-loop chase N of 2: …", "chase": N}}`. The loop reads its own `chase` lines back for state, so a Servex restart loses nothing. At most 2 chases, GAP apart.
4. **Escalate** after the 2nd chase + GAP with still no landing: if a `card_ask` tool is registered in-process (waiting-on-you is building it: `card_ask({card, question, options, from})`), call it with `options: ["close it", "keep chasing"]` and `from` = the line-1 agent; else post a card message through `servex.assistant.card_reply({card, from: "servex-task-loop", text})` (the same in-process call Monitor.js uses). Card = line-1 `card`, else `"live"`. Log `{"log": {…, "chase": "escalated"}}`. Never chase an escalated task again. At most 5 escalations per tick; the rest wait for the next tick.
5. **Owner closes:** add a Servex tool `close_task({dir, why})` that appends `{"assign": {"closed_by": "owner", "closed_at", "closed_why"}}`. That, or a landing, is the only way a task leaves the loop.
6. **First-run count:** on its first tick, log one line to Servex's own log: "task-loop: first run, N open tasks today (M quiet)". Also expose a tool `task_loop_status()` returning `{open, quiet, chased, escalated, last_tick}`.

## Proof (put it in your log)

Boot a private Servex from the worktree root, hidden: `SERVEX_PORT=8195 SERVEX_PROXY_PORT=8196 SERVEX_NO_GATE=1 SERVEX_NO_LAYERS=1 SERVEX_TASKLOOP_EVERY_MIN=0.25 SERVEX_TASKLOOP_QUIET_MIN=0.5 SERVEX_TASKLOOP_GAP_MIN=0.5 LOCALAPPDATA=<your scratch> node Servex/index.js` in the background (windowsHide; no windows ever). Create a test task under the WORKTREE's `public/framework/ai/<today>/tl-probe/task.jsonl` with card `test/tl-probe`, leave it quiet, and show: chase 1, chase 2, escalated, in its task.jsonl. Show the first-run count line. Delete the probe dir after; don't commit it. Never touch the live Servex on port 80, and don't commit test cards.

## Fence

Yours: new `Servex/TaskLoop.js`, the lines in `Servex/Servex.js` that start it and register its two tools, `Servex/doc/task-loop.md` (one screen: a small SVG picture first — the timeline open → quiet → chase 1 → chase 2 → Waiting on you — then a short table of the timers and a paragraph each on chase, escalate, close). Not `Servex/agents/*` (another minion). Budget: TaskLoop.js under 200 lines. Land by appending landed_at + outcome to your log, then stop.
