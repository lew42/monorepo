# Layout — the hub for every layout question and every layout page on the site

## The five shapes a page picks from

| shape | one line | mechanism |
|---|---|---|
| **Standard** | one column, 300–1000px — the site's own default | a page that says nothing ([`doc/words.md`](/framework/core/Page/doc/words/)) |
| **Split** | two columns, any proportion, stacks on mobile | `arrangement: "main-aside"` ([Layout catalogue](/framework/core/Layout/main-aside/)) |
| **Columns** | three or more standard columns, responsive | `this.columns({ even: true })` ([`doc/columns.md`](/framework/core/Page/doc/columns/)) |
| **Floating page** | an inner left sidebar beside a page that scrolls on its own | [`layout/floating/`](./floating/) |
| **Top-down shape** | background · padding · full-bleed | [`doc/words.md`](/framework/core/Page/doc/words/) and [`doc/columns.md`](/framework/core/Page/doc/columns/) |

> **Word collision, named once:** core's own `width: "wide"` and a column's own `fill` are not
> the owner's "two columns" (**Split**, above) and "three or more" (**Columns**, above) — that's
> why this table says Split/Columns, not wide/fill.

## Choosing one

Before building: the `layout` skill's five sizing questions (container, size, own layout,
container count, preview), and its five **C1–C5** questions for picking the shape itself —
drawn live, with demos, at [/layouts/decide/](/layouts/decide/).

## Everything else about layout, indexed

[/layouts/](/layouts/) — the encyclopedia: every way a page divides its room, named and drawn
[/layouts/browse/](/layouts/browse/) — every layout on the whole site, one picture card each, Approve/Improve
[/layouts/decide/](/layouts/decide/) — the five questions above, live, with the column demos
[/layouts/practice/](/layouts/practice/) — three ids built big: a workbench, a reader, a catalog
[/layouts/labs/](/layouts/labs/) — six shape experiments, played with before they earned an id
[/layouts/shell/](/layouts/shell/) — a sidebar that never moves, and a tree of homepage designs
[core/Layout](/framework/core/Layout/) — the catalogue: 30 named arrangements, each proven at seven widths
[sidebar variant](/framework/styles/layouts/sidebar/) — the `.basis + .flex-1` sidebar shape
[floating page](./floating/) — this module's own inner-sidebar shape, `floating()`
[layout explorer](/layouts/explorer/) — one tree of every layout on the site, siblings/selected/children in three columns
[v1](./v1/) — this hub's first version, kept as reference
