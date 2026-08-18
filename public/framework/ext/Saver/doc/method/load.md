The base implementation shown here is a stub — `Promise.resolve(null)` — because
`Saver` itself persists nothing. Every real backend overrides it: see
[Saver.js](/framework/ext/Saver/files/) and the individual file pages for
[`FileSaver.js`](/framework/ext/Saver/files/), [`LocalStorageSaver.js`](/framework/ext/Saver/files/)
and [`MemorySaver.js`](/framework/ext/Saver/files/).

**Contract, honoured by all three** — resolves the stored JSON, or `null` if
nothing has been saved yet. **A 404 / missing key / empty store is `null`, not a
rejection** — a document that does not exist yet is the normal first run, and a
caller checks `=== null` rather than wrapping the call in `try/catch`. See
[backends](/framework/ext/Saver/doc/backends/) for what "missing" means per
backend.

**Usage** — `core/Item.open(saver)` is the intended caller (documented, not yet
wired: `core/Item/readme.md`); today every real caller reads it directly,
e.g. `ext/editor/page.js`'s startup load.
