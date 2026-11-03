`demo.app()` and its class, `DemoApp` — App and Router for one in-memory `Page`
tree, inside a box. Renamed from `mini-app.js` / `MiniApp` (2026-08-12): the box
was never *mini*, and the rename matched the `demo.*` namespace every other
entry point already used.

## `container()` is what makes this work with zero coordination

`this.root.assign({ app: this, $pages: this.$pages })` — the box hands itself to
the tree's root as `app`, and `Page.container()` (core) asks `app.$pages` for
where the root mounts, then walks up to the *root's* `$pages` for everything
under it. Neither side names the other beyond that one assignment; a page
inside the tree does its own `render()` with no idea it's inside a demo.

## `mark()` reimplements the Router's mark, filtered by containment

`.active-ancestor:has(.page.active-page)` is CSS in the real Router
(`mark_links()`); here it's the same idea written in JS —
`page.chain().forEach(page => { if (page.view?.el.contains(this.page.view.el))
page.view.ac("default") })` — because a parent that hands its child a region of
its own (the catalog arrangement) must stay visible on screen beside it, while
one that doesn't must not stack under it.

## The root is excluded from its own `current()` check

`url !== this.root.url && here.startsWith(url)` — without that guard, every url
in the tree starts with the root's, so the root link would read `aria-current`
from anywhere in the box, the same reason `.tab-default` gets the same
exclusion elsewhere.

## Improvements

1. **`go()` is `async` but nothing awaits its own return** — every caller
   (the click handler, `demo.tree()`'s stage) fires it and moves on. Correct
   given nothing here is actually asynchronous (`child()` resolves from an
   in-memory `Map`), but worth a comment saying so, since `async` on a
   synchronous-in-practice function reads as a hint that it does I/O.
   *(simple, speculative.)*
2. **`rail()` and `crumbs()` both fully `empty()` and rebuild on every `show()`**
   rather than diffing — fine at nine children, worth revisiting only if a much
   larger tree ever lands in a box. *(simple, speculative.)*
