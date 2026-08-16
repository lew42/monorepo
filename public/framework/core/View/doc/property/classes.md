Extra classes to add at construction, space-separated.

**Usage** — read once, by `classify()` (`View.js:45`). Written by
`ext/doc` for its member pages (`framework/ext/doc/Doc.js:39,65,101`
— `classes: "method"`, `"property"`, `"note"`), and by `Page` subclasses through
`render()`'s `.ac(this.classes)`.

**Necessity** — yes, as the constructor-argument form of `ac()`. It is what lets a
caller that builds a view indirectly — through `Page.add()`, through `Doc` —
still put a class on it.

**Simplicity** — right-sized. The one thing to know is the trap it shares with
`capture`:

> **A `classes = "docs"` class field never applies.** `classify()` runs inside
> `super()`, before subclass fields initialize. Name the subclass instead — the
> class-name chain is kebab-cased into CSS classes anyway.

