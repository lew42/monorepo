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

**Children can come from data instead of a string.** Write `children` as a **function** and
core calls it once, on the first ask, and waits for what it returns — so a page whose
children live in a `page.json`, a store or another page's subtree needs no code of its own:

```js
children(){ return fetch("/my/tree.json").then(r => r.json()).then(tree => tree.pages); }
```

Answer with anything `children:` already takes — a string of names, an array, a POJO, real
`Page` objects, or a promise of any of them. [`doc/data-children.md`](./doc/data-children.md)

The file is the route: `./x/` renders `./x.md` as markdown when no `page.js` claims `x` — write a `.md` beside a page, link to it, and it is a page. Nothing crawls; the **link** is the naming.

**A right aside of related links is one more line.** `related: "/a/ /b/"` draws a small "Related" list beside the page — each row's icon and title read live off the target, so a renamed target updates itself: [`doc/property/related.md`](./doc/property/related.md)

## Watch out
- **The six page words** — `navigation` `content` `width` `arrangement` `surface`/`background` `type_size`: a page describes its own shape instead of coding it, every default writes nothing, and the values live in one file (`words.js`). The table, and one page file before and after: [`doc/words.md`](./doc/words.md)
- A `.md` becomes a page only where the fallback looks — **beside** a page, one segment down; and the `.md` url itself is always the raw file, so the probe is content-type gated (the SPA fallback answers a miss with `index.html` at **200**): [`doc/declaring.md`](./doc/declaring.md)
- A page IS the shell grid — `main` (prose, `--measure: 40em`), `wide` (all the leftover), `bleed` (edge to edge, and it SPENDS the gutter tracks — prefer `wide`). Never `--measure: none`: [`/framework/styles/doc/layout-system.md`](/framework/styles/doc/layout-system.md)
- Overriding `render()` owes three silent things — set `this.view`, carry `.page`, never nest a second `.page` — and a flex/grid override owns its children's spacing (`gap`, not `flow`): [`doc/decisions.md`](./doc/decisions.md)
- A page placed with no mark and no `default` is `display: none`, and nothing throws; `warn_if_hidden()` says so on localhost only: [`doc/decisions.md`](./doc/decisions.md)
- `.page` visibility is decided in `@layer util`, so it out-ranks the `.grid` / `.flex` a page wears; `.active-page` and `.active-ancestor` are one question asked two ways — read both: [`doc/css.md`](./doc/css.md)
- `children` changes type — you write a string, you read a `Map`: [`doc/property/children.md`](./doc/property/children.md)
- A demo tree must not name children as a string — that probes the server for `<url>a/page.js`; use a POJO (`children: { HTML(){ … } }`) and a fictional root url: [`doc/decisions.md`](./doc/decisions.md)
- `render()` stamps `page--<name>` (double dash) — a single dash let a directory named after a `Page.css` class (`previews`) silently wear its styles: [`doc/decisions.md`](./doc/decisions.md)
- A card's thumb is inert — the label is the only link, because `<a>` in `<a>` is un-nested silently: [`doc/css.md`](./doc/css.md)
- `columns()` makes the whole subtree a row of full-height columns, and since 2026-09-18 **a column that is open never pays for the next one**: it keeps the width it recommends, the new column takes what is left, and when nothing is left the row scrolls sideways rather than squeezing what is open (the `34cqi` alternative, and when to reach for even columns instead, are beside the change). Each page picks its track with `width: "small" | "large" | "full"`, a child marked `classes: "default"` is the one the host arrives with, and an index whose `content()` already draws its children says `index: true` so core leaves its row list out. It reads `--page-column-max`, never `--measure` — a region that sets `--measure: none` would uncap every column: [`doc/columns.md`](./doc/columns.md)
- `columns({ even: true })` is the other mode: **every open column the same width**, and how many fit is `floor(row / --page-column-recommended)` (`fit: "round"` rounds instead, filling the room tighter and letting a column go under its recommendation), recomputed when the ROOM changes and never when a column opens — so a column opens into a slot that was already there and nothing on screen resizes. Past N the row slides by exactly one column (measured: smooth scroll and FLIP both 0 long frames, View Transitions 23). The six width words stand down under it; `full`, a drag and the `< 32em` phone regime still win. Live on the [Finder](/framework/core/Page/overview/columns/finder/), side by side with today at [/imagine/design/navigation/](/imagine/design/navigation/): [`doc/columns.md`](./doc/columns.md)
- **Roles** — a page says `is: "topic"` and its whole subtree finds it with `this.topic()` / `document()` / `nearest(role)`, no import either way. `is:`, never `topic: true`: a flag named after the accessor shadows the method on the page that claims it: [`doc/roles.md`](./doc/roles.md)
- **Storage** — `this.store()` keeps a page's state between visits against its own url (`lew42:/imagine/team/`): `get(fallback)` / `set` / `patch` / `clear`, nothing to configure. Storage, not state — it never notifies; a failed write falls back to memory and warns once; a page `move()` re-addressed declares `store_key` to keep its data: [`doc/method/store.md`](./doc/method/store.md)
- **Panels** (splitting the height) needs no new word — `classes: "solo flex v gap"` plus `this.regions`, which `container()` already reads: [`doc/panels.md`](./doc/panels.md)
- The column pads (`--page-column-pad-x/y`) and the column's own `--flow` are `cqi` clamps × the host's `--size` knob; a rail's first row sits one pad-y under its head, as prose does. A preview card's title link hugs — the card is the control. Why, with the numbers: [`/imagine/design/size/`](/imagine/design/size/)
- `h1.page-title`'s font-size shrinks below ~460px (`clamp(1.75rem, 9vw, 3em)` in Page.css) so one long word — a title with no space to wrap on — never breaks mid-letter; the theme's flat `3em` still wins at every wider width, unchanged.
- Dragging a page to a new url in Make (`?real=`) does not orphan the links and imports that pointed at the old one — a move rewrites every one of them, found by the site-wide census `core/Page/tools/links.mjs` keeps at `public/links.json`.

## More
- [`doc/findings.md`](./doc/findings.md) — **what the seven column-page labs found**, one claim per line, each linked to the page that measured it: `full` replaces / `fill` joins, tone up reads as hierarchy, a scrollbar may own the edge but not sit in a page's padding, inner chrome is a rule
- [Overview](/framework/core/Page/) — **the palette**: 29 cards, four bands (`page.js`'s `BANDS`) — building blocks · pages are navigation · the box · recipes. Every card is a *picture* of the shape (`ext/demo/mini.js`), and the first band is the [page generator](/framework/core/Page/generator/)'s own vocabulary · [`doc/decisions.md`](./doc/decisions.md) — the record: callers, every verdict, proposed, open · [`doc/declaring.md`](./doc/declaring.md) — the children list, eager loading, the CMS question · [`doc/labels.md`](./doc/labels.md) — titles, labels, icons, cards · [`doc/css.md`](./doc/css.md) — visibility, the sheet, rhythm, the cards · [`doc/layout.md`](./doc/layout.md) — **open:** nested vs `full`, and why alternating between them is tricky · [`doc/columns.md`](./doc/columns.md) — `columns()`, the six width words, the draggable seam, and the crumb strip: the tree stays, `display: contents` flattens the layout
- [`doc/data-children.md`](/framework/core/Page/doc/data-children/) — **applied 2026-09-17**: children that live in data. `children` as a **function** core awaits once — it deleted the two overrides Make and JSON pages each hand-wrote and the "Chaining cycle detected for promise" guard with them, 52 lines fewer across the two — and why a core `redraw()` is still **refuted**
- **Old** — the first pass at these docs, kept while they're rewritten: [`old/readme.md`](./old/readme.md); `old/overview/readme.md` — the fifteen demo trees, now top tabs instead of a rail
- `doc/method/*.md`, `doc/property/*.md` — one page per member, under API
- Files that matter: `Page.class.js` (the class), `Page.css` (every `.page-*` rule), `page.js` (the doc root)
