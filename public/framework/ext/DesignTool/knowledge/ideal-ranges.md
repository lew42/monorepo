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
| `measure` | characters per line, weighted by lines, across the page's prose — code, table cells and framed text excluded | 52–68 | 34–92 | 10 |
| `frame-gap` | the tightest frame gap on the page — gap to the nearest text ÷ font-size, at the 10th percentile | 0.45–2.2 | 0.1–4.2 | 5 |
| `pad-share` | side padding ÷ what a box that size should have — `min(3.5% of width, 3.5em)` | 0.75–1.7 | 0.2–4 | 7 |
| `gap-share` | median sibling gap ÷ container width | 0.008–0.04 | 0–0.09 | 4 |
| `scale` | share of the page's gaps that come from the four sizes it uses most, rounded to 4px | 0.8–1 | 0.5–1 | 4 |
| `lanes` | share of blocks whose left edge shares a lane with 2+ others | 0.75–1 | 0.35–1 | 6 |
| `repetition` | share of text leaves inside a group of 3+ identically-classed siblings | 0.1–0.45 | 0.02–0.85 | 4 |
| `slivers` | share of text-holding boxes under 160px wide | 0–0.02 | 0–0.22 | 6 |
| `depth` | median depth of a text leaf, from the analysis root | 3–9 | 1–16 | 3 |
| `width-used` | content span ÷ the width the layout was given, as the median of per-row spans | 0.7–1 | 0.28–1 | 8 |
| `contrast` | largest HEADING size ÷ median text size | 2.2–4.2 | 1.15–7 | 5 |

`TOTAL` (the sum of all eleven weights) is 62. `weight`, not a fixed 1/11,
is what lets `pad-share` (7) outvote `depth` (3) — a tight, real signal
counts for more than a diffuse one. See "Tight vs. diffuse" below.

## Where each number came from

**`measure` — CONSENSUS, and no longer the site's own IQR.** 45–85 characters
is the typographic consensus and this site already documents `--measure:
52em` as its own answer; the band is tighter than the rule's because this asks
whether text is *comfortable*, not merely readable.

⚠ **The band used to be justified as the site's measured interquartile range
(52–68 at both widths, n=26), and that justification is withdrawn** (2026-08-17,
`ai/2026-08-17/band-rederive/`). That IQR was measured over a population that
admitted card captions and table cells, and it landed inside the ideal band only
because **two errors cancelled**: prose running 75–103 characters, averaged
against captions running 19–26. Read over prose alone, the site's interquartile
range is **59–78 at 1280 and 61–77 at 3440** — above the band, and in agreement
with `characters-per-line.md`'s independent hand count of 83–108 characters for a
52em column. So the numbers stayed exactly where they were and their *reason*
changed: the band now rests on the consensus and on the site's stated intent,
never on where the site happens to sit, and the gap it now charges for is the
open `--measure` decision rather than a fault in the band.

**THE POPULATION IS THE BAND'S REAL DEFINITION, and it now carries all three of
`rules.js`'s exemptions.** This band is that rule read as a quantity and it
shipped with the rule's arithmetic and one of its three guards — the same
mistake `frame-gap` made one file over, and the readme's "copy the GUARDS, not
just the maths" is about exactly this. Prose is text over 80 characters that is:

- **not code** — a code line is authored, not wrapped (this guard it had);
- **not in a table cell** — a narrow cell is a column. `rules.js` has exempted
  cells from this measurement for months, and `read.js`'s own `frame-gap` calls
  `in_cell()` twelve lines away. Measured: one 125px `td` running **13.7
  characters over 8 lines** was the entire reading of
  `styles/elements/misc/`, and 17 `td` blocks supplied 53 of 213 prose lines on
  `framework/ui/`;
- **not inside a frame** — its own box draws an edge, or its parent's does. That
  is a card blurb, a chip, a stat tile: the component's text, not the page's, and
  the rule's own comment has called them "18–24 legitimately" since it was
  written. Measured: fourteen `p.page-preview-desc` captions supplied **70 of
  `/framework/`'s 137 prose lines**, so the line-weighted median landed among
  them and the front door read 26.1 characters.

⚠ **Two other mechanisms were measured and rejected**, and both failures are worth
keeping. A width-relative cluster ("the widest half of the prose") is
width-invariant and reads the page's main column correctly — but on a page whose
only text IS captions it reads the captions: `/notes/` fell to 24.1. A line-clamp
guard fixes that page and throws away `framework/ai/`'s **258-character** log
lines at 3440, which are the genuine defect on that page — a clamp says the block
is a fixed-size summary, not that its lines are the right length.

⚠ **And the sample is counted in LINES, not blocks.** A line is the unit being
measured, so three one-line captions passed a `blocks ≥ 3` gate and one eight-line
paragraph did not. Site-wide the band declined on **55 of 169 rows** and now
declines on **23**, and what is left is honest: fourteen `core/Page/overview/*`
pages that are 100% `probe.IGNORE`d demo stages, and three example pages holding
three text nodes between them.

**`frame-gap` — MEASURED, and the measurement says "don't tighten this."**
DIFFUSE / BIMODAL. The site clusters at ~0.4–0.8× (chrome: nav rows,
toolbars) and again at ~1.6–1.9× (cards using the `clamp(0.75em, 3.5%,
3.5em)` pattern), with the median sitting in the empty middle between them.
The wide band and weight 5 (mid-table) are the honest response to two real
populations answering to one number; a role split would let this tighten. The
`ok` ceiling is 4.2, not lower, because that is where the site's own
`min(3.5%, 3.5em)` pattern lands a full-width band at 3440 by construction —
a tighter ceiling made the house pattern unrepresentable. It also reads the
gap to the nearest text (`text_bounds()`), never a box's own declared
padding, and the tight end (10th percentile) rather than the average — see
`readme.md`, "The second wave" and "Two calls that were open, now closed."

**`pad-share` — MEASURED (as a raw share), now READ AGAINST AN EXPECTATION.**
The calibration that earned its weight 7 was a raw share of the box's own
width — median 0.037/0.038 at 1280/3440, IQR 0.033–0.047, unchanged across
widths, the tightest quantity measured. But a raw share put it in direct
conflict with `frame-gap` on a wide band — 3.7% of a 3440 band is 127px,
which is 7em, which `frame-gap` calls badly over-padded — and both numbers
were right about different boxes. It now measures against `polish.js`'s own
`min(3.5% of width, 3.5em)` expectation instead of the raw share, so a 300px
card with 11px and a 3440 band with 56px both read 1.0. See `readme.md`, "The
second wave."

**`gap-share` — MEASURED, DIFFUSE.** Zero-inflated: most 3+-child containers
on this site are grids or wrapping rows, and the original reading
(`ratios.gaps()`) answers a stack only, so the median container had nothing
to report at all. `read.js`'s `spread()` bands by row first so a grid
contributes both its axes, which recovers a real reading — but the
distribution is still wide, hence weight 4.

**`scale` — RE-DERIVED 2026-08-17, because the count it used to be was a
measurement of the SAMPLE.** The band follows from "a spacing scale is a small
deliberately chosen set of sizes", and it used to ask *how many 4px gap sizes
cover four fifths of the page's gaps.* A statistic of that shape rises with how
many gaps there are to look at, and the proof is internal — subsample one page's
**own** gap population and the reading climbs:

| n gaps sampled | 25 | 50 | 100 | 200 | 400 | all |
|---|---|---|---|---|---|---|
| `ext/Panel/` (888 gaps), old count | 7.6 | 11.0 | 10.0 | 13.8 | 15.2 | **17.0** |
| `ext/Panel/`, new share | 0.74 | 0.66 | 0.61 | 0.61 | 0.60 | **0.58** |

Every page tried roughly doubled; `styles/layouts/model/` went 8.2 → 13.0 over
the same sweep. Across 168 pages the old reading ranked **0.551 (Spearman)** with
the page's gap count and 0.32 with its node count — so `framework/ui/`, nineteen
component demos on one page, scored **zero for being large**, which is the
question that opened this. The share converges by n=100 and is the same question
asked so that it answers.

**It is now the share of the page's gaps that come from the four sizes it uses
most**, 4px buckets (12 and 13 are one decision made once). Both constants are
inherited rather than fitted: **four** is the top of the old ideal band ("2–4 is a
scale someone chose") and the **0.8** ideal floor is the old definition's own
"four fifths". The `ok` floor of 0.5 is the point where there is no vocabulary at
all — fewer than half the page's gaps drawn from its four commonest sizes.

⚠ **The old low end was DEAD and nothing is lost by dropping it.** "One gap is no
hierarchy" never fired once: the minimum reading across 168 pages at both widths
was **2.00**, and `ideal` began at 2.

⚠ **The em hypothesis was wrong**, and it is recorded because it is the obvious
one: gaps are authored in `em`, so one authored value renders at many pixel
sizes. Bucketing each gap in quarter-ems of its container's font size instead of
4px moved the site median 5 → 6 at 1280 and 6 → 5 at 3440. Nothing. The long tail
is real; it was the *statistic* that could not see past it.

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
site's stated prime objective ("widescreen space gets used"). And it has **no
ceiling**: a former one charged a full-bleed shell for spanning 99%, which is
`pad-share`'s complaint taken twice.

⚠ **IT IS COVERAGE, AND THE TWO EARLIER VERSIONS WERE BOTH SPANS** (2026-08-17
— the fix, and the reason this band was worth nothing until then). A span from
the leftmost content box to the rightmost **assumes the very thing the band
measures**: that what lies between the two edges is continuous. A topbar with a
logo left and an avatar right spans the whole screen and covers 5% of it, and
`score.js` read 100% there. The escape attempted next — band the content leaves
into 24px rows by `y` and take the median span — traded that for a worse
failure: a nav rail contributes one narrow band per label, the rail and the
content region are two *independently scrolled* columns whose vote is
proportional to their own scroll height, and the median landed inside the rail's
cloud. It read **6–10% on seventeen of eighteen pages** against this band's own
`ok` floor of 0.28 — a uniform hard zero forfeiting 13% of the tier's weight
while looking like a measurement.

`ratios.width_used()` now takes the **union of the x-intervals content
occupies**, as a share of the frame. Three consequences, none of them a
threshold:

- No row banding at all, so nothing weights a rail by its scroll height. The
  y-band machinery is deleted.
- **Clipped to the frame.** One long line inside a horizontally-scrolling
  `<pre>` reports its unclipped extent — 2640px of one code line — and the span
  read **208.3%** on `/web/layout/flow/` and 148.5% on `/web/nav/crumbs/`
  (neither page has any transform or zoom; every `escale` is 1). You cannot
  spend more width than you were given; content past the frame is
  `doc-overflow`'s and `escape`'s question.
- The population is **what is drawn** — a text block *or* a leaf. Leaves alone
  missed every paragraph containing an inline `<code>`, so a prose page sampled
  four boxes and declined to answer; text alone missed a gallery of image tiles
  filling 3440.

Distribution over the eighteen-page vision corpus at 1280, before → after:
**min 0.04 → 0.59, median 0.07 → 0.87, max 0.59 → 0.97; pages outside `ok`
16/17 → 0/18.** ⚠ It is now saturated at the TOP at 1280 (16 of 18 at full
credit) — expected, and the reason the band exists is 3440, where the nine
hand-written presets fail it hard. `taste/corpus/`'s `pinned the body narrow`
case, judged at 3440, agrees on all seven subjects at a full −1 swing where it
previously read n/a on one. `ai/2026-08-17/tier-calibration/`.

⚠ **ONE IMPLEMENTATION NOW, shared with `score.metrics()`.** Two hand-written
answers to the same named question disagreed by two hundred points, and nothing
anywhere said they were meant to agree.

**`contrast` — DERIVED**, the one non-geometric quantity in the book. Not
separately calibrated; the band names what a type hierarchy needs at both
ends — under ~1.2× is no heading at all, over ~7× is a poster and a footnote
with nothing between.

⚠ **THE NUMERATOR IS THE LARGEST HEADING, not the largest text** (2026-08-17).
As `max(fs)` a single decorative glyph set the band: a **125.7px**
`div.panel-t-time` clock, 8 characters, inside a Panel demo carrying no
`data-layout-ignore`, over a 15px median read **8.38** on `/framework/`, and the
same shape read **18.20** at 3440 on `framework/ui/`. On **165 of 169 pages the
largest text already IS a heading**, so naming `h1`–`h6` changes only the four
rows where it was not, and takes the maximum from 8.38 → **3.92** at 1280 and
18.20 → **3.91** at 3440. A page with **no heading declines** rather than reading
~1.0: `polish.js`'s `hierarchy` is the rule that reports a missing h1, and a band
with no hierarchy to measure has nothing to say.

⚠ **The obvious fix is wrong, and one run killed it.** "The largest text with at
least 12 characters" excludes the clock — and excludes most of this site's page
titles too, because an `h1.page-title` runs **4–9 characters**. It took the site
median from 3.42 to **2.36** and the 25th percentile from 2.70 to **1.17**; a
character-weighted 95th percentile was worse (median 1.17). **Length does not
separate an ornament from a title. The tag does.**

⚠ **SATURATED ON THIS SITE, AND THAT IS NOT A DEFECT TO FIX HERE.** It pays full
credit to **163 of 165** rows at both widths, because one theme means one type
ramp: the whole corpus reads five discrete values (2.56, 2.70, 3.42, 3.91, 3.92).
The band measures the *theme*, and every page draws from the same one. Against
the other population it is one of only four bands that told a good generated roll
from a bad one, so the weight stays at 5 — "a range can be saturated for one
population and the sharpest thing you own for another" (`taste/readme.md`). What
it still discriminates on this site is the floor: a page whose largest heading is
**smaller than its body text** reads 0.88 and scores zero.

## The saturation sweep — all eleven bands against their own ranges

⚠ **A band that pays full credit to every page measures nothing, exactly like one
that pays zero to every page.** Both directions are the same failure, and the only
way to see either is a band's value distribution against **its own declared
range**. This is the whole corpus — 169 urls at 1280 and 3440, after the
2026-08-17 re-derivations (`ai/2026-08-17/band-rederive/`). `null` is a page the
band declined to read; `full` and `zero` are pages at the two ends of `credit()`;
`out` is pages outside the band's own `ok`.

| band | ideal | ok | min | med | max | null | zero | **full** | out |
|---|---|---|---|---|---|---|---|---|---|
| `measure` | 52–68 | 34–92 | 35.5 | 69.6 | 96.2 | 23 | 3 | 54 / 146 | 3 |
| `frame-gap` | 0.45–2.2 | 0.1–4.2 | 0.00 | 1.40 | 1.48 | 28 | 2 | **138 / 141** | 2 |
| `pad-share` | 0.75–1.7 | 0.2–4 | 0.45 | 0.82 | 2.60 | 30 | **0** | 80 / 139 | **0** |
| `gap-share` | 0.008–0.04 | 0–0.09 | 0.00 | 0.01 | 0.07 | 0 | 21 | 102 / 169 | 0 |
| `scale` | 0.8–1 | 0.5–1 | 0.49 | 0.75 | 1.00 | 1 | 1 | 48 / 168 | 1 |
| `lanes` | 0.75–1 | 0.35–1 | 0.35 | 0.83 | 0.99 | 3 | **0** | 130 / 166 | **0** |
| `repetition` | 0.1–0.45 | 0.02–0.85 | 0.00 | 0.56 | 0.98 | 3 | 16 | 59 / 166 | 16 |
| `slivers` | 0–0.02 | 0–0.22 | 0.00 | 0.03 | 0.42 | 14 | 13 | 64 / 155 | 13 |
| `depth` | 3–9 | 1–16 | 3 | 8 | 15 | 3 | **0** | 105 / 166 | **0** |
| `width-used` | 0.7–1 | 0.28–1 | 0.61 | 0.93 | 1.00 | 0 | 0 | **164 / 169** | 0 |
| `contrast` | 2.2–4.2 | 1.15–7 | 0.88 | 3.42 | 3.92 | 4 | 1 | **163 / 165** | 1 |

At 3440 the same table changes in four places, all of them expected:
`width-used` **164 → 60** full (this is the width the band exists for),
`slivers` **64 → 142** full with 0 zeros, `lanes` 130 → 108, `pad-share` 80 → 60.
Everything else moves by two rows or fewer.

**Four bands are saturated at the top, and only two of them are findings.**

- **`width-used` at 1280 (164/169) and `slivers` at 3440 (142/155) are honest.**
  An app-shell page genuinely does fill 1280, and nothing is a sliver on a 3440
  screen. Each band earns its keep at the *other* width, and each says so in its
  own `why`.
- **`contrast` (163/165 at both widths) measures the THEME.** One type ramp, one
  set of ratios — the corpus reads five discrete values. Recorded above; the
  weight stays because the band is sharp on generated layouts.
- **`frame-gap` (138/141, with its median AND its 75th percentile both exactly
  1.40) is the one unexplained saturation, and the census names the box.** Of the
  141 pages that read the band, **94 at 1280 and 93 at 3440 take their 10th
  percentile from OUTSIDE the content region** — and **87 of them from the same
  element, `div.sidebar`, at exactly 1.400.** The next repeat is 0.89×17. A page
  like `styles/elements/code/` offers **two framed boxes in the whole document**
  and both are shell chrome. Where a page has framed content of its own the band
  reads it correctly — `/framework/` 0.80 on `div.page-preview`, `ext/JSONL/` 0.89
  — so this is not a broken measurement, it is a band with **no page-specific
  population on two thirds of the corpus**. `taste/readme.md` already records the
  signature locally ("four of the pages reported *identical* values"); it is
  site-wide, and 87 pages agreeing to three decimals is not a coincidence.
  **Not fixed here:** the obvious repair — read the band over the content region,
  as the six content bands do — takes it to `null` on every page with no framed
  content of its own, and `frame-gap` keeps the root on purpose (chrome's padding
  is exactly what this tool exists to measure). That is a band decision with a
  wide blast radius and it is the owner's, not a subagent's.

**Three bands never reach either edge — `pad-share`, `lanes` and `depth` record
zero hard zeros AND zero out-of-range rows at both widths.** They still taper, so
they are not dead; but their `ok` bounds are wider than anything this site
produces, which means the outer half of each range has never been exercised and
is untested rather than validated. Left alone deliberately: each would need its
own re-derivation, and a range that is merely *unexercised* is not yet a range
that is *wrong*.

## Tight vs. diffuse

Three quantities were tight enough, as calibrated, that a range meant
something directly as measured: **`pad-share`** (since re-pointed at an
expectation rather than the raw share it was calibrated on — see above), the
**IQR core of `measure`**, and **`lanes`** (with the chrome caveat above). The
rest are either genuinely diffuse across this corpus (`frame-gap`,
`gap-share`, `repetition`, `depth` — real quantities, just not ones with a
single right answer yet) or were never separately calibrated at all (`scale`,
`slivers`, `width-used`, `contrast` — derived from argument, not
measurement). Full run: `ai/2026-08-16/layout-generator-rules/calibration.md`.
