# The `structure` section — what shape is this page

On the `page` tab: the nested `.page` boxes the active page sits in — each as its `page-*`
slug plus the arrangement classes that place it — then its own direct children, one line
each, and a count.

    page-framework topic flex fill hides-nav
      ↳ page-View doc-page
    div doc-well flex
    div tabs block
    2 children · 1 flex

- **The DOM, not `router.chain()`.** A page mounts in the nearest ancestor holding a `$pages`
  region, so the page chain and the box chain can differ — and only the boxes are what CSS
  sees. Innermost row is the page you are on, in full ink; its ancestors are muted, and
  `active-page`/`active-ancestor` are dropped as repeating the row's own position.
- **A display only when it is news.** `flex`, `grid` and `none` are computed (`flow` is read
  off the class), so `.toc` reads `none` and `.page-previews` reads `grid` — neither says so
  itself; suppressed when the class list already contains the word.
- ⚠ **Drawn twice, 400ms apart.** The rail refreshes from `navigated()`, *before* the page's
  stylesheets land, and every child computes `block` until they do. Content arriving after
  the second draw — a slow `md` fetch — is missing until the tab is redrawn.
