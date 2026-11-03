# Catalog — every page with a demo as a live preview, plus every class card

Open [/framework/catalog/](/framework/catalog/): a card per page (a scaled live iframe, loaded only when it scrolls into view), new ones marked NEW, grouped like the sidebar. Click a card for the full demo. Order: the NEW pages first (so the first screen is previews of what you have not seen), then the live instance hierarchy links, the class cards (Refine, Dictate, System first), then every group.

- `catalog.jsonl` is computed, never typed: `node public/framework/catalog/build.mjs` walks the page tree (`page.js` folders under core, ext, ux, ui, code, lab, library, design, styles) and writes one line per page and per class (`<Name>/<Name>.js`). Re-run it after adding a page.
- `CatalogPage.js` (`class CatalogPage extends Page`), `CatalogPage.css`, `page.js`.
- NEW = the page's `page.js` first landed in git after 2026-10-01 (no page-visit log exists to say what you have seen).
- Live instance hierarchy: exists as [the Page object](/framework/ux/Content/Object/page/) and [the App object](/framework/ux/Content/Object/app/); the whole running site is now [InstanceTree](/framework/ux/Content/Object/instance-tree/), live ([spec and status](doc/instance-tree.md)).

## Watch out
- Pictures first: each card shows `thumbs/<slug>.webp` (git-ignored, made by `node Server/CatalogThumbs.mjs --apply`; refresh stale ones the same way, `--all` reshoots) and boots its live iframe on hover. No picture = the iframe loads 4 at a time (~10 s for 40). Numbers and what is not deployed: [doc/next.md](doc/next.md).
- A page that holds the main thread freezes every preview: list it in `NO_PREVIEW` (today: `code/performance/bench/`). A preview never loads previews of its own (the catalog is a card in itself).
- Page methods named `icon` or `link` shadow the page's own; the class uses `glyph()` and `anchor()`.
- `framework.css` caps `iframe` at `max-width: 100%`; the preview frames reset it or the page renders narrow.
