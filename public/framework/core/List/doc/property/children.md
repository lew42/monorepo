The backing array — `this.children ??= []` in the constructor, so it defaults
even if nothing was passed. Every other member reads or writes this one array;
there is no second internal structure (no index Map, no id lookup) to keep in
sync.

**Usage** — iterated directly by [`Item.walk()`](/framework/core/Item/api/walk/)
(`this.items.each(...)`) and read for length/order checks in tests
(`root.items.children.map(k => k.id)`). Nothing stops reaching in and mutating
this array directly — `children.push(x)` would skip
[`adopt()`](../method/adopt.md) and the `"add"` notification entirely, silently.
That is the same shape of trap [`List`'s own readme](/framework/core/List/)
names for reaching past `Item` into `list.items.append()`: it *works*, and it
skips the thing that makes it safe.
