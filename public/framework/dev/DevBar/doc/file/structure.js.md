The `structure` section of the `page` tab: the nested `.page` boxes the active page sits
in, then that page's own children and how each lays out. It walks the **DOM** rather than
`router.chain()` — a page mounts in the nearest ancestor holding a `$pages` region, so only
the boxes are what CSS sees.

⚠ It draws **twice**, 400ms apart, and the second is the true one: the rail refreshes from
`navigated()`, before the page's stylesheets land, and until they do every child computes
`block`. The record, with the rest of the reasoning: [`doc/structure.md`](/framework/dev/DevBar/doc/structure/).
