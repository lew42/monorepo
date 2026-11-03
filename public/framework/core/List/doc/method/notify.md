`this.owner?.emit?.(event, child); return this;` — the only place a `List`
touches the outside world. Both `?.`s matter: a list built with no `owner`
(nothing in this framework does that, but nothing forbids it) notifies nobody,
silently, rather than throwing.

**This is the entire "one listener at the root" mechanism from the List side.**
[`append`](append.md) and [`remove`](remove.md) call this with `"add"` /
`"remove"`; [`Item.emit`](/framework/core/Item/api/emit/) does the actual
bubbling once the event reaches the owning Item. `List` itself has no listener
list, no subscribe method, no idea who's listening — it just hands the event to
its owner and steps out of the way.
