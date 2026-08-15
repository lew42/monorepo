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

## 1. How wide is the thing itself — one column, or 2+?

`.page.standard` puts every child in the `main` track: `--measure: 52em`,
prose width. That is the right default for reading and the WRONG width for
anything else — a grid, table, or dashboard left in `main` squeezes multiple
columns into prose measure, which is the single most common "displays
awkwardly" bug. Decide, per block:

- **Prose** — `main` track (the default). Never wider: 52em IS the measure.
  A deliberately narrow block: `.measure` (34em).
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
- **Full-row items** (dashboard rows, feeds): keep the row, and grid its
  INSIDE — identity | detail | figures — so width turns into legibility
  instead of a 3000px line of crammed text.

**Check three widths, not thirty: ~1280, 1920, 3440.** If it reads at those
three, the clamps and auto grids cover the rest. A layout shipped unseen at
3440 is unfinished.

## Measure it — `ext/LayoutTool`

Don't eyeball it, and don't spend a vision model on it. The tool reads the
browser and returns a grade, ranked findings, and a proposed declaration for
each. **No AI at runtime**; vision was used only to calibrate the thresholds.

```js
import { analyze, frame } from "/framework/ext/LayoutTool/LayoutTool.js";

analyze(document.querySelector(".page.active-page"));   // this page, now
frame("/framework/styles/layouts/grid/", 3440);         // any url, any width
```

From a terminal, the same module through Playwright (installed **globally** —
never add it to `package.json`):

```js
await page.evaluate(async () => {
    const m = await import("/framework/ext/LayoutTool/LayoutTool.js");
    return m.analyze(document.querySelector(".app"));
});
```

Or just open the pages: **`/framework/ext/LayoutTool/audit/`** ranks every
framework page worst-first and shows a **before/after** pair of live frames for
each proposal; **`/framework/ext/LayoutTool/tests/`** runs the 16-case corpus at
a width of your choosing.

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

**For the CSS itself — where a declaration belongs, which layer, container or
item, token or rule — load the `css-strategy` skill.** The long form, with live
examples the analyzer measures as they render, is `/framework/styles/rules/`:
cascade, proportion, nesting, robust, reuse.

## The one-line versions

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
