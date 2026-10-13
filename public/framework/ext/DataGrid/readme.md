# DataGrid — one grid for every list of records: a table or a rail of cards, a setting not a class

Resize, sort, filter, windowing, and two drawers. The markup that used to be `ui/datagrid` and
`ui/table` lives here now (those two files re-export it). Architecture and why:
[doc/architecture.md](./doc/architecture.md). Live demo with a debug view of the instance:
[the Overview page](/framework/ext/DataGrid/).

## Use

```js
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";
new DataGrid({ columns: [{ key: "name", label: "Name" }, { key: "age", label: "Age", type: "number" }], rows });
```

`rows` is an array or an async function. `columns[]`: `key label type("text"|"number"|"date") width min format filter sort`.

- **Drawers:** `DataGridTable` (`DataGrid.Table`), `DataGridRail` (`DataGrid.Rail`), shared paging in `DataGridDrawer`. `grid.set_view("rail")` swaps without refetching.
- **The view setting:** `?view=` > the reader's saved toggle (`PagePrefs`) > the page's `{"settings":{"view":…}}` line (`grid.default_view(name)`, read by `page_settings()`) > `"table"`.
- **Hooks a page passes** (no subclass): `href(row)` (a row or card becomes a link), `cells(row)`, `row(row)` (a whole row View), `card(row)`, `sort_rows(rows, {key, dir})`, `natural_dir(key)`, `filters: false`.
- **Live feed:** `grid.set_rows(rows)` keeps sort, filters, scroll and view.
- **Fast:** fixed `row_height` (36) windows past 300 rows; `row_height: null` pages `page_size` (100) rows at a time, next page on scroll, "Show more" as keyboard fallback.
- **Statics:** `DataGrid.head/body/template/plain(columns, rows)` (markup), `DataGrid.table(head, rows)` (a native `<table>`).
- Column widths save to `PagePrefs` when a drag ends; double-click a grip resets it.

## Who uses it

- [Sessions](/framework/ai/sessions/) (`ai/AISession/AISessionsPage.js`): table or rail, its own row and card (`AISessionView`), its own sort + nesting hook. Before/after: long tasks ~430–680 ms → ~50–130 ms, DOM nodes 5,900 → 2,700 ([numbers](/framework/ai/sessions/2026/10/12/session-6d3ef407/data-grid/sessions-perf/results.jsonl)).
- [AI Overview](/framework/ai/) (`ai/AIOverview.js`), the demo, and every `ui.datagrid` / `ui.table` caller through the re-exports.

## Watch out

- `href` is also a `View` method: the grid only treats it as a hook when the page passed its own (`grid.link(row)`).
- Past 300 rows pass a real `--datagrid-height`, never `none`: windowing needs the box's height ([doc/perf.md](./doc/perf.md)).
- The header is one sticky row (`.datagrid-head`, a subgrid), opaque across the gaps; it sticks to the nearest box that clips, so a page that scrolls the grid itself must unclip the boxes between ([Sessions](/framework/ai/sessions/) does: `sessions.css`).
- The demo's column resize is one delegated listener set, not one per column ([doc/perf.md](./doc/perf.md)).

## More

- [doc/architecture.md](./doc/architecture.md) · [doc/perf.md](./doc/perf.md) · [`ui/datagrid`](/framework/ui/datagrid/) · [`ui/table`](/framework/ui/table/)
- Files: `DataGrid.js` `DataGridDrawer.js` `DataGridTable.js` `DataGridRail.js` `DataGrid.css` `page.js` `perf.mjs`
