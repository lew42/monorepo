# Process monitor: the plan

**What you will see:** a Processes section on the Live card. It shows a graph of RAM (ours vs. everything else) and CPU over the last hour, one row per task with its processes, RAM and CPU, and a short list of orphaned processes, with a note on each one that was reaped.

## Where the numbers come from

1. **Each agent's real process.** Servex starts every claude.exe itself. The SDK lets Servex do that spawn (`spawnClaudeCodeProcess`), so Servex keeps the PID and records it on the agent, in the registry and in the lifecycle log. "Running now" then means a live PID. An agent that says it is working but has no live process gets flagged.
2. **One sampler, every 10 seconds.** The monitor already runs one hidden PowerShell loop, every 5 seconds, for CPU. That loop now also reads every process's PID, parent PID, name, RAM, CPU and start time. The command line is read once per new process. No new PowerShell starts per sample.
3. **Ours vs. everything else.** "Ours" is:
   - the Servex process tree (agents, their bash/tail/grep/sleep/git/node children);
   - the detached dev servers and gate Servex started (their PIDs are already recorded);
   - the owner's own Claude Code sessions (VS Code tabs), counted as "Claude sessions".

   Everything else is "other". Chrome, VS Code, Creative Cloud and the rest are reported but never touched.
4. **By task.** Each process is attributed to the agent whose claude.exe it sits under, and that agent to its task. A dev server in a worktree belongs to the task holding the worktree.

## What gets logged

- In memory: the last hour, at 10-second resolution (about 360 points), served at `/api/processes`.
- On disk: one line per minute in `logs/processes.jsonl`: totals, per-task totals, and the top processes. It stays small.
- `system_health`, the mastermind's tool, gains "ours X GB / other Y GB", the top three tasks by RAM, and the orphan count, so the architect sees it every time it checks.

## Orphans

- **Flagged:** one of our kinds (bash, sh, tail, grep, sleep, node, git, cmd, conhost) whose parent is gone, or whose owning agent is stopped or dormant.
- **Reaped, only when all three hold:**
  - its command line points into this repo, the worktrees, or Claude's temp dirs;
  - it has been idle (0% CPU) for more than 10 minutes;
  - no live agent or live Claude session is above it.

  Each reap writes one log line.
- **Never touched:** anything outside those paths, and anything whose name is not on the list above.

## Order: three small merges

1. PIDs on agents, the sampler, `/api/processes`, the minute log, `system_health`. Proof: numbers vs. Task Manager.
2. Orphans: flag, then reap. Proof: plant a stale sleep and tail, watch them get reaped, and watch Chrome and VS Code stay untouched.
3. The graph on the Live card (one minion, after step 1 fixes the API). Proof: a screenshot at 1920.

After those: a doc (`Servex/doc/processes.md`), a smoke test, a review, and a recommendation to the Servex mastermind to read the usage line on every tick.

## Added: worktree clean-up (16:25)

Every folder in `C:/Code/lew42/worktrees/` becomes a Servex project with a port and a `<name>.localhost`, and nothing removes it.

- Every 10 minutes, Servex looks at each worktree that is not in the quick-fix pool. A worktree is **finished** when:
  - its branch is merged into michael/dev, or its task has landed and its owner has stopped;
  - it has no uncommitted work;
  - no live agent works in it.
- A finished worktree is removed with `git worktree remove`, and only after `Server/junction-check.mjs` passes. The branch is kept, so `git revert` still works.
- Servex then drops its project: the port, the subdomain and any server running from it.
- The quick-fix pool (`qf-*`) is left alone. The pool already recycles those.
- The process monitor shows "worktrees: N (M finished, K removed today)".
