# What the layout work taught us (as of 2026-08-17)

## Measured facts

- `findings.json`'s aggregate score was **anti-correlated with how pages look** — Pearson **−0.39**, so the number was deleted rather than retuned; every rule survived ([vision-baseline](/framework/ai/2026-08-17/vision-baseline/)).
- `taste.json` is the tier that tracks looks — MAE **7.22**, Spearman **+0.266** against 18 frozen 1280×800 shots, versus math's MAE 12.78 / −0.039 ([vision-baseline](/framework/ai/2026-08-17/vision-baseline/)).
- Sonnet vision scoring reproduces **itself** at **ICC 0.71** for **$0.035 and 5,620 tokens per image**, and agrees with the Opus baseline (+0.625) better than Opus agrees with itself (ICC 0.51) ([rubric-v2](/framework/ai/2026-08-17/rubric-v2/)).
- Asking any model for a 0–100 score is unstable: the same model re-scoring the same pixels drifted **−2.4 to −6.4 per axis** and reordered the corpus — a rank has no scale to drift ([human-ranking](/framework/ai/2026-08-17/human-ranking/)).
- **The missing piece is a human reference.** Nothing above can be ranked until Mike orders the 18 shots: [/framework/ai/2026-08-17/human-ranking/rank/](/framework/ai/2026-08-17/human-ranking/rank/) — 59 clicks, ~5 minutes, autosaved after every pick.
- `width-used` — the prime objective as a number — was a **dead band on 17 of 18 pages** (6–10%), forfeiting 13% of taste's weight; fixed, it reads median **0.92 at 1280 vs 0.58 at 3440**, so it can finally tell the two widths apart ([tier-calibration](/framework/ai/2026-08-17/tier-calibration/)).
- The tool **manufactured its own top finding**: an open dev rail displaced `.app` by 272px and produced the leading `gutter · high` on **12 of 24** page×width pairs ([tier-calibration](/framework/ai/2026-08-17/tier-calibration/)).
- Four of eleven taste bands — width-used 28.1%, repetition 21.0%, measure 17.9%, contrast 17.1% — carry **84%** of the layout generator's 33-point quality gap ([loss-budget](/framework/ai/2026-08-17/loss-budget/)).
- Raising the probe's depth cap is safe: **16 of 16** new highs are real, **0** false positives, all on one broken example workspace ([depth-sample](/framework/ai/2026-08-17/depth-sample/)). Settle time is not a confound — **17 of 17** highs survive at 3000ms ([settle-study](/framework/ai/2026-08-17/settle-study/)).

## What keeps breaking

- **Content nobody can scroll to** — a `catalog()` region with no height ceiling of its own. Fix: scope the ceiling to the routed `:has(> .page-catalog-pages > .page:is(.active-page, .active-ancestor))` test the module already uses.
- **A rail that eats the whole column below 64em** — `max-height: none` on a `shrink: 0` rail. Fix: reuse the desktop bound verbatim (`flex: 0 0 min(34em, 45%); max-height: 100dvh`) — both resolve against whichever axis is currently main.
- **One flex item starving its sibling** — default `min-width: auto` lets a card-filled box refuse to shrink while a bare paragraph collapses to 42px. Fix: `.flex.auto` on the row, one class, no new CSS.
- **Prose too wide to read** — `--measure: 52em` is **84–108 characters** here (hand-counted), past the site's own 92-char ceiling. Fix: narrow the token; widening a column is never the fix for dead space.
- **A tool defect read as a page defect** — a batch of new `high` findings is usually the instrument's. Fix: measure the instrument first ([knowledge/false-positives.md](/framework/ext/DesignTool/knowledge/)) — a rule that fires on the common case is worse than no rule.
- **Measuring a repo while agents are editing it** — a page mid-edit swung 92/A → 87/B at *every* settle delay and cost a whole study. Fix: measure a clean tree, or record the diff state beside the number.

## What to do next

1. **Mike ranks the 18 shots** — [/framework/ai/2026-08-17/human-ranking/rank/](/framework/ai/2026-08-17/human-ranking/rank/), five minutes; every tier above is unvalidated until a human reference exists.
2. **Re-derive the two bands `tier-calibration` proved false** — `measure` (26 chars is 188px card captions, not nav labels) and `contrast` (8.38 is a 125.7px demo clock), then re-run loss-budget's width-used share against the fixed band.
3. **Settle the two open RULE#1 calls** — raise `probe.js`'s depth cap 20 → 28 (16 real highs, 0 false), and narrow `--measure` 52em → ~40em.
