Third in the rail: the `manual` tree is the one demo built almost entirely
outside its own `children:` list — one child added from `initialize()`, two more
chained onto the constructed page from outside, three levels deep by the end.

## What only this demo can show

`add()` returning the child, not the parent, so a caller can chain a level deeper
(`site.add("css", …).add("layout", …)`) — a fact `children:` declarations can
never demonstrate, since they never call `add()` directly. The crumb strip at
`/manual/css/layout/` is the receipt that the chain actually nested.

## Improvements

1. **No `doc/file/overview/add/page.js.md` existed.** *(simple, important —
   done in this pass.)*
