`step(this.past, this.future)`. Pops the most recent snapshot off `past`, pushes
the *current* state onto `future` so `redo()` can come back, then calls
`this.restore(popped)`.

Returns `false` when `past` is empty — that is what disables the undo button
(`marks()` reads `history.can_undo()`, the same predicate) and what a caller
checks before assuming anything happened.

## `restore` is the caller's contract, not this class's

`step()` calls `this.restore(...)` — supplied at construction. In the editor that
is `swap()`, which hydrates a whole new `Item` tree and moves the saver, the
listeners, the canvas and the selection onto it. A `History` built without a
`restore` silently does nothing (see [`restore`](./restore.md)).
