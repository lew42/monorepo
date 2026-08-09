**Usage** — one internal caller: `tc()` (`View.js:175`), which loops it over a
space-separated list. Nothing in `public/` calls it directly.

**Necessity** — no, as a public name. As a body, yes — it is the single-class step
`tc` iterates.

**Simplicity** — the split buys nothing: `tc` could write
`this.hc(c) ? this.rc(c) : this.ac(c)` inline and lose a member. The one thing to
preserve is the *difference* between them — this one takes **one** class, `tc`
takes a list — because a reader who assumes they are aliases will pass `"a b"`
here and toggle a class literally named `a b`.

