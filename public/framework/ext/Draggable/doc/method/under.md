"What's under the cursor, filtered to registered instances" —
`document.elementsFromPoint`, walked in the browser's own hit-order, skipping
anything inside `this.view.el` and anything an optional `ok()` predicate
rejects.

⚠ **Not `e.target`.** Under pointer capture (see [`grab()`](../grab/)) `e.target`
is always the handle. `elementsFromPoint` also gives "innermost registered
container" for free — the chain it returns is already ordered innermost-first —
which is what lets `Sortable.locate()` skip writing its own sort.

**Usage** — called by `release()` (find the drop target) and by
`Sortable.locate()` (find the destination list), each with a different `ok()`.
