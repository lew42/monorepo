verdict: fix

Reviewer: a fresh in-process Opus agent that never saw the author's turns, given the owner's 20:00 ask prefixed "Don't build this. You are reviewing the finished result against it." (review.mjs could not run its own reviewer: the spawn was queued at the memory gate and returned no id — the 19:20 bug this task fixes next.) Reviewed commit ec1dd9ce.

1. [fix] Agents.js stop(): an agent already idle-stopped (reaped) returns early from Agent.stop() before register(), so an owner's stop_agent never wrote stopped_by — the mobile-nav case.
2. [fix] Global.js mastermind(): a message to the mastermind-servex role reopens the holder directly, skipping the guard.
3. [fix] registry.js: task_dir inheritance also applied to a new spawn reusing an old id, so it inherited a landed task and every message was refused.
4. [fix] Heartbeat.js: a forced revive (revive: true) left the heartbeat's in-memory stopped_by mark, so wake_parent kept skipping that parent for the rest of the boot.
5. [note] Every in-process stop (reaper, Layers) is recorded as "on purpose" in the heartbeat's memory map, so a reaped parent's child report goes to the inbox only. Predates this change.
6. [note] find_task_dir returns the first log naming an id; a reused id across two days can match the wrong task.
7. [note] Cards.js: the owner's answer to a question from a landed or stopped agent is now refused and silently dropped.
8. [note] Heartbeat drain: a task whose owner has no registry row is resumed with reopen(), skipping the cwd check.
9. [note] No other send() caller breaks: the live card route, Layers, Global, TaskLoop, Monitor, gate_sweep and Sessions all catch.
