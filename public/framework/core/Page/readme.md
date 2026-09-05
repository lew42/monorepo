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
- `columns()` makes the whole subtree a row of full-height columns; each page picks its track with `width: "small" | "large" | "full"`, a child marked `classes: "default"` is the one the host arrives with, and an index whose `content()` already draws its children says `index: true` so core leaves its row list out. It reads `--page-column-max`, never `--measure` — a region that sets `--measure: none` would uncap every column: [`doc/columns.md`](./doc/columns.md)
- **Roles** — a page says `is: "topic"` and its whole subtree finds it with `this.topic()` / `document()` / `nearest(role)`, no import either way. `is:`, never `topic: true`: a flag named after the accessor shadows the method on the page that claims it: [`doc/roles.md`](./doc/roles.md)
- **Storage** — `this.store()` keeps a page's state between visits against its own url (`lew42:/imagine/team/`): `get(fallback)` / `set` / `patch` / `clear`, nothing to configure. Storage, not state — it never notifies; a failed write falls back to memory and warns once; a page `move()` re-addressed declares `store_key` to keep its data: [`doc/method/store.md`](./doc/method/store.md)
- **Panels** (splitting the height) needs no new word — `classes: "solo flex v gap"` plus `this.regions`, which `container()` already reads: [`doc/panels.md`](./doc/panels.md)
- The column pads (`--page-column-pad-x/y`) and the column's own `--flow` are `cqi` ramps × the host's `--spacing` level; a rail's first row sits one pad-y under its head, as prose does. A preview card's title link hugs — the card is the control. Why, with the numbers: [`/imagine/design/spacing/decision.md`](/imagine/design/spacing/decision.md)

## More
- [`doc/findings.md`](./doc/findings.md) — **what the seven column-page labs found**, one claim per line, each linked to the page that measured it: `full` replaces / `fill` joins, tone up reads as hierarchy, a scrollbar may own the edge but not sit in a page's padding, inner chrome is a rule
- [Overview](/framework/core/Page/) — **the palette**: 29 cards, four bands (`page.js`'s `BANDS`) — building blocks · pages are navigation · the box · recipes. Every card is a *picture* of the shape (`ext/demo/mini.js`), and the first band is the [page generator](/framework/core/Page/generator/)'s own vocabulary · [`doc/decisions.md`](./doc/decisions.md) — the record: callers, every verdict, proposed, open · [`doc/declaring.md`](./doc/declaring.md) — the children list, eager loading, the CMS question · [`doc/labels.md`](./doc/labels.md) — titles, labels, icons, cards · [`doc/css.md`](./doc/css.md) — visibility, the sheet, rhythm, the cards · [`doc/layout.md`](./doc/layout.md) — **open:** nested vs `full`, and why alternating between them is tricky · [`doc/columns.md`](./doc/columns.md) — `columns()`, the six width words, the draggable seam, and the crumb strip: the tree stays, `display: contents` flattens the layout
- **Old** — the first pass at these docs, kept while they're rewritten: [`old/readme.md`](./old/readme.md); `old/overview/readme.md` — the fifteen demo trees, now top tabs instead of a rail
- `doc/method/*.md`, `doc/property/*.md` — one page per member, under API
- Files that matter: `Page.class.js` (the class), `Page.css` (every `.page-*` rule), `page.js` (the doc root)
