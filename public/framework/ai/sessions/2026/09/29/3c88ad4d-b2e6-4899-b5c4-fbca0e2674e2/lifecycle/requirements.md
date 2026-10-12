# Lifecycle: nothing is left running

**Owner's words:** [owner-words.md](/framework/ai/2026/09/29/lifecycle-nothing-left-running-nested-ta/owner-words.md) (09-29, about 5:35 PM). Every sentence is traced in [refine/coverage.md](refine/coverage.md). The cleaned list is [refine/brief.md](refine/brief.md). This task covers items 1–4 and 11–15 there. Items 5–10 (nested tasks) are the sibling task `nested-tasks`.

**The complaint:** 22 dev servers were left running. It's the same root problem as before: AIs forget to start or stop things once they're deep in work. The owner: "we don't want to rely on the AIs to remember". **So the fix is node code, not a skill line.**

## Deliverables, in order

1. **A creation log.** Every resource the system makes is logged when it's made, with its owner task, and its end is logged too. That covers agents, tasks, worktrees, dev servers (`Server/run.js`, including the ones started by hand with `PORT=… node server.js`), health watchers and supervisors, and headless browsers. There's one log through Servex `append_log`: `{at, kind, id, pid?, port?, path?, owner_task, owner_agent, event: "start"|"end", why?}`. Put the hook where each thing is created: spawn_agent, worktree-up and take_worktree, server.js/run.js startup (it can log itself), health-supervisor, and the Playwright launch helper.
2. **An efficiency study**, done by Sonnet minions that count. Use the log where it exists and the evidence on disk where it doesn't (task dirs, `.worktrees.json`, `C:\Code\lew42\worktrees\`, `.worktree-logs\`, the Servex agent registry, the live process list). Count:
   - tasks started and never landed;
   - servers started and never stopped;
   - worktrees orphaned (merged or abandoned, still on disk or still serving);
   - agents left idle holding a claude process.

   Give a number for each, a table of the worst cases, and one page with a picture (a chart) linked from the card.
3. **A node reaper** tied to the heartbeat and the task lifecycle: when a task lands or dies, everything it owns is closed (its worktree server and wrapper, health watcher, headless browsers, and idle one-pass agents such as reviewers, clarity and checkers). It runs on landing (on-landing.mjs) and as a sweep on the heartbeat tick, which catches what was missed. **Count before and after**, on the live machine.
4. **The keep list.** The reaper never touches the main site server (:3104), Servex, the gate, whisper, or anything on a keep list. Today the keep list is **:8137** (the owner's phone uses it for LAN access, until LAN access has a proper home).

## Evidence already gathered (use it; don't re-find it)
- **Why teardown never ran:** `Server/on-landing.mjs` finds a task's worktree only through `worktree` on task.jsonl line 1 (`entry_for_task_dir` in `Server/worktree-sweep.mjs`). Only 1 of about 20 task logs on 09-29 had it, so no "worktree-down:" line was logged all day. Fix: whatever opens the task log (spawn_agent `task`, take_worktree, worktree-up) writes `worktree` there, and there's a slug and branch fallback.
- **Hand-started servers are in no registry:** there were 5 on 09-29, about 1 GB. The rule now in the minion skill ("stop every server you start") is a stopgap; the log in step 1 replaces it.
- **Wrappers respawn children:** killing `run.js` alone isn't enough, because its `server.js` wrapper starts it again. Close the wrapper first.
- **One-pass agents** (reviewer, clarity, checker) have parent null and stay idle holding about 300 MB each. Stop them when their result is written.
- **A clarity agent is spawned per minion landing**, not per task, which multiplies agents under memory pressure. Make it once per task, and queued while the monitor flag is up.
- The mastermind's hand reaps on 09-29 are logged in `ai/2026-09-29/servex-mastermind/task.jsonl` (16:50, 17:15).
- **The monitor nags without news:** the servex-monitor sent "stop the finished ones" about every 3 minutes from 16:40 to 17:45 (about 15 times), usually when nothing was left to stop. Once the reaper stops finished agents itself, have the monitor message only when the set of stoppable agents changes, and name them.

## Fence
The files are Servex/ (Pool.js, a new Reaper or Lifecycle module), Server/on-landing.mjs, Server/worktree-*.mjs, Server/health-supervisor.mjs, server.js/run.js startup logging, and the study page under `public/framework/servex/lifecycle/` (use create_page).
Stay out of Heartbeat.js revive logic and the dispatch queue: those belong to `node-reliability`. Call its tick and don't change it; if you need a hook there, ask mastermind-servex-5.
Work in a worktree, and merge with `Server/merge.mjs`. Restart Servex with `node Servex/sustain.mjs --restart` as your last step, which is safe from an agent shell since e23538c0.

## Done means
The study page shows the numbers. A live before/after count of servers and agents sits on the card. A task that lands leaves nothing of its own running, proven on one real landing.
