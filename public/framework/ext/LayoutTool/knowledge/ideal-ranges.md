# Ideal ranges

Every number `taste/ranges.js` uses, what it measures, and where it came from.
Companion to `thresholds.md` — that file is what `rules.js`/`polish.js` fire
on; this is what `taste/` scores. Same rule applies: where a number came from
reading measured data, that is said plainly, and where it is still a guess,
that is said too. This file is cited BY `ranges.js`; if the two disagree,
`ranges.js` is the bug.

## The table

| range | what it measures | ideal | ok | weight |
|---|---|---|---|---|
| `measure` | characters per line, across the page's prose | 52–68 | 34–92 | 10 |
| `frame-gap` | padding ÷ font-size, on boxes that draw an edge | 0.45–1.95 | 0.15–3.2 | 5 |
| `pad-share` | side padding ÷ the box's own width | 0.028–0.06 | 0.008–0.13 | 7 |
| `gap-share` | median sibling gap ÷ container width | 0.008–0.04 | 0–0.09 | 4 |
| `scale` | distinct gap sizes on the page, rounded to 4px | 2–4 | 0–10 | 4 |
| `lanes` | share of blocks whose left edge shares a lane with 2+ others | 0.75–1 | 0.35–1 | 6 |
| `repetition` | share of text leaves inside a group of 3+ identical siblings | 0.1–0.45 | 0.02–0.85 | 4 |
| `slivers` | share of text-holding boxes under 160px wide | 0–0.02 | 0–0.22 | 6 |
| `depth` | median depth of a text leaf, from the analysis root | 3–9 | 1–16 | 3 |
| `width-used` | content span ÷ the width the layout was given | 0.72–0.96 | 0.3–1 | 8 |
| `contrast` | largest text size ÷ median text size | 2.2–4.2 | 1.15–7 | 5 |

`TOTAL` (the sum of all eleven weights) is 62. `weight`, not a fixed 1/11,
is what lets `pad-share` (7) outvote `depth` (3) — a tight, real signal
counts for more than a diffuse one. See "Tight vs. diffuse" below.

## Where each number came from

**`measure` — MEASURED (the core), consensus (the edges).** 45–85 characters
is the typographic consensus and this site already documents `--measure:
52em` as its own answer. The `ideal` band, though, is the site's measured
**interquartile range** — 52–68 at both 1280 and 3440 (n=26) — tighter than
the consensus because this asks whether text is *comfortable*, not merely
readable. TIGHT: the one quantity whose core cluster is identical at both
widths measured.

**`frame-gap` — MEASURED, and the measurement says "don't tighten this."**
DIFFUSE / BIMODAL. The site clusters at ~0.4–0.8× (chrome: nav rows,
toolbars) and again at ~1.6–1.9× (cards using the `clamp(0.75em, 3.5%,
3.5em)` pattern), with the median sitting in the empty middle between them.
The wide band and weight 5 (mid-table) are the honest response to two real
populations answering to one number; a role split would let this tighten.

**`pad-share` — MEASURED, TIGHT.** The tightest quantity measured: median
0.037/0.038 at 1280/3440, IQR 0.033–0.047, unchanged across widths. `pad-em`
(the same padding read against font-size instead of box width) is what
`frame-gap` reads, and it is bimodal — `pad-share` is what stays tight once
the box's own width is divided out, and it earns weight 7 for it.

**`gap-share` — MEASURED, DIFFUSE.** Zero-inflated: most 3+-child containers
on this site are grids or wrapping rows, and the original reading
(`ratios.gaps()`) answers a stack only, so the median container had nothing
to report at all. `read.js`'s `spread()` bands by row first so a grid
contributes both its axes, which recovers a real reading — but the
distribution is still wide, hence weight 4.

**`scale` — DERIVED, not separately measured.** No per-page calibration run;
the band follows directly from "a spacing scale is a small deliberately
chosen set of sizes." The soft floor (0 keeps half credit) is intentional — a
two-track layout with one gap is simple, not wrong.

**`lanes` — MEASURED, TIGHT, but flagged.** Median 0.93–0.94, IQR 0.89–0.97 —
tight in the data — **but partly an artefact**: measured on a whole `.app`,
nav and page chrome anchor most candidate boxes to a shared x-coordinate
regardless of what the content does, and the `library/bad/` traps score
*higher* on this than the good pages (0.967–0.979 vs. 0.928–0.941). The ideal
floor was pulled down from the measured 0.85 to 0.75, and the weight from 8
to 6, specifically because part of the tightness is chrome, not content.

**`repetition` — MEASURED, DIFFUSE, and RETUNED.** Written at 0.3–0.75 from
intuition about "enough hierarchy." Measured: median 0.225–0.226, p10–p90
0.094–0.417 — the real centre is roughly a third of the original guess, and
page type (list/nav-heavy vs. single-column prose) drives most of the spread.
Weight 4, because the spread is real, not noise to be argued away.

**`slivers` — DERIVED from `frame-gap`'s own argument.** Not separately
calibrated across the corpus; it exists because a depth-6 roll is not bad
*because* it is deep, it is bad because the fourth column is 80px wide.
Measuring the width directly needs no depth cap at all — see `depth` below.
Weight 6 reflects that this is what deep nesting actually costs, read
directly rather than inferred from a level count.

**`depth` — MEASURED, DIFFUSE / BIMODAL, weighted last on purpose.**
Root-relative: it only compares two pages measured from the same kind of
root, true for a generator's own shots and false for a site-wide audit.
Measured from `.app`, this site's pages read a p10–p25 pinned at 8 and a
p75–p90 of 13–15 — two populations (simple/demo pages vs. markdown-doc pages)
with nothing between them, not one distribution with noise. Bimodal *and*
root-relative is two independent reasons to weight it lowest, 3.

**`width-used` — DERIVED**, the prime objective as a number, and deliberately
**ungated** — `dead-space` (in `rules.js`) only fires at 1500px and up, since
below that a narrow column may be the *window's* doing; this band applies at
every width, because whether a layout spent what it was given is a fair
question at 390px too. Weight 8, the second highest — this is closest to the
site's stated prime objective ("widescreen space gets used").

**`contrast` — DERIVED**, the one non-geometric quantity in the book. Not
separately calibrated; the band names what a type hierarchy needs at both
ends — under ~1.2× is no heading at all, over ~7× is a poster and a footnote
with nothing between.

## Tight vs. diffuse

Three quantities are tight enough that a range means something as measured:
**`pad-share`**, the **IQR core of `measure`**, and **`lanes`** (with the
chrome caveat above). The rest are either genuinely diffuse across this
corpus (`frame-gap`, `gap-share`, `repetition`, `depth` — real quantities,
just not ones with a single right answer yet) or were never separately
calibrated at all (`scale`, `slivers`, `width-used`, `contrast` — derived
from argument, not measurement). Full run:
`ai/2026-08-16/layout-generator-rules/calibration.md`.
