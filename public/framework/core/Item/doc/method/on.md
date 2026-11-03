`(this._on[event] ??= []).push(fn)` — subscribe. Multiple listeners on the same
event are called in registration order; the same `fn` added twice is called
twice, since nothing here dedupes.

See [`emit`](emit.md) for how a listener on a parent hears a child's event
without subscribing to the child at all.
