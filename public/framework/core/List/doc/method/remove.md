Finds the **first** occurrence by `indexOf`, splices it out, clears `parent` if
it still points here, notifies:

```js
const i = this.children.indexOf(child);
if (i === -1) return this;
this.children.splice(i, 1);
if (child.parent === (this.owner ?? this)) delete child.parent;
return this.notify("remove", child);
```

**⚠ First occurrence only.** Duplicates of the same node in one list are
treated as normal — each is its own entry — so `remove(x)` when `x` appears
twice removes one copy and leaves the other, by design, not as an oversight.

**⚠ The `parent === owner` guard matters.** If `child` was already re-adopted
elsewhere (moved to a different list) before this `remove` runs, its `parent`
no longer points at this list's owner, and this skips clearing it — so a stale
`remove()` call can never undo a *newer* adoption. This is what makes
[`move()`](/framework/core/Item/api/move/)'s "detach, then insert" sequence
safe even though it calls remove-then-insert across two different lists.

A `child` not actually in this list is a silent no-op — `indexOf` returns `-1`
and nothing else runs.
