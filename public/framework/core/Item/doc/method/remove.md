`kid ? this.items.remove(kid) : this.parent?.items.remove(this)` — one method,
two directions. Called with an argument it removes that child; called with none
it removes **itself** from its own parent.

That is a deliberate reading, not an overload found by accident: `node.remove()`
and `parent.remove(node)` say the same sentence from either end, so a caller
that already has the node in hand never needs to also hold its parent.

At the root (no `parent`), `remove()` with no argument is a no-op — there is
nothing to detach from. `remove(kid)` where `kid` is not actually a child of
this item is also a no-op, silently, because [`List.remove()`](/framework/core/List/api/remove/)
does nothing when `indexOf` misses.
