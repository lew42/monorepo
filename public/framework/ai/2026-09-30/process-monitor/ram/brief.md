# Brief: free RAM. Stop idle worktree servers, and go dormant sooner when RAM is tight

You are a Sonnet minion of **task-mastermind-dormant-idle**, for the task [process-monitor](../requirements.md). Read its last section first, "the RAM squeeze, measured": asks 1 and 2 are yours.

**Work in:** `C:/Code/lew42/worktrees/pm-ram` (branch `worktree/pm-ram`, already made from michael/dev). Never edit the main checkout. Commit early, by exact path. It has no node_modules (never link them); `node Servex/processes.test.mjs` runs without them.

**Your files (the fence):**
- `Servex/Worktrees.js`
- `Servex/Lifecycle.js`, but only if stopping a project's server and its health watcher needs it
- `Servex/agents/Global.js` (the dormant timer)
- `Servex/processes.test.mjs` (add checks)
- `Servex/doc/processes.md` and `Servex/doc/dormant.md` (one short section each)

Nothing under `public/`. Another minion owns `Servex/Processes.js`. Read it, but don't edit it: `this.servex.processes.now` gives you `free_mb` and `total_mb` every 10 s.

## 1. Stop what idle worktrees run

A worktree's own dev server (`server.js` / `run.js`), its `Server/health.mjs` watcher and that watcher's Playwright Chromium cost about 2–3 GB together. Today they keep running after the task is done.

Every Worktrees pass (or more often, if that is cheap), stop all three for a worktree when:
- its task is paused, landed or stopped, or nothing in it has been used for 2 hours (the same signals `Worktrees.js` already reads);
- and it is not a `qf-*` pool slot that is taken.

Stop them through Servex's own stop path (the one `stop_server` uses), never by killing pids you guessed. Find how Lifecycle.js and Pool.js tie health.mjs to its tree.

**Restart on demand:** the proxy already auto-starts a project on its first request. Check that it still does after your stop, and say so in the doc. Log one line per stop to the `servex` log (`type: "worktrees"`). Show the count in `summary()` as `servers_stopped`.

## 2. Go dormant sooner when RAM is tight

`Global.js` sends an idle agent dormant after `dormant_ms` (3 min). When free RAM is under 6 GB (`SERVEX_TIGHT_MB`, default 6144), use 30 seconds instead (`SERVEX_DORMANT_TIGHT_MS`). Read free RAM from `servex.processes.now.free_mb`. If the monitor has no reading yet, keep the normal timer. Log the switch once each way, not every tick.

## Proof

- Add checks to `Servex/processes.test.mjs`: with made-up state, a landed task's worktree gets its server stopped, and a taken qf slot does not. The dormant time is 30 s under 6 GB free, and 3 min otherwise or with no reading.
- `node Servex/processes.test.mjs` passes.
- The live effect is measured after the merge and restart, not by you.

When done, commit and write `pm-ram-report.md` in this folder (`public/framework/ai/2026-09-30/process-monitor/ram/`, in the MAIN checkout: report only). Say what was built, with the test output, and what was left. Reply to your parent in one line. Never write the owner's name anywhere. Every spawned process uses `windowsHide: true`.
