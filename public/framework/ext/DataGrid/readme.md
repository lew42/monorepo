# DataGrid — one reusable grid: resize, sort, filter, fast at thousands of rows

A new module (2026-10-03) — the owner's own words: "we should turn it into a reusable component
and fix it once, the right way, across all instances." Built because the AI Sessions tab's
hand-built grid mounted a separate resize widget per column (9 of them), each watching the whole
page for mouse movement just to show a "near the edge" glow — measured live at 108% CPU. This
module fixes that shape, once, for every grid that uses it.

**UI vs UX, the owner's own split:** the markup — a CSS-grid box, a header, a body, one
`--col-<key>` size token per column — is [`ui/datagrid`](/framework/ui/datagrid/), and it needs no
JavaScript to exist. Resize, sort, filter and windowing are *behaviour*, so they live here, in a
class built on top of that same markup. `ext/DataGrid` is the two bundled together — the thing you
actually import and use.

## Use

```js
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";

new DataGrid({
    columns: [
        { key: "created", label: "Created", type: "date" },
        { key: "status", label: "Status" },                               // a small set -> checkbox filter
        { key: "amount", label: "Amount", type: "number", format: v => "$" + v.toFixed(2) },
        { key: "note", label: "Note", filter: false },                    // free text -- no filter
    ],
    rows,   // a plain array, or an async function that returns one (a jsonl source)
});
```

Append it like any other view (`panel.main.append(new DataGrid({...}))`) or build it straight
inside a capturing function — it mounts itself wherever it was constructed, the same as `Panel2`.
There is no separate `.mount()` call to remember.

- **`columns[].type`** — `"text"` (default), `"number"` or `"date"`. Picks the sort comparator and
  the auto-generated filter: a date gets a from/to range, a small set of repeating values (≤ 12
  distinct, checked against the first 300 rows) gets checkbox chips, a number gets min/max inputs,
  and free text gets no filter at all.
- **`filter: false`** / **`sort: false`** on a column opts it out of either, regardless of its type.
- **`width` / `min`** — a plain number (read as px) or any CSS length (`"10rem"`).

Live demo, with the code: [the Overview page](/framework/ext/DataGrid/).

## Why it's fast — the short version

[`doc/perf.md`](./doc/perf.md) has the measured numbers (`perf.mjs`, run against the demo page's
own 2,000 rows). In one line each:

- **One resize listener, not one per column.** A drag reads which column from the element under
  the pointer (`e.target.closest(".datagrid-grip")`) — there is nothing watching the rest of the
  page, ever, so there is nothing for it to cost when the pointer is somewhere else.
- **One CSS custom property per frame.** Dragging writes `--col-<key>` on the grid element and
  nothing else — no re-render, no per-row layout.
- **Windowing past 300 rows.** Only the rows in (or just outside) the visible scroll range are in
  the DOM; two plain spacer boxes keep the scrollbar's length and position honest for the rows that
  aren't rendered.

## Watch out

- **The handle is CSS-only, no "near zone."** `ext/grip`'s own resize widget shows its handle only
  once a document-wide listener decides the pointer is "close enough," which is both where the CPU
  bug lived and why the handle felt slow to appear. This module's handle is a plain `:hover` rule —
  it's either hovered or it isn't, with no JS deciding "near" at all.
- **The default internal scroll height is `28rem`** (`ui/datagrid`'s own `--datagrid-height`
  custom property) — override with `.style("--datagrid-height", "...")` on the grid. Below the
  windowing threshold (300 rows, `ext/DataGrid`'s own `WINDOW_AT`) any length works, including
  `"none"` for the page to scroll instead of an inner box. **Past that threshold, pass a real
  length, never `"none"`** — windowing works out which rows are visible from the grid's own
  `clientHeight`, and `block-size: none` is invalid CSS, so it silently falls back to `auto` and
  turns windowing off (every row renders) instead of erroring. Caught in review, not by eye.
- **`ai/sessions/page.js` is not adopted yet.** A sibling task (`@task-mastermind-sessions-tab-polish`)
  owns that file this week; the page's own Overview names the other tables on the site worth
  moving next.

## More

- [Overview](/framework/ext/DataGrid/) — the live demo, 2,000 rows, with the code beside it
- [`doc/perf.md`](./doc/perf.md) — the measured frame-time and CPU numbers, and how to re-run them
- [`ui/datagrid`](/framework/ui/datagrid/) — the markup half this class builds behaviour on top of
- [`ext/grip`](/framework/ext/grip/) — the older per-column resize widget this module replaces for
  a data grid (still the right tool for a single rail or split panel — see its own readme)
- Files: `DataGrid.js` (the class), `DataGrid.css` (filter bar / sort arrow styling), `page.js`
  (the demo), `perf.mjs` (the performance proof)
