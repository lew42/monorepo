How many levels of my declared children are fetched when I load. It is the one number that decides what opening a url costs.

- `2` (the default): my children and theirs, which is what a card wall (`walls()`) or a two-level sidebar draws.
- `1`: only my children, for a page that previews them as cards, a rail or a list.
- `0`: none, for a page that draws none of its children.

A page sets it in its config (`depth: 1`); the field initializes before `assign()`, so a declared value wins. `load_all_children(levels = this.depth)` reads it (`Page.class.js`). More: [declaring.md](../declaring.md).
