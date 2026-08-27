# Page — a node: a url, some content, and children. Dormant, so `export default new Page(…)` is always import-safe; the class every `page.js` on the site exports.

## Use
```js
import { Page, md } from "/app.js";

export default new Page({
    meta: import.meta,              // the folder is the route — nothing registers anything
    title: "Docs",
    children: "intro guide api",    // child folders, in menu order; forgetting one costs the menu entry, not the url
    content(){ md("Hello."); this.previews(); },
});
```

The file is the route: `./x/` renders `./x.md` as markdown when no `page.js` claims `x` — write a `.md` beside a page, link to it, and it is a page. Nothing crawls; the **link** is the naming.

## Watch out
- A `.md` becomes a page only where the fallback looks — **beside** a page, one segment down; and the `.md` url itself is always the raw file, so the probe is content-type gated (the SPA fallback answers a miss with `index.html` at **200**): [`doc/declaring.md`](./doc/declaring.md)
- A page IS the shell grid — `main` (prose, `--measure: 40em`), `wide` (all the leftover), `bleed` (edge to edge, and it SPENDS the gutter tracks — prefer `wide`). Never `--measure: none`: [`/framework/styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md)
- Overriding `render()` owes three silent things — set `this.view`, carry `.page`, never nest a second `.page` — and a flex/grid override owns its children's spacing (`gap`, not `flow`): [`doc/decisions.md`](./doc/decisions.md)
- A page placed with no mark and no `default` is `display: none`, and nothing throws; `warn_if_hidden()` says so on localhost only: [`doc/decisions.md`](./doc/decisions.md)
- `.page` visibility is decided in `@layer util`, so it out-ranks the `.grid` / `.flex` a page wears; `.active-page` and `.active-ancestor` are one question asked two ways — read both: [`doc/css.md`](./doc/css.md)
- `children` changes type — you write a string, you read a `Map`: [`doc/property/children.md`](./doc/property/children.md)
- A demo tree must not name children as a string — that probes the server for `<url>a/page.js`; use a POJO (`children: { HTML(){ … } }`) and a fictional root url: [`doc/decisions.md`](./doc/decisions.md)
- `render()` stamps `page--<name>` (double dash) — a single dash let a directory named after a `Page.css` class (`previews`) silently wear its styles: [`doc/decisions.md`](./doc/decisions.md)
- A card's thumb is inert — the label is the only link, because `<a>` in `<a>` is un-nested silently: [`doc/css.md`](./doc/css.md)
- `columns()` makes the whole subtree a row of full-height columns; each page picks its track with `width: "small" | "large" | "full"`. It reads `--page-column-max`, never `--measure` — a region that sets `--measure: none` would uncap every column: [`doc/columns.md`](./doc/columns.md)

## More
- [Overview](/framework/core/Page/) — **the palette**: 29 cards, four bands (`page.js`'s `BANDS`) — building blocks · pages are navigation · the box · recipes. Every card is a *picture* of the shape (`ext/demo/mini.js`), and the first band is the [page generator](/framework/core/Page/generator/)'s own vocabulary · [`doc/decisions.md`](./doc/decisions.md) — the record: callers, every verdict, proposed, open · [`doc/declaring.md`](./doc/declaring.md) — the children list, eager loading, the CMS question · [`doc/labels.md`](./doc/labels.md) — titles, labels, icons, cards · [`doc/css.md`](./doc/css.md) — visibility, the sheet, rhythm, the cards · [`doc/layout.md`](./doc/layout.md) — **open:** nested vs `full`, and why alternating between them is tricky · [`doc/columns.md`](./doc/columns.md) — `columns()`, the four width words, and the crumb strip: the tree stays, `display: contents` flattens the layout
- **Old** — the first pass at these docs, kept while they're rewritten: [`old/readme.md`](./old/readme.md); `old/overview/readme.md` — the fifteen demo trees, now top tabs instead of a rail
- `doc/method/*.md`, `doc/property/*.md` — one page per member, under API
- Files that matter: `Page.class.js` (the class), `Page.css` (every `.page-*` rule), `page.js` (the doc root)
