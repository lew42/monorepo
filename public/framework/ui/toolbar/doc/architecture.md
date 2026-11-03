# Toolbar architecture — markup you copy, not a component you call

The toolbar is a row of buttons, a search field and a segment control, made from plain `card flex` classes. It is a `ui/` template: its page shows the markup and the reasons, and the source is [`page.js`](../page.js). There is no class and no function to import; the page's own `specimen` is the template.

## No `ui.toolbar()` function

**Decided:** a bar is written out as markup (`card flex wrap gap v-center`), and the page prints that markup as its source.
**Why:** what makes a bar useful is what goes in it: which groups, which one grows, how tight each gap is. A function would hardcode one bar or take a config object that describes the row, which is worse than the row.
**Instead:** a `ui.toolbar({ groups, grow })` helper. It would be used once per app, and every change would go through its config.
**Detail:** [the page, `content()`](/framework/ui/toolbar/)

## Wrap by default; scroll only for a one-line bar

**Decided:** the row uses `wrap`, so buttons drop to a new line on a narrow screen.
**Why:** every button stays reachable. The cost is height, and that is the accepted trade.
**Instead:** `flex-nowrap` with `overflow-x: auto`. It keeps one line, but hides an unknown number of buttons off the right edge with nothing telling the reader they are there.
**Detail:** [the page, `mobile` demo](/framework/ui/toolbar/)

## The growing field uses `flex-1`, not `split`

**Decided:** the one element that should absorb the slack gets `flex-1`.
**Why:** `split` (`space-between`) spreads three groups into thirds and leaves the field at its own width. `flex-1` works with any number of groups, and it fixes the input, which `framework.css` sets to `width: 100%`.
**Instead:** `split`. It is still right for a two-group bar with no field, as the `title` demo shows.
**Detail:** [the page, `## flex-1, not split`](/framework/ui/toolbar/)

## `flex-1` needs a `min-width` under `wrap`

**Decided:** the growing field sets a `min-width` (`9em` in the template).
**Why:** `flex: 1` is `flex-basis: 0`. In a tight row, without a minimum, the field shrinks to a couple of pixels instead of wrapping to the next line.
**Instead:** no minimum, which fails as described above.
**Detail:** [the page, the `wrap` paragraph](/framework/ui/toolbar/)

## Gaps are a fraction of the theme gap

**Decided:** a group's gap is `calc(var(--gap) * 0.3)` for labelled buttons and `* 0.15` for icon-only buttons.
**Why:** a tight gap reads as one group. The theme already draws borderless buttons, so no border or joining CSS is needed.
**Instead:** a joined segmented control (negative margins, corner suppression on the middle buttons). It needs real CSS and earns none here.
**Detail:** [the page, `group` demo](/framework/ui/toolbar/)

## A segment is a group where `.prim` marks the selected option

**Decided:** in a segment control, the selected button carries `.prim`, and the others are plain.
**Why:** `.prim` on one of several mutually exclusive buttons reads as "selected", not as a fourth independent action.
**Instead:** a separate `.selected` class. It would be new CSS for a state `.prim` already expresses.
**Detail:** [the page, `filter` demo](/framework/ui/toolbar/)

## Checked against the code

Every entry above matches `page.js` as it is now. No `⚠` mismatch was found.
