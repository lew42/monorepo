The captor stack. `set_captor()` pushes, `restore_captor()` pops.

**Usage** — two callers, both inside the class (`View.js:397,402`). Nothing reads
it.

**Necessity** — yes. A single slot would break the first time a capture nested,
which is every `div(() => div(() => …))` on the site.

**Simplicity** — right-sized: an array, two operations. One placement constraint,
stated in the file because it cannot be inferred:

> It is declared **after** the class body (`View.js:518`), and `View.stylesheet()`
> is called two lines later. A `stylesheet()` call above the declaration throws
> "Cannot read properties of undefined" — because it builds a View, which runs
> `append_fn`, which pushes here.

It is never trimmed. An unbalanced `set_captor` leaves an entry behind for the life
of the document, silently; nothing checks depth.

