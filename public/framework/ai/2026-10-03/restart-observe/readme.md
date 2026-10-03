# PC restart, observed (2026-10-03, booted 3:43 pm)

Snapshots taken just before: [before-agents.json](./before-agents.json) (5 live agents), [before-processes.json](./before-processes.json) (20 node, 7 claude, 13 Playwright chrome, 1 whisper).

## What came back by itself
- **Servex** (`sustain.mjs` → Servex, the port-80 gate), **the dev server**, **whisper-server**: all up, `servex.localhost` and `monorepo.localhost/framework/` answer 200. No manual step needed.
- **The main checkout** is still on `michael/dev`, nothing uncommitted except live logs.
- **Processes:** 6 node (was 20), 3 claude (was 7), no leftover Playwright Chrome. A reboot is a clean slate.

## What didn't
- **Working agents did not resume.** `task-mastermind-system-class` and `clarity-restart-keeps-agents` were working; after the boot they read `gone`. `mastermind-page-3` (idle) also `gone`; `mastermind-servex-10` came back `dormant`. Their sessions are on disk, so they can be resumed, but nothing does it automatically.
- **This VS Code session's hourly check-in** (a session-only cron) was lost and had to be re-created by hand.
- **Two dev-server processes** run after boot: `server.js` and `Server/run.js`. Check whether that's intended or a double start.

## What to automate (lessons)
1. **On boot, Servex resumes every agent that was `working` with an unlanded task**, from its session id, with a "you were interrupted by a restart; read your task log" message. The same fix as agent-triggered Servex restarts (with @mastermind-servex-10).
2. **A shutdown snapshot.** Servex writes the agent list and open tasks to a file on its own exit signal (and every few minutes, since a hard power-off sends nothing). On boot it diffs against that file. Windows Home has no shutdown-script policy; a console process gets `CTRL_SHUTDOWN_EVENT` only as a service, so the periodic snapshot is the dependable half.
3. **A "restart" page** (/framework/servex/) listing, after each boot: what came back, what was resumed, what failed. This readme is its first entry.
4. **The install/boot checklist** (what must be running: sustain, gate, dev server, whisper; the scheduled tasks: Claude Janitor, Servex start) belongs on that page too, as the reference a fresh machine is set up from.
