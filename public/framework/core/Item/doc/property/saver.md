Whatever object has `save(item)`, `load()` and `delete(item)` — see
[`ext/Saver`](/framework/ext/Saver/). Absent on most nodes; usually set once, on
the document root, by [`Item.open()`](../method/open.md) or by hand:
`new Item({ saver })`.

**Never serialized**, and never read directly by application code — go through
[`item.save()`](../method/save.md) and [`item.delete()`](../method/delete.md),
which walk `parent` until they find one (or resolve `false` if none exists
anywhere in the chain). A node deep in the tree can carry its own `saver` too;
nothing stops a subtree from having a different backend than its document root,
though nothing in this module exercises that case.
