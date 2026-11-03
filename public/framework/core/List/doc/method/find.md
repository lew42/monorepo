`this.children.find(fn)` — one level, not recursive. This is **not**
[`Item.find(id)`](/framework/core/Item/api/find/), which walks the whole
subtree by id; this is `Array.prototype.find` over direct children only, by
whatever predicate you pass. Sharing a name across the two classes with
different meanings (one recursive-by-id, one flat-by-predicate) is a real
naming collision — see this pair's Recommendations for the call to rename one.
