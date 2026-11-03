The reader's introduction to `ui.table` — an exhibit (source + live render),
two variant children (`num`, `cells`), a short note on the one CSS override.

## What it demonstrates that the function's source can't

`cells()` shows a cell as a **function** rather than a string — the table's
one piece of real API surface that isn't visible from `table.js` alone, since
`td(cell)` just runs whatever it's handed with the `<td>` as captor.

## Improvements

1. **`num` and `cells` are both real, distinct lessons** and stay separate
   children rather than folding into one variant — correctly split. *(n/a)*
2. Nothing else ranked: the page is 47 lines and every line earns its place.
