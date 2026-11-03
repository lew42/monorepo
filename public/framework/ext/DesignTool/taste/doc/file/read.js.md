The eleven quantities of `ranges.js`, derived from one probe model. Arithmetic
only — no DOM, no judgement — the same contract `ratios.js` keeps for the tier
below this one, which is what lets these bands be checked against a saved
capture as easily as a live page.

## Every length is read at its own scale

The layout-space ruler (`styles/layouts/space/`) renders a whole 3440 page at
19% zoom for its shots, so a 400px column measures 76px on screen. A raw pixel
threshold would call every one of those a sliver. `own()` and `space` divide by
a node's own `escale`/width instead of comparing against a fixed pixel floor —
the same discipline `probe.js`'s `scale_down()` established for the tier below.

## `gap-share` cannot reuse `ratios.gaps()`

That function answers a *stack* only and bails the moment two children share a
row or column — most 3+-child boxes on this site are grids, not stacks, so the
first version of this band read zero on the median page. `spread()` bands
children by `y` first, giving up both a grid's row gap and its column gap while
still handing a true stack the same answer as before.

## `frame-gap` asks `text_bounds()`, never a box's declared padding

The version that read declarations scored a toned wrapper — no inset of its
own, holding a properly padded card — as text butting a frame, because the
wrapper's own `padding` was `0`. Half the generator's rolls scored zero on a
defect they did not have before this was fixed. `reach()` asks `text_bounds()`
now, which is what `rules.js`'s `cramped` always did: bounds, never
declarations. `tightest()` then reads the 10th percentile of those gaps, not
the mean — an average saturated over 120 layouts because a page's mean inset
is fine while one box is touching, and `pad-share` was already covering the
typical case.

## `pad-share` measures against an expectation, not a raw share

`inset()` divides a box's padding by `min(0.035 × width, 3.5 × font-size)` —
`polish.js`'s own `pad-scale` formula, proportional until a box gets wide and
then flat — instead of the box's own width directly. A raw share put
`pad-share` and `frame-gap` in conflict on a wide band: 3.7% of a 3440 band is
127px, which `frame-gap` calls badly over-padded, and both were right about
different boxes.

## Three bands are about their POPULATION, not their arithmetic (2026-08-17)

The defects that survived two calibration passes were all in *what got measured*,
never in the sum:

- **`measure` reads prose**, and prose is over 80 characters, not code, **not a
  table cell** and **not inside a frame** — `in_frame()` is one line, self or
  parent, because `.app` paints and an unbounded walk would exclude the whole
  site. A card blurb, a chip and a stat tile are the component's text; `rules.js`
  has said "18–24 legitimately" about them since it was written. Its sample gate
  counts **lines**, because a line is the unit being measured.
- **`contrast()` takes the largest `h1`–`h6`**, not the largest text. One 125.7px
  clock inside a demo set the whole band otherwise.
- **`on_scale()` returns a SHARE, where `distinct()` returned a count** — and a
  count of that shape rises with how many gaps you look at, which the subsample
  table in `../../knowledge/ideal-ranges.md` shows doubling on every page tried.

Numbers, rejected candidates and the corpus-wide sweep:
`../../knowledge/ideal-ranges.md`. The argument: `../../readme.md`.

## A band with too small a sample reads `null`, not a harsh score

Every band goes through `enough(list, least, read)`, which returns `null`
below its minimum count rather than grading two data points as if they were
twenty. Found by ranking the site: six `styles/layouts/*` demo pages scored 0%
on `measure` and `width-used` while `analyze()` called them fine — they are
galleries of miniatures with almost nothing left for this tier to read once
`probe.IGNORE` skips the stage.

## Improvements

1. **`frame-gap` wants splitting by box role.** Chrome (nav rows, toolbars) and
   cards are two real populations, not noise around one number — the site
   clusters at ~0.4–0.8× and ~1.6–1.9× with the median in the empty middle
   between them. A role-aware read would recover the weight the bimodal split
   currently costs `frame-gap` in `ranges.js`. *(medium, useful.)*
2. ~~**`lanes()` reads whatever root it is handed.**~~ **Done, 2026-08-17** —
   `read()` derives the content scope once from `ratios.region()` and the six
   content bands read there. `lanes` went from full credit on 18 of 18 pages to
   separating them.
3. **`frame-gap` has no page-specific population on two thirds of the site.**
   Measured: 94 of 141 pages take their 10th percentile from outside the content
   region, and **87 of those from one element — `div.sidebar`, at exactly
   1.400**. Reading it over the region would fix that and take the band to `null`
   wherever a page frames nothing of its own; it keeps the root on purpose,
   because chrome's padding is what this tool exists to measure. *(large,
   needs the owner.)*
