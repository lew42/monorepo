Budget: $8 ($5 asked, plus $3 for the orphan fix found after).

# Servex: free the stuck pool slots, and stop them sticking

**Why:** today's agents got no worktree. Two pool slots are still marked taken:
- **qf-6**, held by mastermind-servex-9 (stopped) for 17.7 hours. Its uncommitted files are `ai/board.jsonl`, `ai/cards.jsonl` and a task.jsonl with one dictation in it.
- **qf-9**, held by task-mastermind-task-audit (landed) for 17.2 hours. Its uncommitted files are `files.jsonl` indexes under `ai/2026-10-02`, `ai2` and `ext/Refine`.

`return_worktree` refuses both because of those uncommitted files. They are logs and generated indexes, not work. (vscode-mastermind, 2026-10-03)

## The real cause: the pool lost track of five of its worktrees (-10, from the repo, 2026-10-03)

- `.worktree-pool.json` lists only 2 slots, qf-6 and qf-9, both taken. `K` is 3.
- `git branch --list "worktree/qf-*"` shows all nine names in use. qf-2, 4, 5, 6, 7, 8 and 9 each have a worktree checked out, and the branches for qf-1 and qf-3 still exist.
- So `top_up()` sees 2 < 3 and calls `prepare()`. But `free_id()` finds no free name among qf-1 to qf-9 and returns null. `prepare()` then returns null without a word, so no slot is ever made ready, and every queued minion waits forever. Those 7 checked-out worktrees are the "7 pool worktrees idle" that `system_health` shows.

**Step 0, before any change: a dry-run list** (vscode-mastermind's review of 2026-10-03). Write `node Servex/Pool.js --list` (or a flag on an existing command), changing nothing, that prints one row per `qf-1` to `qf-9`:
- in the pool file or not;
- on disk or not;
- its holder and that holder's state;
- the agents working in it;
- clean, `.jsonl`-only dirty, or dirty with other files;
- its commits off michael/dev;
- what the fix below would do to it: adopt, remove, keep (and why), free.

Post that table on the card before touching anything, and run every step below with `--dry` first.

**Fix this first, ahead of step 1:**
1. **Adopt the orphans.** On boot and in `reclaim()`, any `qf-N` worktree that's on disk (`git worktree list`) but missing from the pool file is looked at:
   - no live agent works in it, it's clean, and it has no commits off michael/dev → add it back as ready (fast-forward it, check its server answers), or remove it with `worktree-down.mjs`;
   - otherwise keep it, and say so once, with the reason (the same rules as step 2).
2. **Never fail silently.** When `free_id()` returns null, log one line ("pool: no free qf name; qf-1 to qf-9 are held by: …") and put the reason on the queued spawn.
3. **Test it:** a worktree on disk that isn't in the pool file gets adopted, and the queued spawn takes it.

Afterwards, check `.worktree-pool.json` and `git worktree list` agree, with at least one slot ready.

## Step 1: free qf-6 and qf-9 without losing a line

1. For each slot, run `git -C <slot> status --porcelain` and `git -C <slot> log --oneline michael/dev..HEAD`.
   - If a slot has **commits** that aren't on michael/dev, or a changed file that isn't a `.jsonl`, stop: use `node Servex/Lifecycle.js --salvage qf-N --dry`, then the real run, which keeps everything on a `salvage/` branch.
2. For each changed `.jsonl`, append to the **main tree's** copy every line the slot's copy has that main's doesn't. Write `Servex/pool-lines.mjs` to do it with code (law 7), never by hand:
   - it compares whole lines, and appends only the missing ones, in their original order;
   - it appends through `node .claude/hooks/append.mjs`;
   - `--dry` prints what it would append.
   For `files.jsonl`, regenerate the index in main instead, if the repo has a generator for it; otherwise append it like a log.
3. In the **slot only** (never the main tree), `git -C <slot> restore <those files>`, then `return_worktree` (or `node Servex/Lifecycle.js` with the matching command). Check both slots now read ready.

## Step 2: fix the cause, in `Servex/Pool.js` `reclaim()` / `give_back()`

1. **A landed holder counts as finished.** Today `reclaim()` frees a slot only if its holder is `stopped` or `gone`. A holder whose task.jsonl has `landed_at` also counts, even if it's still idle. Keep the other rules exactly as they are: no live agent works in the slot, and no live agent descends from the holder.
2. **Logs and generated indexes never block a hand-back.** When `give_back()` finds that every uncommitted file is a `.jsonl`, it runs step 1's line merge into main, restores those files in the slot, and goes on. Any other changed file, or any unmerged commit, still refuses and keeps the slot, as now. Reclaim never salvages anything else (the 09-30 rule in the `reclaim()` comment stays).
3. **The spawn queue drains.** `heartbeat_status` shows `minion-cost-reader` (parent task-mastermind-session-costs) waiting for a pool worktree since 2026-10-02 23:09, and task-mastermind-framework-home-grids' 3 minions queued behind it after a restart. The machine was calm (12 GB free, 7% CPU), so the queue was waiting on the stuck slots, not on memory. After step 1, check that the queue starts these agents within a minute. If it doesn't, find the step that should wake the queue when a slot is freed or topped up, and fix it. Add one test: free a slot, and the queued spawn gets it.
4. **Tests:** extend `Servex/pool-hold.test.mjs`, or add a test file beside it, with these cases:
   - a slot held by a landed idle holder is reclaimed;
   - a slot dirty only with `.jsonl` is reclaimed, and the missing lines end up in main;
   - a slot with a changed `.js` file is kept;
   - a slot with an unmerged commit is kept.
   Use temporary git repos, never the real pool.

## Step 3: land

- Run `node --check` on each changed file, then the tests.
- Commit by exact path and merge.
- Restart Servex with `restart_servex` (after restart-keeps-agents, it waits until no agent is mid-turn).
- Append an `experiment` line: the pool's slot states before and after, copied from `.worktree-pool.json`.
- Known issue `pool-slot-held-by-stopped` (in `ai/2026-10-02/known-issues/seed.json`): mark it fixed and link this task.

Sonnet, medium effort. Never `stash`, `checkout --` or `reset` in the main tree. Never delete a branch. Don't wait on the owner.
