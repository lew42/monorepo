# Screenshot analysis by model — cost and quality

Three Claude models analyzed the **same 15 screenshots** (5 layouts pages —
fit, flex, grid, document, docs — at 400/1920/3440px) with the **same prompt**,
one image per resumed CLI turn, usage metered per turn from the CLI JSON.
Raw data: `../vision-sonnet/layout-analysis.json`,
`../vision-haiku-opus/layout-analysis-{haiku,opus}.json`.

## Cost

| | Haiku 4.5 | Sonnet 5 | Opus 5 |
|---|---|---|---|
| analysis total | **$0.33** | **$1.80** | **$2.36** |
| steady-state / image | ~$0.02 | ~$0.12 | ~$0.14 |
| output tokens / image (avg) | 890 | 1,174 | 1,956 |
| wall clock / image | ~13s | ~19s | ~28s |
| issues reported (15 images) | 26 (11 high) | 47 (9 high) | 81 (22 high) |

Correcting for method skew (below), a cold Sonnet run would be ~$0.09–0.10 per
image — the true per-image price ladder is roughly **1 : 5 : 7** (Haiku :
Sonnet : Opus).

**Where the money actually goes.** The image itself is cheap: each PNG entered
context as only ~1.3–4k cache-write tokens (the 400px shots at the low end),
regardless of model. The dominant cost is **context accumulation**: every
resumed turn re-reads all prior images as cache reads, so cache_read grew
linearly every turn (Haiku 34k→120k, Opus 29k→155k, Sonnet 102k→168k) and total
cache-read cost grows with the *square* of image count. For a big audit, batch
a handful of images per session, or use one fresh session per image — with the
1h prompt cache the system prompt is a cache *hit* across sessions, so
per-image cost then stays flat.

Method skew, kept out of the numbers above: Sonnet's session also *captured*
the screenshots first (capture: $0.74, 289k tokens, 69s — playwright script,
15 shots), so its analysis turns carried ~70k extra cache-read baggage each
(~$0.02/image). Haiku and Opus started cold on the already-captured shots.

## What all three models agree on (highest-confidence findings)

1. **400px: the sibling-nav rail is clipped with no scroll affordance** — every
   page, every model. Opus adds that the *active* card is the one sliced off.
2. **400px, document & docs: the stage keeps two previews side by side** —
   both illegible (9%/24% scale), control bar clipped mid-row. The demo these
   pages exist to show conveys nothing at this width.
3. **3440: fit and grid stop growing at ~1900–2100px** — ~39–45% of the
   viewport is blank right-hand background. Grid is the worst in the set.
4. **3440: flex's nine-tile single-row gallery is the genuine widescreen win**;
   document/docs opening a fourth lane (source panel) is the other one.
5. **400px, grid: the demos don't reflow** — six ~48px columns in a 342px box;
   "Three, then straight to one" still shows three.

## Quality by model

**Haiku — cheap smoke detector, unreliable verdict.** Catches the gross
failures (3440 whitespace, 400px stage compression) but systematically rosier
at 1920: it called the prose measure "comfortable (60–80 chars)" and pages
"well-structured" where both other models measured ~95–130 characters and
flagged it high — Haiku is the outlier, almost certainly wrong, since the
over-wide measure is Sonnet and Opus's most-repeated finding. It also hedges
("may be cut off", "likely cut off"), i.e. guesses rather than observes, and
misdescribed fit-1920's table as a "multi-card grid". Fine for "is anything
badly broken?"; do not trust its praise.

**Sonnet — the reliable default.** Every consensus finding, coherent
cross-page patterns (tab-strip clipping, wide measure, right-edge waste),
severity ratings that track the other models. Less precise than Opus: few
measurements, occasional vagueness ("some multi-column use"), and it misses
the second-order observations Opus makes.

**Opus — a designer's review, not just detection.** Pixel coordinates and lane
percentages, causal CSS reasoning (row height driven by the tallest cell; the
demo not "counting down" its columns), cross-page comparisons ("the flex
sibling fits nine tiles across the same viewport"), and — uniquely — it read
the page's own visible copy and judged the layout against it: "prose runs
~110–130 chars, directly contradicting the 52em prose track this very page
documents." Roughly 3× Haiku's finding count with the same consensus core.
Caveat: its pixel numbers are unverifiable precision — treat as approximate.

**Divergences worth knowing.** Sonnet and Opus disagree on fit-3440's code
blocks (side-by-side vs stacked full-width) — unresolved without re-viewing.
Haiku's 1920 "well-organized" verdicts conflict with both others. Nothing else
materially contradicts across models.

## Caveats

- The judge (Fable, orchestrating) did **not** view the images; quality is
  triangulated from cross-model agreement, internal specificity, and the
  pages' actual code (e.g. the "tab strip" is the catalog rail; the site does
  document a 52em measure — Opus's cross-reference is correct).
- All shots are viewport-height only: these pages are `fill`-shaped, the
  document never scrolls (fullPage capture proved it), so below-the-fold rail
  content is absent and "cut off at bottom" remarks are capture artifacts.
- One run per model; no variance estimate.

## Recommendation

Screenshot QA sweeps: **Haiku** to flag catastrophes at $0.02/shot, ignore its
positive verdicts. Layout audits meant to drive fixes: **Opus** — at ~$0.14 a
shot the marginal dollar over Sonnet is noise next to the wall-clock of taking
the screenshots, and the findings arrive fix-ready (where, why, against what
spec). **Sonnet** when you want trustworthy findings at volume. And regardless
of model: keep sessions short — the images are cheap, the accumulating context
is not.
