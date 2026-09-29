# Minion: merge.mjs must never run git merge over uncommitted edits

Load the `minion` skill first. Card directory with the owner's raw words: `public/framework/ai/2026/09/25/quick-fix-worktrees-smoke-test-then-merg/`. Parent brief: `public/framework/ai/2026-09-25/quickfix-worktrees/requirements.md`. Read the last lines of `public/framework/ai/2026-09-25/quickfix-worktrees/task.jsonl` (the INCIDENT and decision d3), and `smoke/proof/merge-reset-incident.txt`.

**Work only in the worktree** `C:/Code/lew42/worktrees/quickfix-worktrees` (branch `worktree/quickfix-worktrees`). Commit there. **Never run merge.mjs against the real main tree** (`C:/Code/lew42/monorepo`): prove everything on a scratch repo.

**The owner, 2026-09-24:** "we don't want to clobber things." At 19:04 today `Server/merge.mjs` ran `git merge` into the main tree while 85 files had uncommitted edits, 4 of which the branch also changed. Git saved them in an internal stash, reset the tree, failed, and did not restore them. They were recovered by hand.

## Deliverables

1. `Server/merge.mjs`, before any git command that writes:
   - Compute the files the branch changes (`git diff --name-only michael/dev...<branch>`) and the main tree's dirty files (`git status --porcelain`, including untracked).
   - **No overlap:** merge as now (`git merge --no-ff --no-edit`). Before merging, also run `git merge-tree --write-tree michael/dev <branch>` and refuse (exit 4, files listed) if it reports a conflict, so `git merge` is only ever called when it cannot fail.
   - **Overlap:** do not call git merge. Instead make the diff `git diff michael/dev...<branch>` (binary-safe: `--binary`), run `git apply --check` on it in the main tree, and if that passes, run `git apply` (working tree only: no `--index`, no `--3way`). If the check fails, refuse (exit 4) and print the files; nothing is touched. On success, append `{branch, head, at, files}` to `.merge-landed.json` at the main root (a JSON array) and print: "applied over uncommitted edits, not committed: the owner commits".
   - Keep the lock, the smoke test, the hold on/off, `windowsHide`. Never stash, reset, checkout or force.
   - Add `--main <dir>` (default: the main repo from `git rev-parse --git-common-dir`) and `--skip-smoke` (for proofs only; it prints a loud warning), so it can be proven on a scratch repo.
2. `Servex/Pool.js` `return_worktree`: a branch whose current head is recorded in `.merge-landed.json` counts as merged, like an ancestor of michael/dev. Then bring the slot current without discarding: the slot's commits are already in the main working tree, so remove that slot (worktree-down) instead of fast-forwarding, and let the pool prepare a fresh one. Keep the change small.
3. Proof, in `landing/proof.txt` of the task dir (write it to the MAIN tree path `C:/Code/lew42/monorepo/public/framework/ai/2026-09-25/quickfix-worktrees/landing/`), made by a `landing/proof.mjs` that builds everything in your scratchpad: a fresh `git init` repo on a branch `michael/dev` with three files, a worktree branch that changes files A and B, then:
   (a) clean main: merges with a commit;
   (b) main has an uncommitted edit to A in a different hunk: applied, A keeps both edits, nothing staged, `.merge-landed.json` written, and `git stash list` is unchanged;
   (c) main has an uncommitted edit to the same lines of A: refused with exit 4, and the main tree's diff is byte-identical before and after;
   (d) a real conflict with no dirt (both committed): refused by merge-tree, and nothing is touched.
   Before each case, print the dirty-file hashes; after each, print them again.
4. Update `Servex/doc/pool.md` and the top comment of merge.mjs in a line each. Commit (message ends with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), log to `landing/task.jsonl`, and end your turn with the four case results and the commit hash.

Fence: `Server/merge.mjs`, `Servex/Pool.js`, `Servex/doc/pool.md`, and `landing/` in the task dir. Every process hidden.
