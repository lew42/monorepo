# Brief: tree-fixes

Four small items left by today's landings, each verified headless on a private server
(`PORT=8131 node server.js` from the repo root, background, killed by its real Windows PID).

## Deliverables

1. **`ux/Tree` leaf awareness** — a page with `leaf: true` (read `core/Page/readme.md` for the
   field) has children that are not navigation; a `root:` tree must not expand into them. Read
   `ai/2026-09-18/site-sidebar-tree/task.jsonl`'s landing and `core/Sidebar/doc/decisions.md` for
   the exact case; fix in `public/framework/ux/Tree/Tree.js`.

2. **Two `ux/Tree` defects** that `real-page-move` guarded around inside Make (read
   `public/imagine/paging/make/doc/decisions.md` §5): a drop is followed by a `click` that
   re-selects the row (it cancelled a confirm question — suppress the synthetic click after a
   drop), and an unopened branch counts as zero children (a drop into a folded page landed first
   instead of last — count the node's real children). Fix in `ux/Tree`, then remove Make's guards
   if they are now dead (read them; if they do more, leave them and say so).

3. **The six `root:` swaps** — `core/Sidebar` now takes `root: <a Page>` for a deep, lazy,
   adaptive tree, but its six production callers still pass `pages: this.sections()` (find them:
   `rg -l "pages: this.sections\(\)|new Sidebar\(" public --glob "*.js"` — list them, expect six;
   `framework/page.js` is one). Swap each to `root: this` ONLY where the visible result is the
   same first level plus deeper reach; load each page after at 1280 and 3440; count the
   first-level rows before and after (they must agree) and say which pages now reach deeper.

4. **Docs**: one line each in `ux/Tree/doc/decisions.md` and `core/Sidebar/readme.md`.

## Fence

`public/framework/ux/Tree/**`, the six caller files (the `Sidebar(...)` call only),
`public/imagine/paging/make/**` (the dead guards only), your task dir. Nothing else — not
`core/Sidebar` itself, not `core/Page` (another minion is in it).

## Constraints

- The owner's dev server on port 80 is running: never touch it; LiveReload pushes edits to their
  tabs, so one write per file and verify within a minute.
- Never `git stash`, never `find /`, never drive the owner's tabs.
- An `rg` pattern starting with `/` returns nothing here — drop the slash.

## Final report shape

Five lines, one per item, each with what changed and the number that proves it.
