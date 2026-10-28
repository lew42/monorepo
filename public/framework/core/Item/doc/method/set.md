## One delta, key by key

`set({ title: "B", count: 2 })` applies each key in order, and each key does one of three things:

- **A method's name** calls it: `set({ remove: [] })` is `remove()`. This is how a saved line replays a verb.
- **A child's id or a list's name** walks into it: `set({ milk: { set: { count: 2 } } })` changes `milk`.
- **Anything else** is a field: it goes into `data`, and only if the value changed it emits `change` and `delta`.

`set("title", "B")` is the same as `set({ title: "B" })`.

**Watch out:** an Item or a List passed as a field value is stored as a plain snapshot and never saved again. Give the class a declared list instead ([delta-flow.md](/framework/core/Session/tasks/data-shapes/seats/delta-flow/delta-flow.md), "Would set of a List or an Item wire up persistence?").
