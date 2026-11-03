# Quick-fix pool cleanup (2026-09-30)

`take_worktree` failed with "No worktree could be made ready": all nine `qf-*` names were used up by leftover worktrees, so the pool had no free name.

What was done, nothing discarded:
- `qf-2`, `qf-5`, `qf-7` — merged; their only uncommitted changes (board/flags churn) are saved here as `qf-N.diff`; worktrees removed.
- `qf-6` — merged; diff saved here (`qf-6.diff`, generated files.jsonl churn); its folder would not delete (files locked by some process) — remove `C:/Code/lew42/worktrees/qf-6` by hand when nothing holds it.
- `qf-8` — a half-initialised worktree (locked "initializing", staged deletions only); removed.
- `qf-1`, `qf-3` — worktrees removed, **branches kept** because they hold unmerged commits:
  - `worktree/qf-1`: core/Page left nav matches the top tabs + "Make a page" inline results (2 commits, 14 files). Decide: merge or drop.
  - `worktree/qf-3`: the Dictate playground (7 commits). Main already has the playground by another route; probably superseded — compare before dropping.
- `qf-4`, `qf-9` — taken, untouched.

The pool reuses a merged name by itself (`Pool.js`, free_name: `branch -d` a merged leftover); an unmerged branch keeps its name blocked, which is right.
