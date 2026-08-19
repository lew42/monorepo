Sixth of the "Arrangements" group: the `finder` tree is Miller columns — every page a
column, six levels deep at its deepest, opened three in (`return …get("docs")…get("guide")`).

## The walk is the lesson

`column(page)` patches every page the same way: `classes: "column"` (the root: `"columns"`,
it IS the row), a `content()` that draws the column body **and** sets `this.$pages` to a
region *inside* it, and an `activated()` that reveals the newest column. Nothing in the tree
knows about columns; the DOM stays a tree; `columns.css` flattens the layout.

## Two traps in `activated()`

A demo page is built detached, so no `requestAnimationFrame` gives the row a box for the
first reveal — a one-shot `ResizeObserver` does. And the box marks what it shows *after*
`activate()`, so a plain rAF is still needed for every navigation after that. `scrollBy` on
the row, never `scrollIntoView`, which walks up and scrolls the page around the box.
Record: [`doc/columns.md`](/framework/core/Page/doc/columns/).
