The severity weights, the finding census, and `metrics` — the page-level numbers
(`measure`, `pad_em`, `width_used`, …) that `report.js`, `live.js` and the DevBar
rail all render. Plus `leading()`, the shortlist of what to read first.

## ⚠ IT NO LONGER COMPUTES A SCORE, and the deletion is the design

`analyze()` returned `100 − Σ min(cap, weight × (1 + log₂ n))` and a letter grade
until 2026-08-17. Measured against eighteen hand-rated screenshots that number came
out ***anti*-correlated with how pages look** — Pearson −0.393, and against DOM node
count Spearman −0.519 — because it counted findings and findings scale with content,
so it **rewarded emptiness**: grade A / 96 to the worst-looking page in the corpus,
its single lowest score to the best, and never a reading below 70 across a 36-point
reality. Evidence: [vision-baseline](/framework/ai/2026-08-17/vision-baseline/); the
removal: [tier-calibration](/framework/ai/2026-08-17/tier-calibration/).

**Every rule survived. Only the average did not** — the same rules found the catalog
scroll boundary that was hiding content on 18 pages, and a rule that finds real
defects is not at fault for a broken average built on top of it.

What replaced it: **`worst_first`**, which sorts by the raw census (high desc, then
med, then low) and makes no quality claim, plus `census()` and `severity()` for
display. `taste/` is the only tier here that scores. The diminishing-returns and
capping machinery went with the score — the weights it fed remain, because
`leading()` still orders a report by them.

## Two rules are weighted by NAME, and that is the whole severity fix

`RULE_WEIGHT` gives `unreachable` 75 points and `empty` 30, in place of their
severity's 12. Both answer something three tiers cannot: content nobody can
reach is not a bigger `high` (4099px unreachable scored 82/B as one), and a
dead url is not a layout finding at all (it scored 94/A by firing nothing).
`weigh(issue)` is the single accessor — `score()`, `leading()` and anything
ranking findings must go through it, or the two rules silently sort as ordinary
highs. Their per-rule cap is 90 rather than 25, since the cap exists to stop a
repeated *habit* dominating and neither of these is one.

**A fourth severity tier was the alternative and lost.** `counts.high` is read
by the corpus's `good` verdict, by `report()` and by the DevBar rail; a
`critical` those three do not know about is a number that quietly stops adding
up.

## `leading()` ranks by cost first, magnitude second

What to read first: the heaviest finding by `weigh()`, then the most extreme
measurement within it. It is not the same ordering `score.js`'s own `cost` array
uses (penalty-sorted, per rule) — the two answer different questions ("what
costs the most in total" vs. "what's worst"), which is worth knowing before
assuming they'd ever agree.

## `metrics.text` is the number that tells a 404 from a page

Characters of text under `region()` — the outermost vertical scroller nearly as
wide as the root. It is what the `empty` rule thresholds on, surfaced as a
metric so a crawl can filter on it without re-deriving it.

## Improvements

1. **`GRADES`'s `find(([floor]) => value >= floor)` re-scans the array on
   every call** — five entries, called once per `analyze()`, so genuinely
   free; noted only because it reads like it wants to be a lookup and isn't
   one. *(simple, speculative — not worth changing at this scale.)*
2. **`metrics()` now imports from `ratios.js`**, which every other consumer of
   that file does through a rule. Harmless, and the second place `region()` is
   computed in one `analyze()` call (the `empty` rule is the first) — a shared
   derivation cache on the model would remove both. *(simple, speculative.)*
