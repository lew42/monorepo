Budget: $3.

# Servex: worktree servers survive a restart, so 4 finished landings can merge

Split out of [restart-keeps-agents](/framework/ai/sessions/2026/10/03/restart-keeps-agents/) to land first and alone (vscode-mastermind's review of 2026-10-03).

## The bug: a Servex restart forgets every worktree's dev server

**What happened:** four worktrees can't land, because their servers are dead and nothing can bring them back:
- `framework-home-grids` (port 60613; 2 commits; task-mastermind-framework-home-grids);
- `voice-refine` (port 61229) and `dictate-core` (port 61282) (task-mastermind-one-dictation; both have since merged another way, so check before reviving them);
- `sessions-tab-polish` (port 60008; task-mastermind-sessions-tab-polish, whose minion needs it for screenshots at merge).

Each worktree is still listed in `.worktrees.json`. None of them can be revived:
- `worktree-up.mjs` registers the worktree with `POST /api/projects` (`Servex/Servex.js` about line 481). That registration lives only in memory, so a restart drops it. `list_servers` and `restart_server` no longer know the name.
- It's registered `external: true`, so `Project.start_command()` returns null and Servex could never start it anyway.
- `worktree-up.mjs` refuses a worktree that already exists, and `server-guard.mjs` (correctly) refuses `node server.js` by hand.
- So `merge.mjs` has no live server to smoke-test, and the landing fails every time.

**What it must do:**
1. On boot, Servex registers every worktree listed in `.worktrees.json` (or `git worktree list`; pick the reliable one and say why) on its pinned port.
2. A worktree project gets a real start command (`node server.js` in its directory), since node-reap made Servex the only thing that starts servers. Then `start_server`, `restart_server` and the proxy's start-on-first-request all work for it.
3. Drop `external: true` for worktrees, or keep it only for something that truly runs outside Servex, and say which.
4. **Tests:** a worktree registered before a simulated restart is still listed after it, and `start_server` brings its server up.

## Also in this landing: the reaper's stale task cache

task-mastermind-one-dictation found that `Lifecycle.task()` cached each task's `task.jsonl` time for the whole life of Servex. Once a task looked silent for 2 hours, every 5-minute sweep reaped its worktree server again, even after new writes and in the middle of merge.mjs's smoke test. mastermind-servex-10 added `this.tasks = null;` at the top of `sweep()` in `Servex/Lifecycle.js` (uncommitted in main). Keep it, add a test (a task written after the first sweep isn't "silent" in the second), and commit it here.

## Before the restart

- Main has mastermind-servex-10's other uncommitted Servex edits, never through `node --check`: `Servex/agents/Global.js` (the queue-check backoff), `registry.js`, `Echo.js`, `roles.js`. Check each; commit the ones that pass by exact path; for one that fails, fix the syntax or leave it uncommitted and say so.
- **The restart still ends agents that are mid-turn** (restart-keeps-agents fixes that next). So restart only when `list_agents` shows nobody mid-turn, and note who was working.

## Land

- `node --check` each changed file, run the tests, commit by exact path, merge, restart as above.
- Bring the waiting servers up with `start_server`, and tell task-mastermind-framework-home-grids and task-mastermind-sessions-tab-polish to retry their merges (`send_to_agent`).
- Append an `experiment` line: the worktrees listed after the restart, and which servers answered.

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Don't wait on the owner.
