# Adoption: how `parent` stays one hop

Every `Item` owns exactly one `List`, built as `new List({ owner: this })`. The
`owner` reference is the entire mechanism behind a rule that spans both
classes: **a child's `parent` is always an `Item`, never a `List`.**

```js
adopt(child){
    child.parent = this.owner ?? this;   // the Item, not this list
    return child;
}
```

[`append`](method/append.md) and [`insert_before`](method/insert_before.md)
both call `adopt()` before touching the array; [`remove`](method/remove.md)
clears `parent` on the way out, guarded so a node already re-adopted elsewhere
is left alone.

## Why this is worth its own page

It is the answer to a question that looks obvious and isn't: when a `List` is
just a plumbing detail of `Item`, why does `parent` point at the `Item` and not
at the `List` that actually did the splicing? Because every consumer of
`parent` — [`Item.root()`](/framework/core/Item/api/root/),
[`Item.contains()`](/framework/core/Item/api/contains/), the
[`save()`](/framework/core/Item/api/save/)/[`delete()`](/framework/core/Item/api/delete/)
delegation chain — wants to walk **Items**, and a `parent` chain that stepped
through a `List` every other hop would need every one of those methods to know
`List` exists and skip over it.

An earlier version set `child.parent = list` directly and needed a **no-op
`adopt()` override on every `List` subclass** to undo that at each call site —
a workaround for a decision made one layer down. Reading `owner` instead of
`this` removes the need for the override to exist at all.

## Why hydrate restores this instead of storing it

`parent` is never serialized ([`Item.toJSON`](/framework/core/Item/api/toJSON/)
never mentions it). [`Item.hydrate()`](/framework/core/Item/api/hydrate/)
rebuilds the whole chain by calling `item.items.append(kid)` for every child it
reads — which runs `adopt()` again, for free, as a side effect of building the
tree the normal way. There is no separate "restore backrefs" pass and nothing
to keep in sync with the wire format, because the wire format never had a
backref to begin with.
