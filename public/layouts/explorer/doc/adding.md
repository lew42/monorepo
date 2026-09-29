# Adding a layout to the explorer

One object in [`explorer.json`](../explorer.json), inside the `children` array of the category
it belongs under (or a new top-level category, same shape):

```json
{ "id": "1-flow", "title": "Flow", "wire": "1-flow" }
```

Three fields do all the work:

- **`id`** — the url segment. Lowercase, dashes, no spaces — the same shape every id on the site
  already uses.
- **`title`** — what the card and the breadcrumb say.
- **`wire`** *or* **`url`**, not both:
  - `wire` is a `layouts.json` id (see [`/layouts/`](/layouts/)) — the card and the centre view
    draw the layout standard's own wireframe, live, with no picture to take or keep current.
  - `url` is a real page's address — the card and the centre view load it in a small, shrunk
    `<iframe>`, so whatever that page looks like today is what the explorer shows today.
  - Neither field: this node is a pure category (like "Two columns") — it borrows its own
    picture from its first child (recursively, if that child is a category too), and its
    `description` and full children sit one click to the right.

`children` nests the same shape, so a layout with real variants (the way `2-sidebar` holds the
five [`Sidebar` variants](/framework/core/Sidebar/variants/)) gets its own `children` array of
`{ id, title, url }` objects, one per variant.

Nothing else to touch — no CSS, no new page.js. `page.js`'s own `route()` reads the file fresh
on every request the tree can answer.
