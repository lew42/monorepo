# datagrid — the record

## 1. Why the markup and the behaviour are two separate modules

The owner's own split, stated plainly during this build: pure HTML and CSS is **UI** — it needs no
class, even when a JS function is what renders it (`datagrid(columns, rows)` here is a function,
but everything it builds is markup and a stylesheet, nothing that remembers state between renders
or installs a listener). The moment something needs JavaScript with state or a lifecycle — resize,
sort, filter, windowing — it's **UX**, and in this case it's bundled as one `ext/` package,
[`ext/DataGrid`](/framework/ext/DataGrid/), rather than scattered across several small `ux/`
classes, because all four behaviours share one grid instance and one set of columns.

This module exports `datagrid_head` and `datagrid_body` separately from the combined `datagrid`
component for exactly this reason: `ext/DataGrid` needs to re-render just the body (a sort, a
scroll) or just flip one CSS custom property (a resize drag) without the markup module knowing
anything about why — it just renders what it's given, every time, the same as any other UI
component here.

## 2. One `--col-<key>` custom property per column, set inline

`grid_template()` builds one grid-template-columns track per column as
`minmax(min, var(--col-key, width))`. The variable is set inline on the grid element at mount
(`$grid.style("--col-" + c.key, ...)`), so the page never needs a stylesheet rule written per
column, and a later resize (in `ext/DataGrid`) is a single property write — not a full
`gridTemplateColumns` recompute, which would force a layout pass over the whole table on every
`pointermove` frame of a drag.

## 3. The resize handle is CSS-only — no JS "near zone"

`.datagrid-grip` is a plain absolutely-positioned strip spanning the full header-cell height, shown
on `:hover`/`:focus-visible` via one CSS rule. The bug this whole project exists to fix (the AI
Sessions tab's hand-built grid, 108% CPU) was a JS "is the pointer near this edge" computation
running on every pixel of mouse movement, anywhere on the page, per column. Making the handle's
visibility a hover state instead removes that computation entirely — the browser already knows
where the pointer is relative to an element, for free.
