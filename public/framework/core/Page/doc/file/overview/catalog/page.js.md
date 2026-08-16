Second of the "Arrangements" group: the `parts` tree pairs the same cards with a
`$pages` region beside them — `initialize(){ this.catalog() }` is one line, master
–detail in full, because a child mounts wherever the nearest ancestor's `$pages`
points.

## The one detail a reader could miss without the comment

`return site.children.get("html")` at the end — the demo opens *on* a child, not
on the root, specifically so the arrangement is already doing its job the instant
the box paints rather than showing an empty region first.

## Improvements

1. **No `doc/file/overview/catalog/page.js.md` existed.** *(simple, important —
   done in this pass.)*
