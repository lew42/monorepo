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

## The graduation (2026-08-21): the CSS stayed, the closure left

`ui/` is html + css templates. `tree` was the one of twenty that was not — it held a
`rows` Map and a `selected_row` across renders, installed two click listeners of its own,
and carried an `update()`/`select()` lifecycle. That is a class, written in the one shape
nothing can subclass, so it became [`class Tree`](/framework/ux/Tree/).

**Splitting, not moving.** Every `.ui-tree-*` rule above is a rule about a *relationship*
(nesting, indent) or a *state* (open, selected, hover), which is exactly what this tier is
for. The class imports this file for that stylesheet and wears these same classes, so
neither tier can restyle a tree without the other getting it. A `ux` that took the
stylesheet along would have forked the look the first day this one changed.

**`tree()` retired 2026-08-21.** It stayed byte-compatible while `ext/Playground`
imported it straight from here and used both the factory and `.select()`; once that
caller moved to `ux/Tree` (`ai/2026-08-21/pg-tree/`), nothing outside this page's own
demos called it, and the closure came out — see
[`ai/2026-08-21/ux-tree-retire/`](/framework/ai/2026-08-21/ux-tree-retire/). The full
graduation argument, the name collisions the class had to dodge, and what the split
cost are in [`ux/Tree/doc/decisions.md`](/framework/ux/Tree/doc/decisions.md).

**One thing worth carrying elsewhere:** a shallow audit reported *no listeners anywhere in
`ui/`* because it grepped for `addEventListener`. This file installs two, through View's
`.click()`. In a framework whose base class wraps the DOM API, grep for the wrapper.

## The twentieth slot: Data (5 → 6)

`tree` is the fourth loop-driven export, joining `table` and `timeline` — its kin,
not sorted by counting. It went into Data rather than a new band: the band doc
warns a band of *three* over-widens its cards at 3440px; six only narrows them, so
that risk doesn't apply in this direction. `ui/readme.md`'s "nineteen" is now one
behind — outside this task's fence, left for the next pass through `ui/`.

## Two rules came back from the class (2026-09-17)

`ux/Tree` merged into one class that day (its [`doc/decisions.md`](/framework/ux/Tree/doc/decisions/)
has the argument), and two rules belong here rather than there.

**`.ui-tree-row:focus` — the focus ring.** It lived in `Tree.css` scoped as
`.ux-tree-keys .ui-tree-row:focus`, because the keyboard was a named subclass whose class
could scope it. The keyboard is in the base class now, so there is no such class to scope
with — and a focus ring is a rule about a **state**, which is exactly what this tier is for:
it sits beside `:hover` and `.ui-tree-selected`. It is `:focus`, not `:focus-visible`,
because the focus is *moved by script* on an arrow key and whether that counts as "visible"
is a UA heuristic; it is always visible here, and that is the whole feature. The
`outline-offset` is negative because the framework's positive 3px is drawn outside the row,
which a 14em rail clips.

**`.ui-tree-text` gained `min-width: 0`.** It already had `overflow: hidden` and
`text-overflow: ellipsis`, and neither did anything: a flex item's floor is its **content**
width unless you say otherwise, so a long label made the row wider rather than truncating.
Nothing showed it while a row held only a caret, an icon and a label — the row simply grew.
It showed the moment the class added a star and two row buttons after the label, which a
long label then pushed off the end of the rail.

## 2026-09-19 — one square frame, and a fold arrow you can see

Two rules changed, and both reach every tree on the site, so both were re-checked on
`/framework/ux/Tree/`, `/framework/ui/tree/`, `/imagine/paging/make/` and
`/framework/styles/system/` afterwards: no page error, no row overflowing its rail.

### The fold was a 9px glyph in a 9px box

It read `font-size: 0.7em; width: 1em`. **A length in `em` resolves against the
element's own font size**, so that "1em" box was 0.7 of the row's — on the site's rail
(an 0.8em font) the whole control measured 9 × 9px. The owner could barely see it and
nobody could hit it.

It now sets no font size at all and takes the shared frame below: 12.8px of glyph in a
16.6px square on the rail, 16px in a 20.8px square at a page's font size. It stays quiet
by **colour** (`--subtle`), which is the right knob for "secondary", rather than by
being too small to hit. GitHub's file tree and Notion's sidebar are the two references.

### The frame both children wear

The owner, 2026-09-19: *"the icons should be properly framed so that they always look
good — in some sort of square frame, centered vertically and horizontally … sized in ems
so they respond with the font size … fixed height and width, aspect ratio square."*

```css
.ui-tree-row { --ui-tree-frame: 1.3em; }
.ui-tree-toggle, .ui-tree-icon {
    display: grid; place-items: center;
    width: var(--ui-tree-frame); aspect-ratio: 1;
    line-height: 1;
}
```

⚠ **`line-height: 1` is the half that actually fixes the drift.** The two boxes were
already centred on the label — the row is `align-items: center`. What rode high was the
glyph *inside* its box: it inherited the row's 1.4 line-height, which draws a line box
taller than the glyph and then sits the glyph on its own baseline instead of in the
middle. `place-items: center` centres the line box; `line-height: 1` makes that line box
the glyph's own em square, so centring it centres the glyph. Measured at 1920: the icon
ink's centre is 0.08px from the label ink's centre, on five rows out of five.

⚠ **`aspect-ratio: 1` with only a width**, never a second length — one number cannot then
disagree with itself.

### An `em` in a custom property resolves where it is USED

Worth knowing before writing another token like this one. An **unregistered** custom
property inherits as a *token stream*, not as a computed length: `--ui-tree-frame: 1.3em`
declared on the row is still the literal `1.3em` when a child reads it, and resolves
against **that child's** font size. While the fold still carried `font-size: 0.9em`, this
one token produced a 16.63px icon box and a 14.97px fold box — read back from the live
page, both looking perfectly plausible in the stylesheet.

Dropping the fold's font-size override is what makes one token mean one number. The
alternative, `@property { syntax: "<length>" }`, would compute it to px at the row and
inherit that — but it needs a computationally-independent `initial-value`, so any
`.ui-tree-icon` used outside a row would collapse to a 0px box. Not worth it for one
element that has no business setting its own font size anyway.

### Both are `ui/`'s, not the class's

Unchanged rule, restated because this change tested it: a rule about a **relationship or
a state** stays in `ui/tree`, and `ux/Tree` wears these same classes. The frame is a
relationship between the row's three parts, so it belongs here — which is also why one
edit fixed the rail and every other tree at the same time.
