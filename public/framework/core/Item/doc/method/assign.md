`Object.assign(this, ...args)` — one line, called by the constructor
(`this.assign(...args)`) and by [`hydrate()`](hydrate.md)'s `Item.open()` path
(`.assign({ saver })`) to attach a saver after loading without a second
constructor shape.

**Usage** — this is how every Item is built: `new Item({ data, id })` works
because the constructor's first line is `this.assign(...args)`, so any plain
object of instance properties (`data`, `id`, `saver`, even a stray `items`
array) lands directly on the instance before the constructor's own defaulting
runs.

It is also the reason `saver` and `type` are spelled exactly that in the spec —
`new Item({ saver })` has to work with a bare assign, no renaming layer. The
same one-liner exists on [`List`](/framework/core/List/api/assign/); nothing
shares it, because sharing a two-line method across two classes with no other
relationship would cost more than it saves.
