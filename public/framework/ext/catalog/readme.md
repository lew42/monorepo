# catalog

`Page.prototype.catalog()`, patched on the way `tabs()` is: `previews()` as a
persistent rail, a `$pages` region beside it, the first child rendered
`.default` so the region is never blank. One line converts any index:

```js
initialize(){ this.catalog(); }
```

It is not a component with an API of its own — it is a rearrangement of
`Page`'s existing tree and its existing `previews()` wall, ~60 lines of JS
(`catalog.js`) and one CSS file (`catalog.css`) that turns the wall on its
side and pins it. There is no class here; `page.js` documents it as a
patched `Page` method (`subject: Page`), the same way a patched `View`
method gets documented on `View`'s own page.

## What it does

`catalog()` moves this page's own `content()` into a new first child,
`"intro"`, wearing this page's title/label/icon — a real child at a real
url, so it gets a card, a deep link, and the marking every other entry has.
Everything else that was already a child keeps its name, order and `Page`
instance. `content` is then replaced with a renderer that draws the rail
(`this.previews()`, one column) beside a `$pages` region the children mount
into. Full mechanism: [`doc/method/catalog.md`](./doc/method/catalog.md).

## Why `initialize()`, not `content()`

A child only has a url once the router has walked it, and `render()` — where
`content()` runs — happens long after that. `initialize()` runs inside the
`Page` constructor, before children resolve, which is the one place adding a
real routable child is safe. The full fork, including what almost shipped
instead (`intro:` as a config key): [`doc/decisions.md`](./doc/decisions.md).

## The rail is `previews()`, turned sideways

One `grid-template-columns: 1fr` on the same `.page-previews`, `position:
sticky` so the rail scrolls itself instead of getting thrown to the top on
every navigation, and a `< 64em` breakpoint that turns the column back into
a horizontal strip above the detail. No second card shape exists anywhere in
this file — a card styled once is right on a wall, in a rail, and in a
strip. Full CSS tour: [`doc/file/catalog.css.md`](./doc/file/catalog.css.md).

## Who calls it

Grepped across all of `public/`. Direct callers — `initialize(){
this.catalog(); }` on their own page:

| page | url | rail of |
|---|---|---|
| `framework/ui/page.js` | `/framework/ui/` | 19 components |
| `framework/ai/page.js` | `/framework/ai/` | one entry per working day |
| `framework/styles/sections/page.js` | `/framework/styles/sections/` | 15 page bands |
| `framework/styles/layouts/400/page.js` | `/framework/styles/layouts/400/` | 5 specs, one column at 400px |
| `framework/styles/elements/forms/page.js` | `/framework/styles/elements/forms/` | every form control |
| `web/nav/page.js` | `/web/nav/` | 11 nav patterns — also the page's own subject |
| `web/layout/page.js` | `/web/layout/` | 7 layout principles |
| `core/Page/nav/page.js` | `/framework/core/Page/nav/` | a live demo, inside a `demo()` box |

**`styles/layouts/` gave this up on 2026-08-16** and is worth reading as the boundary:
a rail is right for a tier you read *through*, and wrong for a tier you *choose from* —
twenty-three cards in one column, six visible at a time, on a page whose whole argument
is that layouts use their width. It is a sectioned `previews()` wall in an `ext/Panel`
now. `styles/layouts/readme.md` has the reasoning; nothing about this method changed.

And one structural caller that fans out to every module with docs:
**`ext/doc/Doc.js`** imports `catalog.js` directly and calls
`this.catalog()` from `overview_section()` — so every `Doc`'s Overview tab
*is* this method, `overview: "a b c"` being sugar for naming sibling
directories as the children it rails. Eight `Doc` pages exist today
(`core/App`, `core/View`, `core/Page`, `core/Router`, `core/Sidebar`,
`dev/Socket`, `ext/doc` and this page), and every one of them is a caller
by inheritance rather than by import.

`app.js` is the only unconditional importer (`import
"./framework/ext/catalog/catalog.js";`), which is what makes the direct
callers above able to write `this.catalog()` without importing anything
themselves — the same shape `tabs()` uses.

## Decisions

| question | verdict |
|---|---|
| where does the page's own prose go once `catalog()` owns `content`? | it becomes the rail's first card — no `intro:` config key |
| call from `content()` or `initialize()`? | `initialize()` — children must exist before the router walks |
| hand-build the rail per site, or a shared method? | a method, once three real users pasted the same recipe |
| let the rail scroll with the page, or pin it? | pinned (`sticky`) — the region scroller was throwing a scrolled rail back to the top on every click |
| core or ext? | ext — arrangements are opt-in, core owns what a page *is* |

Full reasoning for each: [`doc/decisions.md`](./doc/decisions.md).

## Traps

- **⚠ Must run from `initialize()`.** Calling it from `content()` builds the
  intro as an unroutable child — its card would link to a 404.
- **⚠ The moved `content` keeps its original `this`.** It was written as a
  page method before the move; `catalog()` wraps it, it doesn't rebind it.
- **⚠ A second call isn't guarded.** Nothing on the site calls `catalog()`
  twice, but nothing stops it either — it would re-wrap an already-wrapped
  `content` and insert a second `"intro"` over the first. See
  [`doc/file/catalog.js.md`](./doc/file/catalog.js.md) for the one-line fix.
- **⚠ `--rail` (19em) and `row-gap` (1.2em) are un-named magic numbers**,
  tuned by eye against four real catalogs rather than derived from a token.

## Open

- **`--rail`'s width has no token yet.** More pages render a visible
  multi-card rail than the six the original tuning pass (Aug 2026) checked
  against — none fighting the default yet; the first one that does is the
  signal to promote it (`catalog.css`). Not every caller above shows a rail:
  a `Doc` whose Overview has no `overview:` key gets a single hidden-rail
  intro, same as a rail of one anywhere else.
- **No guard against calling `catalog()` on a page that's already one.**
  Theoretical today — recorded so it isn't rediscovered the hard way.
