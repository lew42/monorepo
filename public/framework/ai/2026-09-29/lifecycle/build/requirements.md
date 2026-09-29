# Lifecycle build: log every resource, reap what a finished task owns

Load the `minion` skill first, then `code`. Parent: task-mastermind-lifecycle. Card dir: `public/framework/ai/2026/09/29/lifecycle-nothing-left-running-nested-ta/`.
**The owner's words and full brief:** `public/framework/ai/2026-09-29/lifecycle/requirements.md` (read it all; you own deliverables 1, 3 and 4 there, plus the monitor fix and the clarity fix under "Evidence"). Owner: "we don't want to rely on the AIs to remember". **Node code, not a skill line.**

## Where you work
Worktree **C:\Code\lew42\worktrees\lifecycle** (branch `worktree/lifecycle`, its server is on :54967). Commit there. Never edit the main tree. Don't merge: the parent merges.
Every Node spawn/exec/fork sets `windowsHide: true`. Stop every server or process you start before your turn ends.

## Fence (only these files)
Servex/Lifecycle.js (new: the log writer + the reaper), Servex/Pool.js, Servex/Servex.js (wiring only), Servex/MCP.js and Servex/agents/Agents.js (only the spawn_agent / take_worktree hook points), Servex/Monitor.js (the nag fix), Server/on-landing.mjs, Server/worktree-up.mjs, Server/worktree-down.mjs, Server/worktree-sweep.mjs, Server/health-supervisor.mjs, Server/run.js, server.js, Server/browser.mjs, Server/clarity.mjs, and docs under Servex/doc/ and Server/doc/. **Don't edit Servex/Heartbeat.js or the dispatch queue.** Hook the heartbeat tick from outside (wrap or subscribe in Servex.js); if that's impossible, run your own sweep on the same interval and say so.

## Deliverables
1. **One creation log**, `lifecycle.jsonl`, written through Servex's append_log (or its Log.js single writer; from plain node scripts, go through Servex's HTTP/MCP door, falling back to a direct append if Servex is down). A line is `{at, kind, id, pid?, port?, path?, owner_task, owner_agent, event:"start"|"end", why?}`. `kind` is one of agent, task, worktree, server, health, browser. Hook it at: spawn_agent (start) and agent stop/exit (end); worktree-up, take_worktree, worktree-down; `server.js` and `run.js` log their own start and exit (this catches hand-started `PORT=… node server.js`; owner_task comes from env `LEW_TASK` if set, else is inferred from the cwd's worktree slug, else null); health-supervisor; the Playwright launch in browser.mjs (log `end` on browser close).
2. **The worktree fix:** whatever opens a task log (spawn_agent `task`, take_worktree, worktree-up with a task dir) writes `worktree` into it. `entry_for_task_dir` falls back to matching the task's slug or branch (`worktree/<slug>`) against the registry when line 1 lacks `worktree`.
3. **The reaper** (Servex/Lifecycle.js): `reap(task)` closes everything a task owns: the worktree server's **wrapper first** (server.js, which respawns run.js), then run.js, its health watcher, its headless browsers, and its idle one-pass agents (reviewer, clarity, checker, and anything it spawned that is idle). on-landing.mjs calls it. A `sweep()` runs on the heartbeat tick: anything whose owner task has landed, or has been dead for over 2 hours, gets reaped; so do idle one-pass agents whose result is written (parent null counts). Every reap logs an `end` line with `why`. Give it a `--dry` CLI: `node Servex/Lifecycle.js --dry` prints what it would close.
4. **The keep list:** never touch the main site server (port 3104 / the monorepo's own run.js), Servex, the gate, whisper, or ports in a keep list file `Servex/keep.json` (today `[8137]`: the owner's phone). A worktree with uncommitted work keeps its files; only its processes may stop.
5. **Clarity once per task:** clarity.mjs runs once per task (skip if the task's log already has a clarity line), and waits while the system_health flag is up.
6. **The monitor nags only on news:** Monitor.js messages "stop the finished ones" only when the set of stoppable agents changed since its last message, and names them.

## Proof you hand back (in your own log, then a message to your parent)
- `node Servex/Lifecycle.js --dry` output on the live machine (it reads the live process list), saved to `public/framework/ai/2026-09-29/lifecycle/build/dry-run.txt`. Don't run it for real; the parent does after merging.
- Start a throwaway `PORT=5xxxx node server.js` in the worktree, show its start line in the log, kill it, and show the end line.
- `node --check` on every file you touched, and Servex booted on a private port (or its tests) with no error.
Length budget: Lifecycle.js stays under about 250 lines. Land your log with a `landed_at` line; outcome 80 words at most.

## Added 17:50 (from mastermind-servex-5): salvage stuck pool slots
7. **Salvage in the reaper:** when a pool slot's holder is dead and its tree is dirty, commit the dirty files to a branch `salvage/<slot>-<date>` (never merge it, never delete it), log the branch (lifecycle.jsonl `why`, and one line on the task's card if it has one), then reset the slot and reclaim it (Pool.js).
   **The cause the parent found:** the slot's own running dev server appends `page.jsonl` lines (e.g. `{"file":"25/"}`, `{"file":"readme.md"}`) as it serves, so the tree goes dirty again seconds after a reset. qf-2/3/4 were salvaged by hand at 17:48 (salvage/qf-{2,3,4}-2026-09-29), were dirty again within seconds, and hold only such lines. So: **stop the slot's server (wrapper first) before salvage and reset**, and treat a diff that holds only appended `page.jsonl` lines as server noise: salvage it anyway, but don't let it block a reclaim. Then run the salvage once on qf-2/3/4 for real (after the dry run) and note in your log what each salvage branch holds.
