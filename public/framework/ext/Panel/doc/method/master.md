`master()` returns the panel `this` mirrors, or `null` if `this` is not a
mirror — `this.data.mirror ? this.root().find(this.data.mirror) : null`. It is
the one lookup `get()` and `set()` both use to decide whether a shared key
should redirect.

⚠ **`|| this` at the call site is the dangling-master guard, not this
method.** `get()` reads `((Panel.shared.includes(key) && this.master()) ||
this).data[key]`, so a master that has since gone missing — `find()` returns
`undefined` for an id no longer in the tree — falls back to reading `this`
instead of throwing. But `this` (the mirror) holds none of the shared keys
itself; only `data.mirror` lives there. So the fallback reads **blank**, not
"whatever it last had" — every shared key resolves to `Panel.defaults`. Read
`master()` on its own and a widowed mirror looks identical to `null`; the
guard lives one level up on purpose.

That blank fallback is exactly why `bequeath()` exists: every verb that stops
a panel holding what its copies read (`split()`, `close()`, `absorb()`,
`generate.js`'s `sow()`) hands mastership to a surviving copy first, so a
mirror is never left pointing at an id `find()` can't resolve.
