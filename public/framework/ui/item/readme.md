# item — one row: an optional icon, then a name

The owner's own words: "it's just a single line, an icon, and a name." `item()` is that row,
plus two things that ride along for free: a right-side end (a ⋯ menu or a → for a link), and a
tree, when it has children — built on the browser's own `<details>`/`<summary>`, so the open and
shut state needs no script at all.

## Use

```js
import { ui } from "/app.js";

ui.item({ icon: "description", name: "readme.md", href: "/framework/ui/item/" });

ui.item({ icon: "folder", name: "core", open: true, children: [
	{ icon: "description", name: "View.js", href: "/framework/core/View/", end: "arrow" },
] });
```

`children` is an array of the same shape, nested to any depth (a file tree), or a function that
draws its own content instead. `end` is `"menu"` (a ⋯ button — wire its click yourself, this only
draws it), `"arrow"` (a plain →, for a link row), or a function for anything else. Add `.inline`
yourself (`ui.item({ … }).ac("inline")`) for a row that hugs its own content instead of filling
the line — a chip inside a line of text rather than a row in a list. Add `.boxed` for the
background-and-border look every plain `<button>` on the site already has — `.item` is flat by
default (no border, no background, a light hover wash), because a tree of boxed rows reads as a
stack of buttons, not a tree.

## Watch out

- **`children` and `href` don't mix in this first version.** A branch is a `<summary>`, and its
  `href` is never read — an item is a link OR a tree node, not both yet: [item.js](item.js).
- The padding is a control's own, tightened on the sides — not a page-region `.pad` and not a
  card's `--pad-card`, because a row's size is about its own text, the same reasoning every
  button and nav item already follows: [item.js](item.js), the padding note beside the CSS.
- `core/Item` is a different thing with a similar name — a persistence base class, not this.
  Kept separate, on purpose: [doc/core-item.md](doc/core-item.md).

## More

- [Overview](/framework/ui/item/) — the framework's own folder tree, drawn live, and all seven variants side by side.
- [doc/reuse.md](doc/reuse.md) — where `.item` could replace a row in `ux/Tree`, `ux/Content/Disclosure` or `ext/files`, at low risk, in a later pass.
- [doc/core-item.md](doc/core-item.md) — `core/Item` compared, and the recommendation.
- Back to [UI](/framework/ui/).
