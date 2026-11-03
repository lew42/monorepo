Budget: $6

# core/Test: tests run on save (WorktreeWatch) and at merge (merge.mjs), and report only a pass-to-fail change

Load the `minion` skill first. This task's log is `session.jsonl` in this folder.

**Why:** today a failing test reaches nobody, because nothing runs the tests by itself: every line in `core/Test/results.jsonl` says `"trigger":"manual"`. The design is in [plan.md](../plan.md), section 3, "Proposal: the watcher that already exists also runs the tests".
- **Approved** by mastermind-deputy.
- **Agreed** by mastermind-system-architect-3, who owns `Servex/WorktreeWatch.js` and `Server/merge.mjs`, with the three changes marked ★ below.

## Build

1. **`public/framework/core/Test/TestRunner.mjs`, a `--near <file>` mode.** It answers the `*.test.mjs` files in that file's own folder, plus the tests that import it **directly**.
   - `covers()` already resolves imports transitively. Reuse that resolver for one level; do not build a second one.
   - Node tests only.
   - ★ Give each test process a 60 s timeout. A timeout is logged, and counts as "no result".
2. **`Servex/WorktreeWatch.js`** (183 lines; its `changed(paths)` is at about line 96). After the existing 2 s debounce, it also runs the near tests of the changed files.
   - ★ It triggers only on `.js` and `.mjs` changes. A worktree's dev server rewrites `files.jsonl` constantly, and that must never start a run.
   - There is one shared queue in Servex: at most 3 test processes at once, across all worktrees. A new change replaces that worktree's queued run.
   - **It reports only a change.** When a test goes from pass to fail, the holder gets one message through the existing `this.send(this.owner, …)` path at about line 158, and its task log gets one `log` line with the test's name and first failing line. Fail to pass gets one more line. Steady state says nothing.
   - Every run still appends to `core/Test/results.jsonl`, with `trigger: "save"`.
3. **`Server/merge.mjs`** (621 lines; find where it calls `smoke.mjs`). Beside the smoke test, it runs every test that covers the diff (`TestRunner --covers`) twice: on the branch, and on its merge base.
   - It refuses a merge only for a test that passes on the base and fails on the branch. The roughly 15 tests already failing on michael/dev must block nothing.
   - ★ Cache the base results by commit sha, one line per sha in `core/Test/results.jsonl`, so a second merge from the same base does not run the base again.
   - ★ A timeout on the branch is "no result", never pass-to-fail.
   - Add a `--skip-tests` flag next to `--skip-smoke`, for scratch-repo proofs only.

## Prove

- A scratch proof that a test which passes on the base and fails on the branch is refused, and one already failing on the base is not. `merge.mjs` already has scratch-repo proofs; follow their pattern.
- WorktreeWatch: a `.mjs` save runs its near tests, and a `files.jsonl` write runs nothing. Use a unit-level test with a fake `send`; do not start a real Servex.
- `node --check` every touched file.
- Log the cost on this task as a `log` line when you finish.

## How

- Work in a worktree of your own: `node Server/worktree-up.mjs near-tests` (branch `worktree/near-tests`), never the main tree. Commit after each of the three parts.
- Never kill or restart the dev server or Servex (Servex only picks this up at its next restart, which is not yours to do), never drive the owner's tabs, never `git stash`.
- When done, log `ready: worktree/near-tests at <sha> <one line>` on this task and send `mastermind-page` one line.

**Deliverable:** the branch, with the three parts and their proofs. If time runs out, cut the WorktreeWatch part first and log why: the merge gate is the part that stops a break from landing.
