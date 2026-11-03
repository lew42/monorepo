# Every page layout the site uses, and where it lives in code

One row per whole-page arrangement. `page_js_count` is a grep count of `page.js` files that
opt in (the exact command is in `layouts.json`). Full detail — DOM markers, tab CSS, examples —
is in [`layouts.json`](./layouts.json); this table is the map, that file is the proof.

| Layout | Opt-in (api) | Defined in | page_js_count | Tabs sit... |
|---|---|---|---|---|
| **Doc page** (top tabs beside the title) | `new Doc({...})` instead of `Page` | `ext/Doc/Doc.js` | 74 | beside the title, same row |
| **demo.tree()** card in a wall | `demo.tree({ tree: fn, ... })` | `ext/demo/exhibit.js:135` | 50 | — (not tabs) |
| **Column pages** (page split side-by-side) | `this.columns({...})` in `initialize()` | `core/Page/Page.class.js:803` | 42 | — (not tabs) |
| **catalog()** — card rail + routed child | `initialize(){ this.catalog(); }` | `ext/catalog/catalog.js` | 25 | — (not tabs) |
| **browse()** — filter rail + wall of bands | `this.browse(bands, tokens, opts)` | `ext/catalog/browse.js` | 6 | — (not tabs) |
| **Inner left nav / switcher** | `this.switcher("names", {skin})` | `ext/tabs/switcher.js` | 2 | vertical rail, IS the nav |
| **Floating page** | `floating(box, {nav, content})` | `core/Page/layout/floating/floating.js` | 2 | — (sticky left nav, not tabs) |
| **AI 2 shell** (inbox/rail dashboard) | none — one page's own hand-built shell | `ai2/page.js` | 1 | **right-aligned — a bug**, see below |
| **Site shell / `.page.standard`** | automatic default; opt OUT with `classes:` | `core/Page/Page.class.js:645`, `app.js` | default for everything; 150 files opt out | — (not tabs) |

Note: `browse()`, `catalog()` and `demo.tree()` all draw the same card (`.page-preview`) inside
the one shared `.page-previews` grid — three arrangements of one card wall, not three card shapes.

## /imagine/ and /layouts/ — do they build their own shell?

- **`/imagine/`**: almost entirely on the shared APIs above (columns host, `this.previews()`,
  real `ext/tabs`). One deliberate exception: `imagine/scenes/page.js` owns a 3D `build()`/`tick()`
  render loop and explicitly opts out of the columns host — documented, not an accident.
- **`/layouts/`**: mixed on purpose, since the realm's subject is layouts. Most pages use the
  shared APIs (`browse()` even replaced an old hand-rolled grid in `layouts/browse/`). The real
  custom shell is `layouts/shell/page.js` (a drag-resizable rail + viewport, overriding `render()`
  itself) and the `layouts/labs/shells/**` pages, each demonstrating one whole-app-chrome shape —
  that IS the lab's job, not drift.

## The AI 2 right-aligned tabs — why, in one line

`ai2.css:1082-1084` gives the three tabs `order: 1/2/3` for an inbox-lighting trick, but the shared
tab strip's own trailing filler (`ext/tabs/tabs.css:133`, `.tabs.block > .tab-bar::after`) has no
`order` set and defaults to `order: 0` — so the filler sorts *before* the tabs, eats all the free
space, and shoves the three tabs flush right. No other page on the site sets per-tab `order`, so
this is the only page it hits.

## Re-implementations found (pages that built their own tab strip or wall by hand)

| File | What it built | Should use instead |
|---|---|---|
| `public/web/nav/tabs/page.js` | hand-built `.tabs/.tab-bar/.tab` + `.tab-panel` | `this.tabs()` — self-documented as a demo-sandbox exception (no real Router here) |
| `public/framework/styles/layouts/toc-studio/page.js` | hand-wired `.tabs .tab-bar .tab` category strip | `this.tabs()` — self-documented exception (page renders 3x, `tabs()` mutates in place) |
| `public/imagine/codrops/page.js` | own `.grid.auto` wall with a hand-written `demo_card()` | `this.previews()` (or a grouped variant) — defensible since it needs mechanism grouping `previews()` lacks |

Two other grep hits were false positives, not re-implementations: `ui/controls/page.js` draws a
static `.tabs` pair purely as a visual swatch of the CSS grammar (no navigation behind it), and
`imagine/paging/navigation/tabs/page.js` is a deliberate demo of a real component
(`PagingNavStack`), not a hand-rolled shell.

## Why pages drift from the shared layouts (what this pass saw)

1. **Demo/lab pages drift on purpose.** Most "re-implementations" found were sandboxes that say,
   in a comment, exactly why they can't use the shared call here (no live Router, a page that
   renders itself three times, teaching one whole-chrome shape on purpose). That's not drift to
   fix — it's the page's actual job.
2. **A shared CSS rule can silently collide with a one-off page tweak.** The AI 2 bug isn't a
   hand-rolled shell at all — it's a normal `this.tabs()` call, broken by a `flex-order` trick
   added on one page interacting badly with a filler pseudo-element nobody thought to give an
   `order` of its own. The fix belongs in the shared `tabs.css`, not in AI 2.
3. **Card walls have three names because they have three real shapes** (a full-page wall, a
   persistent rail beside a routed child, a single live-preview card) — that's coverage, not drift.
4. **Genuinely bypassing the wall is rare and gets migrated when found** — `layouts/browse/`
   itself used to hand-roll its grid and was moved onto `browse()`; the instinct to consolidate
   already exists in the codebase.
5. **A whole-app-chrome demo (`layouts/shell/`, `layouts/labs/shells/**`) can't use `core/Page`'s
   shell at all** — its entire point is to show a *different* shell shape, so it overrides
   `render()` and documents the three obligations core/Page imposes on anyone doing that. This is
   the one place a full custom shell is the correct choice, not a shortcut.
