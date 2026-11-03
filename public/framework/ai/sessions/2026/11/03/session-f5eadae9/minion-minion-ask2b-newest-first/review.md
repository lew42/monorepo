verdict: pass
1. [note] The round-3 fix checks out. `skip_stale()` now stops at `chunks[this.at].reply` (worktree/qf-2 Recite.js:301–302), so a reply that is already playing, or paused at `this.at`, is never cut. The `pending_ids` remap now resolves any entry inside the dropped run (`p.last < i || p.last > end`, :306), and the new test covers both the playing case and the paused-by-barge-in case (Recite.order.test.mjs:172–207).
2. [note] `skip_stale()` calls `Recite.mark_played()` for a dropped reply but never calls `recite.on_read` with `heard: "skipped"`, which `cancel_unheard()` does (readme.md, "Cutting-in settings"). So a page can't tell that a stale reply was dropped rather than heard. That's fine under "only if tiny", but it should be wired up if `on_read` ever gets a consumer.
3. [note] I could not rerun `Recite.order.test.mjs` or `Recite.test.mjs` in node: both print "skip in node" and need `/framework/core/Test/view/`, and the main site doesn't serve the worktree. The counts (10 tests/35 checks, 38/204, ReciteBubble 43) come from the minion's finish line in session.jsonl.
4. [note] The work is still unmerged in `worktree/qf-2` (commits 335c6fe22 → 13602e6f4; `git merge-base --is-ancestor` says it is not in michael/dev). requirements.md records this, so a fresh agent can continue. The ledger churn in diff.patch (board.jsonl, files.jsonl ×4, the ask2a session logs) comes from the main tree, not from this branch. The branch's commits touch only `audio/Recite/`.

## Requirements
- 1 "Sentences of ONE reply keep their order; only the order BETWEEN replies flips; a reply already playing is never cut" — yes — `insert_at()` puts a fresh reply after the anchor's run, a continuation extends its own run, and the round-4 guard keeps `skip_stale()` off the playing reply.
- 2 "`skip_stale` only if tiny: an older waiting reply older than 2 minutes is dropped" — yes — `skip_stale()` is ~10 lines and runs from `ended()`. The readme says it doesn't check held or idle-gap replies.
- 3 "Held updates (`pending_updates`, `update_hold_ms`) keep their behaviour" — yes — `queue_update()` passes `append: true`. The readme's "No flood" paragraph and the doc comments match the code.
- Proof "A, B, C while the first is playing → [playing], C, B, A; stale skipped" — yes — Recite.order.test.mjs (the minion reports 10 tests, 0 failed; I did not rerun them, see note 3).
- Report "one line to `mastermind-voice-system`; readme one line for the rule" — yes — the line is in that session's inbox (round-2 review). readme.md has the "Newest-first" paragraph and a recorded decision with its alternative.
- Class with live instances — n/a — no new class. `Recite.order.test.mjs` is indexed in `audio/Recite/files.jsonl`.

## Words
- The readme paragraphs are plain and complete. The "Decision" paragraph names the alternative that was rejected and gives the reason — yes.
