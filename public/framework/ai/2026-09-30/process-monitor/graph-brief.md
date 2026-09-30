# Brief: the Processes graph on the Live card

You are a minion of **task-mastermind-dormant-idle**, for the task [process-monitor](requirements.md). Read the owner's words in [owner-words.md](owner-words.md) first.

**Work in:** `C:/Code/lew42/worktrees/process-graph` (branch `worktree/process-graph`, its own server at http://localhost:52901/). Never edit the main checkout. Commit early, by exact path.

**Your files (the fence):**
- `public/framework/ai2/processes.js` (new)
- `public/framework/ai2/live.js`
- `public/framework/ai2/ai2.css` (only rules for your new classes; prefix `ai2-proc-`)
- `public/framework/ai2/doc/` (one new doc, if needed)

Nothing under `Servex/`. The data already exists.

## The data

Servex answers `GET <servex_base()>/api/processes` (see `inbox.js` for `servex_base`/`servex_fetch`). It is new, so the LIVE Servex answers 404 until it restarts onto the new code; show nothing then. The shape is in `C:/Code/lew42/worktrees/process-monitor/Servex/doc/processes.md` (read it; it merges to michael/dev soon). A real sample to build against is in:

`C:/Code/lew42/worktrees/process-graph.sample.json` (outside the repo)

The sample was taken outside Servex, so it has no `task` or `front desk` groups; the live one will. Render every kind the same way.

Test with headless Playwright, intercepting `**/api/processes*` with that file. Never drive the owner's open browser tabs. Never copy the sample into the repo.

Key fields:
- `ours {n, mb, cpu}` and `other {n, mb, cpu}`, plus `free_mb` and `total_mb`
- `groups[]`: `{key, kind: task|desk|servex|session|servers|orphans|agent, label, n, mb, cpu, pids, agents?}`
- `orphans[]` and `reaped[]`
- `running[]`: `{id, state, pid, mb, lost}`
- `worktrees {total, pool, in_use, open, uncommitted, finished, removed_today}`
- `history[]`: up to 360 points, `{at, cpu, ours_mb, other_mb, free_mb, groups: {key: [mb, cpu]}}`

## What to build (the owner's asks 1, 3, 4, 5)

1. **A "Processes" section on the Live card** (`/framework/ai2/live/`). Poll every 10 s, and skip while hidden, like `poll_pool`. It shows, in this order:
   - **The graph:** RAM over the last hour as a stacked area, ours on the bottom and everything else above it, against total RAM, with CPU % as a line on its own small chart below. One glance should say "ours is X GB of Y".
   - **By task:** one row per group, biggest RAM first: label, process count, MB, CPU %, and a tiny sparkline of its RAM from `history[].groups[key]`. A row opens (`details`) to list its processes, or its agents with their PIDs.
   - **Orphans:** "N orphaned, M reaped", opening to the list.
   - **Worktrees:** "45 worktrees: 3 pool, 6 in use, 9 open, 5 uncommitted" and "N removed today".
2. **"Running now" shows the real process.** Each agent row's small line gains "pid 47356 · 248 MB" from `running[]`. An agent marked `lost` (working, but no process) gets a visible "no process" badge. A dormant one reads "dormant, no process".

## Rules

- Load the `page`, `layout`, `dataviz` and `color` skills before building. The chart is inline SVG: no new dependency, no build step.
- It must look right at 400, 1200 and 1920 wide, in light and dark. Take the shots headless at those widths, reached from the rail the way the owner reaches it, and look at them.
- `node Server/hold.mjs on/off` around your batch of writes, if the main site loads them (it won't, from your worktree, but the merge will).
- When done: commit, write `<this task dir>/graph-report.md` (the shots, what was built, what was left), and reply to your parent with one line.
