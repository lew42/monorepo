One number, and how it was arrived at. Turns a list of issues into a 0–100
score, a letter grade, a `leading` shortlist of what to read first, and
`metrics` — the page-level numbers (`measure`, `pad_em`, `width_used`, …)
`report.js` and `live.js` both render.

## Penalties diminish per rule, and cap per rule, and cap again per tier

`weight × (1 + log₂ n)` — forty cramped cards cost about four times one, not
forty times, because a repeated component is one mistake made once. Each
rule's contribution is then capped at 25 (`CAP`), or a single site-wide habit
zeros the score outright and every page reads the same. The whole `polish`
tier is capped at 15 **together**, not per rule, because five near-universal
polish rules each capped at 25 still summed to 125 and collapsed grades to
`F:106 D:11 C:3 A:1` the first time this was tried without the second cap.

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
