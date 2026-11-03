`insert_before(child, ref = null)` — adopts `child`, then splices it in just
before `ref`. `ref` being `null`, or not actually a member of this list,
**appends** rather than throwing or silently dropping the insert:
`const i = ref ? this.children.indexOf(ref) : -1; i === -1 ? push : splice(i, 0, child)`.

**⚠ Takes a node, never an index.** That is deliberate and load-bearing —
[`Item.move()`](/framework/core/Item/api/move/) is defined entirely in terms of
this method, and because the position is *relative to another node* rather
than a numeric offset, there is no off-by-one to get wrong when the list has
already changed shape between "compute the index" and "insert at the index."
