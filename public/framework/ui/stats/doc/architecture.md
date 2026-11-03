# Stats architecture — a template, not a component

Stats is a `ui/` template: a wall of label-and-number tiles you copy from its page, [`page.js`](../page.js). The function on that page is rendered on the stage and printed as the source, so the code shown is the code that ran. Nothing here is imported by other code.

## There is no `ui.stats()` function
**Decided:** the tile strip is a template function inside `page.js`, copied into the caller, not an exported API.
**Why:** a function has no room for a row its author did not foresee. The old one had zero call sites while three hand-rolled copies existed, and the page itself abandoned it once it needed an icon in the label row.
**Instead:** an exported `ui.stats(items)` helper: one place to fix, but every new variation needs a new parameter.
**Detail:** [`page.js`](../page.js) (the `icons` demo shows the unforeseen row)

## The tile is a Card
**Decided:** a tile is `div.c("card flex v")` with `--gap` at `0.1em` and two lines (`h4 muted` label, `h2` number); the strip is `grid gap auto`.
**Why:** a card wall already exists, so a separate component would be a second version of it.
**Instead:** a dedicated Stat component, which would duplicate [Card](/framework/ui/card/).
**Detail:** [`page.js`](../page.js)

## One token turns a card grid into a tile strip
**Decided:** column width is the `--column` token on the grid (`9em` for tiles, `10em` with icons, `14em` default); no new selector or variant page.
**Why:** `grid auto` wraps on `--column`, so a number is enough, and a second variant is one number pretending to be a second component.
**Instead:** a `.stats` class or a "summary" variant page, which would add CSS for what a token already does.
**Detail:** [`page.js`](../page.js)

## Type scale is the only styling
**Decided:** the label is `h4`, the number `h2`, and the only colour is `muted`, derived from the ink it sits on.
**Why:** the [type scale](/framework/styles/layers/theme/) is the whole vocabulary; a tile never invents a font-size or a named colour.
**Instead:** per-tile font sizes and colours, which drift from the theme.
**Detail:** [`page.js`](../page.js)
