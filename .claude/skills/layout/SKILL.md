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
2. **How big will it be?** Its width at 400 / 1280 / 1920 / 3440. One column, or 2+? Two
   or more columns of *content* **never** live in `main` — claim `wide` or `bleed`. This is
   the single commonest failure: a grid, table or dashboard squeezed into 52em.
3. **What is its own layout?** Prose → `.flow`. A row of UI → `flex gap` (+ `wrap`). Tiles →
   `.grid.auto` with a real `--column` (14–22em) so 3440 gets 4+ columns. Reading columns →
   bound both ends: `repeat(auto-fill, minmax(min(34em, 100%), 38em))`.
   ⚠ What the flex vocabulary cannot say: every flexible word (`.flex.auto`, `.all-1`, `.three`, `.flex-1`) sets `flex-grow: 1`, so free space always splits evenly — there is no word for a fluid track twice its neighbour. Two Figma wireframes needed a 2:1 seam and both ship an inline `flex: 2 1 30em`; the per-child `--column` workaround decays 2.00 → 1.17 across widths (`styles/layouts/wire/doc/bento.md`).
4. **How many containers can the page have?** Usually two or three regions. A page shows
   each thing once — not a dashboard *and* a wall of the same children. Nested pages
   (`children:` inside a region) count.
5. **What is its preview on the parent?** One question at a glance — title + thumb or one
   line; size by importance (`.two`, `.tall`, `.big`), not by how much content exists. A
   preview is a picture, never a live instance.

## The two bounds rules

- **Every track needs a floor and a ceiling.** `1fr` alone keeps its content minimum and
  overflows at 400; `minmax(0, 18em)` alone collapses. `min(x, 100%)` is the floor that
  can't overflow; `minmax(0, 1fr)` and `min-width: 0` are the same fix in two syntaxes.
- **Widening a column is never the fix for dead space** — it trades dead space for an
  unreadable measure. Add a region, or a column, or accept the gutter.

## Rhythm — one system per box

`.flow` for stacked prose (the page already is one); `flex v gap` for UI stacks. Never
both in one box, never `flow` inside a card.

## Look at it, then cycle

Close the dev rail and stop editing before you measure — open, it displaced `.app` 272px
and manufactured the top finding on 12 of 24 page-widths. Four widths: **400, 1280, 1920,
3440** — 1280 is where an unbounded reading track fails alone. Headless Playwright or
`ext/DesignTool`: `analyze()` = what is broken, `rate()` = how good, `frame(url, 3440)` =
any page at any width. Read the finding, fix the cause one rung up (a missing
`min-width: 0`, an unbounded track, prose in `main`). Then back to question 1.
⚠ `scrollWidth === clientWidth` proves only that nothing overflows *horizontally*: the homepage passed it with 4549px of bands inside a 284px `flex-1` region of a `page full fill` shell — seven bands invisible, no symptom. Also check the content region's `scrollHeight <= clientHeight` (or that the document is what scrolls), scoped to regions INSIDE the layout — `div.pages` is the SPA's own scroller and reads 24× at 400 legitimately. An odd width (1440) found it when 400/1280/1920/3440 all missed.
⚠ Counting a wrapped row by distinct `Math.round(rect.top)` is wrong under `v-center` — centred children of different heights get different tops on the SAME line (the homepage topbar read as 3 lines at 1920; it is 1). Two children are one line when their vertical ranges OVERLAP.

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
