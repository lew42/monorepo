# What not to flag

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
  site-wide**, from one `Sidebar` declaration. `repeats()` in `LayoutTool.js`
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
`heading-offset` takes the wide window (2–96px) by only ever comparing a heading
to the text block directly beneath it, where two columns are not a possible
explanation. Same measurement, different scope, one-tenth the noise.

⚠ It missed its own motivating case first time round, because it skipped
heading-over-heading as "hierarchy's problem" — and the real pair was a page
*title* against the `h2` inside the offending wrapper.

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

Those ten cover every false positive found so far.

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
