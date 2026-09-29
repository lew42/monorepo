# Layout — the hub for every layout question and every layout page on the site

The five shapes and the whole layout system are the icon sections above, each one a link. This
file is what those widgets don't show: how to choose a shape, one note on naming, and a plain
list of every link (for an AI reading this file directly, not the rendered page).

> **Word collision, named once:** core's own `width: "wide"` and a column's own `fill` are not
> the owner's "two columns" (**Split**, above) and "three or more" (**Columns**, above) — that's
> why the shapes above are named Split and Columns, not wide and fill.

## Choosing one

Before building: the `layout` skill's five sizing questions (container, size, own layout,
container count, preview), and its five **C1–C5** questions for picking the shape itself —
drawn live, with demos, at [/layouts/decide/](/layouts/decide/).

## Every link on this page, indexed

[/layouts/](/layouts/) — the encyclopedia: every way a page divides its room, named and drawn
[/layouts/browse/](/layouts/browse/) — every layout on the whole site, one picture card each, Approve/Improve
[/layouts/decide/](/layouts/decide/) — the five questions above, live, with the column demos
[/layouts/practice/](/layouts/practice/) — three ids built big: a workbench, a reader, a catalog
[/layouts/labs/](/layouts/labs/) — six shape experiments, played with before they earned an id
[/layouts/shell/](/layouts/shell/) — a sidebar that never moves, and a tree of homepage designs
[core/Layout](/framework/core/Layout/) — the catalogue: 30 named arrangements, each proven at seven widths
[sidebar variant](/framework/styles/layouts/sidebar/) — the `.basis + .flex-1` sidebar shape
[floating page](/framework/core/Page/layout/floating/) — this module's own inner-sidebar shape, `floating()`
[layout explorer](/layouts/explorer/) — one tree of every layout on the site, siblings/selected/children in three columns
[v1](/framework/core/Page/layout/v1/) — this hub's first version, kept as reference
[doc/words](/framework/core/Page/doc/words/) — Standard and Top-down shape, in words
[Layout catalogue: main-aside](/framework/core/Layout/main-aside/) — the Split mechanism, `arrangement: "main-aside"`
[doc/columns](/framework/core/Page/doc/columns/) — the Columns mechanism, `this.columns({ even: true })`
