Queues `item` for the write, and returns a promise for **your** write landing —
not for the queue emptying in general. Every backend inherits this unchanged;
none of them override it.

**Usage** — the only method most callers ever touch: `saver.save(doc)`. Called
without a backing await in [`dev/DevBar/settings.js`](/framework/dev/DevBar/)
(`set()`) and awaited in the shared checks on this page.

**Contract** — `this.pending = item` first, unconditionally, so the *last* call
before a drain reads it always wins over an earlier one still queued. Then: a
write already in flight → hand back that same promise (your item will be
picked up inside it, see [`drain`](/framework/ext/Saver/api/drain/)); nothing in
flight → start one.

⚠ **The returned promise resolves when your state is on disk, not when the next
write starts.** It is the `drain()` promise, which only settles once
`this.pending` is back to `undefined` — including a write your own call caused
to be queued. A caller that fires `save()` and never reads the result has no way
to know a write failed; see [`write`](/framework/ext/Saver/api/write/).
