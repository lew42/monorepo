The view this one was appended to.

**Usage** — **written and never read.** `append()` sets it (`View.js:61`); no
member of `View`, and no file in `framework/`, ever reads it back. Every
`.parent` read in the framework is
`Page.parent`, which is a **different property on a different class**, assigned by
`Page.add()`.

**Necessity** — no, on current evidence. It costs one assignment per append and
buys nothing that `view.el.parentNode` does not.

**Simplicity** — the problem is not the two lines, it is the collision. `View` and
`Page` both have a `parent`, they mean different things (DOM containment vs. tree
position), and a `Page`'s `view` is a `View` — so `page.view.parent` and
`page.parent` sit one dot apart and answer different questions. Either delete this
one or record the distinction where both classes can see it. Proposed in
`readme.md`.

