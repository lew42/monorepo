# Review, part 2: the mastermind decides, feedback is settled in turns, usefulness is scored

Owner's words: `ai/2026-09-28/content-cards-audit/owner-words.md`, the first third. What exists: `Server/review.mjs` (fresh-eyes review, landed): a size computed from the diff, a fresh reviewer, answers `fixed` / `declined: why`, and a merge gate. What exists to reuse: collab-rounds' Phase machinery (`ext/Collab/`, `Server/collab.mjs`) and its scoreboard (`public/framework/ai/collab/scoreboard.jsonl`, contract in `ai/2026-09-28/collab-rounds/collab-format.md`).

1. **The mastermind decides.** Keep the computed size as the default. The task mastermind may set `none` with `--why "self-evident: <one line>"`, or raise the size. One line in the sub-mastermind skill: decide at the split, and write the why.
2. **Feedback in turns.** Replace the one-shot answer with phases, using the Collab Phase objects: the reviewer's findings → the builder answers each one (fixed, or declined with why) → the reviewer replies to each decline (accept, or hold) → the mastermind rules on anything still held. Each turn is written to the task's `review.jsonl`, so nothing is said out of turn or goes unheard. Stop after one round of holds.
3. **Is a review useful?** For each review, append a `{"score":{...}}` line to the collab scoreboard, in its own format, with: the reviewer model, the size, the cost, the findings, how many were fixed, and whether the outcome changed (any fix merged). A small view on the scoreboard page: reviews, percent that changed the outcome, and dollars per useful review, per model.
4. **Docs:** update `Server/doc/review.md` (the turns picture first).

**Proof:** one real review run through all four turns, with a held decline the mastermind ruled on; the scoreboard view with today's reviews backfilled from their review.md files. **Fence:** `Server/review.mjs`, `Server/doc/review.md`, the review lines in the Collab scoreboard view, one line in sub-mastermind. Main tree for review.mjs and merge.mjs (as fresh-eyes did).

## Added (from organization, via mastermind-servex-3): two false-finding causes in review.mjs

5. **Screenshots must come from the worktree.** review.mjs shoots monorepo.localhost (the main tree), so every NEW page is a 404 and the reviewer files a false "fix". Shoot the worktree's own server (the same lookup merge.mjs uses).
6. **Every answer must count.** `status()` counts only replies that start with `fixed` or `declined`, so a `noted` reply blocks the merge silently. Accept `noted` for note-kind findings, and make every refusal name the unanswered finding by number. Together, 5 and 6 caused a fix, stale, re-review loop: about $1.30 a round, three rounds on one branch.
