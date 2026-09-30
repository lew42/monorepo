# The pool never reclaims a taken worktree: requirements

Budget: $8

## What happened (task-mastermind-icon-system, 2026-09-30 about 15:10)
Pool worktree `qf-9` was taken with `take_worktree` at about 12:55. Around the Servex restart at 15:10 (the new Pool.js from f3ca2f50 came up, and `worktree-prune` had run), qf-9's directory, branch and dev server were deleted while a minion was writing in it. The minion held the work in context and rebuilt it in qf-6; a fresh minion would have lost it.

## Deliverables
1. **"Taken" survives a restart.** Pool.js persists which worktrees are taken and by whom (a file under Servex's home, or the registry row), and on start treats a persisted taken worktree as taken until its agent is `stopped` or `gone` AND its branch has no unmerged commits AND `git status --short` in it is empty.
2. **Nothing with uncommitted work is ever deleted.** `Server/worktree-prune.mjs` and Pool's reclaim skip any worktree whose `git status --short` is not empty, or whose branch has commits not in michael/dev, and print why. Salvage (a `salvage/<name>-<date>` branch) is the only path that may move such work, never delete it.
3. **A proof** (`proof.txt`): take a worktree, write an uncommitted file, restart nothing but run the reclaim and prune paths by hand; the worktree stays. Then stop its agent and commit nothing; it still stays, with the printed reason.
4. Tell mastermind-servex-8 one line when merged (a Servex restart follows; do not restart yourself).

Fence: Servex/Pool.js, Server/worktree-prune.mjs, Servex/doc/. Worktree required (take_worktree). From the Bash tool, call merge.mjs with MSYS_NO_PATHCONV=1.
