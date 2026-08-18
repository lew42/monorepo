# Taste — decisions and record

*moved from readme.md 2026-08-17; conclusive, not current guidance.*

The third tier. `rules.js` says what is BROKEN — content unreachable, boxes
overlapping. `polish.js` says what is OFF — near-miss alignment, padding that
doesn't scale, a ragged row; it caps at medium so a wobble can never outrank
content nobody can read. Neither can tell two clean layouts apart: both are
free to score 100, and ranking two clean layouts is exactly what a generator
needs when it searches rather than samples. That is this tier's one job.

```js
import { rate } from "/framework/ext/DesignTool/taste/taste.js";

rate(document.querySelector(".page.active-page"));
// → { score, grade, bands, weakest, covered, read, of, ignored, mostly_picture }
```

`ranges.js` is the rulebook — eleven dimensionless ratios, each an `ideal`
band, a wider `ok` band, and a `weight`. `read.js` derives all eleven from one
probe model, arithmetic only. `taste.js` is the front door: `rate()` reads (or
takes an already-probed model, the shape `analyze()` also accepts), scores
every band, and returns the total plus the three weakest. The prose half of
the rulebook — where every number came from — is `../knowledge/ideal-ranges.md`.

## Why a rating, not a rule

A rule fires or it doesn't, and that binary is the right shape for "broken" —
either the text is clipped or it isn't. A range pays **partial credit**, so
two pages that are both clean — no rule fires on either — still get different
numbers, because one sits at the centre of `measure`'s ideal band and the
other is grazing the edge of `ok`. That difference is the entire reason this
tier exists: `rules.js` and `polish.js` together cannot produce it.

The cost is real and stated plainly: **nothing here proposes a fix, and
nothing appears in an issue list.** A low band score means "further from
centre", not "wrong" — there is no declaration to write, no element to ring,
no `defer()` to wave it through. A rating ranks; only a rule repairs.

## The taper, not a step

`credit()` is full inside `ideal` and falls **linearly** to zero at the far
edge of `ok` — never a cliff. The same argument `rules.js` makes for severity
being a curve rather than a line: a step cannot tell 69 characters a line from
90, any more than a binary test can tell 87 characters from 300. A taper can,
and a search that hill-climbs needs that gradient to have anywhere to climb —
a step function is flat everywhere except the one edge.

## A missing range is dropped, not scored zero

A dashboard has no prose, so `measure` reads `null` on it. Marking a null
reading as a failure would rank every dashboard below every article, which is
not a taste judgement, it's a category error. `rate()` filters to the bands
that produced a real number and **moves the divisor with them** — the score is
always out of the weight that was actually measured. `covered` reports what
fraction of the book was readable (weight measured ÷ `TOTAL`), so a 62/B with
`covered: 40` and a 62/B with `covered: 95` are visibly not the same claim,
even though the headline number matches.

`read.js` is where most of those nulls are born: every band gates on a
**minimum sample** (`enough()`) and reads `null` below it, rather than scoring
a two-data-point read harshly. Found by ranking the site — six
`styles/layouts/*` demo pages scored 0% on `measure` and `width-used` while
`analyze()` called them fine, because two miniature captions are not a reading
column.

## A page mostly pictures cannot be rated

`probe()` now returns `ignored` — the share of the root's scroll area a walk
was told to skip, via `probe.IGNORE` — and `rate()` passes it through, adding
`mostly_picture` at 50% or more. This tier reads text and geometry, so a page
whose subject is a demo stage measures the caption around it: **132 of 336
audited page-widths are more skipped than read** (`DesignTool/readme.md`,
"39% of what this tool audits, it never looked at"). `ignored` and
`mostly_picture` are the caveat, not a fix — a low score on a mostly-picture
page says the tool was blindfolded, not that the layout is bad.

## The refit

The bands were first written from intuition and then measured against 26 good
pages and 10 known-bad traps on this site, at 1280 and 3440
(`ai/2026-08-16/layout-generator-rules/calibration.md`). Six of the
eleven moved:

- **`repetition`** was written at 0.3–0.75 from a guess about "enough
  hierarchy." The site's own good pages measure a p10–p90 of 0.09–0.42, median
  0.23 — the guess was roughly double the real centre.
- **`measure`** narrowed to the site's own interquartile range (52–68 at *both*
  widths) rather than the wider typographic consensus — this asks whether text
  is comfortable, not merely readable.
- **`pad-share`** is the tightest quantity measured — an IQR of 0.033–0.047 of
  the box's own width, unchanged from 1280 to 3440 — and was given weight to
  match: 7, the third highest in the book. (It no longer measures that share
  directly; see the second wave below.)
- **`frame-gap`** turned out BIMODAL — chrome clusters at ~0.4–0.8×, cards at
  ~1.6–1.9×, and the median sits in the empty gap between them. A wide band
  and a low weight (5) is what a single number can honestly say about two
  populations until the read is split by box role.
- **`lanes`** is tight in the data (median 0.93–0.94) but **partly an
  artefact**: measured on a whole `.app`, nav and page chrome anchor most
  boxes to a shared x whatever the content does, and the `library/bad/` traps
  score *higher* on it than the good pages. The ideal floor was pulled down to
  0.75 (from the measured 0.85) and the weight to 6 to reflect that the signal
  is partly chrome, not content.
- **`depth`** is root-relative and bimodal — chrome-heavy pages read 13–15,
  simple ones read 8, nothing in between — so it carries the lowest weight in
  the book, 3.

**The lesson worth stating plainly: a weight is evidence, not opinion.** A
diffuse quantity — one that means something different depending on page type —
earns less influence over the total than a tight one, on purpose, because a
wide weight on a diffuse signal is just noise wearing a number.

## The second wave — four things only USING it could find

Calibration fixed the bands. Pointing the finished tier at real work — the nine
hand-written layouts in `styles/layouts/space/presets.js`, this tier's own doc
page, and 600 generated rolls — found four defects no amount of calibrating
would have: a band can be measured correctly against the wrong quantity.

- **`width-used` was measured over TEXT blocks**, so a gallery of sixteen image
  tiles reported spending 11% of a 3440 screen while filling it. It also had a
  **ceiling** that charged a full-bleed shell for spanning 99% — which is
  `pad-share`'s complaint taken twice, so the ceiling is gone. ⚠ And both of the
  fixes that followed were still wrong; see "It is coverage now", below.
- **`frame-gap` and `pad-share` counted painted boxes with no text.** A wall of
  `.wash` swatches has no padding by design and took `frame-gap` to 0.00 on
  every tile wall on the site — the same false positive `rules.js`'s `cramped`
  guards with `bounds[n.i]`. Both now require the box to hold text.
- **`scale` counted DISTINCT gap values**, and this tier's own page measured 25
  and scored zero. Every real page has a long tail of one-off gaps on top of the
  three or four sizes it is built from, so it counted the vocabulary instead —
  the smallest set covering four fifths of the gaps. ⚠ **And that was still a
  count, which was still wrong**; see "the sample was the bug twice", below.
- **`pad-share` and `frame-gap` were in direct conflict**, and only the presets
  showed it: 3.7% of a 3440 band is 127px, which is 7em, which `frame-gap` calls
  badly over-padded. Both bands came from the same 36 pages and **both were
  right about different boxes.** `polish.js` already writes the resolution —
  `min(3.5%, 3.5em)`, proportional until a box gets wide and then flat — so
  `pad-share` measures against that expectation instead of a raw share, and a
  300px card with 11px and a 3440 band with 56px both read 1.0. `frame-gap`'s
  ceiling rose to clear 3.5 for the same reason: that is where the house pattern
  lands by construction, and a ceiling below it made the house pattern
  unrepresentable.

**The generalisation: calibration tells you a band is in the wrong place; only
use tells you a band is measuring the wrong thing.** The first is arithmetic,
the second needs a case where two honest numbers disagree.

## ⚠ A broken range discriminates beautifully

The most useful thing this tier taught, and it is a warning about itself.
Searched over 120 layouts, `width-used`, `lanes` and `frame-gap` each looked
like a strong discriminator — a wide, repeatable gap between the best rolls and
the worst. **Each collapsed to a ~0.0 gap the moment its own defect was fixed.**

Three times is a lesson, not a coincidence: a defective range separates layouts
*by the defect*. `width-used` was sorting them by how much text they happened to
contain; `frame-gap` by how many undecorated swatches they drew. Both signals
were real and reproducible. Neither was about the layout.

So **a range's apparent power is not evidence that it is right**, and a
suspiciously clean ranking is the first thing to distrust. What survives the
correction is what the range was actually for — here, four of eleven.

## Does it agree with an obvious right answer? — `corpus/`

**A rulebook that cannot be wrong is not a rulebook.** Eleven bands were retuned
twice and nothing asserted that the resulting *order* was right.

A corpus of pages someone ranked needs someone. A corpus of **pairs** does not:
take a layout, break one named thing about it, and the original is better by
construction. Six breaks × five presets, judged **on the band the case names**,
not on the total — because taking the padding out of a gallery *raises* its
total (content then spreads, and `width-used` gains more than `pad-share` loses),
which is a true fact about a weighted sum and not a failure of `pad-share`.

**20 agree · 1 disagree · 9 not applicable**, live at
[`corpus/`](/framework/ext/DesignTool/taste/corpus/) — read the count there,
not here; it moves as `styles/layouts/space/presets.js` and this tier both
do, and this line will drift again. ⚠ Not a clean sweep — the one disagreement
is under "Open" below.

⚠ **The count moves every time the tier does, and that is the point.** It read
23/0/7 the hour it was built, then 20/1/9 after eight corrections landed in the
bands beneath it, and **29/0/13 once two subjects were added.** Quote it with a
date or not at all.

⚠ **A CASE THAT TESTS NOTHING IS WORSE THAN A CASE THAT FAILS**, and the corpus
caught that about itself — the strongest thing it has done. After the sample
gates landed, "laddered the columns" quietly went to **0 of 0**: three subjects
had no wrapping row for it to ladder, and the other two had too little text for
`slivers` to read. It reported as clean n/a and nobody would have looked again.
`masonry` and `split` are in `SUBJECTS` for that reason. **Read the denominators,
not the passes.**

⚠ **Green is not the achievement; the n/a set is.** Not-applicable pairs prove
nothing for three distinct reasons, and a corpus that scored any of them as a
pass or a failure would be lying: the break has **nothing to change** on that
subject (eight fixed tracks added to a *column* body ladder nothing); the
named band has **nothing to read** at all on that subject ("unbound the
prose" leaves `measure` with no live reading on several presets); or **the
subject already scores zero** on the band the case is about — `gallery` on
`width-used` at 3440 for "pinned the body narrow" — so there was nothing left
for the break to cost.

Three design points it forced, each after getting them wrong first:

- **A pair only means something if the left side is actually good.** Unbounding
  `--measure: 52em` changed nothing at any width, because 52em already runs ~100
  characters a line here (hand-counted, two independent methods, four viewports:
  `ai/2026-08-16/mastermind-layout/measure-verdict.md`) — the case was comparing
  two broken layouts. Cases carry a `base` that fixes the subject before the
  break breaks it.
- **A band with nothing to measure is n/a, not a failure.** `slivers` reads null
  on a dashboard of tiles because none holds twenty characters. Scored as a
  failure it made the corpus look broken when it was silent.
- **Two cases are expected to FAIL, and they are the most useful two.** "Hid the
  text" (ink the colour of its ground) is invisible to all eleven bands, because
  every one of them is geometry — `rules.js` owns it. "Scrambled the spacing"
  cannot be reached from a layout at all: a page's gap *vocabulary* belongs to
  the components inside it, and a spec can add at most one gap per container. A
  corpus with no declared boundary reads as a claim that the tier catches
  everything.

### And it found three real defects on its first run

Not in the cases — in the tier:

- **`width-used` could not see a narrow body.** It spanned the leftmost to the
  rightmost content box, so one full-bleed topbar pinned the answer to the whole
  screen however narrow the column under it was. The per-row median that replaced
  it was worse; see "It is coverage now", below.
- **`frame-gap` and `pad-share` could not see a stripped layout.** A page carries
  a dozen correctly-padded components and two or three layout tracks, so the
  *median* moved by nothing when every track's inset was removed. Both are
  width-weighted now: a 3440 band with no inset is a bigger mistake than a 200px
  chip with none.
- **`frame-gap` was measuring declarations, not text.** It read a box's own
  `padding`, so a toned wrapper with no inset of its own — holding a properly
  padded card — measured 0.00 and read as text butting a frame when nothing was
  near it. The generator draws that shape constantly, so **half its rolls scored
  zero on a defect they did not have**, worth four points of mean fitness. It
  asks `text_bounds()` now, which is what `rules.js`'s `cramped` always did:
  bounds, never declarations.

### Two calls that were open, now closed

- **`frame-gap` reads the tight end, not the average.** It had saturated — 0.01
  of separation over 120 layouts — because a page's *mean* inset is fine while
  one box is touching, and because `pad-share` was already measuring the typical
  inset. The two were saying one thing twice. It is the **10th percentile** now
  (not the minimum, so one outlier is not the whole reading), which is the
  question the tool was built for and is not redundant with anything.
- **A break about one width is judged at that width.** Pinning a body to 20em
  costs `width-used` at 3440 and *helps* it at 390, where 20em is most of the
  screen — averaging the three washed the break out. `at: 3440` on the case.
  The alternative was gating the band, which would have been a worse answer:
  "did the layout spend the room it was given" is a fair question at 390 too.

## ⚠ Copy the GUARDS, not just the maths

`frame-gap` is `rules.js`'s `cramped` expressed as a quantity, and it shipped with
`cramped`'s **measurement** and none of its **guards**. That cost four false
readings in one afternoon, each found separately and each already solved in
`rules.js` years of findings ago:

- **A full-bleed shell's edge is the window**, and text against it is the design.
  `gutter` excludes the shell for exactly this reason. Unguarded, `core/App/` read
  a frame gap of 0.00.
- **A box that clips is answering a different question** — `clipped` owns it.
- **A table cell's inset is row rhythm, not a cramped card.** `framework.css`'s
  `th, td { padding: 0.25em 0.75em }` is every table on the site; counting it once
  produced 175 identical findings on one page.
- **Text outside its box is overflow, not a narrow inset.** A shell holding an
  overflowing descendant reported **−235**, which then became the page's 10th
  percentile and took a healthy page to zero on a defect it did not have.

With the four guards in, `frame-gap` agrees with `cramped` — which fires zero
times on every page that had been reading badly. **A band that models a rule and
skips its exemptions is not a simpler version of that rule, it is a worse one.**

⚠ **And the finding that led here was wrong, which is worth keeping.** Six
`styles/elements/*` pages dropped 9–23 points when `frame-gap` switched from
declared padding to text bounds, and that was read — by the mastermind, out
loud — as the band no longer *flattering* pages whose text sat tight. It was not.
`cramped` fired zero times on all six; five were already at full credit. What
actually happened is that the same day's restructure had moved their swatches
behind `.page-preview-thumb`, which `probe.IGNORE` excludes, so the sweep was
measuring sidebar chrome — **which is why four of the pages reported *identical*
values.** Two pages measuring the same number to two decimals is not a
coincidence, it is a signature that the tool is looking at what they share.

## Two traps

- ⚠ **Every length is read at its own scale.** The layout-space ruler
  (`styles/layouts/space/`) renders a whole 3440 page at 19% zoom for its
  shots, so a 400px column measures 76px on screen. A raw pixel threshold
  would call every one of those a sliver. `slivers` and `pad-share` divide by
  the node's own `escale`/width instead of comparing to a fixed pixel floor —
  see `own()` and `space` in `read.js`.
- ⚠ **`gap-share` cannot reuse `ratios.gaps()`.** That function answers a
  STACK — it bails the moment two children share a row or column — and most
  3+-child boxes on this site are grids, not stacks. The first version of this
  band read zero on the median page. `spread()` in `read.js` bands children by
  `y` first, so a grid gives up both its row gap and its column gap, and a
  true stack gives the same answer as before.

## Used by

`styles/layouts/space/gen.js` imports `AUTHOR` — the same table read from the
author's side, in `em`s rather than ratios — to draw declarations that land
inside the bands this file grades. `styles/layouts/space/page.js` imports
`rate()` directly and scores each of its five live shots, and
`styles/layouts/space/search.js` runs it over a hundred rolls at three widths:
`AUTHOR` writes, `RANGES` grades, and the generator climbs the difference.
`dev/DevBar/layout.js` prints it beside `analyze()`'s grade on every page.

**And four of the eleven do all the work.** Searched against 360 generated
layouts, only `frame-gap`, `pad-share`, `measure` and `contrast` told a good
roll from a bad one; the rest were saturated, because the generator's own model
keeps every roll clear of the zones they exist to catch. That is a result about
the generator, not a case for dropping them — the same `width-used` that cannot
separate two rolls is the range the nine hand-written presets fail hardest at
3440. **A range can be saturated for one population and the sharpest thing you
own for another.**

## It is coverage now, and three bands were dead (2026-08-17)

A vision baseline — eighteen frozen 1280 screenshots, hand-rated against written
anchors — convicted this tier of a defect no amount of calibrating could reach,
and then the internal numbers convicted two more of the same shape.
`ai/2026-08-17/vision-baseline/` has the images; `ai/2026-08-17/tier-calibration/`
has the fixes and every distribution below. **Not one threshold in `ranges.js`
moved.**

**`width-used` read 6–10% on seventeen of eighteen pages** against its own `ok`
floor of 0.28 — a uniform hard zero, silently forfeiting 13% of this tier's total
weight while looking like a measurement. Both of the implementations above were
**spans**, and a span *assumes the thing the band measures*: that what lies
between the leftmost and rightmost content is continuous. A topbar with a logo
left and an avatar right spans the screen and covers 5% of it. The per-row median
traded that for something worse — a nav rail contributes one narrow band per
label, the rail and the content region are two independently scrolled columns
whose vote is proportional to their own scroll height, and the median landed
inside the rail's cloud.

It is `ratios.width_used()` now: **the union of the x-intervals content occupies,
clipped to the frame**, over text blocks *and* leaves, shared with
`score.metrics()` so the two tiers cannot disagree by two hundred points again.
The y-band machinery is deleted. Distribution over the 18 at 1280: min
0.04→0.59, median 0.07→0.87, outside `ok` 16/17→0/18. Over the whole 169-url
corpus it now does what it was built for: **median 0.92 at 1280 and 0.58 at
3440**, five hard zeros at 3440 and none at 1280 — it distinguishes the two widths,
which it could not do at all before.

**`repetition` was counting bare TAGS as components** — `probe.label()` returns
the tag alone for an unclassed element, so twenty sibling `<p>` in a markdown
block were one repeated component and every article on the site read as a wall.
Median 0.84→0.56, outside `ok` 8/18→1/17. **`lanes` was paying full credit to
18 of 18 pages**, exactly as its own `why` suspected; scoped to the content
region it now separates some (full credit 18/18→15/17).

## Three bands re-derived, and the sample was the bug twice (2026-08-17)

`ai/2026-08-17/band-rederive/` — every distribution below is 169 urls at 1280 and
3440, before and after. **No band was tuned toward a baseline**: the 18-image
vision baseline does not reproduce itself (ICC 0.510) and `taste`'s correlation
with it flips sign between passes, so it was weighted at zero and the evidence is
each band's distribution against its own declared range.

- **`measure` was reading component text** — a card blurb, a chip, a table cell —
  and every guard it needed was already written down somewhere else in the module.
  It is `rules.js`'s `measure` rule read as a quantity and it shipped with the
  rule's arithmetic and **one of the rule's three exemptions**: the same mistake
  `frame-gap` made one file over. Fourteen `p.page-preview-desc` captions supplied
  **70 of `/framework/`'s 137 prose lines**; one 125px `td` running 13.7
  characters over 8 lines was the whole reading of `styles/elements/misc/`.
- **`scale` was measuring the sample, not the page.** Subsample one page's *own*
  gaps and "how many sizes cover four fifths" climbs 7.6 → 17.0 as n goes 25 →
  888. It is the **share** drawn from the four commonest sizes now, which
  converges by n=100.
- **`contrast` was set by one decorative glyph** — a 125.7px clock inside an
  unmarked Panel demo. The numerator is the largest **heading** now; on 165 of 169
  pages the largest text already was one.
- **`frame-gap`'s −0.01 guard**, logged as a bug and left by the previous pass:
  `reach()` returned `null` below −1, so a rounding of a tenth of a pixel came
  through as a negative padding. Clamped at zero; no credit moves.

**Every number, every rejected candidate and the whole-corpus saturation sweep are
in `../knowledge/ideal-ranges.md`** — this is the argument, that is the record.
⚠ The one thing to carry away: **`measure`'s thresholds did not move.** Its old
justification was the site's own interquartile range, and that IQR had been
measured over the contaminated population — it landed inside the ideal band only
because two errors cancelled. Read over prose alone the site runs **59–78**, above
the band, which is what `knowledge/characters-per-line.md` hand-counted
independently. The band charges the site for the gap now. **Fix the population
before you touch a threshold; a threshold fitted to a broken reading will look
right and be wrong.**

**Verified**: `tests/` **23/23 at 400, 1280, 1920 and 3440**; `corpus/` **27
agree · 1 disagree · 14 n/a**, the same count as before the change, with the one
disagreement on `pad-share · frame-gap` and not on any band touched here. The
`scale` case (`scrambled the spacing`, expected to fail) still reads +0 on all
seven subjects, so the boundary it marks survives the new statistic. Tier-wide the
mean barely moves and **the spread grows** — 84.9→84.6 mean, sd **7.60→8.71** at
1280; 78.5→78.8 mean, sd **9.29→9.84** at 3440 — which is the signature a
re-derivation should have: not flatter, more separated.

## Open

- **`frame-gap` reads the shared nav rail on two thirds of the site.** Of the 141
  pages that read the band, **94 take their 10th percentile from outside the
  content region, and 87 of those from the same element — `div.sidebar`, at
  exactly 1.400**; the band pays full credit on 138 of 141 and its median and 75th
  percentile are both 1.40. Where a page has framed content of its own it reads
  correctly (`/framework/` 0.80, `ext/JSONL/` 0.89), so this is not a wrong
  measurement, it is a band with no page-specific population on most rows. The
  obvious repair — read the content region, as the six content bands do — takes it
  to `null` wherever a page frames nothing of its own, and this band keeps the
  root **on purpose**, because chrome's padding is what the tool exists to
  measure. The owner's call. (This subsumes the older note about
  `styles/elements/*` reading 1.4 on five of seven: the cause is not those pages'
  `probe.IGNORE`d swatches, it is site-wide.)
- **Three bands never reach either edge.** `pad-share`, `lanes` and `depth`
  record zero hard zeros **and** zero out-of-range rows at both widths. They still
  taper, so they are not dead — but the outer half of each `ok` range has never
  been exercised by anything on this site, and is untested rather than validated.
- **`contrast` is saturated and probably should be.** Full credit on 163 of 165
  rows, because one theme means one type ramp: the whole corpus reads five
  discrete values. It measures the theme, not the page. The weight stays at 5
  because against 360 generated layouts it was one of only four bands that told a
  good roll from a bad one — but on *this* population it is spending 5 of 62
  weight to say "yes, this page uses the site's headings."
- **A wall of cards rates fine after all.** `/framework/` — the front door — went
  F49 → D68 → **A94** across the two passes, and every point of the original
  charge turned out to be a measurement defect: `width-used`, `repetition` and
  `lanes` mechanically broken, then `measure` reading its captions and `contrast`
  reading a demo clock. **The question "is a card wall genuinely weaker than it
  looks" is closed, and the answer was no.**

- **`corpus/` validates the ORDER, not the PLACE.** It proves the tier notices
  when a named thing is broken; it says nothing about whether `measure`'s ideal
  band should be 52–68 or 50–70. Ranking against a human's judgement — a set of
  real pages someone put in order — is still the missing half, and it is the half
  that needs a person.
- **One case disagrees, live — and it is a different subject than it was.**
  "Took the padding out" now disagrees on **`split`** (+0), not on `gallery`,
  which reads n/a; `docs` (−0.69) and `masonry` (−0.12) agree and the other three
  are n/a (2026-08-17, measured). Same shape either way: the subject's
  `pad-share · frame-gap` credit does not move when the break strips its padding.
  Not root-caused; worth checking whether `split` was already at floor on one of
  those two bands before the break — the "nothing left to lose" n/a shape — or
  whether the case is finding something real. ⚠ The subject moved because
  `styles/layouts/space/presets.js` is rebuilt by other tasks; **read the count
  live, and read which subject with it.**
- **`frame-gap` wants splitting by box role.** Chrome and cards are two real
  populations, not noise around one number; a role-aware read would recover
  the weight the bimodal split currently costs it.
- ~~**`lanes` wants scoping away from page chrome.**~~ **Done, 2026-08-17** — it
  and five other content bands read `ratios.region()` now. Original note:
  measured on a content root
  rather than `.app`, the artefact `ai/2026-08-16/layout-generator-rules/calibration.md`
  describes might resolve into a real signal at a higher weight.
- **The weights are hand-set, never fit.** Six bands were retuned against
  measured data; none of the eleven weights themselves came from anything more
  rigorous than "the tight ones should count for more." A held-out search that
  optimizes weight-to-outcome does not exist yet.
