# ai/merge — the "ready to merge" list and its Merge button

Page: [/framework/ai/merge/](/framework/ai/merge/). One card per branch an agent has marked ready; the owner's one decision per project is pressing **Merge**.

## Where the list comes from

An agent that has finished and passed review logs `ready: <branch> [at] <sha> <what was done>` in its task record (`session.jsonl` or `task.jsonl`). `Server/ReadyToMerge.mjs` (`node Server/ReadyToMerge.mjs [--json]`) scans the last 14 days of records under `ai/sessions/`, keeps the latest line per branch, and drops a branch that is already in `michael/dev` or no longer exists. It adds the review phrase (`review.mjs --status`), the worktree (`git worktree list`) and `stale` (the branch moved past the named sha). Nothing is stored; every row is computed on request.

## On disk

```
public/framework/ai/merge/
  page.js              the page
  ReadyToMerge.js      class ReadyToMerge extends View: fetches the rows, draws a card each, POSTs the Merge
  ReadyToMerge.css
Server/ReadyToMerge.mjs       readyRows(), mergeBranch(), the CLI
Server/ReadyToMerge.test.mjs  node Server/ReadyToMerge.test.mjs
```

## Who writes, who reads

- **Servex** (`Servex/Servex.js`, loopback only): `GET /api/ready-to-merge` returns the rows; `POST /api/merge {branch}` calls `mergeBranch`, which re-reads the rows, refuses a branch not on the list, stale, or with no worktree, runs only `node Server/merge.mjs <worktree>` (one at a time), and answers `{ok, out, why}`.
- On success it appends `merged: <branch> <sha> by the owner (Merge button)` to that task's record through `.claude/hooks/append.mjs`.
- **The page** reads both routes through `servex_url()` and shows merge.mjs's answer in the card; a refusal is shown, never retried.

## Not built yet

A count badge on the dashboard, a diffstat per card, returning pool worktrees after a merge, and vscode-mastermind reading this list instead of grepping logs.
