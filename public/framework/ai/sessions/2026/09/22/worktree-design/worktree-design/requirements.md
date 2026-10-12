# worktree-design — parallel work on this repo without bloating the SSD

Minion: Opus, effort high. Session id `74705646-2f09-477e-8925-4c6f88941ce4`. Read
[`../mastermind-servex/common.md`](../mastermind-servex/common.md) first, then section **C** of
[`../mastermind-servex/requirements.md`](../mastermind-servex/requirements.md). This is a
**paper** task: research, measure, design, recommend. Build nothing under `Server/` or
`Servex/`. Private port if you need one: **8093**.

## The owner's words, today (14:55), on top of section C

> make sure to research the best way to use work trees for parallel work. not every minion needs
> a worktree. i think there should be a master-mastermind that is the executive decision maker,
> to keep things moving, and then each task gets its own mastermind who creates the worktree, and
> can spawn minions to work on it. with worktrees, i don't think you can duplicate a directory
> in-place? instead of repo/ and repo-branch2/, you'd have repo/dir/ and repo/dir-branch-2/?
> duplicating a large repo like this one might be a performance issue. consider solutions to get
> the parallelization of worktrees, without bloating my SSD. maybe we need to restructure the
> repo, and prune a lot of things.

## What exists — read first

- `ai/2026-09-19/worktree-study/` — a prior study: nine masterminds on one target was found
  feasible but oversized (≈7.25 GB at nine); start with three. Its numbers are your baseline.
- `Server/worktree-up.mjs` and `worktree-down.mjs` — scripts that already exist; read what they
  do and whether they were ever proven on this repo (`ai/2026-09-21/safe-rollout/` says
  "worktrees work, but not on this repo yet" — find out why).
- Claude Code's built-in isolation: the `EnterWorktree`/`ExitWorktree` tools and the Agent
  tool's `isolation: "worktree"`, and `claude --worktree` if the installed CLI (2.1.260) has it
  (`claude --help`). Find what they actually do on disk — where the worktree goes, what it
  checks out, whether it is a full checkout — before designing anything of our own.
- `git worktree` itself: a worktree is a second checkout sharing one `.git`; the object store
  is not duplicated, the **working files are**. `git sparse-checkout` can make a worktree that
  materialises only the directories a task touches.

## Deliverables — all on one page, `ai/2026-09-22/worktree-design/page.js`, plus the log

1. **The numbers.** Measure this repo today, without another agent editing it at the moment you
   measure (say in the log when you measured): tracked files, working-tree size on disk, size of
   `.git`, the largest directories under `public/` (a top-ten table), how many files are
   generated pages vs hand-written, and the time for `git worktree add` of a full checkout and
   of a sparse one limited to, say, `public/framework/ai/` + `Server/` + the root files. Two
   numbers that must agree: the tracked-file count from `git ls-files | wc -l` and the sum of
   your directory table. Clean up every worktree you make (`git worktree remove`, then `git
   worktree prune`) and prove `git worktree list` is back to one.
2. **Where a worktree goes.** Answer the owner's question plainly: a git worktree is a sibling
   directory, not a copy in place (`C:/Code/lew42/monorepo-<task>/` or a `worktrees/` folder
   outside the repo), and a sub-directory of the repo would be *inside* the main checkout and
   picked up by its watchers. Say where ours should go and why, and what the dev server's
   `chokidar` watcher and `directory.json` builder do if a worktree lands inside `public/`.
3. **Who gets one.** The owner's shape: a master-mastermind decides; a per-task mastermind
   creates the worktree and spawns minions into it; not every minion needs one. Write the rule
   in five lines: which work runs in the main tree (a single-page edit, a doc pass, a log
   append) and which gets a worktree (multi-file, risky, or a parallel team on the same task for
   comparison). Name the cleanup policy: when a worktree is removed, what happens to its
   branch, and who merges.
4. **Per-worktree dev server through the proxy.** Each worktree runs its own `node server.js`
   on its own port; the Servex proxy (being built by the sibling `servex-port`, `<name>.localhost:8080`)
   routes `<task>.localhost` to it. Say what the worktree server needs (its own `directory.json`
   build, `NO_WHISPER=1`, `BOOT_TEST`-style flags) and what the cost of one more server is
   (memory from the running one: `Get-Process node`).
5. **The SSD answer.** Three options, each with a measured or estimated size for three parallel
   teams: (a) full worktrees; (b) sparse worktrees materialising only the task's directories;
   (c) restructure — move the generated bulk (which directories, from your table) out of the
   tracked tree or into a separate repo so a full worktree is small. Recommend one for phase 2
   and say the case in which another would win. If (c), list what you would prune, with sizes,
   as a proposal — do not delete anything.
6. **Merging parallel teams.** The owner wants two teams on one task, best of each merged. Say
   in a paragraph how that works with branches (`task/<slug>/a`, `task/<slug>/b`, a compare
   page, cherry-pick or a merge by a judge minion), and what is hard about it on a tree of
   generated pages.

## Fence

Your task dir only, plus `ai/2026-09-22/page.js` `children:` (add your slug — the day page
declares dirs that have a `page.js`). Worktrees you create go **outside** the repo
(`C:/Code/lew42/wt-<slug>/`) and are removed before you land. Never `git stash`, `reset`,
`checkout --`, commit or push in the main tree.

## Length

The page: one screen — the recommendation first in two sentences, then the rule (3), the
table (1), the three options (5); the rest one click down. Landing report: eight sentences with
the three sizes.
