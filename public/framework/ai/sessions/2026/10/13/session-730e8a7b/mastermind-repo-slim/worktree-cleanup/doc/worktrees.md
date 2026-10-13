# Worktrees: where they live, why they piled up, how they get reused

A **worktree** is a second checkout of the repo in its own folder, on its own branch, so an agent can
build without touching the main tree. The cleanup of 2026-10-13 ([report](../report.md)) found 51 of them,
about 24 GB. This page records three decisions from that cleanup. The detail is in the
[task log](../task.jsonl).

---

### 1. Where worktrees live: `C:/Code/lew42/workspace/worktrees/`

There are three candidates:

- **`monorepo/.claude/worktrees/`** is inside the repo folder. Every tool that walks the repo folder
  sees seven extra copies of the repo: the dev server's file watcher, searches, VS Code indexing,
  and a backup of the folder. Only the Agent tool's `isolation: "worktree"` puts worktrees here,
  and the harness decides that, not us.
- **`C:/Code/lew42/worktrees/`** is where they live today. `Server/worktree-up.mjs` (`WORKTREES_ROOT`)
  and `Servex/Pool.js` (`prepare()`, `recycle_orphans()`) both hard-code `../worktrees`.
- **`C:/Code/lew42/workspace/worktrees/`** is the owner's suggestion: a workspace folder for everything
  that is never committed, so `lew42/` holds only projects.

**Decision: `workspace/worktrees/`.** It follows the owner's words, keeps `lew42/` a projects folder, and
gives scratch work one home outside every repo. The alternative was to stay at `lew42/worktrees/`: it
works and costs nothing to keep, but it puts a scratch folder among the projects.

**API keys do not go in the workspace.** Servex already keeps its keys in `%LOCALAPPDATA%\lew42\servex\`
(`openrouter.key`). That folder is outside every repo and every backup of the repo, and it is the one place
Servex already reads. A second home for secrets would break law 6 ("one of everything").

**How to switch (three steps):**

1. `worktree-up.mjs` and `Pool.js` both read one root, with a fallback to the current one:
   `process.env.LEW42_WORKTREES || path.resolve(main, "..", "workspace", "worktrees")`.
2. Restart Servex (`node Servex/sustain.mjs --restart`), so new worktrees are made there.
3. Don't move the old ones. They age out through the timed prune (decision 3). `git worktree move <old> <new>`
   moves any one that has to stay.

Status: decided, not switched yet. Step 1 touches `Servex/Pool.js`, which is outside this task's fence.
It is a follow-up for the Servex owner.

---

### 2. Why quick-fix worktrees are not being reused

The pool (`Servex/Pool.js`, [pool.md](../../../../../../../../../../../Servex/doc/pool.md)) keeps up to three `qf-N`
worktrees warm. Since 2026-09-22, the Servex log has counted **74 takes and 55 returns, but 239 named
worktrees made with `worktree-up.mjs`**. Three causes, most important first:

1. **The skills send every multi-file task to a new worktree.** The `sub-mastermind` skill says "multi-file
   work … gets a worktree: `node Server/worktree-up.mjs <slug>`", and keeps the pool for "quick fixes".
   So most work never asks the pool.
2. **The pool's cleanup of leftovers was stuck for 24 hours.** `qf-1` had a stale `index.lock`
   (0 bytes, from 2026-10-12 16:15). Every 10 minutes `recycle_orphans()` made a new
   `salvage/qf-1-<date>-<n>` branch, failed at `git add`, and threw. That one error stopped the loop at
   `qf-1`, so `qf-4` and the other leftovers were never reached. The result: 143 failures and 150
   salvage branches, all at the same, already-merged commit. Fixed for now by moving the stale lock
   aside. At 16:07 the pool then recycled `qf-1` to `qf-4` by itself; their salvage commits held only
   the dev server's `page.jsonl` and `files.jsonl` lines.
3. **A slot only goes back to the pool when it is clean, and agents' logs make it dirty.** `return_worktree`
   refuses any changed file. Agents write `task.jsonl`, `usage.jsonl` and `cards.jsonl` inside their
   worktree, so a finished slot reads as dirty. It then waits for `reclaim()` instead of going straight
   back to the pool. A slot's own dev server does the same to a *ready* slot: at 15:55, `qf-2` "would
   not fast-forward to michael/dev" because its server had rewritten `files.jsonl`, so the pool dropped
   it and built a new one (`qf-3`, 40 s).

**What makes them reusable:**

- In `Pool.js`, `recycle_orphans()` skips one failed slot and goes on to the next, instead of throwing.
  `salvage()` also checks for an `index.lock` before it makes the branch, and makes the branch only
  after `git add` succeeds, so a failed pass leaves no branch behind. *(Servex owner; outside this fence.)*
- In the `sub-mastermind` skill, the default becomes `take_worktree()` for any one-team task, and
  `worktree-up.mjs <slug>` only when the task needs a long-lived branch with a name a sibling must find.
  *(system architect.)*
- A slot treats its own server's `page.jsonl`/`files.jsonl` as noise when it fast-forwards (it does
  so already on return), instead of dropping the slot. *(Servex owner.)*
- Live logs go to the main tree, not into the worktree. That is the
  [tidy-git-status](../../tidy-git-status/) task.

---

### 3. Why 51 piled up after 38 were pruned on 2026-09-30, and the one fix

**Many things create worktrees, and nothing removes them on its own.** These create them:

- `worktree-up.mjs <slug>`, run by masterminds (the `C:/Code/lew42/worktrees/*` names);
- the Agent tool's `isolation: "worktree"` (the 7 under `.claude/worktrees/`, which the harness removes only
  when they are unchanged);
- a plain `git worktree add` run by hand (the strays `C:/Code/lew42/wt-*` and `C:/Code/worktrees/`).

**`worktree-prune.mjs` has only ever run by hand.** No landing step (`merge.mjs`, `finish-task`) and
no timer calls it. Even when it ran, it skipped 20 of 50, because a single changed log file was enough
to keep a worktree.

**One more source of waste:** `git worktree remove` on Windows can fail partway when a file is held
open. Git then forgets the worktree but leaves its files on disk. 29 folders like that were found; 24 were removed.
`Server/worktree-leftovers.mjs` removes one only when every file in it is already in git (each file is
hashed and looked up), is ignored by `.gitignore`, or is a server log. Counts are in the [report](../report.md).

**The one fix: run the prune on a timer.** Servex's 10-minute pool sweep also runs
`node Server/worktree-prune.mjs --salvage --idle-hours 6`. It removes only a worktree whose branch is in
`michael/dev`, where no live or queued agent works, that is not a pool slot, and whose last commit and
every changed file are older than 6 hours. Anything left is committed on the worktree's own branch first,
and `git worktree add <path> <branch>` brings it back. The script side is built and tested
(`--idle-hours`, 2026-10-13). The one-line hook-up in Servex's sweep is the follow-up for the Servex owner.
