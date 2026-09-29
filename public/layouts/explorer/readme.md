# Explorer — every layout on the site, walked as one tree

[**/layouts/explorer/**](/layouts/explorer/) is a three-column browser: the current level's
items on the left, the one you picked large in the middle, and its variants on the right. Click
a variant and it slides into the middle, and the old right becomes the new left — the owner's
own words for it: "the right sidebar becomes the left ... the currently selected one becomes the
main view."

## Use

- Start at the top and the left rail is the categories: one column, two columns, three columns,
  many, mobile, mega, how to choose, the approved five.
- Click a category, then a layout id, then (where there are any) a real page built from it — a
  sidebar variant, a "how to choose" question, a page at 3440. Every stop has its own url, so
  reload and back both land in the same place.
- Adding a layout to the tree is one object in [`explorer.json`](./explorer.json) —
  [`doc/adding.md`](/layouts/explorer/doc/adding/) has the shape.

## Watch out

- **This is a SEPARATE tree from the site's real page tree**, on purpose — the html study this
  task followed found that nesting real pages the way a Finder column browser does keeps every
  ancestor mounted just to show a window three wide. `explorer.json` is its own small file; a
  node's `wire` or `url` points at the real thing, but the tree shape itself is this page's own.
- **A card never renders a live page.** An id with a `wire` in `layouts.json` gets the layout
  standard's own drawing (`Layout.frame()`, already built for `/layouts/`); a node with a `url`
  gets a lazy `<iframe>` of the real page, shrunk the same way `Layout.js` shrinks its own
  wireframes — a container-query `zoom`, never a screenshot.
- **The ☰ drawer does not hold this page's properties.** `ext/drawer`'s tabs are a fixed,
  registered list (AI, Sessions, Dictation, Settings, Admin) and this task's fence did not reach
  that module, so the selected item's title, address, description and child count are a small
  strip under the centre view instead — the brief's own named fallback.
- **`std-` is this page's CSS prefix**, already registered for `/layouts` in
  `framework/styles/css-scopes.txt` — no new prefix was needed.

## More

- [`explorer.json`](./explorer.json) — the tree: every category, every layout id, every real
  page, one object each
- [`doc/adding.md`](/layouts/explorer/doc/adding/) — how to add a layout to the tree
- The html study this page follows: `/framework/ai/2026/09/29/layout-explorer-3-columns-and-a-study-of/html-study.md`
