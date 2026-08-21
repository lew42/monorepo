# tree — decisions

## Reserved slots, not ragged text

Icon is optional per node; a missing one still reserves `.ui-tree-icon`'s width, so
an icon'd "Box 3" and an icon-less "Box 1" share one text column — raggedness reads
as a mistake, an even column doesn't. Same reasoning for the toggle: a leaf renders
an empty `.ui-tree-toggle` span sized like the button, so leaf and branch siblings
line up regardless of who has children.

## Indent is nesting, not `depth × indent`

Considered a `--depth` property per row (`calc(var(--ui-tree-indent) * var(--depth))`),
the form the brief's "or offsetLeft of the text" line hints at. Rejected: a flat row
structure surviving collapse means walking a subtree to hide every descendant. Nested
`<ul>`s get that for free — `display: none` on one hides everything under it; depth
is just how many ancestor lists a row sits inside, and `tree.js` never stores one.

## Selection: the row selects, the toggle only toggles

A branch is selectable — a Frame layer is still a layer — so the row's click handler
fires `onSelect` whether or not the node has children. The `▸` button calls
`e.stopPropagation()` before flipping `.ui-tree-open`, so expanding never also
selects. `t.select(node)` reuses that code but skips `onSelect`: a caller syncing
the tree to its own state shouldn't re-trigger its own handler.

## `t.update()` resets everything

A fresh `update(nodes)` empties the root and rebuilds, so open/collapsed state and
the selection both reset to what the new data says. Diffing old vs. new nodes to
preserve UI state is real complexity for "the caller owns the data" — simplest
that survives collapsing, again.

## The twentieth slot: Data (5 → 6)

`tree` is the fourth loop-driven export, joining `table` and `timeline` — its kin,
not sorted by counting. It went into Data rather than a new band: the band doc
warns a band of *three* over-widens its cards at 3440px; six only narrows them, so
that risk doesn't apply in this direction. `ui/readme.md`'s "nineteen" is now one
behind — outside this task's fence, left for the next pass through `ui/`.
