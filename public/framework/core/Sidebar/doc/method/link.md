One row: an optional icon and a label, inside a real `<a href>`.

## Usage

- `Sidebar.js:86` — `nav()`, for a flat entry.
- `Sidebar.js:96` — `group()`, for every entry inside a group.

## Necessity

Essential, and the note on `Sidebar.js:100` is the whole justification for it
existing rather than borrowing:

> **Built here, never borrowed from `page.link()`** — that handed every row a
> second component's class, and which won came down to stylesheet order.

`.page-link` and `.sidebar-link` style the same thing differently. A row wearing
both is decided by whichever sheet loaded last, which is not a decision anyone made.

`page.label ?? page.title` is where an entry's two spellings resolve, and the order
matters: **a label belongs to the list it appears in, a title to the page.** They
are not two names for one thing. [entries](/framework/core/Sidebar/doc/entries/).

## Simplicity

Right-sized at five lines. The row is a plain anchor with a real `href`, which is
what lets `Router.mark_links()` light it — **no view compares `window.location`
itself**, so the panel cannot disagree with the tab bar or the breadcrumb about
where you are.

It reads `page.url` without checking it. An entry with no `url` renders
`href="undefined"`, silently — the one input this class does not validate, and the
only way to hit it is a malformed entry or a nested group.
