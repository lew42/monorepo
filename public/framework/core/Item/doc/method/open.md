The one async entry point: `const json = await saver.load(); return
Item.hydrate(json ?? {}).assign({ saver });`

**⚠ Construction itself never does I/O — this is why `open()` exists
separately from `new Item()`.** An earlier shape let a saver's `load()` land
*after* a subclass's constructor ran, which meant `load()` could arrive after
the subclass had already set its own field defaults and quietly wipe them.
`open()` fixes the ordering by making it explicit: **load → sync hydrate →
attach saver**, three steps, no interleaving possible because each is awaited
or synchronous in sequence.

`saver` is attached with [`assign()`](assign.md) *after* hydrate returns, not
passed into `hydrate()` itself — so the tree hydrates with no saver at all
during construction, and only the returned root ever gets one. A child mid-tree
never has a saver unless something sets one later.
