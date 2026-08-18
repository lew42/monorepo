# Anatomy — seven "generic layouts" from the Figma, and the two strings behind them

Frame 12 (`181:1457`) names seven children: Burger, 3× Burgers, Burger with Columns,
Burger with Columns with Burger, Columns, Columns with Burger, 3× Columns. All seven
are `flex v` (a Burger) and `flex auto` + `--grow: 2` (Columns), nested.

## Use

One spec per shape, `entry`'d the same way [Wire](../wire/) does — a twin card plus a
bare `/full/` url to measure.

```js /framework/styles/layouts/anatomy/specs.js
const band = (label, line, tone = "") => div.c("pad flex v gap " + tone, () => {...});
const burger = (...bands) => div.c("flex v", () => bands.forEach(fn => fn()));
const columns = (left, center, right) =>
	div.c("flex auto", () => { left(); center().style("--grow", "2"); right(); })
		.style("--column", "12em");
```

## Watch out

- **One page, not seven directories.** Six of this tier's other Figma frames already
  had real layouts; [Wire](../wire/) is the precedent for "demonstrate the string,
  link to the real one" instead of a sibling dir per frame.
- **`--grow` replaces an older idiom.** [shell](../shell/) and [sidebar](../sidebar/)
  predate it and use a fixed `basis` rail plus an inline `flex: 1 1 24em`; every
  Columns shape here is `--grow: 2` instead — one token, no inline `flex`.
- **`columns()` sets `--grow` on the centre itself**, once — a caller never applies it
  again, whether the centre is a plain band or a nested `burger(...)`.

## More

- [Overview](/framework/styles/layouts/) · [doc/decisions.md](./doc/decisions.md) the record
- Files: `specs.js` (the seven, and the two primitives) · `page.js` (the index)
- Nearby: [wire](/framework/styles/layouts/wire/) eight strings, one gap found · [shell](/framework/styles/layouts/shell/) the toggleable Holy Grail · [document](/framework/styles/layouts/document/) header, measure, footer
