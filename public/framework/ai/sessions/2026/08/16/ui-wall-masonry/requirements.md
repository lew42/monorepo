# ui-wall-masonry

**The ask, verbatim (Mike, 2026-08-16):**

> can you use our new masonry layout for the framework/ui/ things?

## What that means

`/framework/ui/`'s Overview draws the nineteen components as `this.wall()` —
`Page.previews()`, a `repeat(auto-fill, minmax(14em, 1fr))` grid with
`align-items: start`. The cards are live component renders of wildly different
heights (a badge row against a table against a timeline), so every row is as
tall as its tallest card and the wall is full of vertical holes — measured
below the Breadcrumbs, Tooltip and Panel cards at 1600.

The vocabulary landed for this in `browse-grids` (same `group: layout`):
`.masonry` and `.packed` in `framework.css`, `pack()` in
`styles/layouts/masonry/masonry.js`.

## Which of the two

**`packed`**, not `masonry`, and the reason is not reading order:

- `stats` declares `card: "two"` (`grid-column: span 2`) and the wall backfills
  with `grid-auto-flow: dense`. `.masonry` is CSS multicolumn — `grid-column`
  is inert there, so the wide card silently narrows.
- `.packed` is a real grid, so the span, the `dense` backfill and a `group:`
  heading's `grid-column: 1 / -1` all keep working.
- DOM order also survives, which the page's own prose leans on: *"Start at Data
  table"* is the first card.

Cost: one `ResizeObserver` and a measuring pass, and `pack()` gets a **second
caller** — the bar its readme sets for promoting it to `util/`. Not promoting
it in this task; flagged for Mike.

## Steps

1. Pick the variant — `masonry` vs `packed` against `card: "two"` and DOM order
2. Pack the Overview wall in `ui/page.js`
3. Verify at 1600 / 1200 / 900 / 400 — spans, no overlap, the wide card intact
4. Check the nineteen `demo.exhibit()` Variants walls for the same raggedness
5. Record it — `ui/readme.md`, and the second caller in the masonry readme
6. Land — shots in the log, links named
