# Navigation — pages are navigation

A page's `children:` is its menu. Opening a child is navigating: the url changes, the child becomes the active page, and its parent stays in the chain (`.active-ancestor`).

- **Declare** children as a string of folder names, an array, an object, or a function that returns any of those: [`doc/declaring.md`](./declaring.md), [`doc/data-children.md`](./data-children.md)
- **Show** them as links with `nav()`, cards with `previews()`, or a wall with `walls()` — titles, labels and icons come from [`doc/labels.md`](./labels.md)
- **Choose where a link opens** — the page that holds the link decides (`open_link`): [`doc/open.md`](./open.md)
- **Open them side by side** as columns: [`doc/columns.md`](./columns.md)
- **Related links** in a right aside: [`doc/property/related.md`](./property/related.md)

## When you add a page: index it twice (the owner, 2026-11-01)

A new page that nothing links to is forgotten. Every time something is added to the site, and above all a page, do two kinds of indexing before you call it done:

1. **Index the page itself, among the site.** Ask which existing pages should point to it, and link it from them: its parent's `children:` first, then the index-like pages a reader browses (the section's main page, the framework page, a readme's table). Be generous: a link too many is easy to remove later; a missing one means the page is lost.
2. **Index its contents.** The page's own sub-pages and files are listed on it, near the top, as a table of contents: links first, then explanation. A summary of everything with plenty of links usually beats paragraphs, numbers or diagrams on an index page.
3. **Check the order.** What a reader sees first should be the map (the links), in a sensible order. Stats, intros and pictures come after.

Readmes follow the same rule, scoped by path. A folder's `readme.md` says something about every file and folder in it (an index with a one-line overview each) and links to the deeper readme instead of repeating it. Don't promote a deep item into a grandparent's readme unless there's a good reason: an agent reading the framework readme for one task should not be pulled into every project. A folder that grows past about 10 to 20 items is a candidate for grouping. Indexes are kept by agents for now; data that changes often should be indexed by a script instead, never copied by hand into two places. A periodic minion audit ("is everything in this folder indexed?") is the check.

Before sending anyone a link to a page or a preview, or proposing a merge: load it in a browser yourself first. A blank page must never reach the owner. If you can't open the deploy yourself, `node Server/PreviewCheck.mjs <url>` loads it in a headless browser (optional; it lists pages that come up blank, throw, or get HTML where a module should be).

A page that is only a `page.jsonl` (no `page.js`) is found on a static host through its parent's `files.jsonl` line `{"file":"<name>/page.jsonl"}`: commit that line, or Cloudflare answers the router's `<name>/page.js` request with `index.html` and the pages that load it break (2026-11-01). The dev server writes the line; a Linux clone also rewrites many unrelated lists, so commit only the lines for what you added.
