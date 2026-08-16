`child.parent = this.owner ?? this; return child;` — one line, called by every
mutator ([`append`](append.md), [`insert_before`](insert_before.md)) before it
touches the array.

**⚠ Sets `parent` to the `owner`, not to the list itself.** This is the whole
reason [`owner`](../property/owner.md) exists: a child's `parent` is always an
**Item**, so [`Item.root()`](/framework/core/Item/api/root/) and the
[`save()`](/framework/core/Item/api/save/)/[`delete()`](/framework/core/Item/api/delete/)
delegation chain never have to know a `List` exists — they just walk `.parent`
and every hop is another Item.

An earlier version set `parent = list` and needed a no-op `adopt()` override on
every `List` subclass to undo that mistake at the point of use. Reading `owner`
here instead deletes that whole workaround.
