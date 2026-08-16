Depth-first, pre-order: calls `fn(this)`, then recurses into every child's
`walk(fn)`. Nothing stops `fn` from mutating the tree it's walking — that is on
the caller, same as mutating an array mid-`forEach`.

**Usage** — [`find(id)`](find.md) is `walk` with a bail-in-spirit-but-not-in-fact
predicate (it does not actually stop early; see that page). Anything that needs
"every node, in document order" — export, a full-tree validation pass — reaches
for this rather than writing its own recursion over `items`.
