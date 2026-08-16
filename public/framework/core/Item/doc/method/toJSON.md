`{ type: this.wire(), id: this.id, data: this.data }`, plus `items` **only when
non-empty** (`if (this.items.length) json.items = this.items.toJSON()`).

Called implicitly by `JSON.stringify` — nothing calls `toJSON()` directly except
tests. `items` omitted-when-empty (rather than `[]`) keeps a leaf node's wire
form to three keys instead of four.

**Never mentions `parent` or `saver`.** Both are instance properties assigned
outside the constructor's own fields, so `JSON.stringify`'s default behavior
would include them if this method didn't exist — this override is what makes a
parent→child→parent cycle *unserializable by construction* rather than merely
"not currently serialized." See [`hydrate()`](hydrate.md) for how `parent` comes
back.
