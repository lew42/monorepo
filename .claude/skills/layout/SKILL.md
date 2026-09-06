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
   ⚠ On a page with `initialize(){ this.catalog(); }`, `content()` lands in a child `intro` page inside `.page-catalog-pages`, so `wide` claims the DETAIL column, not the region — 591px at 1280 on `/framework/styles/elements/code/`, and Q1 answered before looking was wrong by 2×.
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
   `.grid.auto` with a real `--column` (14–22em) so 3440 gets 4+ columns. Reading columns →
   bound both ends: `repeat(auto-fill, minmax(min(34em, 100%), 38em))`.
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

⚠ A demo OF a size token must be measured against the box it will actually live in, not the
box you drew it in — the one-line check: is the demo box wider than the token it demonstrates?
2026-08-19: a `--measure` card built two 470px panes, the 40em cap never bit (the routed page
was 545px, not the 965px assumed), both states were identical and the card taught nothing.

## Spacing and bleed — the 3440 rules (the owner, 2026-09-01)

- **Spacing is a ramp × a level, never a constant.** With no override, `.pad`/`.gap`/`.flow`
  read `--pad-default` / `--gap-default` / `--flow-default`, and every element derives those
  three from framework.css's three ramps (`--pad-ramp`, `--gap-ramp`, `--flow-ramp`) × its
  `--spacing` level (`spacing-tight` 0.6 · regular 1, no class · `spacing-airy` 1.6). Each
  ramp holds its 1280 floor to the pixel and about doubles by 3440 — pad 16.5 → 70px, gap
  15 → 46px, flow 30 → 54px. A theme retunes a RAMP, never a default (the `:where(*)` rule
  re-derives a default underneath it). The columns host scales `--page-column-pad-x/y` with
  its row (`cqi` — bar, heads, items and prose share one indent). A hand-typed `1em` on a
  container that can be wide is the smell; the flat-em era is what made every audit find 3440
  cramped. The numbers, and the alternatives they beat:
  [/imagine/design/spacing/decision.md](/imagine/design/spacing/decision.md) — 2026-09-05,
  superseding the 2026-09-01 clamps this section used to quote.
  ⚠ A component's own constant is the other half: `gap: 0.6em` becomes
  `calc(var(--gap-ramp) * 0.6)` (a section-scale gap, 2em and up, takes `--flow-ramp` × N/2),
  so the multiplier IS the old em number and only 3440 moves. A CONTROL's padding is never
  converted — `--pad-ramp` is a % of the containing block and would put 52px a side on a chip.
- **`bleed` is for PAINT.** A background image or wash may butt its container. A framed
  box — a card, a figure, a table — or bare text NEVER bleeds: "CLOSEST REAL MISS" sat
  0px from the viewport edge on a bled card wall, on the padding study page itself
  (2026-09-01). Cards ride the padded track (`wide` in a page grid, plain flow in column
  prose — its pad now scales); `previews()`/`walls()` pay the gutter back for exactly this.
- **Column prose has a measure.** `.page-column-prose` caps p/headings/lists/`.md` at
  `--measure` — a `full` study column rendered its intro 3410px wide. An `.md` holding a
  TABLE compresses instead of overflowing: mark that one call `.ac("wide")`.
- **The approved set is closed.** Five layouts, named, with the contract that locks them:
  [/imagine/design/layout/approved/](/imagine/design/layout/approved/). A new page picks
  one by name; a sixth is a proposal for the owner, never a commit.

## The two bounds rules

- **Every track needs a floor and a ceiling.** `1fr` alone keeps its content minimum and
  overflows at 400; `minmax(0, 18em)` alone collapses. `min(x, 100%)` is the floor that
  can't overflow; `minmax(0, 1fr)` and `min-width: 0` are the same fix in two syntaxes.
- **Widening a column is never the fix for dead space** — it trades dead space for an
  unreadable measure. Add a region, or a column, or accept the gutter.

## Rhythm — one system per box

`.flow` for stacked prose (the page already is one); `flex v gap` for UI stacks. Never
both in one box, never `flow` inside a card.
⚠ **A wall or grid dropped into flowed prose keeps the FLOW's rhythm** — its entrance and exit
margins ride `--flow`, not its own flat `--gap`. In a 1,166-box crawl of every `/imagine/` realm
at 1280 + 3440, the only three neighbour-spacing jumps over 2.5× with no legitimate reason in the
whole site were one bug of exactly this shape: `.page-previews`' hardcoded `--gap: 0.8em` beside
the surrounding `.md.flow`'s `--flow: 2em` — a 10.8px wall margin against 27.1px of paragraph
rhythm, read live off both boxes (2026-09-05, `/imagine/design/spacing/`).

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
⚠ Counting a wrapped row by distinct `Math.round(rect.top)` is wrong under `v-center` — centred children of different heights get different tops on the SAME line (the homepage topbar read as 3 lines at 1920; it is 1). Two children are one line when their vertical ranges OVERLAP.

⚠ A grid can be the RIGHT HEIGHT and still leave the fold white: `min-height: 100%` sizes
the GRID while `align-content: start` leaves its one ROW content-sized — together they left
54% of a 1080 screen empty under a composition that had already fitted (container 1048, row
487; the same fault three times in one lab, 2026-08-30). After Q2, read back the child row's
height as well as the container's, and say whether the leftover was wanted.

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
