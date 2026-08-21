Fifth of the "Arrangements" group, and the last of it: the `handbook` tree is
three levels deep (`/handbook/css/layout/`) with a middle section whose own
`content()` calls `this.previews()` on *its* children — the one demo proving
`previews()` composes at any depth, not just at the root.

## The return value is the point again

`return site.children.get("css")` opens the demo two levels in, the same trick
`catalog/page.js` uses at one level — here it matters more, because the crumb
strip above the render is the only way to see that the tree actually goes three
deep from where the box first paints.

## Improvements

1. **No `doc/file/overview/deep/page.js.md` existed.** *(simple, important —
   done in this pass.)*
