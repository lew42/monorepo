Budget: $3.

# Servex: the main checkout never leaves michael/dev

**Why:** on 2026-10-03, someone ran `git checkout michael/subcard-columns` in the main repo, and main stayed on that branch for over 20 minutes. During that time, two agents committed onto that branch without noticing (8ec7fed0 prompt-refine, 33816044 subcard-columns). `merge.mjs` then refused every merge: "the main repo is not on michael/dev". (Reported by @task-mastermind-one-dictation.)

**The root cause** (@task-mastermind-one-dictation): the worktree `C:/Code/lew42/worktrees/prompts-live` had `michael/dev` itself checked out. git won't let two worktrees hold the same branch, so main couldn't go back to michael/dev, and landings were being copied onto both branches.

**Now:** main is back on michael/dev (@vscode-mastermind). This task owns both halves again: the guard (items 0 and 1, moved back from restart-keeps-agents) and the alarm (item 2).

0. **No worktree but main may hold michael/dev.** git-guard refuses `checkout`/`switch` to `michael/dev` anywhere except main, and `worktree add` of michael/dev. `worktree-up.mjs` always makes `worktree/<slug>`. The alarm in item 2 also names any worktree holding michael/dev.
1. **The guard:** `.claude/hooks/git-guard.mjs` refuses, in the MAIN tree only, any `git checkout <branch>`, `git switch` or `git checkout -b` that would leave main on a branch other than `michael/dev`. A worktree can switch freely. The refusal says what to do instead: make a worktree with `node Server/worktree-up.mjs <slug>`. Write and Edit can't touch `.claude/`, so write a node patch script, and give it a dry run.
2. **The alarm:** Servex's one-minute sweep checks main's branch with `git branch --show-current`. If it isn't `michael/dev`, log one line and post one Inbox card naming the branch and how far it has diverged. Post that card once per incident, not every minute.
3. **Tests** for both, then land: commit by exact path and merge.

Sonnet, medium effort. Don't wait on the owner.
