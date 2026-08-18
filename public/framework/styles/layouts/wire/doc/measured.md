# Measured — eight layouts, four widths

Headless Chromium, one page per layout at its bare `/full/` url — no stage, no `zoom`, a real
viewport. `400 / 1280 / 1920 / 3440`. The owner's question was *"should work as expected on
Mega and Mobile, with some wrapping of course"*, so the wrapping is the measurement.

## Columns × rows, per width

The widest row of labelled regions × how many rows the page ends up with.

| layout | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| bands | 1 × 5 | 3 × 3 | 3 × 3 | 3 × 3 |
| left | 1 × 7 | 3 × 3 | 5 × 2 | **7 × 1** |
| right | 1 × 7 | 3 × 3 | 5 × 2 | **7 × 1** |
| hero | 1 × 7 | 3 × 3 | 3 × 3 | 3 × 3 |
| bento | 1 × 6 | 3 × 3 | 3 × 3 | 3 × 3 |
| columns | 1 × 9 | 3 × 6 | 3 × 3 | 3 × 3 |
| board | 1 × 6 | 3 × 3 | 3 × 3 | 3 × 3 |
| grail | 1 × 5 | 3 × 3 | 3 × 3 | 3 × 3 |

**Every layout is one column at 400.** No layout was told to be.

**`left` and `right` are the two that keep gaining columns** — their wall is `grid gap auto`
at `--column: 24em`, so `auto-fit` re-counts: 1 track at 400, 2 at 1280, 4 at 1920, 6 at 3440
(the rail is the extra 1 in each figure). The other six hold at three because three is how many
children they have, which is the honest answer — a row of three features is three features.

## Overflow

`documentElement.scrollWidth === clientWidth` on **32 of 32** runs, and the widest descendant
overhang is `0px` everywhere. Nothing on any of the eight pushes the page sideways at any
width, including 400.

## The reading measure on a mega screen

Widest rendered `<p>`, in px:

| layout | 400 | 1280 | 1920 | 3440 |
|---|---|---|---|---|
| bands / hero / bento / board / grail | 288 | 511 | **544** | **612** |
| left / right | 288 | 460 | 368 | 477 |
| columns | 288 | 367 | 544 | 612 |

544 at 1920 and 612 at 3440 are **exactly 34em** — the `measure start` cap in `region()`
biting, since the body font-size clamp puts `1em` at 16px at 1920 and 18px at 3440. Below the
cap the column is the constraint, not the measure. That one class on one line is the whole
"works on Mega" answer: `bands` at 3440 is three 1100px columns whose text still sets 34em.

## Two things this run found

**`.basis` never grows.** At 400 the `left` rail wraps onto its own line and keeps its 14em
(224px of a 400 screen), leaving a gutter, because `.basis` is `flex: 0 0 …`. Its neighbour
fills, because `flex: 1 1 26em` grows. Not fixed here — the fixed rail is what `.basis` is
*for*, and `doc/bento.md`'s Candidate 1 is the class-string way to get a rail that grows when
it is alone on a line.

**Page height is the viewport, not the content.** All eight report 846–858px against a 900px
window, i.e. `page full fill` is doing its job and the footer is pinned rather than pushed. The
`min-height: 0` on each scrolling middle is what makes that true; without it the band cannot
shrink and `overflow-y` never engages.

## Reproducing

`probe.mjs` in the session scratchpad, not the repo. It loads
`/framework/styles/layouts/wire/<name>/full/` at each width, counts `h3` labels (a cheap
"did it render" assertion), reads `scrollWidth`/`clientWidth`, and walks every descendant for
the worst right-edge overhang.
