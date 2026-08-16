`get(key)` reads `this.data[key]`, falling back to `Panel.defaults[key]` when
the key was never set. It is the *only* place `Panel.defaults` is consulted —
`data` itself never has the defaults copied into it.

⚠ **This means `get()` never returns `undefined` for a key that has a
default.** "Unset" is only observable as `item.data.x === undefined`, never
through `get()`. Nothing in this module needs that distinction today; a
caller that does would have to bypass `get()` and read `data` directly.

Why defaults live on the class instead of in `data`: see
[Decisions](/framework/ext/Panel/docs/decisions/).
