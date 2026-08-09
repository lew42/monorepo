**Usage** — **none.** Documented by `edric/framework/view/page.js:97`; called by
nothing.

**Necessity** — no, and it does not work. It calls `this.clone()` in a loop and
**throws every clone away** — the return value is discarded, so the copies exist
only if the ambient captor happened to catch them, which it does not, because
`clone()` builds its View with an `el` already supplied and the captor grabs it at
construction. Relying on that is the black-magic failure in miniature: the visible
code says "make three", and where they land is decided somewhere else entirely.

**Simplicity** — the honest version returns an array and lets the caller place
them, at which point it is `Array.from({length: n}, () => view.clone())` and does
not need to be a method. Delete. Proposed in `readme.md`.

