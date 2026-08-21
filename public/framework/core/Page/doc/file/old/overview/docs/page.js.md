Second of the "Sites" group: the `docs` tree is four prose pages sharing one
shape — a `const doc = { icon, content(){ … } }` spread into every child — with a
`next` pointer chaining them into a reading order via `this.parent.children.get`.

## The pattern it teaches generalizes past this demo

`{ ...doc, next: "pages", body: "…" }` is the answer to "four pages that are 90%
identical" without a base class or a template system — plain object spread, on a
plain `children:` POJO. Any doc-site-shaped section of the real site (and several
exist) is this exact pattern at a larger scale.

## Improvements

1. **No `doc/file/overview/docs/page.js.md` existed.** *(simple, important —
   done in this pass.)*
