`true` for the span between `grab()` and the matching `release()`/`cancel()`. It
exists to guard the two listeners that fire on every pointer move and every
pointer up, dragging or not — `pointermove: e => this.dragging && this.drag(e)`
(Draggable.js:22-23) — so a stray move or up outside a real gesture is a no-op
rather than a call into `drag()`/`release()` with nothing set up.

**Usage** — set `true` in `grab()`, cleared in `end()`. Nothing else reads it;
`Sortable`'s own hit-testing (`before()`) checks a *different* instance's
`placeholder`/`view.el` to skip itself, not this flag.
