# datagrid — the markup for a data-grid table, no JavaScript required

A CSS-grid box, a header row and a body — the part of a data grid that is pure HTML and CSS, so it
needs no class and no listener to exist. The owner's own rule: if it's markup a function renders,
it's UI, even when that function lives in a `.js` file. Resize, sort, filter and windowing are all
*behaviour* — JavaScript with state and listeners — so none of that lives here. That's
[`ext/DataGrid`](/framework/ext/DataGrid/), built on top of this same markup.

```js
import { datagrid } from "/app.js";

datagrid(
	[{ key: "name", label: "Name" }, { key: "age", label: "Age", width: 80 }],
	[{ name: "Ada", age: 30 }, { name: "Grace", age: 44 }],
);
```

## Use

- A column is `{ key, label, width, min, format }` — `width`/`min` is a plain number (read as px)
  or any CSS length string (`"10rem"`); `format(value, row)` turns a raw value into the cell's
  content.
- `datagrid_head(columns)` and `datagrid_body(columns, rows)` are exported separately too —
  `ext/DataGrid` re-renders just one of them (a sort, a scroll) without rebuilding the other.
- One `--col-<key>` custom property per column, set inline at mount — resizing (in `ext/DataGrid`)
  only ever touches that one property afterwards, never the grid's real column-width list.

## Watch out

- **`--datagrid-height` caps the box at `28rem` by default** (`max-height`, so a short table still
  hugs its own content) — override with `.style("--datagrid-height", "...")`, including `"none"`
  to let it grow with its content instead. `ext/DataGrid`'s windowing (past 300 rows) needs a real
  length here, not `"none"` — see [its own readme](/framework/ext/DataGrid/) for why.
- This folder renders nothing on its own past the markup — opening this page shows a tiny static
  table; the live resize/sort/filter demo is on [`ext/DataGrid`'s own page](/framework/ext/DataGrid/).

## More

- [`ext/DataGrid`](/framework/ext/DataGrid/) — the behaviour built on top of this markup; its page
  has the real, live, 2,000-row demo.
- [doc/decisions.md](./doc/decisions.md) — why the markup and the behaviour split into two modules.
- Back to [UI](/framework/ui/).
