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
Foundational, so no hard cap: plan first and post it on the card. Build through the pool, then `merge.mjs` (smoke test), then review. Build on [dormant-idle](/framework/ai/2026-09-30/dormant-idle/)'s memory checks and the working cap.

## Added 2026-09-30 (16:25): worktree and subdomain clean-up
The owner saw `cards-and-logs.localhost` (a task worktree) in the console and asked whether these pollute the namespace. They do today:
- **57 folders in `C:/Code/lew42/worktrees/`.** Every one with a package.json becomes a Servex project with its own port and `<name>.localhost`, and nothing removes them. 17 of the 45 branch worktrees are already merged into michael/dev.

**Ask:** a worktree is temporary.
- When its branch has merged (or its task has landed and been stopped), remove the worktree. Keep the branch, so `git revert` still works.
- Servex drops its project, port and subdomain.
- The quick-fix pool (`qf-*`) is recycled, not removed.
- Use `git worktree remove` only after `node Server/junction-check.mjs` passes (junction-guard: a remove can delete through a node_modules junction into main).
- Show the count on the process monitor.


## Added 2026-10-01 (15:55): the RAM squeeze, measured
Snapshot: **4.5 GB free of 31.7**; commit 43.6 of 52.8 GB (Servex queues spawns below about 4 GB).
- claude.exe: 14 processes, 5.5 GB. 8 are Servex agents (about 3.8 GB, 270–690 MB each). 6 are VS Code extension conversations from 09-24 and 09-30 (about 1.65 GB), probably closed tabs that are still alive; the owner can close them.
- chrome: 27 processes, 5.2 GB, including 8 idle Playwright Chromiums (health.mjs keeps one per tree it watches).
- node: 45 processes, 3.9 GB. 19 are dev servers (server.js, about 1.8 GB), mostly WORKTREE servers for tasks that are paused or landed.

**Asks:**
1. Stop the dev server, health watcher and Chromium of every worktree whose task is paused, landed or stopped. Restart on demand.
2. Idle agents go dormant FASTER when RAM is tight (no process: resume is cheap).
3. Count the VS Code conversations and flag the stale ones on the dashboard.
4. Games: the owner allows closing StarCraft (and similar) ONLY when the PC has been idle (no keyboard or mouse, via GetLastInputInfo) for more than 30 minutes AND RAM is tight. Never while they are playing. Log every close.
5. Measure, don't guess: per-process RAM by owner (task, agent or app) on the monitor page.


## Added 2026-10-01 (16:10): dormant the moment a turn ends
The owner: the conversation is already on disk (the SDK writes the session transcript), so there's no reason to keep a claude.exe holding it in RAM between turns.
- **Today:** an agent goes dormant after 3 minutes idle (Servex/doc/dormant.md).
- **Ask:** a per-role `dormant_after`.
  - **0** (exit as soon as the turn ends) for masterminds, minions and reviewers. They mostly wait on children or on the owner, and a resume is "a few seconds".
  - **Keep warm** only while it matters: the voice session's fast assistant, during an active session (its reply must land in about 1 s), and an agent with a child about to report.
- **MEASURE first:** cold-resume time (process start, session load, first token) for a small and a 150k-context session. Also check the prompt cache still hits after a resume (it should within its TTL, so the cost doesn't change). If a resume is over about 3 s, keep a short grace (e.g. 20 s) instead of 0.
- Show RAM saved on the monitor.
- (The harness can't free the prompt from RAM mid-turn. Exiting between turns is the lever we have.)


## REVISED 2026-10-01 (16:20): dormancy is per agent AND per request, not "always exit"
The owner: exiting after every reply would be a mistake for live chat. Autosend means many small messages, so the process would restart constantly.
- **`dormant_after` is a property of the agent,** set at spawn and changeable per request:
  - **Voice fast and smart assistants:** stay warm for the whole active session. Never exit between replies.
  - **One-off work** (minions, reviewers, most task masterminds): exit right after the reply, unless a follow-up is expected within about a minute.
- **The spawner decides:** `spawn_agent` / `send_to_agent` take `dormant_after` (seconds, or "session"). The mastermind skill says how to choose: about to read the reply and maybe ask a follow-up → keep it warm briefly (e.g. 60 s); handing it to a 3–5 minute review → exit now and resume later. Free RAM in those minutes means more agents in flight.
- **Measure** the cold resume as before. Watch RAM volatility (frequent drops and refills) on the monitor, and the commit charge (the pagefile is the OS's overflow).
