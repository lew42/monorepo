---
name: layout-design
description: Answer the three sizing questions BEFORE building any page, preview, demo, or dashboard — how wide is the final thing, how big is its preview on the parent, and how does it use a 3440 screen. Load when creating or restyling any page.js or component view, when choosing a preview/card size, when a page "looks awkward / off / cramped", or when measuring/auditing a layout with ext/LayoutTool. Companion to code-architecture (which owns the CSS ladder); this owns the sizing decisions.
---

# Layout design

Every awkward page on this site got awkward the same way: markup was written
before its **size** was decided. Answer these three questions — one sentence
each, in the plan, before the first factory call. The vocabulary is
`core/Page/Page.css` (page tracks, preview cards) and `framework.css`
(grid/flex utilities); nothing here requires new CSS.

**Before writing one, look at it: `/framework/ext/LayoutTool/library/`.** Eleven
arrangements the site is built from — reading column, reading grid, tile wall,
gallery, stat strip, rail + content, list · detail, section band, dashboard row,
wide table, toolbar — each with its declaration, a live render, and its score at
400 / 1280 / 1920 / 3440 measured on the page as it renders. **The ten
don'ts are beside them** (`library/bad/`), each naming the rule it trips, the
width where it stops working, and the entry that replaces it. Copy an entry
before inventing one; the catalog is the answer to most of this file.

## 1. How wide is the thing itself — one column, or 2+?

`.page.standard` puts every child in the `main` track: `--measure: 52em`,
prose width. That is the right default for reading and the WRONG width for
anything else — a grid, table, or dashboard left in `main` squeezes multiple
columns into prose measure, which is the single most common "displays
awkwardly" bug. Decide, per block:

- **Prose** — `main` track (the default). Never wider. A deliberately narrow
  block: `.measure` (34em).
  ⚠ **52em is not 75 characters on this site — it is 83 to 103**, depending on
  the copy, and `measure` reports the high end. Measured in Montserrat at every
  width (the em box scales with the root font, so the ratio never moves). The
  ceiling that is safe for *any* copy is about **42em**; `38em` gives ~75. The
  house track straddles the 85 mark, which is why the rule fires on some prose
  pages and not others — **the token is the finding, not the page**, and
  changing it is a site-wide type decision.
  `ext/LayoutTool/knowledge/characters-per-line.md`.
- **2+ columns of content** — claim `wide` (main + breakout, grows rightward).
- **A wall, board, or full experience** — claim `bleed` (edge to edge; hand
  the gutter back with `padding-inline: var(--gutter-x)` if framed content).

One left edge, always: `main` and `wide` share their start line and spare
width is spent rightward — wide blocks extend, nothing re-centers.

## 2. How big is its preview on the parent?

The parent's `previews()` wall is `auto-fill minmax(--column: 14em, 1fr)` —
every card gets one ~14em track unless it claims more: `.two` (2 tracks),
`.tall` (double thumb), `.big` (both), via `card:` on the page. A dashboard
row (`ext/ai`) is the other shape: full row, one per item.

- A preview answers **one question at a glance** — "what is it" or "where's
  it at". Title + thumb, or title + one line. No code, no tables, nothing
  that scrolls.
- Size by **importance to the parent page, not by how much content exists**.
  A major child earns `.big`; a peer among twelve stays one track.
- A `preview()` override reaches every caller (day dashboard AND topic wall),
  so build it on `preview_card()` + a thumb — one shape that reads in a
  linear list and a card grid. Bespoke row markup reads wrong in one of them.

## 3. Does it actually use 3440?

Widescreen space gets **used** (unstacked), not left as gutters — the prime
objective. But don't hand-craft responsiveness from 300px to 4000px: pick a
real `--column` and let one auto grid do it.

- **Tiles/cards**: `--column: 14–22em` on a `.grid.auto` → 4+ columns at 3440,
  still sane on a laptop. `1fr` as the track maximum is correct here — a card
  stretching to fill is fine.
- **Content/reading columns**: bound the track at **both** ends.
  ```css
  grid-template-columns: repeat(auto-fill, minmax(min(34em, 100%), 38em));
  ```
  ⚠ **Do not use `.grid.auto` with a large `--column` for prose.** `.grid.auto`
  is `minmax(min(--column, 100%), 1fr)`, and `1fr` is *unbounded*: the moment
  the container only fits one column, that column takes the entire width. A
  `--column: 40em` reading grid measured **112 characters a line at 1280px** —
  this exact advice used to live here, and `ext/LayoutTool` failed a test case
  built from it. `1fr` is for tiles; prose needs a ceiling.
- **Full-row items** (dashboard rows, feeds): keep the row, and give its
  INSIDE places — identity | detail | figures — so width turns into legibility
  instead of a 3000px line of crammed text. ⚠ **The inside has to be able to
  stack too**: as a fixed three-track grid this laddered at 400 with the detail
  column crushed to 16px. `flex-wrap` plus a `20em` basis is the same three
  places above ~34em and one column below, with no breakpoint written down.
- **Rail + article uses a laptop and wastes a mega monitor** (measured: 18% of
  3440). The site's answer is a **third** region — that is the whole difference
  between the Document and Docs layouts, and it is a checkbox, not a rewrite.
- **Widening a column is never the fix for dead space.** It trades a
  `dead-space` medium for a `measure` high, and one of those is content nobody
  can read. What each shape actually uses of 3440:
  `ext/LayoutTool/knowledge/widescreen.md`.

**Check four widths: 400, ~1280, 1920, 3440.** ⚠ **1280 is not decoration** —
half of the recorded failures are clean at 400 *and* at 1920 and broken in
between, because an unbounded reading track only fails in the band where it
holds ONE column (roughly 1100–1300px here). A layout shipped unseen at 3440 is
unfinished; one shipped unseen at 400 is usually the one that ladders.

## Measure it — `ext/LayoutTool`

Don't eyeball it, and don't spend a vision model on it. The tool reads the
browser and returns a grade, ranked findings, and a proposed declaration for
each. **No AI at runtime**; vision was used only to calibrate the thresholds.

```js
import { analyze, rate, frame } from "/framework/ext/LayoutTool/LayoutTool.js";

analyze(document.querySelector(".page.active-page"));   // what is BROKEN
rate(document.querySelector(".page.active-page"));      // how GOOD it is
frame("/framework/styles/layouts/grid/", 3440);         // any url, any width
```

**Ask both, and expect them to disagree.** `analyze()` reports failures, so a
page with nothing wrong scores 100 and two clean pages are indistinguishable —
useless the moment you are *choosing* between layouts. `rate()`
([`taste/`](/framework/ext/LayoutTool/taste/)) grades eleven ideal ranges with
weights — measure, padding against what a box that size should have, gap,
alignment, repetition, how much of the width got spent — and pays partial
credit, so it can rank. Its `weakest` three are the shortest useful answer to
"what would I change first". ⚠ It proposes no fix and rings no element; a rating
ranks, only a rule repairs.

From a terminal, the same module through Playwright (installed **globally** —
never add it to `package.json`):

```js
await page.evaluate(async () => {
    const m = await import("/framework/ext/LayoutTool/LayoutTool.js");
    return m.analyze(document.querySelector(".app"));
});
```

Or just open the pages: **`/framework/ext/LayoutTool/library/`** is the catalog
and the don'ts, every entry measured at four widths as it renders;
**`/framework/ext/LayoutTool/audit/`** ranks every framework page worst-first
and shows a **before/after** pair of live frames for each proposal;
**`/framework/ext/LayoutTool/tests/`** runs the 16-case corpus at a width of
your choosing; **`/framework/ext/LayoutTool/taste/`** is the rulebook itself,
eleven live bands with the evidence behind each number.

⚠ **A tab an agent drives is a HIDDEN tab, and hidden tabs do not lay out.**
No `requestAnimationFrame`, no `ResizeObserver` delivery — so anything a page
sizes from those is frozen, and `getBoundingClientRect()` hands you the frozen
number with no error. It cost half an hour on `styles/layouts/space/`, where
five screens that should have measured 390–3440 all read 4184px and scored
identically. Check `document.visibilityState`; use `mcp__site__shot` or headless
Playwright when you need real geometry.

⚠ **`frame()` was clamped to the host window** by `framework.css`'s
`iframe { max-width: 100% }` reset — a 3440 run from a 1920 browser measured
1920 and labelled it 3440. Fixed in `LayoutTool.css`; **any wide number you find
recorded from before that fix is suspect**, including the corpus's and the
audit's 3440 columns. Headless Playwright at a real viewport was never affected.

**Read the finding, then fix the cause.** Every issue names a ratio and the
element that failed it — `cramped` is text-to-frame over font-size, `measure` is
characters per line, `escape` is overflow over parent width. The proposed
declaration is a starting point, not the fix: it treats the symptom on one
selector, and the cause is usually one rung up (a missing `min-width: 0`, an
unbounded track, a `.flow` inside a card).

**When it disagrees with this file, check the measurement.** It has been right
once already — the `1fr` correction above came from a test case built out of
this skill's own advice.

**Before adding a rule or arguing with one**, read
`framework/ext/LayoutTool/knowledge/false-positives.md`. Eight classes of box
make a sound measurement meaningless (inline, `display: contents`, scrollers,
deliberate crops, full-bleed shells, code, scaled miniatures, pseudo-element hit
areas), and every one of them was a real bug in the analyzer first.

**Three findings you can discount, and one silence you cannot.** Read these
before "fixing" a report:

- **An `alignment` cluster at one repeated offset is padding**, not a wobble.
  Divide the offset by the box's font size — if it lands on `0.5`, `0.6`,
  `0.75` or `0.8em`, that is the container's own inset and the finding is the
  tool's. (`knowledge/alignment-vs-padding.md`.)
- **`dead-space` needs four text blocks over 20 characters**, so it reports a
  full-width *table* as 13% used, and cannot see a hero or a toolbar waste any
  width at all.
- **`pad-scale` stops at 85% of the viewport**, and `gutter` measures against
  the font size — so a 3300px band with a 20px inset passes both. That one is a
  hole, not a pass.
- **A clean score is not proof.** Vertical overflow of a box whose `overflow` is
  `visible` trips no rule at any width; the detector for it is `sweep()`.
  (`knowledge/blind-spots.md`.)

**For the CSS itself — where a declaration belongs, which layer, container or
item, token or rule — load the `css-strategy` skill.** The long form, with live
examples the analyzer measures as they render, is `/framework/styles/rules/`:
cascade, proportion, nesting, robust, reuse.

## The one-line versions

- **Every track needs a floor AND a ceiling.** One bound instead of two is
  nearly every layout that breaks at an unchecked width: `1fr` with no ceiling
  ran 128 characters a line at 1280, `minmax(0, 18em)` with no floor collapsed
  to 62px at 400. `min(x, 100%)` is the floor that cannot overflow; `minmax(0,
  …)` and `min-width: 0` are the same declaration in two syntaxes.
  `ext/LayoutTool/knowledge/bounds.md`.
- **A scroller cannot live in a wrapping row** — a flex line sizes to its
  content, so `overflow-y: auto` has nothing to do once the row wraps. Where
  two panes genuinely want their own scrollbars, **all three** boxes declare it,
  so the row scrolls when wrapped and the panes scroll when they are not.
- **Constrain the container, never the items.** A property on a leaf must be
  unset on every exception; a property on a container is overridden by the one
  child that wants out.
- **Padding has two floors** — the text's font size (legibility) and the box's
  own width (composition). `padding: clamp(0.75em, 3.5%, 3.5em)` clears both.
  20px is fine on a 240px card and looks off on a 1000px one.
- **A block in normal flow containing blocks in normal flow cannot break.** Six
  departures are what does: `min-width: auto` on a flex/grid item, an unbounded
  `1fr` maximum on a reading column, leaving the flow, a chosen `height`,
  `overflow: hidden` with no scrollbar, negative margins.
- **`.page.full` zeroes the padding AND the measure**, and the page title is
  rendered outside your `content()` — so a full-width page with a gutter
  declares the two tokens rather than taking `full` and adding padding back.

## The click-through ladder

Glance → card → page. Each tier answers one more question than the tier
above; detail lives only at the bottom.

- **Glance** (a thumb on a grandparent): a count, a status, a miniature.
- **Card** (the parent's wall or dashboard): identity + one state line.
- **Page** (the thing): everything — full prose, tables, replays, code.

If a card needs a scrollbar, a second font treatment, or three stat lines to
fit, it is carrying page content — push it down a tier. If reaching the
detail takes three clicks through pages that each add nothing, a tier is
empty — remove it.

## Vertical rhythm — two systems, never mixed in one box

- **`.flow`** is the owl: `* + *` margins off one em token (`--flow: 2em`),
  so a heading's gap scales with the heading. For stacked **prose** — pages,
  articles, readmes. `.page` already is one.
- **`flex v` + `gap`** is the component stack: `div.c("flex v gap")
  .style("--gap", ".4em")` is the whole adjustment. For **UI** — cards,
  lists, meters, panels.
- Never `flow` inside a card or UI cluster — flow's heading gap resolves
  against the heading's own font-size and once sat a card title 72px under
  its icon (the comment in `styles/sections/features.js`).
- **One rhythm per container.** When siblings are different kinds — a meter
  strip, a card list, prose — each kind is ONE box with its own internal
  rhythm, and the page's flow spaces the boxes. "Broken rhythm" is almost
  always two systems interleaved in one parent, or a list whose items change
  shape mid-run.
- **A page shows each thing once.** A dashboard of the children AND a
  `previews()` wall of the same children is the same content twice — keep
  the one that answers the page's question, delete the other.

## Type inside a block

- Pick a type level (`h1`–`h4`, body, `code`) — never invent a font-size.
  Hierarchy inside a card comes from **weight and `muted` color at one
  size**, not from stacking `small` on `h4` — two sizes plus two casings in
  one card is the "two fonts" smell.
- Numbers meant to be compared get `font-variant-numeric: tabular-nums` and
  a consistent unit style (`231k tokens`, `12% window`), value first, label
  muted.
- "One styled text crammed in" is the tell that a block never chose its
  audience: decide what the reader is deciding (which task? is it done?
  where do I click?) and give each answer its own aligned place — not one
  concatenated line of dots and abbreviations.
