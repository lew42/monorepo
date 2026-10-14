# table architecture — a re-export, so one table lives in one place

`ui/table` is a two-line shim. The table code lives in `DataGrid.table(head, rows)` inside [`ext/DataGrid`](/framework/ext/DataGrid/); this module only re-exports it, so `import { table } from "/app.js"` keeps working. Entry: [`table.js`](../table.js).

## One table implementation, owned by DataGrid

**Decided:** `ui/table` holds no markup of its own; `table` is `DataGrid.table`.
**Why:** the site had three grid-like pieces (`ext/DataGrid`, `ui/datagrid`, `ui/table`); one owner means one fix updates every caller.
**Instead:** keep `ui/table` as its own copy, which duplicates the markup and drifts (law 6: one of everything).
**Detail:** [DataGrid architecture, "One grid, not three"](/framework/ext/DataGrid/doc/architecture.md#one-grid-not-three)

## A native `<table>`, not a data grid, for prose-sized tables

**Decided:** `table(head, rows)` renders a plain `<table>` with no sorting, filtering or windowing.
**Why:** a five-row table in a doc page is prose; a grid would add JavaScript and a fixed-height box it does not need.
**Instead:** send every table through `new DataGrid(...)`. That gives sort and filter, but costs a fixed height and a render pass, and suits long lists only.
**Detail:** [DataGrid architecture, "One grid, not three"](/framework/ext/DataGrid/doc/architecture.md#one-grid-not-three)

## A cell is text or a function, never a markdown pass

**Decided:** a string cell becomes a text node; a function cell runs with its `<td>` as the open element, so a link or `<kbd>` goes straight in.
**Why:** cells are data, and a markdown pass would turn a backtick or `**` in a value into formatting.
**Instead:** run cells through `md()` first; that makes every value a markup decision, which is the wrong default for records.
**Detail:** [ui readme, "no markdown pass"](/framework/ui/readme.md)
