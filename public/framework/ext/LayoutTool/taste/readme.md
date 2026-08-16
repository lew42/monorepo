# taste

The third tier. `rules.js` says what is BROKEN — content unreachable, boxes
overlapping. `polish.js` says what is OFF — near-miss alignment, padding that
doesn't scale, a ragged row; it caps at medium so a wobble can never outrank
content nobody can read. Neither can tell two clean layouts apart: both are
free to score 100, and ranking two clean layouts is exactly what a generator
needs when it searches rather than samples. That is this tier's one job.

```js
import { rate } from "/framework/ext/LayoutTool/taste/taste.js";

rate(document.querySelector(".page.active-page"));
// → { score, grade, bands, weakest, covered, read, of }
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
  tiles reported spending 11% of a 3440 screen while filling it. It spans
  content leaves now. It also had a **ceiling** that charged a full-bleed shell
  for spanning 99% — which is `pad-share`'s complaint taken twice, so the
  ceiling is gone.
- **`frame-gap` and `pad-share` counted painted boxes with no text.** A wall of
  `.wash` swatches has no padding by design and took `frame-gap` to 0.00 on
  every tile wall on the site — the same false positive `rules.js`'s `cramped`
  guards with `bounds[n.i]`. Both now require the box to hold text.
- **`scale` counted DISTINCT gap values**, and this tier's own page measured 25
  and scored zero. Every real page has a long tail of one-off gaps on top of the
  three or four sizes it is built from. It counts the vocabulary now — the
  smallest set covering four fifths of the gaps.
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

**23 agree · 1 disagrees · 6 not applicable.** Every case is live at
[`corpus/`](/framework/ext/LayoutTool/taste/corpus/).

Three design points it forced, each after getting them wrong first:

- **A pair only means something if the left side is actually good.** Unbounding
  `--measure: 52em` changed nothing at any width, because 52em already runs ~117
  characters a line here — the case was comparing two broken layouts. Cases carry
  a `base` that fixes the subject before the break breaks it.
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
  screen however narrow the column under it was. It is the median of per-row
  spans now.
- **`frame-gap` and `pad-share` could not see a stripped layout.** A page carries
  a dozen correctly-padded components and two or three layout tracks, so the
  *median* moved by nothing when every track's inset was removed. Both are
  width-weighted now: a 3440 band with no inset is a bigger mistake than a 200px
  chip with none.
- **The one still open:** `gallery` disagrees on "pinned the body narrow" — the
  break costs `width-used` at 3440 and *helps* it at 390, and averaging the three
  widths washes it out. Either the case should be judged at the width it applies
  to, or the band should be, and that is a decision rather than a bug.

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

## Open

- **`corpus/` validates the ORDER, not the PLACE.** It proves the tier notices
  when a named thing is broken; it says nothing about whether `measure`'s ideal
  band should be 52–68 or 50–70. Ranking against a human's judgement — a set of
  real pages someone put in order — is still the missing half, and it is the half
  that needs a person.
- **One case disagrees**, and it is a decision rather than a bug: a break that
  costs a band at 3440 and helps it at 390 averages out. Judge the case at the
  width it applies to, or judge the band there.
- **`frame-gap` wants splitting by box role.** Chrome and cards are two real
  populations, not noise around one number; a role-aware read would recover
  the weight the bimodal split currently costs it.
- **`lanes` wants scoping away from page chrome.** Measured on a content root
  rather than `.app`, the artefact `ai/2026-08-16/layout-generator-rules/calibration.md`
  describes might resolve into a real signal at a higher weight.
- **The weights are hand-set, never fit.** Six bands were retuned against
  measured data; none of the eleven weights themselves came from anything more
  rigorous than "the tight ones should count for more." A held-out search that
  optimizes weight-to-outcome does not exist yet.
