Same shape as [`save()`](save.md), same delegation, same `false`-not-throw when
no saver exists anywhere up the chain: `this.saver ? this.saver.delete(this) :
this.parent ? this.parent.delete() : Promise.resolve(false)`.

**⚠ Does not remove the node from the tree.** This calls the saver's
`delete(this)` — it asks the storage layer to delete a document — it does not
call [`remove()`](remove.md). Deleting a node from its parent and deleting a
document from storage are two different operations that happen to share a verb
name; a caller wanting both calls both.
