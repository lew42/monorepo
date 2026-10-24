# Task queue: an estimate per task, so the ranking separates rows

Budget: $4 (Sonnet, medium). Parent: `mastermind-deputy`, who reviews and merges. Load the `minion` skill first.

## Why

The [task queue](/framework/ai/queue/) ranks by `importance × (1 + 0.5 × re-asks) ÷ (1 + estimated cost ÷ $2)`. The owner asked for a queue that "prioritizes things based on cost, estimated cost, … importance … if I keep asking for something". Today the estimate is one median per module (`TaskQueue.estimate`), so every `ai` task costs $6.05 and the first ten rows tie at 0.74. The order is just "big thing, then oldest". Readme: `public/framework/ai/queue/readme.md` (its Next list names this).

## What to build

1. **`TaskQueue.estimate(landed, module, title)`** in `public/framework/core/Task/TaskQueue.js`. Use the median real cost of the landed tasks whose titles share the most words with this task's title (`TaskQueue.words`): the top 5 with at least 2 shared words. With fewer than 3 such tasks, fall back to the module median as now, then all landed, then the fixed fallback. `basis` says which ("median of 5 similar landed tasks: …two titles…").
2. **`Server/TaskQueue.mjs` `gather()`** adds `title` to each `landed` entry. `SessionIndex` rows carry a title; check `node Server/TaskQueue.mjs --check` prints it.
3. **The page** shows `est_basis` as the Cost cell's `title` tooltip, if it does not already.
4. **Readme**: the score paragraph and the Next list in `ai/queue/readme.md`.
5. **A test**: `public/framework/core/Task/TaskQueue.test.mjs` (or extend the one that exists). Two tasks with different titles get different estimates from a small fake `landed` list, and the fallback chain holds.

## Check it

- `node Server/TaskQueue.mjs --check` before and after, both saved in this folder (`check-before.txt`, `check-after.txt`). How many distinct scores are in the top 20: the number before (1 or 2) and after. That is the deliverable number.
- The page loads on your worktree with no console error (`node Server/smoke.mjs <worktree> /framework/ai/queue/`). Its server must be restarted to load the server change: use `node Server/worktree-restart.mjs qf-2` (your worktree only).
- Commit at each working step. Reply `ready: <sha>`, the two numbers and the smoke line.

## Where

- Worktree `C:/Code/lew42/worktrees/qf-2` (branch `worktree/qf-2`, server http://127.0.0.1:61378/), already taken for you. Its server restart: `node Server/worktree-restart.mjs qf-2`.
- Edit only: `public/framework/core/Task/TaskQueue.js`, its test, `Server/TaskQueue.mjs`, `public/framework/ai/queue/*`.
- Never kill or restart the owner's dev server (port 80, monorepo.localhost) or Servex, never `git stash`, never drive the owner's tabs. The live site gets this at the next dev-server restart; that is fine.
