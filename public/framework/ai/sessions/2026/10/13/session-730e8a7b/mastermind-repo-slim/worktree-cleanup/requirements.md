# Worktree cleanup: 51 worktrees, ~24 GB, down to the ones in use

Budget: $15. Load the `sub-mastermind` skill first; you are the task mastermind for this one task. The owner's raw words are in `../requirements.md` (ask 2). Your log is this dir's `task.jsonl` (Servex opened it). CLAUDE.md laws apply, above all **never destructive**: nothing is deleted that is not already in git on a branch.

## The facts (mastermind survey, 2026-10-13 15:45)

- `git worktree list` shows 51 worktrees: 7 under `monorepo/.claude/worktrees/`, 38 under `C:/Code/lew42/worktrees/`, 3 stray at `C:/Code/lew42/wt-*`, 1 at `C:/Code/worktrees/comment-prune-3`, plus the main tree.
- 47 of them are at **0 commits ahead of `michael/dev`** (fully merged). Ahead: `worktree/orphans` (+2), `worktree/readmeaudit` (+2), `worktree/refine-demo` (+1); `wt-task-folders` is a detached HEAD.
- Most show "dirty" files (1 to 293). Those are mostly machine-written logs (`page.jsonl`, `files.jsonl`, directory listings), but you must prove that per worktree, not assume it.
- `Server/worktree-prune.mjs` already exists (read its header): it removes a worktree only when merged, no live agent inside, not a pool slot, and nothing changed but its own logs. On 2026-09-30 it pruned 38 of 76. `Server/worktree-sweep.mjs` stops a worktree's dev server. The quick-fix pool is `Servex/Pool.js` + `Servex/doc/pool.md` (`qf-*` worktrees; `qf-5` is locked).
- Live agents: run `list_agents`; only idle/working rows matter, and check each one's `cwd`.

## Deliverable

1. **Run `node Server/worktree-prune.mjs --dry` first** and record its output in your log. Then `--apply` for everything it is willing to prune. Measure GB before and after (`du -sm` on the three roots), two numbers in the log.
2. **For merged worktrees it skips because of other changes:** extend the script (or add `Server/worktree-salvage.mjs`, a class if it has state) with a `--salvage` mode: in that worktree, commit every change on ITS OWN branch as one commit `salvage(<worktree>): working tree at prune, 2026-10-13`, then remove the worktree (never `--force`, never `git clean`, never `git stash`). The branch stays; a manifest JSON of old path → branch → salvage commit goes in this task dir. A dry run prints the manifest first. Reversible: `git worktree add <path> <branch>` brings any back.
3. **Never touch:** the main tree, a locked worktree, a pool slot the pool manages, a worktree with a live agent cwd, or the 3 ahead branches (list them in the report for the owner with `git log michael/dev..<branch> --oneline`; do not merge them). `wt-task-folders` (detached): report what its HEAD commit is and whether it is on a branch; salvage to a `salvage/wt-task-folders` branch only if its commits are not reachable from any branch.
4. **Decisions to write** (as `decision` lines + a short `doc/worktrees.md` in this task dir, linked from `Servex/doc/pool.md`): (a) where worktrees should live: inside `monorepo/.claude/worktrees` vs `C:/Code/lew42/worktrees` vs a `C:/Code/lew42/workspace/` folder that could also hold un-committed things such as API keys; pick one and say how to switch; (b) why quick-fix worktrees are not being reused and what makes them reusable; (c) why 51 piled up since the 09-30 prune of 38 (what creates a worktree without ever pruning it) and the one fix that stops the pile-up.
5. Report: one screen on your card (`card_reply`): before/after GB, how many pruned, salvaged, skipped and why, the decisions, links.

Fence: `Server/worktree-*.mjs`, `Servex/doc/pool.md`, this task dir. Nothing under `public/framework` except this task dir. Commit on `michael/dev` by path (these are scripts and records, not site code); a clean `git status` for your files when done. Spawn Haiku minions only if a parallel census is worth it; this is mostly one careful agent's job.
