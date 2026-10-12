# Minion brief: a landed task's dev server goes down (task-loop, part 5)

Load the `minion` skill first. The whole task: `public/framework/ai/2026-09-28/task-loop/`; read the section "Added: a landed task's dev server goes down" at the end of its requirements.md (items 7, 8, 9). Those three items, verbatim, are your acceptance test.

**Why:** on 09-28, 24 dev-server pairs (about 2.1 GB) were still running for worktrees whose tasks had landed days before. And on the same day, collab-rounds' server was stopped while its minion was still fixing a bug, because "landed" alone was the test.

**Worktree:** `C:/Code/lew42/worktrees/task-loop` (branch worktree/task-loop). Work only there. Another minion (tl-heartbeat) works in `Servex/Heartbeat.js` and `Servex/Servex.js` at the same time: don't touch those files.

## Deliverables
1. **`Server/worktree-sweep.mjs`** (new): `can_stop(worktree)` returns `{ok, why}`. It is ok only when all three are true: the worktree's task has `landed_at` (find the task by `.worktrees.json` and task.jsonl line 1 `worktree`); its branch is merged into michael/dev (`git merge-base --is-ancestor <branch> michael/dev`); and no live agent is working whose parent is that task's mastermind, or whose own task dir is it (read Servex's `GET /agents`, or the registry file it reads). `sweep()` goes over every running `server.js` + `run.js` pair: it stops a pair whose worktree dir is gone, or whose `can_stop` is ok, by calling `Server/worktree-down.mjs <name>` (which already refuses to remove a dirty tree). It never touches the main tree's server or Servex's own. A dry-run flag (`--dry`) prints what it would do.
2. **On landing:** `Server/on-landing.mjs` runs `can_stop` for the task's worktree. If it's ok, it runs worktree-down; if not, or if the tree is dirty, it posts one line on the card saying why, naming untracked files if any.
3. **On the loop's tick:** `Servex/TaskLoop.js` calls `sweep()` once per tick (a hidden child process with `windowsHide: true`, or an import). One or two lines.
4. A paragraph in `Servex/doc/task-loop.md`, under a heading "Worktree servers".

## Proof
`node Server/worktree-sweep.mjs --dry` on this machine: paste the list (how many would stop, how many are skipped and why) into your task.jsonl. Then one real stop of a clearly landed and merged worktree (pick one where `--dry` says ok) and show its port is free after. Never kill by process name or port pattern, only by PID via worktree-down. Never let any process show a window.

**Fence:** `Server/worktree-sweep.mjs`, `Server/on-landing.mjs`, `Server/worktree-down.mjs` (only if needed), one or two lines in `Servex/TaskLoop.js`, one section of `Servex/doc/task-loop.md`. About 150 lines. Commit in the worktree by exact path; don't merge into michael/dev. Land in `worktree-down/task.jsonl` with `landed_at` + outcome.
