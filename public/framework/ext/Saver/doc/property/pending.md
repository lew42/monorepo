`Saver.prototype.pending = undefined`. The next item to write, or the sentinel
meaning "nothing queued." Every `save()` call overwrites it unconditionally
(`Saver.js:11`) — there is no queue of items, only ever this one slot, which is
the entire coalescing behaviour in one field.

**Why `undefined`, specifically, and not `null` or a `has_pending` flag** —
`drain()`'s loop condition is `this.pending !== undefined`, and a saved item is
arbitrary JSON: `null`, `0`, `false` and `""` are all things a caller could
legitimately save. Only `undefined` is a value `JSON.stringify` never produces
inside a document, so it is the one sentinel that can never collide with real
data.
