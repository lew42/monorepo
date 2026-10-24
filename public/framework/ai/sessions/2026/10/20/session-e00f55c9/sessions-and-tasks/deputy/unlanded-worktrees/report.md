# Unlanded worktrees: report

Computed by [unlanded.mjs](unlanded.mjs) then [verdicts.mjs](verdicts.mjs); rows in [verdicts.jsonl](verdicts.jsonl). Script found 20 branches with commits michael/dev lacks (of 58 removal records; the other 38 are merged); the table has 20 rows. 9 hold unique files, 10 nothing new, 1 noise only.

| branch | verdict | unique files | recommend |
|---|---|---|---|
| worktree-handover-query | noise only | 0 | leave |
| task/project-class | has unique work | 3 | optional: land the 3 record files |
| task/ai-dashboard | has unique work | 24 | optional: land the review report; screenshots are bulk, leave on the branch |
| worktree/ai-system-page | has unique work | 1 | optional: land the file |
| worktree/architecture-md-4 | has unique work | 2 | leave |
| worktree/dictate-next-4 | has unique work | 3 | optional: land review.md |
| worktree/live-archive | nothing new | 1 | leave |
| worktree/nav-model | nothing new | 1 | leave |
| worktree/one-store | nothing new | 0 | leave |
| worktree/orphans | nothing new | 2 | leave |
| worktree/readmeaudit | has unique work | 3 | optional: land the 3 record files |
| worktree/refine-audit | has unique work | 4 | optional: land review/report.md |
| worktree/refine-build | has unique work | 2 | optional: land docs-check.md |
| worktree/refine-confidence | nothing new | 0 | leave |
| worktree/refine-demo | has unique work | 1 | leave |
| worktree/refine-mic | nothing new | 0 | leave |
| worktree/refine-pipeline | nothing new | 1 | leave |
| worktree/refined-asks | nothing new | 1 | leave |
| worktree/sessions-layout2 | nothing new | 0 | leave |
| worktree/undone-to-tasks | nothing new | 3 | leave |

- **No code was lost.** Every unique file is a task record (task.jsonl, review.md, docs-check.md, diff.patch, screenshots); the branch holds a version michael/dev does not have (some files were also changed on michael/dev).
- worktree/nav-model's 312 files are an old copy of the tree: 311 match earlier michael/dev versions.
- Deleted branches orphans, readmeaudit and refined-asks were found by the sha in the record; their commits still exist.

**What happened next (the deputy, 2026-10-24):** 8 records came back to michael/dev (5 reviews and review reports, 2 docs-checks, a drawer task's lines.json), by [restore.mjs](restore.mjs). It restores a file only when the branch's copy is surely newer: michael/dev lacks it and never deleted it, or michael/dev's copy is unchanged since the fork, or the branch only appended to a log. The other 35 stay on their branches, each with its reason in [restore-manifest.jsonl](restore-manifest.jsonl): screenshot rounds nothing links, review diffs, logs both sides changed, and old tasks that never landed (restoring one would show an open task). No branch was deleted.
