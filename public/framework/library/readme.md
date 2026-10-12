# Library — browse everything we built in three columns: siblings, the chosen item at full size, its variants

Open [/framework/library/](/framework/library/) (`?at=ui/card/media` is the url of one view; reload and back land in the same place).

## Index

- `Library.js` — `class Library extends Page`, the one page; its parts are statics: `Library.Collection`, `Library.Item`, `Library.Rail`, `Library.Stage` (each its own file).
- `Collection.js` — a category: `ui` (children of [`ui/`](/framework/ui/), mobile first, 400) and `figma` (the rebuilt [Figma](/framework/ext/Figma/) pages, 1920).
- `Item.js` — wraps one Page; its variants are the page's own `children`. `render()`: the page's `specimen`, else its `content()` (figma), else its `preview()` thumb with `zoom-*` removed.
- `Rail.js` — a column of cards; each lays the item out at its `optimalWidth` and scales it with CSS `zoom`.
- `Stage.js` — the centre: width chips 400 · 1000 · 1920 · 3440, zoom-to-fit when wider than the column.
- `PaddingContract.js` — `PaddingContract.check(root)`: an item marked `needs_parent_padding` touching an unpadded parent edge gets `.padding-misuse` (red) and one `console.error`.
- [doc/decisions.md](doc/decisions.md) — decisions 1–7, each with its alternative. [doc/tree.md](doc/tree.md) — decision 8, and what `Page` holds now.

## Use

A page joins the library by being a child of `ui/` (or listed in `Library.FIGMA`). To show the real component, not a thumb, name its render function `specimen: fn` (`demo.page()` does it for every variant). Optional per page: `optimalWidth`, `needs_parent_padding`, `no_parent_padding`.

## Watch out

- Figma pages draw their `content()` into the stage (works cleanly). A ui page with no `specimen` shows its preview thumb at 100% instead; the ones that still do: those whose component is not a local one-liner (`table`, `tree`, `controls`, `field`, `dialog`, `menu`, `words`, …).
- The padding contract is proved by a headless test, not a live demo: the live page must smoke clean. A deliberately broken box would print `[padding] demo/broken: needs_parent_padding inside an unpadded box …` and shade red.
- Not built yet: `ux/`, sections, layouts, templates, and `Library.Rail` as a masonry/span-by-width wall (rails stack one column).
