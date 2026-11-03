This node's children — always a [`List`](/framework/core/List/), never
undefined and never a bare array. The constructor takes whatever array was
passed in (or none) and re-homes it: `this.items = new List({ owner: this })`,
then appends the supplied children through the list so each is adopted.

**Usage** — read directly for iteration (`item.items.each(fn)`,
`for (const kid of item.items)`, `item.items.length`), but **mutated only
through Item's own verbs** — [`add`](../method/add.md), [`remove`](../method/remove.md),
[`move`](../method/move.md). `item.items.append(kid)` works and adopts and
notifies correctly, but says the wrong thing: see
[List's own doc](/framework/core/List/) for why the split exists at all.

Deliberately named `items`, not `children` — `Page.children` is a named nav
`Map`, and this is an ordered list where duplicates are normal.
