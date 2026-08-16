Adopts, pushes to the end, notifies: `this.adopt(child); this.children.push(child);
return this.notify("add", child);`

**Usage** — the primitive [`Item.add()`](/framework/core/Item/api/add/) and
[`Item.move()`](/framework/core/Item/api/move/) (via
[`insert_before`](insert_before.md)) build on. Called directly on `list.items`
by demo/test code in this pair's own `page.js` files and nowhere else in the
framework — every real caller goes through the `Item` verb instead. See the
readme: `list.append()` *works* the same as `item.add()` underneath, the
distinction is purely which vocabulary a reader has to learn.
