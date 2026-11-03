## What this file is

34 lines, one `@layer theme` block, six classes — the entire visual vocabulary
both `Draggable` and `Sortable` ever add: `.drag-handle`, `.dragging`,
`.drag-source`, `.drag-ghost`, `.drag-placeholder`, `.drag-items`. Nothing here
is optional or themed further; a page that wants a different look styles its own
elements, not these.

## The one line that prevents the most common bug report

`.drag-items { min-height: 1.75em; }` — an empty container otherwise collapses
to zero height, which means zero hit-test surface, which means "I can't drop
into the empty list" every time. The comment above it in the source calls this
out by name for exactly that reason.

## Why `.drag-source` is `display: none` rather than `opacity: 0`

The live node keeps its pointer-events during a drag (hit-testing filters it out
by hand in `under()`), but it must not be *visible* — the ghost is what the user
looks at. `display: none` removes it from layout entirely, which is safe because
nothing measures the source element's box during a drag; only the ghost and
placeholder are read.

## Improvements

1. **No `prefers-reduced-motion` concession.** The ghost's `translate()` in
   `Sortable.move()` isn't animated (no `transition` here), so there is nothing
   to disable — this file has no work to do for that preference. Noted only so a
   later transition doesn't get added without one. *(simple, speculative)*
2. **`.drag-ghost`'s `opacity: 0.85` is a fixed value**, not a custom property —
   a page wanting a different ghost transparency has to override the rule
   rather than set a variable. Small enough that promoting it to a
   `--drag-ghost-opacity` custom property is a one-line, low-priority change.
   *(simple, useful)*
