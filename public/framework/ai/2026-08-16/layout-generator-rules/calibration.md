# Layout calibration data — what IS, not what should be

Measured 2026-08-16 with headless Playwright against the local dev server (`probe()` +
`ratios.js`, reused unmodified). 26 "good" pages (15 named framework/site pages + the 11
`library/` catalog patterns) and 10 `library/bad/` traps as a negative control, each at
1280×900 and 3440×900. 72 loads, 0 errors, 0 404s. Raw data and per-page values:
`calibration.json`.

## The eight quantities — GOOD pages, per-page value across pages (n=26)

| quantity | width | p10 | p25 | median | p75 | p90 |
|---|---|---|---|---|---|---|
| pad_share (pad-left ÷ box w) | 1280 | 0.030 | 0.033 | 0.037 | 0.047 | 0.066 |
| | 3440 | 0.021 | 0.033 | 0.038 | 0.045 | 0.063 |
| pad_em (pad-left ÷ font-size) | 1280 | 0.50 | 0.73 | 0.80 | 1.58 | 1.86 |
| | 3440 | 0.40 | 0.76 | 0.78 | 1.41 | 1.88 |
| measure (chars/line, chars>120) | 1280 | 33.8 | 52.4 | 58.7 | 67.8 | 77.6 |
| | 3440 | 33.8 | 53.5 | 59.1 | 67.9 | 77.7 |
| gap_share (median gap ÷ container w) | 1280 | 0 | 0 | 0.002 | 0.011 | 0.021 |
| | 3440 | 0 | 0 | 0.002 | 0.008 | 0.011 |
| depth (leaf-with-text depth) | 1280 | 8 | 8 | 8 | 13 | 15 |
| | 3440 | 8 | 8 | 8 | 13 | 15 |
| fanout (children per container) | 1280 | 2 | 2 | 2 | 2 | 2 |
| | 3440 | 2 | 2 | 2 | 2 | 2 |
| repetition (share of ≥3-sibling leaves) | 1280 | 0.094 | 0.125 | 0.226 | 0.344 | 0.417 |
| | 3440 | 0.094 | 0.125 | 0.225 | 0.344 | 0.417 |
| lane (share of boxes on a shared x) | 1280 | 0.867 | 0.909 | 0.941 | 0.967 | 0.969 |
| | 3440 | 0.824 | 0.888 | 0.928 | 0.971 | 0.979 |

Also, for context: `score` (LayoutTool `analyze()`) median 81 @1280 / 78 @3440, IQR
74–86 / 72–89 across the good set; `nodes` median 276 (IQR 235–605, dominated by whether
a page is a single specimen or a full doc/dashboard page).

## Negative control — `library/bad/` (n=10), for comparison only

Not pooled into the ranges above — these are the traps, kept separate.

| quantity | width | median | p10–p90 |
|---|---|---|---|
| pad_share | 1280/3440 | 0.040 / 0.037 | 0.025–0.059 / 0.011–0.056 |
| pad_em | 1280/3440 | 1.35 / 1.06 | 0.72–1.86 / 0.76–1.88 |
| measure | 1280/3440 | 58.1 / 58.1 | 46.8–127 / 46.8–99 (max 272 @3440) |
| gap_share | 1280/3440 | 0 / 0 | 0–0.014 / 0–0.006 |
| depth | 1280/3440 | 8 / 8 | 8–8 / 8–8 |
| fanout | 1280/3440 | 2 / 2 | 2–2 / 2–2 |
| repetition | 1280/3440 | 0.077 / 0.077 | 0.024–0.121 / 0.024–0.121 |
| lane | 1280/3440 | 0.967 / 0.979 | 0.928–0.968 / 0.941–0.980 |
| score | 1280/3440 | 76 / 78 | 51–86 / 52–89 (min 0, two F's: `chosen-height`, `band-with-no-gutter`) |

## What surprised me

1. **`fanout`'s per-page median is degenerate — exactly 2 on all 36 pages, good and bad
   alike, at both widths (min=p90=max=2).** The per-page median is swamped by ordinary
   two-child wrapper `div`s; it never sees the card walls and dashboards it's meant to
   describe. The real signal is in the pooled per-box tail: p90=5, max=64 (one
   heavily-repeated dashboard row). As specified, this quantity is not usable as a
   per-page range at all.
2. **`lane` is *higher* on the broken traps than on the good pages** (median 0.967/0.979
   vs. 0.941/0.928). Not because the traps are better aligned — the `library/bad/`
   entries share one page template (`entry()`), so the nav rail and page chrome anchor
   most candidate boxes to the same two or three x-coordinates regardless of what the
   specimen itself does. `lane` measured on a whole `.app` is dominated by chrome, not
   by the content it's meant to judge.
3. **`content_span` on the `bad/` pages is a near-constant page-template artifact**
   (0.772 at 1280, 0.884 at 3440, on literally every one of the 10 traps) — because it's
   computed over every text block on the page, and all ten share the same entry-page
   prose/caption chrome. It says nothing about the specimen's own width usage on these
   pages; it would need to be scoped to `.lt-case-body` to mean anything there.
4. **`gap_share` is zero for the *median* container, not just some of them** — most
   3+-child parents on this site are grids or wraps, and `gaps()`/the row variant both
   correctly bail to `[]` the moment two children share a row or column. Only a minority
   of containers on any given page are true single-axis stacks, so "gap as % of
   container width" has real data on maybe a third of pages and nothing on the rest.
5. **`pad_em` is visibly bimodal, not unimodal** — pages cluster near 0.4–0.8em (chrome:
   nav rows, toolbar buttons) *and* near 1.6–1.9em (cards/panels using the site's
   `clamp(0.75em, 3.5%, 3.5em)` pattern), with few pages landing in between. The median
   (0.78–0.80) sits in the gap between the two clusters, not on either of them.

## Tight vs. diffuse

- **`pad_share` — TIGHT.** Median 0.037–0.038 at both widths, IQR a narrow 0.033–0.047 (a
  ~35% band around the median), stable across 1280→3440. A real, width-independent
  consensus.
- **`pad_em` — DIFFUSE.** Bimodal (see surprise #5): median 0.78–0.80 sits between two
  real clusters (~0.4–0.8 and ~1.6–1.9), so no single range describes "good." Would need
  to be split by box role (chrome vs. card) before it means anything.
- **`measure` — TIGHT (core), wide tails.** IQR 52–68 both widths (~26% band around
  median 58.7–59.1, actually tighter than pad_share's IQR ratio) — but full p10–p90 runs
  33.8–77.6/77.7 because headings, prose and wide tables are different node populations
  measured by the same formula. The IQR is a real signal; the full range is not.
- **`gap_share` — DIFFUSE.** Median is 0 or near-0 at both widths; the quantity is
  zero-inflated because most qualifying containers turn out to be grids, not stacks (see
  surprise #4). A range built on this would either be trivially [0, small] or ignore most
  of the mass.
- **`depth` — DIFFUSE (bimodal).** p10–p25 pinned at 8, but p75–p90 jumps to 13–15 — two
  real populations (simple/demo pages vs. markdown-doc pages with prose nesting), not one
  distribution with noise. A single range would be wrong for whichever half it doesn't fit.
- **`fanout` — degenerate, not usable as measured.** Every page's per-page median is
  exactly 2 (see surprise #1). "Tight" in the literal statistical sense but for the wrong
  reason — it's saturated by wrapper divs, not describing row/wall/grid width. Would need
  redefining (e.g. only containers using `display: grid|flex`, or fanout of the *widest*
  container) before it says anything about taste.
- **`repetition` — DIFFUSE.** Median 0.225–0.226, but p10–p90 spans 0.094–0.417 — a real,
  wide spread driven by page type (list/nav-heavy pages score high, single-column prose
  pages score near 0). No consensus value.
- **`lane` — TIGHT**, with a caveat. Median 0.928–0.941, IQR 0.888–0.967 at the wider end
  — most block boxes on this site really do share an x-coordinate with 3+ others. But
  surprise #2 means this tightness is partly a page-chrome effect, not purely the content
  region; scoping to the content root (excluding nav/sidebar) before calibrating a range
  would be worth doing.

**Net: `pad_share`, the IQR-core of `measure`, and `lane` are the three quantities where
a taste-tier range would mean something as measured. `pad_em`, `depth`, and `fanout`
need to be redefined (split by role, or scoped away from wrapper/chrome noise) before a
range on them would be anything but arbitrary. `gap_share` and `repetition` are
genuinely diffuse on this corpus — real quantities, just not ones with one right answer.**
