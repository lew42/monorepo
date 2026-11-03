# read.js — measurement notes

## Scaling and ratio overview
The eleven quantities of `ranges.js`, derived from one probe model. Arithmetic only — no DOM, no judgement, exactly like `ratios.js`.

EVERY LENGTH IS READ AT ITS OWN SCALE. The five shots on the layout-space ruler are a whole 3440 page rendered at 19%, so a 400px column measures 76px and any raw pixel threshold reads every one of them as a sliver. Ratios survive a zoom; `space` and `own()` are what the two absolute measurements use instead.

## Scope lesson: six vs five bands
SIX OF THESE BANDS ASK ABOUT THE PAGE'S CONTENT AND FIVE ABOUT THE LAYOUT AS DELIVERED, and every one of the six was reading the app shell. Handed `.app`, `/framework/` — the best-looking page in corpus — scored worst (49) because `repetition` 0.96 (nav IS identically-classed siblings — correct design charged as wall), plus `slivers`, `depth` and `lanes`, whose own `why` lines already compensated for it.

`region()` answers where reader's content lives; content bands read there, and five geometry bands keep whole root because chrome's padding and gaps are exactly what tool exists to measure.

SCOPE WAS NOT THE WHOLE STORY — two bands this comment used to blame on chrome were never chrome: `measure` read 26 characters from page's card captions and `contrast` 8.38 from 125.7px clock in demo. A stated cause is hypothesis — numbers are finding.

`width-used` STAYS ON ROOT: whether rail leaves gutter is precisely what prime objective asks.

## prose (measure) floor
80, not 120: `styles/layouts/web.js`'s shared blurb is 117 characters, and 120 floor made `measure` unreadable on whole rail it was written for.

AND IT CARRIES `rules.js`'s EXEMPTIONS, all three. This band is that rule read as quantity, and it shipped with rule's arithmetic and one of its three guards — same mistake `frame-gap` made, one file over. Code is authored not wrapped. A cell is column. Text inside box that draws edge is COMPONENT's text (card blurb, chip, stat tile), which rule's own comment called "18–24 legitimately" since written. Unguarded, `/framework/` read 26.1 characters because fourteen 188px captions supplied 70 of 137 prose lines, and one 125px `td` was whole reading of `styles/elements/misc/` at 13.7.

## lines sampling
THE SAMPLE IS COUNTED IN LINES, because line is unit being measured. Gated on BLOCKS, band declined on 55 of 169 pages — three one-line captions passed and one eight-line paragraph did not.

## slivers measurement floor
The one that stays on real content: a 40px `span` inside card is not sliver, it is word.

## depth region measurement
Relative to the CONTENT region, not root, or four levels of app shell counted as page's nesting — which is what this band's own `why` means by "measured from `.app`, this site's pages read 8 and 13–15".

## width-used unified implementation
ONE implementation, shared with `score.metrics()`. Two hand-written answers to "how much of width does content use" disagreed by 200 points.

## measure not counting samples
TOO SMALL A SAMPLE IS NOTHING TO MEASURE, not bad score. `taste.js` already drops band that reads `null` and moves divisor with it — principle was right and nothing enforced it by SIZE, so page with two paragraphs got real, harsh `measure` credit computed off two paragraphs.

Found by ranking site: six `styles/layouts/*` demo pages scored 0% on `measure` and `width-used` while `analyze()` called them fine. They are galleries of miniatures, and `probe.IGNORE` skips demo stage by policy — so almost everything on them is invisible by design, and what was left was caption. `covered` says that honestly; score of 35 did not.

## frame-gap calculation
A box's inset over what box that size SHOULD have — `polish.js`'s own `min(3.5%, 3.5em)`, proportional until box gets wide then flat.

A raw share of width put this range and `frame-gap` in direct conflict on wide band; both were right about different boxes. readme.md, "The second wave".

## lanes measurement
Alignment counted from positive side: how much of page sits on lane at all. `polish.js`'s `alignment` reports near-misses, which cannot say whether page is 90% aligned or 20%.

Over CONTENT region. Measured on whole `.app` this read exactly 1.00 on all eighteen pages of vision corpus — nav and page chrome anchor most boxes whatever content does, which band's `why` already suspected.

## repetition measurement rules
A group of three or more siblings drawn same way, and text just inside one. TWO LEVELS, and that bound is whole rule: unbounded, three top-level bands sharing class mark every word under them and every layout measures 1.00.

A COMPONENT IS CLASSED; A RUN OF BARE PARAGRAPHS IS PROSE. `label()` returns tag alone when element carries no class and no id, so twenty sibling `<p>` in markdown block shared one `sel` and every word of article counted as repetition — how this band came to read median of 0.81 across site against `ok` ceiling of 0.85 and band derived from measured median of 0.23. Band's own wording said "IDENTICALLY-CLASSED siblings" since written; implementation was counting identically-TAGGED ones.

## contrast measurement
THE LARGEST HEADING over median text size — type scale's top and its middle.

NOT `max(fs)`, and difference is one decorative glyph. 125.7px clock inside unmarked Panel demo over 15px median read 8.38 on `/framework/`, and component's oversized numeral read 18.20 at 3440 — arithmetically right, description of demo rather than page's hierarchy. On 165 of 169 pages largest text already IS heading, so naming them changes only four rows.

A character-count floor was tried first and is wrong: page TITLE is short — `h1.page-title` runs 4–9 characters — so threshold that excludes 8-character clock excludes most of site's h1s too, and median fell from 3.42 to 2.36.

NO HEADING IS DECLINE, not zero. `polish.js`'s `hierarchy` is rule that reports page with no h1; band with no hierarchy to measure has nothing to say.

## on_scale (gap coverage)
How much of page's spacing comes from FOUR SIZES IT USES MOST — 4px buckets, because 12 and 13 are one decision made once.

THIS WAS A COUNT, AND A COUNT OF THIS SHAPE MEASURES THE SAMPLE. "How many sizes cover four fifths of gaps" rises with how many gaps there are: drawn from one page's OWN gaps, it read 7.6 → 11.0 → 13.8 → 15.2 → 17.0 as sample went 25 → 50 → 200 → 400 → 888 on `ext/Panel/`, and roughly doubled on every page tried. Across corpus it ranked pages 0.55 with their gap count. Page holding nineteen component demos therefore scored zero for being large. Share is same question asked so it converges — same page reads 0.74 → 0.66 → 0.61 → 0.60 → 0.58 over that sweep, flat by n=100.

FOUR, from band it replaces: `2–4 is scale someone chose`. And ideal floor is old definition's own `four fifths`.

## inset/pad-share measurement
Padding, averaged with each box weighted by its own width.

A plain median hid thing these two bands exist for: page carries dozen correctly-padded components and two or three layout tracks, so stripping every track's inset moved median by NOTHING — caught by `corpus.js`'s "took padding out". 3440-wide band with no inset is bigger mistake than 200px chip with none, and weighting by width is cheapest way to say so.

## frame guards (cramped, tables, text outside box)
A TABLE CELL'S INSET IS ROW RHYTHM, NOT CRAMPED CARD. `rules.js`'s `cramped` has exempted cells since written — `framework.css`'s `th, td { padding: 0.25em 0.75em }` is every table on site, and counting it produced 175 identical findings on one page. Band inherited measurement not exemption, so page whose only tight box was ordinary table read at half credit while `cramped` fired zero times on it. Two must agree about what defect is.

TEXT OUTSIDE A BOX IS NOT NARROW INSET, it is overflow — and `escape`, `clipped` and `unreachable` already own it. Unguarded, shell holding absolutely-positioned or overflowing descendant reported frame gap of **−235**, which then became page's 10th percentile and took healthy page to zero credit on defect it didn't have. Band should decline to answer question not its own.

AND A FRAME GAP CANNOT BE NEGATIVE. Between −1 and 0 guard let rounding through as measurement, and band's site-wide minimum was **−0.01** — tenth of pixel of subpixel drift, printed as padding. Text at or past edge is gap of zero.

## tightest frame gap percentile
THE TIGHT END, not average: tenth percentile of frame gaps on page.

Averaged — even weighted — this band SATURATED: over 120 layouts it separated best rolls from worst by 0.01, because page's mean inset is fine while one box is touching. Two bands were also saying same thing twice, since `pad-share` already measures typical inset against what box that size should have. So this one asks question tool was built for — how close does TIGHTEST framed box get — and two stop being redundant.

Tenth percentile rather than minimum, because one decorative outlier should not be whole reading.
