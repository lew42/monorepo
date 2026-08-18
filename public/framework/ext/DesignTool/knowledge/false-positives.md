# What not to flag

## A container reported as touching its own text — the walk's own depth cap (2026-08-16, confirmed and fixed)

The most consequential one yet, because it manufactured `gutter: **high**` on
three panel pages whose glyphs sit **60px+ from every edge**: `ext/editor/`
(56/F), `ext/files/` (66/D) and `ext/Panel/` (21/F).

**`walk()`'s `depth = 20` drops the element children of any node at depth 20.**
Nothing then marks that node *blocky*, so `read_text()` hands it a text block
aggregated from every descendant's `textContent`, and `text_bounds()` reports
**the node's own content box** as its nearest text — **a 0px gap from a box to
itself.**

⚠ **It is not a scroll-overflow cull — `walk()` has none — and it is not the
4000-node cap**, which no page on this site reaches (largest: 1686 nodes). Both
were confidently proposed; `m.nodes.length` refuted both in one call. The
fabrication also propagates: on `ext/files/` the flagged region is at depth 16
and *clean*, and the fabricated block is a `div.file-dir` **below** it, whose
bounds land 0.5px past the region's edge — so the node the rule names need not be
the node that was cut.

**The guard, in `probe.js`:** the cull records itself on the container
(`nodes[parent].cut = true`, for `depth` and `max` alike) and `read_text()` skips
a cut node. *A container whose children the walk dropped is not a text block,
because the tool never measured one.* Site-wide: 328 of 336 page-widths
unchanged, 8 moved, every change a removal; `gutter: high` 9 → 3.

⚠ **The guard stops the invention; it does not restore the sight.** `ext/Panel/`
still has **566 nodes — a quarter of its tree — that no audit has ever walked**,
and at `depth: 200` they are not clean (16 high findings). Only 5 of 168 pages
are affected at all (791 of 70 121 nodes, 1.1%), but `depth: 20` is demonstrably
below this site's real DOM depth of 28. Raising or dropping it is a RULE#1 call —
it moves every score on a nested page — and the numbers are in
`ai/2026-08-16/mastermind-layout/gutter.md`.

**The general shape, and it is new to this file:** every other entry here is the
tool *measuring the wrong box*. This one is the tool **measuring a box it never
looked inside** and reporting the result as if it had. Any truncation in the walk
— depth, node cap, a future budget — must record itself where the truncation
happened, or a later pass will silently mistake absence for structure.

## Two more, found by repairing the site's worst pages (2026-08-16)

Both were caught by an agent sent to *fix* the pages they fire on — which is the
only way this class gets found, because a rule looks equally right from the
outside whether it is correct or not.

- **`whitespace` on a page whose subject is a stage — confirmed.**
  `/web/layout/screens/` reports **93.5% empty**, and `probe.js`'s own `IGNORE`
  list is why: it excludes `.demo-screen`, so the page's entire subject is
  invisible to the walk and what remains genuinely is empty. `probe.js`'s comment
  already names the trade-off — *"a page whose whole subject is a stage looks
  nearly empty"* — so the tool documents the cause and then fires anyway.
- **`invisible` on a wall of preview cards — likely.** `/web/layout/respond/`
  trips it because `Page.css`'s `page-preview-thumb` cards are **deliberately
  bare** and the rule counts unpainted groups. Flagged rather than asserted.

**The shape, and it is now three for three with `taste/`'s `mostly_picture`:** a
rule that consults `IGNORE` for what to **walk** but not for what to **conclude**
will fire on exactly the pages the ignore policy blinded it to.

Every entry here was a real bug **in the analyzer**, found by running it against
this site and reading the output. A layout rule that cries wolf on the common
case is worse than no rule: it trains the reader to skim past the column the
real findings are in.

The pattern is always the same — a measurement that is meaningful for a plain
block is meaningless for some other box, and the site has hundreds of that
other box.

## Boxes that report no box

- **A non-replaced `inline` element has `clientWidth: 0`.** Every child then
  reads as escaping a zero-width parent. Highlighted code inside a `<pre>` —
  one `span.hljs-*` per token — produced *hundreds* of these on one page.
- **`display: contents` has no box at all**, same result. One wrapper on the
  Doc page reported its two children as "1280px outside a 0px parent".

Both are handled by one predicate, `boxed()`: `display` is neither `inline` nor
`contents`. `inline-block` and `inline-flex` do have real boxes and stay in.

⚠ **`boxed()` has to be applied at both ends, and to every rule.** The same
`div.tabs.block` wrapper was **360 of the site's 371 `zero-size` findings** —
a rule reading "a box under 1px still holding text" and meeting a box that is
absent on purpose — and, as a *child*, its 0×0 rect at the origin read as its
parent's entire gutter escaped. Three rules and two ends, one predicate: check
it whenever a rule asks a node for its size.

## ⚠ THE TOOL MANUFACTURED ITS OWN TOP FINDING (2026-08-17, fixed)

**Opening the dev rail created a `high · gutter` on `.pages`, and it was the tool's
number-one finding on half the pages it was pointed at.** With the rail as the only
variable across 24 page×width pairs: rail closed → **0** `gutter` findings on
`.pages`; rail open → the finding on **18 of 24**, and the TOP finding on **12**. Its
highlight ring covered 79% of the viewport, which is what "a report item highlights
the whole page" looked like from the outside.

The mechanism is one expression. `gutter`'s "is this the shell?" test was
geometric — `n.w < m.viewport.w - 2` — and `framework.css` gives `.app` a
`padding-inline-end` the width of the rail, so with the rail open `.pages` measures
1648 of a 1920 **window**, clears the test by 270px, and stops being recognised as
the shell. It now compares against **the root's own content width** (`cw` less its
inline padding), which is the number the rail's own readout has always shown.

⚠ **The committed baseline could not move, and that was VERIFIED rather than
argued.** Re-measured across the 53 rows that could possibly change — every row in
`findings.json` that carried a `gutter` finding, every row whose `pad_em` was null,
plus a 1-in-13 control — `gutter` changed on **0** rows, and the root's content width
equalled the window on **53 of 53** (headless means rail closed, no inline padding on
`.app`, and no document scrollbar, so the two expressions are the same arithmetic).
Two rows moved by one and two findings each, both on DesignTool's own pages, whose
content this same task edited.

**The general rule this is an instance of: a measuring instrument must not appear in
its own measurement.** `probe.IGNORE` already covers `[data-layout-ignore]` and
`live.js` marks its own panel with it for exactly this reason — what nobody had
checked is that the rail changes the SHELL's geometry, not just adds a box to it.

## A finding about the page has no element to ring (2026-08-17, fixed)

`dead-space` and `invisible` are statements about the whole page, so they issue
against `m.nodes[0]`, whose `path` is `""` — and `address.js` resolves an empty path
to the root. The ring therefore came out **3440×1440, covering 100% of the
viewport**, and only intermittently, because both rules are gated at
`viewport.w < 1500`: 0 of 42 top-3 findings at 1280, 5 of 42 at 3440.

**The fix is no highlight at all** — an affordance that rings everything has told you
nothing, and an affordance that lies is worse than an absent one. All three consumers
(`report.js`, `live.js`, `dev/DevBar/layout.js`) now skip the ring when a finding's
path is empty. ⚠ The DevBar's `where()` still rings the root deliberately, and
should: that is a *target* readout, not a finding.

## The app shell is not the page — six bands were reading the chrome (2026-08-17)

`taste/rate()` and `score.metrics()` are both handed `.app`, which on this site is
a 228px nav rail plus the page. **Every band whose subject is the page's CONTENT
was measuring the rail as well**, and two of them said so in their own `why` lines
without anyone acting on it: `depth` ("measured from `.app`, this site's pages read
8 and 13–15 … because four of those levels are chrome") and `lanes` ("PARTLY AN
ARTEFACT: the nav and page chrome anchor most boxes whatever the content does" —
its band was set to 0.75 instead of the measured 0.85 to compensate).

`ratios.region()` has answered "where does a reader's content live" since it was
written, and `score.metrics()` was using it for exactly one field. The scope now
splits by what a band is *about*:

| reads the content region | reads the whole root |
|---|---|
| `measure`, `contrast`, `repetition`, `slivers`, `depth` | `frame-gap`, `pad-share`, `gap-share`, `scale`, `width-used` |

Chrome's padding and gaps are exactly what this tool exists to measure, so the
geometry bands keep the root. `width-used` keeps it too, and deliberately:
whether the rail leaves a gutter is what the prime objective asks. `depth` is
measured *relative* to the region, or the fix would only shift the reading.

Measured over the eighteen-page vision corpus at 1280: `depth` min 2→4, median
10→8, full credit 7/18→12/17; `lanes` max 1.00→0.99, full credit 18/18→15/17
— it had been paying full marks to every page on the site.

⚠ **AND THE TWO BANDS THIS WAS SUPPOSED TO FIX DID NOT MOVE.** The brief said
`measure` read 26 characters on `/framework/` because 14 nav labels dragged the
prose under the floor, and that `contrast` read 8.38 because the median font size
included 10px chrome. **Both are false, and measuring said so.** `contrast`'s
numerator is a **125.7px** clock (`div.panel-t-time`) inside a Panel demo carrying
no `data-layout-ignore`, over a median of **15px** — an ordinary body size, not
microtype. `measure`'s population never contained a nav label at all: `prose`
requires >80 characters and a nav label is 4–10. It reads 26.1 because twenty
`p.page-preview-desc` card blurbs at 188px wide outvote three `p.md` at 782px, and
`by_line` weights by *lines*, so the captions win on lines too. Both remain open in
`ideal-ranges.md`, because both need a band re-derived rather than a mechanism
corrected. **A stated cause is a hypothesis; the numbers are the finding.**

## A component's text is not the page's prose (2026-08-17)

The third form of "the tool measuring the wrong box", and the one this file's own
counter-rule almost hid: `taste`'s `measure` band is `rules.js`'s `measure` rule
read as a quantity, and it **shipped with the rule's arithmetic and one of the
rule's three exemptions.** Everything below is a box the module had already
learned about somewhere else:

- **A table cell is a column, not a broken paragraph** — the entry three sections
  down says so, `rules.js` acts on it, and `read.js`'s own `frame-gap` calls
  `in_cell()` twelve lines from the band that did not. One 125px `td` running
  **13.7 characters over 8 lines** was the whole reading of
  `styles/elements/misc/`; 17 `td` blocks supplied 53 of 213 prose lines on
  `framework/ui/`.
- **A card blurb, a chip and a stat tile are the component's text.** The rule's
  own comment has said "18–24 legitimately" since it was written and nothing
  enforced it for the band: fourteen `p.page-preview-desc` captions supplied
  **70 of `/framework/`'s 137 prose lines**, so the line-weighted median landed
  among them and the site's front door reported **26.1 characters** — while its
  actual reading column runs 45–75.

The guard is one predicate: **text whose own box draws an edge, or whose parent's
does, belongs to that box.** ⚠ Self or parent, never an unbounded walk — `.app`
paints, so every word on the site is inside a frame eventually.

⚠ **Two candidate guards were measured and REJECTED, and the failures are the
useful part.** A width-relative cluster ("the widest half of the prose") is
width-invariant and picks the main column correctly — and on a page whose only
text IS captions it reads the captions, taking `/notes/` to 24.1. A **line-clamp**
guard fixes that page and throws away `framework/ai/`'s genuine **258-character**
log lines at 3440: a clamp says a block is a fixed-size summary, not that its
lines are the right length. **The property that matters is whose text it is, not
whether it was truncated.**

## A count of distinct things measures the sample (2026-08-17)

Not a wrong box at all — a wrong *statistic*, and the first of its kind in this
file. `taste`'s `scale` asked **how many 4px gap sizes cover four fifths of the
page's gaps**, which sounds like a property of the page and is a property of how
many gaps you looked at. Subsampled from one page's own gap population,
`ext/Panel/` read **7.6 → 11.0 → 13.8 → 15.2 → 17.0** at n = 25, 50, 200, 400,
888. Every page tried roughly doubled, and across 168 pages the reading ranked
**0.551 (Spearman)** with the page's gap count — so `framework/ui/`, nineteen
component demos on one page, scored zero for being large.

The fix is the statistic's dual: **the share of the gaps that come from the four
commonest sizes**, which converges — the same page reads 0.74 → 0.66 → 0.61 →
0.60 → 0.58 over that sweep, flat from n=100.

⚠ **The general test, and it is cheap: resample the page's own population and see
whether the number moves.** A statistic that changes when you show it more of the
same page is not measuring the page. A count of distinct categories is the classic
offender; a share of a total is not.

## Length does not separate an ornament from a title (2026-08-17)

`contrast` is `max(font-size) ÷ median(font-size)`, so one decorative glyph set
it: a **125.7px** clock (`div.panel-t-time`, 8 characters) inside a Panel demo
carrying no `data-layout-ignore` read **8.38** on `/framework/`, and the same
shape read **18.20** at 3440.

The obvious guard is a character floor, and **it is wrong in a way that only
measuring shows**: a page TITLE is short. `h1.page-title` runs **4–9
characters** across this site, so any threshold that excludes an 8-character clock
excludes most of the site's h1s — the site median fell from 3.42 to **2.36** and
the 25th percentile from 2.70 to **1.17**. A character-weighted 95th percentile
was worse (median 1.17).

**The tag is the discriminator.** On **165 of 169 pages the largest text is
already a heading**, so reading `h1`–`h6` changes four rows and removes both
outliers. A page with no heading declines — `polish.js`'s `hierarchy` is the rule
that reports a missing h1.

## A run of bare paragraphs is prose, not a repeated component (2026-08-17)

`repetition` groups siblings by `probe.label()` — tag plus its first three classes
— and `label()` returns **the bare tag** for an element with no class and no id. So
twenty sibling `<p>` inside a markdown block shared one `sel`, formed a "group of
three or more identically-classed siblings", and every word of an article counted
as a repeated component. The band's own wording in `ranges.js` has said
**IDENTICALLY-CLASSED** since the day it was written; the code was reading
identically-TAGGED, and nothing compared the two.

The band was derived from a *measured* site median of **0.23** (p10–p90
0.09–0.42) and was reading **0.84** — which is itself the tell: when a band's
readings sit nowhere near the population it was calibrated on, suspect the
measurement before the threshold. One line (a group's `sel` must carry a `.` or a
`#`) took it to median 0.56, max 0.81, and pages outside its own `ok` range from
8/18 to 1/17. No threshold moved.

## Measurements taken against the wrong thing

- **A text block's own bounds must be its CONTENT box, not its border box.**
  Using the border box makes every padded element sit `0px` from its own frame:
  `div.wash.pad` carries a 1em pad and reported as text butting the edge.
- **One `max(font-size)` across a subtree measures the wrong text.** A card's
  14px caption gap divided by its 45px heading reads as cramped. Each edge
  carries the font size of the text that actually *reached* it.
- **A scroller's content is meant to exceed its box.** Measuring a code block's
  inset reported the text 105px *outside* its own frame. A box that scrolls is
  exempt from inset rules on the axis it scrolls.
- **A clipping ancestor must clamp bounds before they propagate.** Otherwise a
  scrolled region hands its parent the extent of everything it hides, and
  `.app` reports its nearest text 4915px outside itself.

## Counts that are not counts

- **Distinct rect tops is not a line count.** An inline `<code>` or `<sup>`
  sits on the same visual line at its own top, so a paragraph with five inline
  spans reports five extra lines. A 650px paragraph came out at "23 characters
  per line" — and *every prose page on the site* read as a broken column.
  Cluster rects by vertical centre with a tolerance of ~0.55 of a line.
- **`<option>` rects are not layout.** A `<select>`'s options reported as
  1100px past their parent, at 1719% overflow. Skipped at the walk.

## Scale accumulates; a computed style does not

**`getComputedStyle(el).zoom` reports the element's OWN zoom, not the zoom it
inherited.** A button inside a `0.25×` demo stage reads as scale 1 while its
rect is a quarter size — so every control in every miniature on the layouts
pages reported as a 6px tap target. **3231 of them**, across 115 of 116 pages.

The fix is a forward pass: nodes are pushed in preorder, so
`escale = parent.escale × own scale` in one loop. Rules that care about the
*screen* (`illegible`) multiply by it; rules that care about the *design*
(`hit-size`) divide by it. A control inside a miniature is a picture of a
control, and the design under it may be perfectly fine.

## Two exemptions the tap-target rule cannot do without

Both come from WCAG 2.5.8 itself, and between them they were worth thousands of
false positives:

- **A link inside a sentence is sized by the line**, not by anyone's choice.
  The spec exempts it explicitly; so does this rule (`display: inline`).
- **A control whose `::after` is stretched over its card has a hit area its own
  rect knows nothing about.** `.page-preview-link` is 105×13 with an `::after`
  covering the whole card — the anchor's rect understates the real target
  tenfold. Pseudo-elements are invisible to `getBoundingClientRect`, so the
  probe asks the style system directly: `getComputedStyle(el, "::after")` with
  `content` set and `position: absolute` means the target is larger than it
  looks.

## A demo is a picture of another layout

The single largest source of noise on this site, and the one the tool cannot
reason its way out of: **`ext/demo`'s stage simulates a different viewport at a
different zoom.** Measuring its contents as part of the host page compares two
viewports and calls the difference a bug.

Left in, the layouts pages reported **460–502 high findings each**, and
`illegible` fired **7173 times** — all of it 3px text inside 0.25× miniatures
that have a zoom control directly above them.

There is no intrinsic difference between "a deliberate miniature" and "text
someone shrank by mistake": both are a `zoom` on an ancestor. So the tool is
**told**, by selector — `probe()`'s `IGNORE` default covers `.demo-screen`,
`.demo-sims`, `.page-preview-thumb` and anything carrying
`data-layout-ignore`. To audit a demo, point the tool at the demo's own render
at its own width.

⚠ This is the one guard that is a *policy*, not a measurement. Everything else
here is the tool learning to read geometry correctly; this one is a decision
about scope, and it is reversible by passing `{ ignore: "[data-layout-ignore]" }`.

## A table is not a stack of cards

The 854-measurement crawl of 2026-08-15 found **3277 of 3414 `cramped` findings
on `tr`, `td` and `th`**, and **173 of 203 high `measure` findings inside a
cell**. Neither is a layout anyone can fix, because a table's insets do not live
where the rule is looking:

- **A `<tr>` draws a border and holds no padding** — the cell's padding is the
  row's inset, so measuring the row reports a declaration that would have no
  effect. Same for `thead`, `tbody`, `table`. All exempt.
- **A cell's vertical padding is row rhythm, not a frame gap.** 4px on 16px text
  is `0.25×` — under the rule's 0.35 floor and identical on all 175 cells of one
  page. Cells stay in **at the touching band only** (`< 0.08×`), which still
  catches the `padding: 0` table the rule was written for.
- **A narrow cell is a column, not a broken paragraph.** The `measure` ladder
  branch already said so in a comment — "a card description, a table cell and a
  stat tile all run 18–24 legitimately" — and nothing enforced it. Now the
  branch skips anything inside a cell, ancestors included.

## One component is one declaration

Not a misreading — a **counting** error, and it distorts a score the same way.
`input.layout-range` is 60×17 wherever the layout panel puts it, and `hit-size`
reported it **437 times across 71 pages** for a single CSS line. A finding is
worth one entry per *thing an author would change*:

- **Identical selector at an identical size collapses**, count carried
  (`distinct()` in `rules.js`).
- **The same structure repeated collapses**, wherever it repeats. The old
  roll-up only merged siblings of one parent, so a row drawn three hundred times
  — each offender the only child of its own row — never merged at all:
  `div.ai-line` × 300 on one dashboard, **`span.sidebar-label` × 2504
  site-wide**, from one `Sidebar` declaration. `repeats()` in `DesignTool.js`
  now groups by rule × selector after the sibling pass.

## Deliberate is not broken

- **A negative margin is a request to overlap.** Stacked avatars tripped the
  collision rule three times on the framework index.
- **`max-height` + `overflow: hidden` is a crop, not a clip** — preview thumbs
  and line-clamped descriptions. Only the *vertical* axis gets this exemption:
  sideways clipping is essentially never deliberate, and when it is, the box
  scrolls.
- **A line clamp is a crop with no `max-height` to show for it.** The exemption
  above tested `max-height` alone, and `p.page-preview-desc` clamps to two lines
  with `max-height: none` — so every inline `<code>` that landed on line three
  reported as high-severity content cut off, **12 of the site's 79
  `clipped:high` findings**. The probe now reads `-webkit-line-clamp` directly
  and `crops()` is the two facts together.
- **A full-bleed shell is a background, not a frame.** `.app` spans the
  viewport, so its "edge" is the window's and text touching it is the design.
  Skipped when width ≥ viewport width.
- **Code is exempt from line length.** A code line is authored, not wrapped:
  short lines are the author's choice and long ones are what the horizontal
  scrollbar is for.
- **18–24 characters a line is normal for UI.** Card descriptions, table cells
  and stat tiles all live there. Laddering means *two words a line over five
  lines* — under 12 characters — not merely "narrow".

## A threshold is a curve, not a line

The first version of every rule was a single number, and every one of them was
wrong in the same direction: **87 characters a line and 300 characters a line
were reported identically.** Each rule now states three thresholds and the
magnitude picks one. Across the site that moved `measure` from 238 high findings
to 5 — the same pages, honestly ranked.

Then the opposite failure, immediately. Adding a second tier — alignment,
proportion, hierarchy — produced **987 near-miss alignments, 362 illegible
labels, 488 padding complaints across 120 pages**, and grades collapsed to
`F:106 D:11 C:3 A:1`. Every page equally condemned is no ranking at all.

Three corrections, each a general lesson:

- **A sub-pixel difference is not a misalignment.** Browsers land fractional
  edges everywhere; 1.5px found noise, 3px finds wobbles.
- **Size alone does not make text illegible.** A 10px label is a label; a 10px
  paragraph is a problem. The low tier needs real text behind it.
- **Cap a whole TIER, not just each rule.** Five rules capped at 25 still sum to
  125. The polish tier is now capped at 15 points together, so a layout that is
  merely unpolished cannot score like one nobody can read.

## A metric that only moves in steps is not a measurement

`chars ÷ lines` looks like characters per line and is not. It can only change
when the **line count** changes, so a paragraph reported an identical **112.3 at
1207px and at 941px** — both happen to wrap to three lines. The number sat
perfectly still while its box shrank by a quarter, which in a live readout looks
exactly like a bug in the readout.

The fix is to measure something continuous. **Total inked rect width ÷ characters
is the font's real average advance**, and it does not depend on wrapping; line
width ÷ that advance is a true characters-per-line that moves with every pixel.
The same paragraph now reads 158.4 → 126.8 → 96.2 → 91.8 as the window narrows.

⚠ The general form: **if a metric is a ratio of two integers and one of them is
small, it is quantised.** Check that it moves before trusting it to rank
anything.

## The window that is safe depends on the relationship

`alignment` only reports **near misses**, 3–12px, because a wider gap is
usually a deliberate second column — and at any looser setting it fired 987
times. But that window made it blind to a page title sitting 32px left of its
own body text, which is a misalignment at any size.

The resolution is not a looser threshold; it is a **narrower relationship**.
`heading-offset` takes an unbounded window by only ever comparing a heading to
**its own next block sibling**, where two columns are not a possible explanation.
Same measurement, different scope, one-tenth the noise.

⚠ It missed its own motivating case first time round, because it skipped
heading-over-heading as "hierarchy's problem" — and the real pair was a page
*title* against the `h2` inside the offending wrapper.

⚠ **AND "THE TEXT BLOCK DIRECTLY BENEATH IT" WAS NOT THE NARROW RELATIONSHIP IT
CLAIMED TO BE** (2026-08-17, fixed). The rule sorted every text node on the page
by `y` and paired a heading with whatever came next — which on a structured page
is a different element entirely, and it was wrong in both directions at once. On
`/framework/`, whose alignment is fine, it fired on the first card TITLE under a
section `h2` (42px: the card's own padding, inside a frame the reader can see) and
on an `li` under an `h2` (17px: a list's marker indent). Meanwhile
`/web/layout/flow/`'s `h1` sat **194px** left of the content it heads and fired
nothing, because the offset cleared the 2–96px window's ceiling — an escape that
only ever existed to survive the wrong pairing, and which is now gone. Two changes
make the wide window genuinely safe:

- **The heading's next block SIBLING**, in the same containing block. Not a
  y-sort. In both false positives the sibling's box started at *exactly* the
  heading's x; only something nested inside it was inset.
- **The LEFTMOST drawn box inside that sibling**, descending past boxes that
  paint nothing and hold no text of their own — a `.bleed` wrapper legitimately
  starts *left* of the heading — and stopping at anything with text, a frame, a
  list, or nothing below it. A frame explains the inset inside it; a list's indent
  is its own convention.

Across the eighteen-page vision corpus: **7 findings on 6 pages → 1 finding on
1 page**, and the one is the 194px step. `ai/2026-08-17/tier-calibration/`.

## A centered toolbar is not the heading's next line — FIXED 2026-08-17, and the fix is not the one below

⚠ **Read this heading before the section under it.** The diagnosis below is
correct and the conclusion it reaches — "the rule stays silent at 720 and 1280 by
coincidence of arithmetic, not because the relationship changed" — was exactly
right, and it understated the problem: the 96px ceiling was hiding a real 194px
defect on `/web/layout/flow/` at the same time. The fix was **not** an exemption
for `.demo-tools`. It was to correct the pairing (next block *sibling*) and to
measure to the **leftmost** drawn box inside it rather than the first in document
order — see "The window that is safe depends on the relationship" above. A
justified row's first child is wherever the justification put it, so document
order never had a claim to being where content begins.

⚠ And there was a second, sharper form of the same bug that only appeared once
the pairing was fixed: `probe.IGNORE` empties a demo stage's subtree by policy, so
a **559px-tall stage sitting exactly on the heading's lane** offers nothing to
land on, and a first-in-order descent slid sideways into the control row beneath
it — reproducing the identical `button.demo-btn` finding on six pages at
158–325px. **A box with nothing under it IS the thing that is drawn**, whether it
drew that itself or the walk was told not to look; that is why the descent stops
at a leaf. The historical diagnosis follows.

### The original diagnosis (2026-08-17, `ai/2026-08-17/shared-heading/`)

`heading-offset` compares a heading only to the flow node **directly beneath
it** ("The window that is safe depends on the relationship", above) — a
relationship narrow enough that a same-column reading pair is the only
explanation, which is what lets it use a wide 2–96px window. `ext/demo`'s own
toolbar breaks that assumption. `.demo-tools` centers its device
buttons (`.demo-devices`) on the **stage's** width (`stage.css`'s `1fr auto
1fr` grid, or the single centered column below its `34em` container query),
not the page's — and when the stage is `.bleed` the two edges are unrelated
by construction: the heading sits in the page's own gutter inset, the toolbar
centers on the full bleed width. Confirmed on 20 `ui/*` pages plus `web/
layout/tracks/` — every page that opens with `demo.exhibit()`/`demo.layout()`
as its first content, so the flagged node is always the same button
(`button.demo-btn`, the "mobile" device toggle) at the same offset, 19.2px,
and only at 390 wide. At 720 and 1280 the identical centering math puts the
same button 181px and 325px from the heading — past the rule's own 96px
"deliberate indent" ceiling — so the rule stays silent there by coincidence of
arithmetic, not because the relationship changed. Screenshots (390 and 1280,
three pages): `ai/2026-08-17/shared-heading/screenshots/`.

A reader sees a left-aligned title and, under it, a centered row of pills —
an ordinary toolbar, identically centered at every width, never once read as
a paragraph that drifted off the title's column.

The shape is one level up from boxes ⑨–⑪: not *the wrong box*, but **the
wrong relationship** — `.demo-tools` is chrome the stage owns, never the
reading flow the heading introduces. No selector-based `IGNORE` was ever
asked to say so, because nothing about a centered toolbar looks like the
miniature content `ext/demo`'s existing exemption ("A demo is a picture of
another layout", above) already covers.

## An index is not an address

Node paths must be `:nth-child()` chains, **and they are relative to the
analysis root.** Two separate bugs came from getting this wrong:

- A **walk index** shifts when a page's content arrives asynchronously, so every
  issue points at the wrong element on the next load.
- A **page-relative path resolved against `.app`** finds a real element at the
  wrong address. The before/after mirror cloned the sidebar and captioned it
  "cramped card" — a wrong answer that looks exactly like a right one.

The report carries `root_path` for this reason. Anything resolving a node path
later must find the same root first.

## The rule this suggests

When a rule fires more than a handful of times on a page a human would call
fine, **the rule is wrong, not the page.** Every entry above was found that
way, and the ratio is stark: the first full-site run produced ~5,600 findings,
of which about 4,300 were one rule misreading one kind of box.

Before adding or defending a rule, check whether the box it measures is one of:

1. **inline** — no `clientWidth`
2. **`display: contents`** — no box at all
3. **a scroller** — content is meant to exceed it
4. **a deliberate crop** — `max-height` + `overflow: hidden`
5. **a full-bleed shell** — its edge is the window's
6. **code** — authored lines, not wrapped ones
7. **scaled content** — a miniature is a picture, not a design
8. **a stretched hit area** — a pseudo-element the rect cannot see

9. **a table** — the row cannot hold the inset and the cell is narrow on purpose
10. **a repeat** — one component drawn forty times is one declaration
11. **a box the walk was cut short inside** — its `textContent` is real and its
    structure is missing, so it reads as one flat run of prose
12. **a centered control strip** — a toolbar's own centering math, not a
    paragraph drifted off its heading's column, even when the numbers land in
    the window built to catch the latter
13. **a component's own text** — a card blurb, a chip, a stat tile, a cell: text
    inside a box that draws an edge is that box's, and 18–24 characters a line is
    correct for it

And one that is not about a box at all:

14. **a statistic that grows with the sample.** Resample the page's own
    population; if the number moves, it is measuring how much you looked at.

Those fourteen cover every false positive found so far. Ten of them ask *is
this box the kind I think it is*; the eleventh asks *did I actually look*; the
twelfth asks *is this the heading's own text, or chrome that merely sits near
it*; the thirteenth asks *whose text is this*; and the fourteenth asks *is this
a fact about the page, or about my sample of it*.

⚠ **And check the arithmetic, not only the geometry.** Removing the four
score-affecting classes above moved the site median from **66 to 79** and F
grades from 269/854 to 61/854. The ranking the tool published before that was
mostly authored by its own bugs — which is the strongest argument in this file
for reading raw output against a page a human would call fine.

## And the counter-rule

Not every mass finding is a false positive. `measure` fired **1333 times across
95 pages** and every sample checked was real — the site genuinely runs prose at
95–130 characters. Two independent vision models said the same thing about the
same pages before this tool existed
(`ai/2026-08-14/vision-report/report.md`), and a third confirmed it afterwards
from a screenshot.

The test is not "how many", it is **"does a sample survive being looked at"**.
Pull three instances and check them by hand before deciding either way.
