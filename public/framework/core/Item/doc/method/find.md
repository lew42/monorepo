Finds a node by id: `let hit; this.walk(item => { hit ??= item.id === id ? item : undefined; }); return hit;`

**⚠ Does not short-circuit.** `walk()` has no early-exit, so `find()` visits
**every** node in the tree even after it has already found its match — the
`??=` just refuses to overwrite `hit` once set. On a document with thousands of
nodes this is a real cost, not a theoretical one; there is no indexed lookup
here (compare `Item.types`/`Item.names`, which *are* Maps, for the registry —
per-instance id lookup is not).

Returns `undefined` when nothing matches, never throws.
