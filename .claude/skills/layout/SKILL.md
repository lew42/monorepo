---
name: layout
description: Invoke before building or restyling anything with a size — a page, a container, a card, a grid, a dashboard — and again when a page looks cramped, squeezed, or wastes the screen. Five questions, answered in one line each before the first factory call. Reference; re-invoke when stale. Measuring is ext/DesignTool; the CSS itself is the css skill.
---

# Layout

Every awkward page here got awkward the same way: markup written before its **size** was
decided. Answer these five, one line each, before the first factory call — and again after
you look at it, because the second pass is where it gets right.

## The five questions

A component inside a container — a rail section, a card, a panel — answers 1 and 3;
2, 4 and 5 are the container's, already decided. A page answers all five.

1. **What container is this going in?** A page's `main` track (prose width, `--measure`),
   `wide` (main + breakout, grows rightward), `bleed` (edge to edge) — or a card, a rail, a
   panel. The container decides your width, gap and rhythm; you inherit, you don't fight.
   ⚠ On a page with `initialize(){ this.catalog(); }` — and on EVERY `ext/Doc` module page, which never writes that line but is a catalog all the same (a `.rail` inside a Doc's detail column measured 168px, 2026-09-17) — `content()` lands in a child `intro` page inside `.page-catalog-pages`, so `wide` claims the DETAIL column, not the region — 591px at 1280 on `/framework/styles/elements/code/`, and Q1 answered before looking was wrong by 2×.
   ⚠ Under a COLUMNS host there is no page grid at all — content sits in `.page-column-prose`, so `wide` is meaningless (`grid-column: auto`) and only `bleed` reaches the edge. Walk `chain()` for the columns host before choosing a track word; `/imagine/` became a host mid-flight and a stage answered Q1 wrong by 2× (2026-08-29). And 3+ levels deep, `width: "large"` shares evenly with default-width ancestors (both `flex: 1 1 0`) — `fill` is the word that actually claims the leftover at any depth (measured: three `large` columns landed 565px each; the leaf on `fill` got 1184px, 2026-08-30). ⚠ The other half: `fill` is `flex: 1 1 100%` with no ceiling, so it ALSO claims the leftover from a column opened UNDER it — a `fill` Research front took 1928px and squeezed the topic and its verdict to their 288px floor (2026-09-04, twice). `fill` is for a LEAF; a page whose children open beside it wants `large` until the columns rule lets `fill` yield to an open child.
2. **How big will it be?** Its width at 400 / 1280 / 1920 / 3440. One column, or 2+? Two
   or more columns of *content* **never** live in `main` — claim `wide` or `bleed`. This is
   the single commonest failure: a grid, table or dashboard squeezed into 52em.
   ⚠ Anything above the first nav element also needs its HEIGHT budgeted — a hero band's
   ceiling is a FOLD budget, so it belongs in `vh`, not `vw`: a `26vw` band was 894px at
   3440, tallest exactly where the page had no more vertical room, and pushed the nav below
   the fold at every width; `clamp(13em, 30vh, 30em)` held one fold at 400/1920/3440 alike
   (2026-08-30).
   ⚠ **Keep the bleed reachable.** Every page and section must be able to opt in to the
   space it sits in — `wide`/`bleed` on the child — and a container that caps its children
   (a `--measure`, a fixed track) takes that away from everything nested inside it. Beside
   a sidebar or a rail the "bleed" is not edge to edge: it is *all the room left*, padded —
   which is `wide` (left edge on the title's axis, the rest rightward), not `bleed` + `pad`
   (that re-pads from the region edge and the rail drifts off the axis). 2026-08-19: a
   vertical tab rail was capped at 78em, so no sub page under it could bleed; the rail
   now takes `wide` (`ext/tabs/tabs.css`).
3. **What is its own layout?** Prose → `.flow`. A row of UI → `flex gap` (+ `wrap`). Tiles →
   `.grid.auto` with a real `--column` (14–22**rem** — a wrap floor is a real length; in `em` it
   scales with the viewport type, and `14em` was 182px at 400, two tiles narrower than their own
   labels, 2026-09-17) so 3440 gets 4+ columns. Reading columns →
   put the ceiling on the WALL (`max-width: calc(38em * N + gaps)`) with `1fr` tracks under it,
   not on each track: `repeat(auto-fill, minmax(min(34em, 100%), 38em))` computes its column
   count from the track's MAX when that max is definite, so it silently fits fewer columns than
   the floor would allow — measured 2 of 3 posts fitted, one dropped, at 1280 (type-color-study,
   2026-09-17).
   ⚠ The tile wall's "3440 gets 4+ columns" assumes a container that WIDENS with the viewport —
   a page inside a Miller-columns pane does not (a `large` column caps ~535px at 1280 and
   ~1152px at 3440, set by the column token, not the browser), so the wall wraps to one or two
   tracks and is TALLER than the list it replaced: `/imagine/platform/`'s nine verdicts measured
   2254 → 2714px at 1280 (+20%) and 2389 → 2601px at 3440 (+9%), and were reverted (2026-09-05).
   Same host, same trap as Q1's "under a COLUMNS host there is no page grid".
   ⚠ A 2:1 seam is `--grow: 2` on the child — `.flex.auto > *` reads `flex: var(--grow,1) 1 calc(var(--column) * var(--grow,1))` (shipped 2026-08-18; exact 2.000 at all widths, `styles/layouts/cols/doc/indictment.md`). What the vocabulary still cannot say: a CEILING on a flexible track (a 32% aside holds its ratio and hits 1010px at 3440 — `cols-main-aside` caps it), and the wrap threshold is `em`, which on this site is a viewport clamp — the same 460px box is two columns at a 400 viewport and a stack at 3440. Floors belong in `rem`; only a rail belongs in `em`.
4. **How many containers can the page have?** Usually two or three regions. A page shows
   each thing once — not a dashboard *and* a wall of the same children. Nested pages
   (`children:` inside a region) count.
5. **What is its preview on the parent?** One question at a glance — title + thumb or one
   line; size by importance (`.two`, `.tall`, `.big`), not by how much content exists. A
   preview is a picture, never a live instance.
   ⚠ Under a columns host one child is previewed at TWO widths at once — a wall card (`--column: 14em`) and the narrow rail item (`--rail-card, 11em`) in the nav column beside it — so a `description:` that fits the wall's two-line clamp still clips in the rail. ≤ 45 characters survives both (measured 2026-09-04: 55 clipped, 49 fit).

**Every choice you make between alternatives is a `decision` line in your `task.jsonl`** — the
question, the options you really considered, the one you chose, why, and the rule (`layout#<section>`)
that produced it — so the owner can Approve or Improve it on your task's Decisions tab, and an
Improve comes back here as a line in [`improvements.md`](improvements.md). Each of the five
questions above is one such choice. Shape and example: [`ext/JSONL`](/framework/ext/JSONL/).

⚠ A demo OF a size token must be measured against the box it will actually live in, not the
box you drew it in — the one-line check: is the demo box wider than the token it demonstrates?
2026-08-19: a `--measure` card built two 470px panes, the 40em cap never bit (the routed page
was 545px, not the 965px assumed), both states were identical and the card taught nothing.

## Spacing and bleed — the 3440 rules (the owner, 2026-09-01)

- **Under `--gap` there are four RUNGS, and a multiplier is no longer allowed** (2026-09-17): `--gap-70` `--gap-50` `--gap-35` `--gap-25` (the number is a percent of `--gap`), with `.gap-70` / `.gap-50` / `.gap-35` / `.gap-25` as the classes. `calc(var(--gap) * 0.4)` becomes `var(--gap-35)`; above the gap there is no rung, that is `--flow`; under a quarter of the gap you are sizing a control, which stays in its own `em`. Painted live, with the census the five rungs were fitted to: [/framework/styles/system/](/framework/styles/system/).
- **Spacing is one knob, never a constant.** `:where(*)` sets `--pad` / `--gap` / `--flow` from
  framework.css's clamps × `--size`, and `.size-small` / `.size-regular` / `.size-large` set that
  knob to 0.75 / 1 / 1.5 — the ladder, the numbers and the control rule:
  [/framework/styles/system/studies/size/](/framework/styles/system/studies/size/).
  ⚠ **A spacing clamp is space BETWEEN and AROUND content — never the size OF a control** (2026-09-06).
  Convert a container's own constant to the nearest RUNG above (`gap: 0.6em` → `var(--gap-70)`,
  not `calc(var(--gap) * 0.6)` — multipliers stopped being allowed on 2026-09-17, two bullets up; a
  section-scale gap, 2em and up, takes `--flow` × N/2). Never convert a control's own
  dimensions — a chip's, button's or nav item's padding, its height, or the gap between its
  own icon and its own label. Those stay in the control's `em`. `× N` is NOT "N em with a
  little extra at 3440": `--gap` equals 1em only at its floor and is pinned at its 2.6em
  cap above ~1400px, so `× 1.3` is 3.38em at 3440 — and `--pad`, a % of the containing
  block, put 90.7px of padding on a nav row. A homepage nav item reached 67.6px tall this way, and
  a `vw` clamp is the same thing in different clothes — `clamp(0.45em, 0.6vw, 1.1em)` on the paging
  toolbar made it 130.7px of chrome at 3440. If the rule sizes a control, it gets neither.
- **`bleed` is for PAINT.** A background image or wash may butt its container. A framed
  box — a card, a figure, a table — or bare text NEVER bleeds: "CLOSEST REAL MISS" sat
  0px from the viewport edge on a bled card wall, on the padding study page itself
  (2026-09-01). Cards ride the padded track (`wide` in a page grid, plain flow in column
  prose — its pad now scales); `previews()`/`walls()` pay the gutter back for exactly this.
- **Column prose has a measure.** `.page-column-prose` caps p/headings/lists/`.md` at
  `--measure` — a `full` study column rendered its intro 3410px wide. An `.md` holding a
  TABLE compresses instead of overflowing: mark that one call `.ac("wide")`.
- **The approved set is closed.** Five layouts, named, with the contract that locks them:
  [/layouts/doc/studies/approved/](/layouts/doc/studies/approved/) (moved from
  `/imagine/design/layout/approved/`, 2026-09-18). A new page picks one by name; a sixth is
  a proposal for the owner, never a commit. That page's own **library**, below the five, is
  a live list of real pages the owner has pressed Approve on — from that page's own `?`
  control (`ext/Ask`'s `mount({ url: this.url })`, 2026-09-18) or from
  [/layouts/browse/](/layouts/browse/) — so a page judged today shows up there today, not
  only in the five shapes.

## Content scale follows the box (the owner, 2026-09-06)

- **Small columns never get large content; a massive container is careful with tiny content.**
  Written down because we make this mistake too often: a 3440 section dropped into a column, a
  hero in a rail, a one-line chip wall alone in a 3440 band. Before placing anything, say the
  box's width range and the content's natural range in one line; if they do not overlap, the
  placement is wrong before any CSS is.
- **Some boxes grow, some cannot.** A stack takes endless content; a hero, a viewport-height band,
  an equal-height card row or an inner-scroll rail does not — say which yours is, and for a bounded
  box say what happens to content that is longer than it (scroll, clip, truncate) before you fill
  it. Wrapping layouts misalign at awkward counts: prove one with 1 · 2 · 3 · 5 · 7 items.
  ⚠ **`auto-fill` picks its column count from the track's max width, blind to how many cards
  there are** — a wall with a KNOWN, fixed count (six cards, say) still lands on an awkward last
  row this way (five columns, one card alone — measured twice the same night on two different
  pages, /layouts/practice/catalog/ and /layouts/shell/, 2026-09-17); write the counts out instead,
  a ladder of container-query divisors (1/2/3/6 for six cards) with the ceiling on the COLUMN, not
  the wall. **A wall whose count is genuinely unknown, small or variable wants `auto-fit`, never
  `auto-fill`** — `auto-fill` reserves a track for every column that could fit even with nothing
  left to put in it, so five real cards in an `auto-fill` row can fill only ~60% of a wide row and
  leave the rest blank (confirmed three separate times: 2026-09-01, 2026-09-17, 2026-09-19 —
  swapping the one word to `auto-fit`, nothing else, fixed all three). Only a control row takes
  `flex wrap`.
- A layout is proven for a **range**: above its ceiling it holds its measure and centres, never
  stretches; below its floor it stacks to a named 1-column fallback. Say the range when you pick
  one, and prove a new one at 400 / 1000 / 2000 / 3440 and the widths between.
  ⚠ "Holds its measure and centres" only holds when the WHOLE page centres — a capped region
  centred alone while a sibling region above or below it stays left (at its own `--measure`) reads
  as two misaligned columns with ~800px of grey between them, every numeric check passing. Centre
  a capped layout only when it is the only region, or when every region around it centres too
  (type-color-study, 2026-09-17).

## The two bounds rules

- **Every track needs a floor and a ceiling.** `1fr` alone keeps its content minimum and
  overflows at 400; `minmax(0, 18em)` alone collapses. `min(x, 100%)` is the floor that
  can't overflow; `minmax(0, 1fr)` and `min-width: 0` are the same fix in two syntaxes.
- **Widening a column is never the fix for dead space** — it trades dead space for an
  unreadable measure. Add a region, or a column, or accept the gutter. And when the brief also
  says USE the wide screen, the answer is a region that can SPEND the leftover, given more
  content — the Reader practice layout had 1,860px of grey between its article and its own notes
  at 3440 with every numeric check passing (2026-09-17).

## Rhythm — one system per box

`.flow` for stacked prose (the page already is one); `flex v gap` for UI stacks. Never
both in one box, never `flow` inside a card.
⚠ **A wall or grid dropped into flowed prose keeps the FLOW's rhythm** — its entrance and exit
margins ride `--flow`, not its own flat `--gap`. In a 1,166-box crawl of every `/imagine/` realm
at 1280 + 3440, the only three neighbour-spacing jumps over 2.5× with no legitimate reason in the
whole site were one bug of exactly this shape: `.page-previews`' hardcoded `--gap: 0.8em` beside
the surrounding `.md.flow`'s `--flow: 2em` — a 10.8px wall margin against 27.1px of paragraph
rhythm, read live off both boxes (2026-09-05, `/framework/styles/system/studies/spacing/`).

## Boxes, padding and contrast (the owner, 2026-09-17)

**Are the siblings more similar or more different?** Worth asking before giving anything a
ground. Options and alternatives — things the reader chooses between — could each take a box of
their own so the set reads as a choice; siblings that are roughly equal, or whose relation is
unknown, are usually better left alone. A suggestion, not a rule. (the owner, 2026-09-17)

**Does this thing need a box — a background different from its parent's?** If yes, it needs
padding by definition — **the one-line rule: a page region takes `.pad`, a framed box takes
`.card`, a control or row keeps its own `em`.** A region's pad scales with the page, a card's
scales with itself, a control's scales with its own text — three different reasons, three
different words, never `.pad` on a card (it sits pinned at a 1em floor inside anything
narrower than ~1292px, the padding audit measured, `/framework/ai/2026-09-19/card-word/`).
`.card` in framework.css carries its pad automatically, so a fill with text jammed against
its edge — a box with no padding, which is a stain, not a box — can no longer happen by
forgetting a second class. If the answer is no, it probably needs no padding at all. Padding
with no background change floats the thing in midair, off the margins its siblings line up
with — the commonest way a page looks "off" with nothing obviously wrong in it.

**Say the ratio out loud for every text-on-ground pair you introduce** — 4.5:1 carries body
text, 3:1 carries large text and UI shapes, below that nothing — because you cannot see 4.2
from 4.6. The accent is the pair most likely to fail: its saturation decides whether it can
carry text at all, and at some hues draining the saturation changes nothing while at others
it changes everything. [/framework/styles/system/studies/color/](/framework/styles/system/studies/color/) paints it and reads
it back live, `--lighten-1/2/3` and `--darken-1/2/3` on five grounds.

**Before the first factory call, answer these in a line each** — the owner's own list, and we
are making a system for more things, not one thing, so each answer is a rule: **layout** (the
shape) · **navigation** (in and back out) · **structure** (what contains what) · **visual
hierarchy** (what goes where, and what is loudest) · **iceberg UX** (the surface stays minimal,
the depth one click down, never deleted) · **color** (which grounds, which ink, which accent —
with the ratios) · **focus** (what the eye lands on first) · **interaction** (what a person can
do here) · **purpose and outcome** (why it exists, what the reader leaves with). An answer you
cannot write is a decision you have not made yet.

## Nesting, grounds and padding — suggestions, not laws (the owner, 2026-09-18)

Two ways to nest, and both are fine. Nesting on the same ground — indent only, as a tree or a
navigation list does — is often the cleaner choice for a simple list. Nesting with a separate
background can make a nice visual hierarchy, lists within lists, and then the box wants padding,
or the text rides the seam between the two grounds. Whether siblings are flush (a zero-gap
stack) or spaced, and how their size and scale step down, is what tells a reader how related
they are — a decision tree of alternatives could use either; there is no rule for which.
One thing worth counting on a phone: each box with its own ground adds a level of padding from
the viewport edge, so three nested cards at 400 may leave little room for text — measure it
before choosing (`/framework/styles/system/studies/spacing/nesting/` when it lands).

## Color meets color, and text meets text (the owner, 2026-09-17)

- **Where two grounds meet is a design decision, not a side effect.** White beside light gray, a
  dark band beside a light one, a dark section nested inside a light page (or the reverse) — each
  pairing has its own effect, and the seam between them is where a layout reads as finished or
  not. Before placing a section, say its ground, its neighbour's ground, and whether one is
  nested in the other; the permutations of the site's grounds are painted at
  [/framework/styles/system/studies/color/sections/](/framework/styles/system/studies/color/sections/) — every ordered pairing
  stacked and nested, with the seam's ΔL* and which pairings read as two pages (16) or two sections
  of one page (14).
- **Typography is a relation, not a setting.** Font, size, weight and color decide a piece of
  text only together with every piece of text around it. Say the pair (this heading against that
  paragraph; this label against that heading), not the value.
- **Repetition is the strongest tool.** Lists, and any element that repeats with the same size,
  weight and color, give the eye an anchor: an eyebrow (a small heading above the h1, sometimes
  underlined), an h2 that is heavy with a very small colored line after it (half its size — a
  date, a count, a tag; what it says matters less than that it repeats in the theme color). One
  such anchor per page, kept identical wherever it appears, tends to be enough. One post, three marks,
  measured: [/framework/styles/system/studies/type/anchors/](/framework/styles/system/studies/type/anchors/) — the accent mark
  anchors and the grey one does not, **even though the grey has the higher contrast** (5.4:1
  against 5.2:1). Contrast decides whether a thing can be read; difference decides whether it
  is found.

## Look at it, then cycle

Close the dev rail and stop editing before you measure — open, it displaced `.app` 272px
and manufactured the top finding on 12 of 24 page-widths. Four widths: **400, 1280, 1920,
3440** — 1280 is where an unbounded reading track fails alone. At each width, three
invariants before anything else: **no text or framed box at x:0** (a viewport edge is
paint-only), **no prose past the measure**, **no constant where a spacing token exists**. Headless Playwright or
`ext/DesignTool`: `analyze()` = what is broken, `rate()` = how good, `frame(url, 3440)` =
any page at any width. Read the finding, fix the cause one rung up (a missing
`min-width: 0`, an unbounded track, prose in `main`). Then back to question 1.
⚠ **When a class is retired for a new one, diff the RULES, not just the call sites.** A rebuild
replaced `.paging-box` with `.paging-canvas` and did not carry over `max-width: var(--measure)`,
so every `wide` stage in the realm ran its prose the whole box — 2739px paragraphs at 3440 on 14
pages, no console error, no overflow (2026-09-05). The invariant that fails is a silent one; only
a sweep at four widths finds it.
⚠ `scrollWidth === clientWidth` proves only that nothing overflows *horizontally*: the homepage passed it with 4549px of bands inside a 284px `flex-1` region of a `page full fill` shell — seven bands invisible, no symptom. Also check the content region's `scrollHeight <= clientHeight` (or that the document is what scrolls), scoped to regions INSIDE the layout — `div.pages` is the SPA's own scroller and reads 24× at 400 legitimately. An odd width (1440) found it when 400/1280/1920/3440 all missed.
⚠ An overflow scan needs an EXCLUDE list or it drowns in legitimate matches: skip `.dev-bar`
(sits past the edge by design), skip anything `checkVisibility()` calls hidden (a closed
`<details>` still reports geometry for its `pre`), and skip any element whose nearest scrolling
ancestor already declares `overflow-x: auto|scroll` (a code block, a `figure.site-shot` strip, a
wide `<table>`) — a first honest sweep of 185 urls without this list reported 99 "overflows" that
were all by design; what is left after excluding them is the real finding (critic-3440, 2026-09-08).
⚠ Counting a wrapped row by distinct `Math.round(rect.top)` is wrong under `v-center` — centred children of different heights get different tops on the SAME line (the homepage topbar read as 3 lines at 1920; it is 1). Two children are one line when their vertical ranges OVERLAP.
⚠ `page.screenshot({ fullPage: true })` captures the VIEWPORT ONLY here — the real scroller is `div.pages`, not the document, so the shot looks like a correct full-page capture while the lower half is silently missing (a table and a preview card, gone, nothing warns). To see a whole page: give the viewport the height (e.g. 1920×2400), or scroll `.pages`; never trust `fullPage` on this site (2026-09-08).

⚠ A grid can be the RIGHT HEIGHT and still leave the fold white: `min-height: 100%` sizes
the GRID while `align-content: start` leaves its one ROW content-sized — together they left
54% of a 1080 screen empty under a composition that had already fitted (container 1048, row
487; the same fault three times in one lab, 2026-08-30). After Q2, read back the child row's
height as well as the container's, and say whether the leftover was wanted.

**A permanent `position: fixed` overlay owes the shell the strip it stands on.** A 44px search
bar pinned bottom-centre covered the last row of every full-height layout under it — three card
titles on `/imagine/`, one post title on `/blog/` — and no invariant in the measure cycle catches
it (nothing overflows, nothing throws). The fix that works for a scrolling page and a full-height
columns row alike is `padding-block-end` on `.app`, the same trade `--devbar` already makes on the
inline edge — after adding any fixed overlay, re-measure what sits under it at the four widths
(omnibox-search, 2026-09-06). **An auto-scroll is a decision too, and it can argue against the
demo it is in** — before landing any `scrollTo`/`scrollIntoView`, screenshot the state it leaves
and say what a reader who cannot see the animation reads from it; the readout can say `0px moved`
while the picture says "broken" when something opaque is pinned over the start of the row, and the
picture wins (polish-critic, 2026-09-17).

**Scrollbars are a decision, never a side effect** (the owner, 2026-08-19). The *page*
scrolls; a region scrolls only when it was meant to (a log, a code block, a rail). A
scrollbar you did not ask for means a size was fixed where it should have been auto — a
fixed height on a stack, `overflow: auto` written as a reflex, a floor on a section — or
a child with content the box cannot hold. Before landing, list every `overflow: auto|scroll`
box and every `scrollHeight > clientHeight` inside the layout, and say for each whether it
was wanted; twelve small scrolling boxes is a layout that chose the wrong sizes (a rolled
Panel layout did exactly that in document mode). Avoid them unless desired.

## When you need a shape

The five words a page is built from — `page` `rail` `wall` `stage` `solo` — are
[`framework/styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md).

`/framework/ext/DesignTool/library/` — eleven arrangements, each measured at four widths,
with the don'ts beside them. Open the **one** you need; don't read the catalog.
[`caveats.md`](caveats.md) — what has bitten, one line each. Improve this skill:
[`improvements.md`](improvements.md). Reminders: `css` for the declaration itself;
`new-task` if you haven't; `documentation` when done.
