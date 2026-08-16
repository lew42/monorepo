# browse-grids

## The ask, verbatim

> best way to get a masonry layout?

> create examples of both, and add them to styles/layouts/
>
> let's redo the styles/layouts/ page, to be a big grid of layout previews. try to
> organize them into sections. create an inner left sidebar for filters. make the
> whole page a full-width and fill-height ext/Panel

> move all the framework/ui/ things out of the top tab. leave overview, api, docs,
> files. put them back into a preview grid

## Decisions taken before the first edit (Mike, at the keyboard)

| question | answer |
|---|---|
| The index's ~10 paragraphs of prose | **Its own child page** — `styles/layouts/model/`, first card in the grid. Every word kept, one click away. |
| Which ext/Panel door | **`panel(seed)`, no saver** — a fixed two-leaf tree with a real draggable seam. Nothing a visitor drags survives a reload. |
| Where masonry's CSS lives | **New utility words in `framework.css`** — `.masonry` (columns) and `.packed` (grid + JS spans), so `layouts/readme.md`'s "no stylesheet in any layout directory" stays true. |

## Scope

- `public/framework/framework.css` — two new utility words.
- `public/framework/styles/layouts/masonry/` — new: the two techniques.
- `public/framework/styles/layouts/model/` — new: the index prose, moved verbatim.
- `public/framework/styles/layouts/page.js` — redone: `catalog()` → a `panel()` of
  filter rail | preview grid.
- `public/framework/ui/page.js` — 19 components out of the tab strip.
- Readmes and `doc/*.md` for each of the above.

## Traps already found (do not rediscover)

- **`tabs()` registers the mount region from the same list it draws the strip
  from** (`ext/tabs/tabs.js:34`). Dropping the 19 `ui/` components from `bar()`
  also strips `/framework/ui/table/` of its `regions` entry, and `container()`
  then walks up to `/framework/`'s `$pages` — the component would render *over*
  the framework sidebar instead of in the doc's panel. Shorten the strip, keep
  the regions.
- **`ui/` is the only Doc with a large child list** (19). `core/Page/` (5),
  `ext/LayoutTool/` (5), `ext/catalog/` (4) are fine as tabs — so this is a
  per-page override on `ui/page.js`, **not** a change to `Doc.bar()`.
- **`layouts/readme.md` records `catalog()` as the verdict** for this index
  ("The index is a catalog, and the ladders are gone"). That verdict is being
  reopened by the person at the keyboard (RULE#2) — the readme has to say so in
  the same breath, with the reason.
- **`previews()` already renders `group:` headings** (`Page.class.js:214`), and
  the layouts already declare five groups — Vocabulary · Pages · Apps · Streams ·
  Instrument. "Organized into sections" is free; nothing new is needed for it.

## Steps

1. Masonry utility words in `framework.css` + `masonry.js` (the span packer).
2. `styles/layouts/masonry/` — both techniques, one page each, under the parent.
3. `styles/layouts/model/` — the index prose moved verbatim, with its own url.
4. Layouts index → a full-bleed, fill-height `panel()`: filter rail | preview grid.
5. Filters wired — by group, and by the traits worth filtering on.
6. `ui/page.js` — components out of the tab strip, regions kept, grid in the Overview.
7. Verify live at 400 / 1280 / 1920 / 3440, and crawl every url this touched.
8. Docs — readmes, `doc/*.md`, the reopened `catalog()` verdict, land.
