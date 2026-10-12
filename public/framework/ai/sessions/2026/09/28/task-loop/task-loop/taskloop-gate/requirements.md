# Minion brief: TaskLoop must not wake the past (task-loop, part 7): small fix before the merge

Load the `minion` skill first. Task: `public/framework/ai/sessions/2026/09/28/task-loop/task-loop/`. Read `heartbeat/requirements.md` item 4c (the architect's review) and `Servex/Heartbeat.js`.

**The bug:** `Servex/TaskLoop.js` walks today's and yesterday's task dirs and `chase()` calls `this.servex.agents.send(id, …)`, the host send, which REVIVES a stopped agent. On the first live boot it would revive every unlanded task's agent from 09-28 and 09-29, with no opt-in, no ration, and no respect for a deliberate stop. The Heartbeat already does revival properly (opt-in by `SERVEX_HEARTBEAT_SINCE` or line-1 `heartbeat:true`, a ration of 2 per hour and 5 per day, `stopped_by`, the gated queue).

**Worktree:** `C:/Code/lew42/worktrees/task-loop`. Work only there.

## Deliverables
1. TaskLoop considers only tasks that opted in, using the Heartbeat's own test (expose one method on Heartbeat, e.g. `opted_in(state)`, and call it through `this.servex.heartbeat`; don't duplicate the date).
2. `chase()` never revives. If the owning agent is live (idle/working), send the neutral check as now (queued, never `now`). If it is stopped, gone or errored, don't send; hand it to the Heartbeat's triage (whatever method it uses to revive under its ration and gate), or skip it and log "left to heartbeat". The escalation path stays as is.
3. One line in `Servex/doc/task-loop.md` saying so.

## Proof
An in-process unit run in your scratchpad, with fake agents plus the real TaskLoop and Heartbeat (see how `heartbeat/task.jsonl`'s "unit" proof did it): (a) a 09-28 task with a stopped agent is ignored (not opted in); (b) an opted-in task with a stopped agent: TaskLoop does not call the host send, and the Heartbeat handles it; (c) an opted-in task with an idle agent gets the check. Also `node --check` both files. Paste the output into your task.jsonl. No live Servex touched; no window shown.

**Fence:** `Servex/TaskLoop.js`, one small method in `Servex/Heartbeat.js`, one line of `Servex/doc/task-loop.md`. About 30 lines. Commit by exact path; don't merge. Land in `taskloop-gate/task.jsonl` with `landed_at` + outcome.
