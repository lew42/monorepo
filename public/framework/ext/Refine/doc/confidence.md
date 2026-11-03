# Confidence: one scale, 0 to 1, where 0.5 means "not sure"

Every number the Refine system calls `clarity` or `confidence` is a **probability that the statement is right**, from 0 to 1. Nothing else.

| Number | Read it as |
|---|---|
| **0.5** | The default. "We are not really sure." Nobody has looked yet, or the evidence is mixed. |
| 0.3 to 0.7 | Somewhere between doubtful and leaning yes. No evidence needed. |
| **below 0.3** | Probably wrong: the sentence is cut off, vague, or contradicts itself. |
| **above 0.7** | Only with the evidence written beside it ("names the file and the verb"). No evidence, no number over 0.7: the scorer clamps it to 0.7. |
| 1.0 / 0 | Certain / no idea at all. Almost never used. |

The UI prints the meaning next to the number: `confidence 0.5: not sure`, `0.85: evidence: …`. Numbers stored before 2026-10-13 are not rewritten; they show as `0.9 (old scale)`, because the old scorer started at 1 and went down, so most sentences read 0.9 and 1.0 without anyone having checked.

Two confidences are kept per ask (`Server/refine-days.mjs` writes both to `confidence.json`): **ask_clear** (do we know what was requested?) and **outcome_clear** (do we know what a finished job looks like?). They are separate on purpose: "make the page better" is a clear ask with an unclear outcome.

## Decision, with the alternative

**Chosen: a probability, default 0.5.** The owner read 0.9 as "pretty high" while the old system meant "a little below the default of 1.0". A probability has one reading everywhere.

**Alternative, rejected: default 1.0 used as a multiplier** (above 1 more sure, below 1 less sure). It composes well (flags multiply), and it is how the old rule scorer worked. But a multiplier reads as a weight, and a weight of 0.9 is the very number that was misread. It also has no ceiling, so "how sure" cannot be compared across sentences. If a product is ever needed (say, combining two confidences), multiply the two probabilities; do not change the scale.

Ask source: `public/framework/ai/sessions/2026/10/13/session-730e8a7b/mastermind-repo-slim/requirements-5.md`, asks 8 and 9. Code: [Scorer.js](../Scorer.js) (rules), `Servex/ext/refine/ClarityScorer.js` (the model's score).
