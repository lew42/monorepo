The owning `Item`, or absent at the root. Never set directly — it is written by
[`List.adopt()`](/framework/core/List/api/adopt/) the moment a node is appended,
inserted, or moved into a list, and `delete`d (not nulled) by
[`List.remove()`](/framework/core/List/api/remove/) when it leaves one.

**⚠ Never serialized.** [`toJSON()`](../method/toJSON.md) never mentions it, which
makes a parent→child→parent cycle impossible to write and impossible to read
back wrong — [`hydrate()`](../method/hydrate.md) restores every `parent` by
*adoption*, appending each child through its parent's `items` as it rebuilds the
tree, never by storing and replaying a backref.

Walked by [`root()`](../method/root.md), [`contains()`](../method/contains.md),
and the delegation chain in [`save()`](../method/save.md) /
[`delete()`](../method/delete.md).
