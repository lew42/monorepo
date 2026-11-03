# Unlanded worktrees: what the closed worktrees left that never reached michael/dev

Budget: $5 (Sonnet, medium). Parent: `mastermind-deputy`, who decides and merges. Load the `minion` skill first.

## Why

Priority 1 in [priority.md](/framework/ai/priority.md) lists "the 19 closed worktrees whose commits never landed". When a worktree is closed, Servex commits whatever was left in it ("worktree closed: N leftover file(s) saved to <branch> before the folder…") onto its branch, and logs the removal in `public/framework/ai/sessions/worktree-removals.jsonl`. On 2026-10-24, 17 of those branches still hold one commit that michael/dev does not have, and 3 more (`worktree/orphans`, `worktree/readmeaudit`, `worktree/refined-asks`) were deleted with unmerged commits. Most of each commit is noise the worktree's own dev server wrote (`files.jsonl`, `page.jsonl`, logs). The question is which of the rest is real work that was lost.

## What to find, per branch

1. **Compute the list, don't copy it** (CLAUDE.md law 7): a node script in this folder (`unlanded.mjs`) reads `worktree-removals.jsonl`, keeps every branch with commits not on michael/dev (`git rev-list --count michael/dev..<branch>`), and for a deleted branch looks for its commit by the `sha` in the record, else by `git log --all --grep` on the "saved to <branch>" subject.
2. For each branch, the files its commits change, without noise: drop `files.jsonl`, `page.jsonl`, `*.log`, `log.jsonl`, `board.jsonl`, `usage.jsonl`, generated `index.json`, `.claude/skills/clarity/flags.jsonl`.
3. For each remaining file, a verdict a script can compute:
   - **same**: the branch's version equals michael/dev's now (`git rev-parse <branch>:<path>` against `michael/dev:<path>`).
   - **older**: michael/dev has the file and its later history touched it, so the branch holds an older copy. Check with `git log michael/dev --since=<the removal date> -- <path>`.
   - **unique**: anything else, e.g. lines that exist nowhere on michael/dev, or a file michael/dev never had. Say what it is in one line, from reading the diff.
4. One verdict per branch: **noise only**, **nothing new** (every real file is same or older), or **has unique work**, with the files and a one-line "what it is, and should it land".

`worktree/nav-model` changes 312 real files. Check first whether they are a whole copy of an old tree, which the commit dates will show, before reading any of them.

## Deliverables

- `verdicts.jsonl` in this folder, one line per branch: `{branch, sha, removed_at, real_files, same, older, unique, verdict, what, recommend}`.
- `report.md` in this folder, one screen. It leads with a table (branch · verdict · unique files · recommend), then three lines at most on anything surprising.
- Two numbers that must agree: the branch count from the script, and the row count of the table.
- Findings go in this folder's `session.jsonl` as `log` lines, not in a findings file.

## Fence

- Read-only git only: `git log`, `git show`, `git diff`, `git rev-parse`, `git rev-list`, `git cat-file`. Never checkout, merge, cherry-pick, branch -d, reset or stash, in any tree.
- Write only in this folder: `public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/deputy/unlanded-worktrees/`. Commit those files (by exact path) on michael/dev when done; nothing else.
- Never kill or restart the dev server, never drive the owner's tabs. No worktree is needed.

Reply `done:` with the two numbers and the branches that have unique work.
