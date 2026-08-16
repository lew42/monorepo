The builder's **one mutation verb**: `move(parent, before = null)` unlinks this
node from its current parent (if any) and inserts it into `parent`'s list,
positioned before `before` — `null` (the default) appends.

```js
node.move(newParent)              // reparent, appended at the end
node.move(sameParent, sibling)    // reorder within the same parent
```

Reorder, reparent and nest are **one code path** because both are "detach, then
insert at a position" — there is no separate `reorder(index)` that could drift
out of sync with `reparent(newParent)`.

**⚠ No cycle guard.** `move()` does not check `!parent.contains(this)` itself —
a caller that lets a node be dropped onto its own descendant will build a
cycle. [`contains()`](contains.md) exists for exactly this, and every real
call site (`ext/Draggable`'s `drop_check`) guards with it before calling
`move()`. This method trusts its caller.
