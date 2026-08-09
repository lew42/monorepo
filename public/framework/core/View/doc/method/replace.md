**Usage** — **none in `framework/`.** Three sandbox pages document it
(`alex/framework/view/page.js:45`, `arya/framework/view/page.js:64`,
`edric/framework/view/page.js:94`); no file calls it.

**Necessity** — no. Every real "swap this out" on the site is `empty(fn)` on a
container that was placed once, which is both cheaper and captor-correct.

**Simplicity** — right-sized as written (`view.el ? view.el : view` accepts a View
or a node). The proposal is deletion, with the note that `empty()` is the shape
the codebase actually reaches for.

