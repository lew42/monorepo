# Do decisions reach the module readmes?

Expected cost: about $2. Sonnet, medium effort. The owner's words: "We're burying a lot of data in the session files that should be put into the actual documentation." Future agents read readmes, not old session files.

Past audits are listed in `public/framework/ai/doc/audits.md`. Check it first and reuse what's there.

## Measure with a script, then judge a sample

1. For the last 30 landed tasks: how many changed code in a module and also changed that module's `readme.md` or `doc/` in the same landing?
2. Pick the 10 biggest of those tasks by cost. Read each one's landing outcome and any `decide`, `plan` or `report` file. List each architectural decision, and check whether the module's readme or doc now states it. Answer yes, no or partly, with the path.
3. Which rule was meant to make this happen (CLAUDE.md law 9, the `documentation` skill, `finish-task`, the merge gate)? Did it run on those tasks? Is anything actually checking it, or only asking?

## Deliver

- `report.md` in this folder, one screen: the two numbers, the table, and the cause.
- The smallest fix that makes this checked by code, not by memory, built in a worktree, reviewed and landed if it's under about 50 lines. For example, `merge.mjs` warns when a branch changes a module's code but not its docs. Otherwise write it as a task with a plan.
- Move at most the 5 most important buried decisions into their module readmes, each linked to its source.
- Leave zero footprint: return the worktree, close anything you started, and list what you closed.
