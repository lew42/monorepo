# Library — browse everything we built in three columns: siblings, the chosen item at full size, its variants

Open [/framework/library/](/framework/library/) (`?at=ui/card/media` is the url of one view; reload and back land in the same place).

## Index

- `Library.js` — `class Library extends Page`, the one page; its parts are statics: `Library.Collection`, `Library.Item`, `Library.Rail`, `Library.Stage` (each its own file).
- `Collection.js` — a category, shown as chips in this order. Each may define `related(item)` (default: siblings, max 6):
  - `ui` — children of [`ui/`](/framework/ui/), mobile first, 400; related = its BANDS group.
  - `ux` — the declared children of [`ux/`](/framework/ux/), 1000, shown as their preview thumb.
  - `sections` — the 15 bands of [`styles/sections/`](/framework/styles/sections/), 1920, full bleed; each band's `section(tone)` is the specimen. Tone variants not built.
  - `layouts` — [`LayoutCatalog.entries`](/framework/styles/layouts/catalog/), 1920, drawn as the catalog screenshot plus "Open the demo →".
  - `templates` — the `Template` subclasses of [`core/Page/Template/`](/framework/core/Page/Template/) (today BigCard), one live instance, 1000.
  - `figma` — the rebuilt [Figma](/framework/ext/Figma/) pages, 1920.
- `Entry.js` — a page-shaped stand-in (title, icon, specimen, no children) for layouts and templates, which are not Pages.
- `Item.js` — wraps one Page; its variants are the page's own `children`. `render()`: the page's `specimen`, else its `content()` (figma), else its `preview()` thumb with `zoom-*` removed.
- `Rail.js` — a column of cards; each lays the item out at its `optimalWidth` and scales it with CSS `zoom`.
- `Stage.js` — the centre: width chips 400 · 1000 · 1920 · 3440, zoom-to-fit when wider than the column.
- `PaddingContract.js` — `PaddingContract.check(root)`: an item marked `needs_parent_padding` touching an unpadded parent edge gets `.padding-misuse` (red) and one `console.error`.
- [doc/decisions.md](doc/decisions.md) — decisions 1–7, 9–12, each with its alternative. [doc/tree.md](doc/tree.md) — decision 8, and what `Page` holds now.

## Use

A page joins the library by being a child of `ui/` (or listed in `Library.FIGMA`). To show the real component, not a thumb, name its render function `specimen: fn` (`demo.page()` does it for every variant). Optional per page: `optimalWidth`, `needs_parent_padding`, `no_parent_padding`.

## Watch out

- Figma pages draw their `content()` into the stage (works cleanly). A ui page with no `specimen` shows its preview thumb at 100% instead; the ones that still do: those whose component is not a local one-liner (`table`, `tree`, `controls`, `field`, `dialog`, `menu`, `words`, …).
- The padding contract is proved by a headless test, not a live demo: the live page must smoke clean. A deliberately broken box would print `[padding] demo/broken: needs_parent_padding inside an unpadded box …` and shade red.
- **The wall**: `?at=<collection>&view=wall` (the "wall / browse" toggle) puts the collection in one grid; a card spans 1–4 columns by its optimalWidth, dense flow (`Rail.wall()`).
- Not built yet: section tone variants; ux specimens (ux items show their preview thumb).

## Notes from your asks

- Stage code waits until its stage is designed in Figma, and is built after that design lands. ([your words](/framework/ai/sessions/87bec773-d6dd-421c-92cc-fdd8a9eb5103/?tab=coverage#p11044), 2026-10-12)
