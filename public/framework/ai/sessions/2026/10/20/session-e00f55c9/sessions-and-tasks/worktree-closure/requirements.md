# Worktrees close with their task: nothing piles up on the disk

Budget: $8. Sonnet, medium effort. Parent: `vscode-mastermind`: log with the `log` tool. Never destructive: every uncommitted file is committed to a branch before its worktree goes; branches are kept.

## The owner (2026-10-22, tab prompt log `ai/2026/10/20/session-e00f55c9/page.jsonl`)

> The system needs to clean up work trees automatically. We can't be frying my disk… we might want to keep it open until it's been merged. So maybe it needs to be part of the task system… when we try and complete a task, we make sure that we close all the loose ends and not have work trees just growing endlessly.

## What exists (read first)

- `Servex/Worktrees.js`: every 10 min, removes a worktree that is merged and clean. It never touches one with "uncommitted" files, so 21 sit forever: most hold a few stray files (`session-flags.json`, a `review.jsonl`, a task log), some hold real work. `node Server/worktree-prune.mjs --dry` lists them; `node Server/Worktrees.mjs --plan` gives verdicts.
- `Servex/Pool.js` (qf-* slots), `node Servex/Lifecycle.js --salvage <slot>` (commits to `salvage/<slot>-<date>`), `Server/worktree-down.mjs`, `Server/doc/worktrees.md`. Each worktree has its own `node_modules`, so each one is large.
- Spawns failed today with "No pool worktree is ready" (qf-5 locked; qf-7, qf-9 waiting to be recycled): find out why.

## Do

1. **Measure:** disk used by `C:\Code\lew42\worktrees` per worktree, by script.
2. **Clear the backlog:** for each stuck worktree, commit its uncommitted files to its own branch (or `salvage/<name>-<date>`), check the branch against `michael/dev` (merged, or which commits are unmerged), then remove the worktree, keeping the branch. One manifest line each in `ai/sessions/worktree-removals.jsonl`. A worktree with an agent working in it, or touched in the last 2 hours, stays.
3. **Close the loop in code:** a task cannot complete while its worktree is open. On landing (`finish-task`, `item complete`, or `Landed.js`), the task's worktree is merged or its leftovers committed to a branch, then removed; unmerged work becomes a "ready to merge" line for the owner ([priority.md](/framework/ai/priority.md) 3b), and the worktree may stay only until that merge. `Worktrees.js` does step 2 automatically for a worktree whose task landed or went quiet for 2 days.
4. **Pool health:** why no pool slot was ready; fix it if small.
5. Update `Server/doc/worktrees.md` (what happens when, automatically). Commit by exact paths; worktree for code; `finish-task` with disk before → after.
