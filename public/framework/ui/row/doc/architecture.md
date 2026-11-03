# Row architecture: one class, three rules

`.ui-row` is the card plan's `row` kind ([plan](/framework/ux/Content/plan/)): one line in a list. The module is two files, [`row.js`](../row.js) (the rules) and [`page.js`](../page.js) (the template, shown and printed).

## Home: a new `ui/row`, prefix `ui-`

**Decided:** the row lives in its own `ui/row`, like its sibling `ui/panel` (the frame's home). **Why:** no existing `ui/` module is "a line in a list" (`ui/item` is a tree row with an icon, a name and an end, a different job). Law 8: name and home first. **Instead:** growing `ui/item` (rejected: it is a tree widget, not a box).

## The row owns padding, gap and hover, nothing else

**Decided:** only `display:flex`, `align-items:center`, `gap:0.6em`, `padding:0.45em 0.6em`, the radius and the hover/`.selected` ground. **Why:** the AI dashboards' rows differ in dividers, grids and fixed heights (the inbox row is always the same height); those stay in their own modules, so a merge changes only the box. **Instead:** one big row class with modifiers (rejected: it would be a second system for the dashboards).

## Merge 9 (ai-rows): what wears it, what does not

Landed: `.ai2-toc-row` (the sub-card list). Left on purpose, with the measured reason: `.ai2-live-item` (a four-column grid, 39px rows the rail depends on), `.ai-prompt` (a 0.15em dense row, by design), `.ai2-row` (a card-padded entry with a 3px bar), `.panel-props-row` (a vertical grid), `.ai-group` (a heading column), `.v3-day-row` (a `<details>` boxed like a card). Detail: the run log in the AI sessions tree, `card-merges-2`.
