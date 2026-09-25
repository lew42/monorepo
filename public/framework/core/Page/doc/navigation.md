# Navigation — pages are navigation

A page's `children:` is its menu. Opening a child is navigating: the url changes, the child becomes the active page, and its parent stays in the chain (`.active-ancestor`).

- **Declare** children as a string of folder names, an array, an object, or a function that returns any of those: [`doc/declaring.md`](./declaring.md), [`doc/data-children.md`](./data-children.md)
- **Show** them as links with `nav()`, cards with `previews()`, or a wall with `walls()` — titles, labels and icons come from [`doc/labels.md`](./labels.md)
- **Choose where a link opens** — the page that holds the link decides (`open_link`): [`doc/open.md`](./open.md)
- **Open them side by side** as columns: [`doc/columns.md`](./columns.md)
- **Related links** in a right aside: [`doc/property/related.md`](./property/related.md)
