The filter. Default: `target !== this`, and that's the whole of the base class's
opinion — type checks, capacity, modifier keys, the cycle guard, all of it is
the caller's, written on the **dragging** instance, not the target.

⚠ **Not a target-side `accepts`.** One override on the thing being dragged
covers every rule at once, and — because `Sortable.locate()` routes every
candidate container through this same method — the placeholder shown mid-drag
can never disagree with the move that commits.

**Usage** — this module's own worked example is `page.js`'s `Card.drop_check`:
`target !== this && !this.item.contains(target.item)` is the entire cycle guard.

Both real callers write a **third clause** this demo doesn't need: `ext/Panel`'s
`PanelDrag` and `ext/editor`'s `Node` each add `target.item?.root() === this.item.root()`
before the cycle check, because `Draggable.registry` is one `WeakMap` for the
whole document — without it, a page with two unrelated `Sortable` trees on
screen lets a drag cross from one into the other. The demo here only ever shows
one tree, so it doesn't need the clause, but a page with more than one should
copy the three-part version, not this page's two-part one.
