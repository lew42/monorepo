## One delta, key by key

`set({ title: "B", count: 2 })` applies each key in order, and each key does one of three things:

- **A method's name** calls it: `set({ remove: [] })` is `remove()`. This is how a saved line replays a verb.
- **A list's name, then a member's id** walks into it: `set({ items: { milk: { set: { count: 2 } } } })` changes `milk`. A dotted key is the same path: `set({ "items.milk": { set: { count: 2 } } })`.
- **Anything else** is a field: it goes into `data`, and only if the value changed it emits `change` and `delta`.

`set("title", "B")` is the same as `set({ title: "B" })`.

**An Item as a value is adopted:** `set("prop", anotherItem)` makes the item its parent, and its later changes are saved under `prop`. **Watch out:** a List as a value is still stored as a plain snapshot and never saved again (its owner is fixed when it is made); give the class a declared list instead ([architecture.md](../architecture.md), "set adopts").
