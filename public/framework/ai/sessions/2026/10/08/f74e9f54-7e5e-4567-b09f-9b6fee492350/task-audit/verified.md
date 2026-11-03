# Verified loose ends: what the receipts say

> **73 rows checked with tools. The verifier agreed with the old label on 34 (47%).** Disagreeing means the old label was wrong, not that the verifier was: each receipt lists what it searched, found and could not find (`verified.jsonl`, written only by `receipts.mjs`).

| Old label | Rows | Verifier agreed |
|---|---|---|
| half-done | 36 | 15 |
| never-started | 12 | 5 |
| done-unverified | 25 | 14 |

Low-confidence receipts: 3. Receipts citing a path or commit that does not exist: 0 (flagged in the receipt, not trusted).

Verdicts: done 34, partial 31, not-started 6, superseded 0, unclear 2.

## My spot check (5 receipts, about 10%), read against the files and git

I picked the five most surprising "done" verdicts. Two held up: row 134 has a landing commit and a landed line, row 93 has its report and review. Three were shaky: row 229 cites a JSONL commit with nothing to do with its ask; row 126's own review says "fix" and Part 2 was absent, which is partial, not done; row 110 admits it has no proof of the visible fix.

**Verdict:** the receipts are much better than the first pass at finding what exists, but a "done" at medium confidence is often really "partial". So `aggregate.mjs` closes a row only on "done" or "superseded" at HIGH confidence; a medium "done" stays on the work list as likely done, check. The shape that fails is cleanup or review-style tasks, where the receipt lists files in the folder but no proof the ask itself happened. Change for the next run: the brief should require one quoted line of evidence per "done".
