# Merge approvals: the plan (priority.md row 3b)

**The ask (the owner, 2026-10-22):** never "needs your go-ahead"; agents bring work to ready-to-merge, and "a Merge button on the owner's screen shows what was done and merges it." The owner's one decision per project is the merge.

## What exists

- `Server/merge.mjs <worktree>` — the one gate that lands a branch (review gate, smoke test, three-way write, lock). Nothing else may merge.
- `Server/review.mjs --status <taskdir>` — the review phrase ("reviewed: 5 fixed").
- Agents already log `ready: <branch> [at] <sha> …` in their task record (`session.jsonl`); vscode-mastermind merges by hand from those lines.
- 305 unmerged branches exist (pool salvage etc.), so "unmerged" alone is not "ready": the `ready:` line is the signal.

## Smallest slice (build now)

1. **`Server/ReadyToMerge.mjs`** (compute, never recall): scans `public/framework/ai/sessions/**/session.jsonl` and `task.jsonl` touched in the last 14 days for `log.msg` matching `^ready: (\S+) (?:at )?([0-9a-f]{7,40})`; keeps the latest line per branch; drops a branch whose sha is already an ancestor of `michael/dev`, or whose branch no longer exists; finds its worktree from `git worktree list --porcelain`. Row: `{branch, sha, at, task_dir, task_url, title (record line 1), what (the rest of the ready line), review (review.mjs --status), worktree, stale (branch head moved past sha)}`. CLI prints a table; `--json` prints rows. Test: `Server/ReadyToMerge.test.mjs` on a temp record (parse forms seen today: "at sha;", "sha (worktree …)", "at sha.").
2. **Servex routes** (loopback only, same guard as `/api/item`): `GET /api/ready-to-merge` → rows; `POST /api/merge {branch}` → re-reads the rows, refuses a branch not on the list or whose head moved, runs `node Server/merge.mjs <worktree>` (one at a time; merge.mjs has its own lock), answers `{ok, out}` with the tail of its output, and appends `{"log":{"msg":"merged: <branch> <sha> by the owner (Merge button)"}}` to the task record through append.mjs. Needs a Servex restart: log "needs restart", never restart it yourself.
3. **The page `/framework/ai/merge/`** (`public/framework/ai/merge/page.js`): one card per row, newest first: title (link to the task), what was done, the review phrase, branch and sha, and a **Merge** button that POSTs and shows merge.mjs's answer in the card. Empty list says "Nothing waiting to merge." Linked from the AI dashboard head and `ai/readme.md`.

## Later (logged, not built)

- A count badge on the dashboard ("3 ready to merge").
- A "what changed" diffstat per row, and the page shots from the review.
- Close the worktree after merge (`return_worktree` for pool trees).
- vscode-mastermind reads the same list instead of grepping logs.

## Decision

Source of truth = the `ready:` log lines, not branches; alternative was scanning all unmerged branches with a passing review, rejected because 305 branches are mostly salvage and the review record is keyed by task, not branch.
