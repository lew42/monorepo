## What this file is

The module's own demo, and its `Doc` page. Two live examples: the flagship —
`board()`, a three-column `Item` tree dragged with `Sortable` (reorder,
cross-list, nest) — in the Overview's default card, and a second card,
`bare()`, showing `Draggable` alone with none of `Sortable`'s machinery.

## `Card` is this page's own subclass, not a library export

`class Card extends Sortable { drop_check(...) }`, defined at the top of this
file, exists only to add the cycle guard —
`target !== this && !this.item.contains(target.item)`. Neither `Draggable.js`
nor `Sortable.js` ships a descendant guard by default; this file is where a
reader sees what writing one looks like, because it's genuinely optional and
callers' needs differ.

## `node()` and `board()` are recursive, not `Item`-tree-aware

`node()` builds one row and recurses into `item.items`, and doesn't know or
care how deep the tree goes — nesting is just "a node has a `$items` box, so it
is also a drop site." `board()` redraws itself from scratch on `add`/`remove`
(bubbled `Item` events), rather than patching the DOM in place.

## `bare()` is the base-class demo, added for this audit

A `Draggable` (not `Sortable`) grabbing a single chip and dropping it on a
single registered bin, with `move()`/`drop()`/`restore()` filled in by hand in
about six lines — the point being that `Sortable`'s ghost-and-placeholder
polish is not required to get a working drag, only a nicer one.

## Improvements

1. **`bare()`'s chip never resets its counter or its bin's label.** Reloading
   the page is the only way back to "Bin" — fine for a doc demo, but worth a
   comment saying so was considered and skipped, since the pattern (state that
   only a reload clears) recurs across this site's demos. *(simple, useful)*
2. **`Card`'s cycle guard is the two-part version; both real callers use three.**
   `ext/Panel`'s `PanelDrag` and `ext/editor`'s `Node` each add
   `target.item?.root() === this.item.root()`, because `Draggable.registry` is
   one `WeakMap` for the whole document and this demo just happens to only ever
   show one tree. A reader copying `Card.drop_check` verbatim into a page with
   two trees would hit the exact bug both production callers already found.
   Worth a one-line comment on `Card` itself saying why the third clause is
   missing here specifically, not just documented three files away.
   *(simple, important)*
3. **The guard's shape is also duplicated in prose** (readme, `doc/verdicts.md`,
   this page's own `md()` call, `doc/method/drop_check.md`) rather than written
   once and linked. Four places to update if it ever changes. *(medium, useful)*
4. **A third card demonstrating cross-list drag alone** (two flat lists, no
   nesting) would isolate that specific claim from the "and it nests too" one
   the board demo currently bundles — genuinely outside-the-box, and probably
   not worth the extra card given the board already shows it. *(medium,
   speculative)*
