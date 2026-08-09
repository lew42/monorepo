**Usage** — **none anywhere in `public/`.** Not one call site, in the framework or
in any sandbox. Only `edric/framework/view/page.js:100` mentions it, as prose.

**Necessity** — no. `append_to`'s mirror, written for symmetry rather than for a
caller.

**Simplicity** — it inherits `prepend()`'s problem: `is.dom(view)` branches to
`view.prepend(this.el)` (the DOM method) and everything else to `view.prepend(this)`
(the View method), so the two arms mean subtly different things. Delete with
`prepend()` — see `readme.md` §Proposed.

