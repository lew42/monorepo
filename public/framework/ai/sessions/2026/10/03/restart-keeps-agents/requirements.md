Budget: $8 ($6, plus $2 for bug 4, resume on boot).

# Servex: a restart keeps working agents, and a mastermind stays wakeable

Servex bugs from today (vscode-mastermind, 2026-10-03), in this order. Start only after [worktree-servers-revive](/framework/ai/sessions/2026/10/03/worktree-servers-revive/) has landed (it was bug 5 here, split out to land first). The git-guard (once bug 3 here) moved to [main-branch-guard](/framework/ai/sessions/2026/10/03/main-branch-guard/).

## Bug 1: a restart ends the agents that were working

**What happened:**
- In one hour, agents restarted Servex twice.
- Three working agents ended with "session ended (other) without landing": inbox-cards-work, framework-home-grids and drawer-cleanup (13:34).
- mastermind-ai-3 was left "gone", and a spawn queued under it never ran.

**What it must do:**
1. **Resume working agents in place.** An agent that was working, or queued to run, when Servex went down comes back after the restart: same session, its turn resumed with one line ("Servex restarted; carry on from where you were"). Its queued children stay queued. The restart-survival code already exists (see Servex/readme.md, "restart survival"). Find why it missed these agents: the "(other)" end reason, or the "gone" state on a row that should be revived. Fix that one cause; don't build a second mechanism.
2. **Agents can't restart Servex whenever they like.** `restart_servex` (`Servex/agents/ops.js`) and `sustain.mjs --restart` queue the restart until no agent is mid-turn, then run it. Use the mid-turn guard sustain.mjs already has, and make it wait rather than proceed. While a restart is waiting, the tool returns "queued: N agents mid-turn" and logs one line. A restart the owner asks for, or `--force`, still goes through at once.
3. **Tests:**
   - restarting while an agent is mid-turn waits, then runs once that turn ends;
   - an agent that was working before the restart is revived afterwards with its session id;
   - a queued child spawn survives the restart and runs.

## Bug 2: a mastermind counts as finished once its first task lands

**What happened:** `send_to_agent` refuses a mastermind with "its task X has landed", even though its queue is still open. The cause is `Agents.blocked()` (`Servex/agents/Agents.js`, about line 424): it treats the first task the mastermind opened as the agent's whole life. `Lifecycle.js` around lines 273 to 289 has the same check, so reaping makes the same mistake.

**What it must do:**
1. An agent whose role is a mastermind (`mastermind-*`, the domain masterminds, not `task-mastermind-*`) is never blocked or reaped as "landed" while it owns an open ask in `public/framework/ai/asks.jsonl`. Compute this from the file (law 7).
2. For any other agent, nothing changes.
3. **Tests:** a mastermind with an open ask and a landed first task can still be messaged and isn't reaped; once all its asks are closed, it is.

## Bug 4: after a PC reboot, working agents stay "gone"

**What happened:** the owner's PC rebooted at 3:43 pm ([restart-observe](/framework/ai/sessions/2026/10/03/restart-observe/)). Servex, the gate, the dev server and whisper all came back on their own. But task-mastermind-system-class and clarity-restart-keeps-agents had been working, and after the boot they read `gone`. Their sessions are on disk; nothing resumed them.

**What it must do:** this is the same fix as bug 1 (one mechanism, not two), plus:
1. **Resume on boot.** On boot, Servex resumes every agent that was `working` and has an unlanded task, from its session id, with one line: "you were interrupted by a restart; read your task log". The same rules as bug 1 apply: never one stopped on purpose, never one whose directory is gone, never a landed one (except a mastermind with open asks, as in bug 2).
2. **Snapshot every few minutes.** A hard power-off sends no exit signal, so Servex writes the list of working agents and their open tasks to one file every 2 to 5 minutes, and on its own exit signal too. On boot it reads that file to know who was working. If the registry already records this reliably, use the registry and say why no new file is needed.
3. **Two dev servers after boot.** `server.js` and `Server/run.js` were both running. Find out whether one supervises the other (that's intended), or whether it's a double start, and fix it if it's a double start.
4. **Tests:** an agent that was working in the snapshot comes back after a simulated boot; an agent stopped on purpose doesn't.

## Land

- Check first what clarity-restart-keeps-agents left half-done (its session, `git status`), so nothing is built twice.
- `node --check` each changed file, then run the tests.
- Commit by exact path and merge.
- Restart with the new queued restart, then watch that no agent ends with "(other)".
- Append an `experiment` line: the agents that were working before the restart, and their state after it, copied from the registry.

Sonnet, high effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
