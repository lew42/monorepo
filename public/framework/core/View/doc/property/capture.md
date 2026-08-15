Whether this view hands itself to the current captor when constructed.

**Usage** — read once, in `prerender()` (`View.js:22`). Set to `false` in exactly
two places, both of which must escape the captor: `stylesheet()`'s `<link>`
(`View.js:369`) and `View.body()` (`View.js:434`).

**Necessity** — yes. Without it, importing a module mid-render would drop that
module's `<link>` into whatever paragraph was being built.

**Simplicity** — right-sized, with one placement rule that fails silently:

> It lives on View's **prototype** (`View.js:466`), not as a class field. A field
> would shadow whatever a subclass declared, and — like everything `prerender()`
> reads — it is read inside `super()`, so a subclass's `capture = false` field
> initializes too late to be seen. A constructor argument or a prototype
> assignment, never a field.

