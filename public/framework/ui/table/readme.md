# table

> **Moved (2026-10-12):** this now lives in [`ext/DataGrid`](/framework/ext/DataGrid/) as `DataGrid.table`. `ui/table` re-exports it, so `import { table } from "/app.js"` still works.

A head row and a body — `framework.css` already draws the borders, padding and header fill; `table()` just loops your arrays into `<tr>`s.

## Use

```js
import { table } from "/app.js";

table(["module", "lines"], [["View", "641"], ["Page", "363"]]);
table.c("num", ["module", "lines"], [["View", "641"]]);  // right-aligns every column but the first
```

## Watch out

- A cell may be a function instead of a string — it runs with the `<td>` as captor, so a link, a badge or a `<kbd>` goes straight in — [table.js](table.js)
- No markdown pass on a cell — a backtick or `**bold**` in a string renders as itself — [ui/readme.md](../readme.md)

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
- [page](/framework/ui/table/) — numeric alignment, wide tables, and function cells
- Back to [UI](/framework/ui/).
