# row

One line in a list, on its parent's ground: `.ui-row` pads in its own em (`0.45em 0.6em`), spaces its parts by `0.6em`, and takes a ground (`--wash`) only when hovered or `.selected`. It never draws a border. A `ui/` template: copy the markup from [its page](/framework/ui/row/).

Code: `page.js` and `row.js` in this folder. A line that also needs a divider, a done state or a fixed grid keeps those rules in its own module; the row owns only the padding, the gap and the hover ground.

## More

- [`doc/architecture.md`](./doc/architecture.md) (decisions and why)
