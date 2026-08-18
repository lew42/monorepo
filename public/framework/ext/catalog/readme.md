# catalog — two arrangements of `previews()` patched onto `Page`, for any index page: `catalog()` pins a rail beside the routed child (read in order); `browse()` lays a filterable wall of bands (choose from the set). Same cards either way (RULE#7).

## Use

```js
initialize(){ this.catalog(); }                                   // rail — the page's own content() becomes the first card

const BANDS = { Surfaces: "card toolbar panel", Data: "table timeline" };
content(){ return this.browse(BANDS, { "--column": "18em" }); }  // wall — one grid per band, sticky filter rail
```

## Watch out

- Call `catalog()` from `initialize()`, never `content()` — the intro child needs a url before the router walks: [`doc/method/catalog.md`](./doc/method/catalog.md).
- `browse`, not `browser` — on a `Doc`, `this.browser()` is the Files tab and silently draws a file tree where the wall should be: [`doc/decisions.md`](./doc/decisions.md).
- `browse()` band sizes are load-bearing: `auto-fit` + `1fr` stretch a band of three across the whole wall; the heading sits outside its grid: [`doc/method/browse.md`](./doc/method/browse.md).
- The rail/region height ceiling stays scoped to `.pages > .page:has(> .page-catalog)` and to a routed child — unscoped it clipped 18 pages, then a `Doc` regression, then 15000px of `/framework/ai/`: [`doc/decisions.md`](./doc/decisions.md).
- Left open: a second `catalog()` call isn't guarded; `--rail` (19em) is eyeballed, not a token; `/framework/ai/<day>/` at `< 64em` while routed still clips (fix belongs in `ai.css`): [`doc/decisions.md`](./doc/decisions.md).

## More

- [Overview](/framework/ext/catalog/) · [`doc/decisions.md`](./doc/decisions.md) — every verdict, trap, open item and the dated caller census, in full.
- [`doc/method/catalog.md`](./doc/method/catalog.md) — the rail's contract · [`doc/method/browse.md`](./doc/method/browse.md) — the wall's contract, `bands`, `tokens`, `owner/name`.
- [`doc/file/catalog.js.md`](./doc/file/catalog.js.md) · [`doc/file/catalog.css.md`](./doc/file/catalog.css.md) · [`doc/file/page.js.md`](./doc/file/page.js.md) · [`doc/file/readme.md.md`](./doc/file/readme.md.md) — per-file walkthroughs.
- Files: `catalog.js` (the rail method), `catalog.css` (wall turned sideways), `browse.js` (bands and filter), `browse.css` (one grid per band). `ext/Doc` calls `catalog()` for every Overview tab; `app.js` imports it once.
