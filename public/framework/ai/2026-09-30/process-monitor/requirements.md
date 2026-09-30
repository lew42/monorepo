# Servex: a process monitor for everything we spawn: requirements

The owner's words are verbatim in [owner-words.md](owner-words.md). Re-read them before each step.

## Asks
1. **"Running" means a real process.** Wherever the dashboards list running agents, base it on actual `claude.exe` processes, each with its PID. Servex spawns them, so it should keep each PID: record it on the agent and log it.
2. **Per process:** PID, parent PID, command, role or task, RAM (working set), CPU %, and start time. Log a sample every 5–10 seconds; low resolution is fine.
3. **Totals:**
   - How much RAM is OURS (Servex, its agents, their children: node, bash, git, tail, grep, sleep), and how much belongs to everything else on the machine.
   - A breakdown by task: which task owns which processes.
4. **A graph:** RAM and CPU over time, for the total and per task. Put it on the AI dashboard (the Live card, or a Processes view).
5. **Orphans:** find processes that belong to our system but no live agent or task, and flag them, e.g. dozens of bash, tail, grep and sleep left behind by background waiters, or node processes with no parent. Surface them, and reap the ones that are clearly ours and clearly dead. Never touch the owner's own apps.
6. **The architect uses it:** mastermind-servex keeps usage (RAM, CPU and tokens) in view and optimizes, so work never hits a roadblock and nothing lingers. CPU spikes also explain the fans (the `fans` skill).

## Snapshot at the ask (2026-09-30 15:25)
chrome 40 procs / 2.97 GB · node 30 / 2.55 GB · claude 9 / 2.40 GB · Code 17 / 1.79 GB · 11.6 GB free of 31.7. Five stale background waiters from the VS Code tab (sleep, tail, grep, bash) were stopped just now.

## Rules
Foundational, so no hard cap: plan first and post it on the card. Build through the pool, then `merge.mjs` (smoke test), then review. Build on the dormant-idle work: its memory checks and the working cap.
