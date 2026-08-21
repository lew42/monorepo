# Proposal — the plain-div page, costed; and the docs a new user lands on

Evidence: [inventory.md](inventory.md). Nothing here was applied; `Page.css` was not touched.

## 5 — The simplification

The owner's sketch: *a `.page` is a plain div that fills the region; `.standard` is opt-in and gives `main / wide / bleed`; the REGION owns inset and measure.*

**It is already 95% true, in the JS.** `Page.class.js:216` ends every `render()` with `.ac(this.classes ?? "standard")` — so a page that declares no `classes:` **already wears `standard`**. The word exists, is stamped on almost everything, and has no CSS rule (Page.css:239). The grid is on a bare, unguarded `.page {}` (Page.css:78) instead.

### The count

| | n | note |
|---|---|---|
| `page.js` files in scope | **144** | excludes `core/new/`, `core/legacy/` |
| …declaring `classes:` at all | **7** files, 8 declarations | `dt-page` ×4, `full pad`, `full fill flex v`, `column`/`columns`, `full` |
| …relying on the default grid | **137** + every inline child | all already carry `standard` |
| hand-typed `div.c("page full fill …")` | **~35** | all in `styles/layouts/**` — layout specimens, never wanted the grid |
| `render()` overrides | **8** | listed in inventory §2 |
| `.page.solo` call sites | **0** | dead class, deletable today |
| CSS rules that move | **5** | Page.css:78, 99-101, 240-241, 279 |

### The migration

1. `Page.css:78` `.page {` → `.page.standard {`. Same for `:99-101` (`> *`, `> .wide`, `> .bleed`) and `:279` (the wall's gutter payback). **Zero `page.js` edits** — the 137 default pages already wear the word.
2. Seven call sites that opted out and still want the grid gain the word: `ext/Doc/Doc.js` ×3 (`c("page doc-page")` → `c("page standard doc-page")`) and the four `classes: "dt-page"` → `"standard dt-page"`. A one-line sed each.
3. Delete `.page.full` (Page.css:240) and `.page.solo` (:112). Once the grid is opt-in, "no gutters" is *not having the grid*. Keep `.fill` — it is height + scrolling, an orthogonal axis.
4. The ~35 `styles/layouts` specimens drop `full` and keep `fill flex v`. They get what they always wanted: a plain div.

### Dodging the `min(none)` trap

`.page` re-declares `--measure` only because `min(none, …)` is invalid at computed-value time and drops the whole template. **The fix is the opt-out value, not the declaration site: `100%`, never `none`.** `min(100%, 100% - 2 × gutter)` is valid and resolves to exactly what `none` was reaching for.

So `.page.standard` reads `min(var(--measure, 40em), 100% - …)` and declares nothing; `tabs.css:68` and `app.css:58` change `none` → `100%`; `.pages { --measure: 40em }` (Page.css:21) stops being decoration and becomes **the real default for its whole subtree** — the one thing the owner asked for. `DesignTool.css:77` and `layouts.css:19` change `none` → `100%` the same way, and `app.css:70`'s third re-tune of `--gutter-x`/`--pad-y` can go, because the region's values now reach the page.

### What breaks

Only what already wanted to. Three real risks: (a) a page wearing `classes:` that silently depended on the grid — the seven above are the complete list, checked by grep; (b) `Page.css:279`'s gutter payback to `previews()`/`walls()`, which reads `--gutter-x` and must move with the grid or take a fallback; (c) `.page.doc-page`'s own `--gutter-x` (Doc.css:16) exists to restate the grid's clamp — it becomes redundant, not wrong.

**Verdict: ship it — the grid is already opt-in in the JS and one word away in the CSS; move `.page {` to `.page.standard {`, add `standard` to 7 call sites, and change every `--measure: none` to `100%` so a region's measure finally reaches its pages.**

## 6 — The docs, as a new user landing on `/framework/core/Page/`

**Overview = a `browse()` wall**, the `styles/layouts/` model (`styles/layouts/page.js:47`, `ext/catalog/browse.js`) — a sticky filter rail beside a wall of live cards, bands declared in reading order. Not `catalog()`: the owner's verdict is that the catalog rail did not work, and the `.tabs.vertical` inner rail did. So: **top tabs = Doc's own (Overview · API · Docs · Files); inside a long page, `.tabs.vertical`; the Overview itself is a wall, not a rail.**

Bands, CSS and layout first, JS last. One line each = what the card must SHOW.

**Band 1 — Pages are navigation** (5 cards, all `demo.tree()`)
`page` a folder is a url · `children` the string that makes the menu · **`mounts` NEW** — one tree rendered three times side by side: `app.$pages`, an ancestor's `$pages`, a tabs `regions` entry · **`replace` NEW** — a sibling replaces, an ancestor keeps; the two classes and the one CSS line, live · `route` urls that are not folders

**Band 2 — The box** (5 cards, live, retitled from `shapes`)
**`shell`** — `main / wide / bleed` as three lit tracks in one page · **`measure`** — the same page at 40em and at 100%, and the line that decides · **`inset`** — `--page-pad` / `--gutter-x` / `--pad-y`, one page, one slider each · **`region`** — the same page dropped into `.pages`, a `.tab-panel`, a `.demo-app-pages`; what each hands down · **`full`** — the five regions of §4 as five buttons, each saying what nav it costs

**Band 3 — Recipes** (8, unchanged): `wall catalog dashboard strip columns landing docs site`
**Band 4 — JS, last** (3): `render()` overrides · `previews()`/`preview()` · `labels`

**The 15 existing `old/overview/*`:** keep 12 (`page children route labels` → band 1; `wall catalog dashboard strip columns landing docs site` → band 3). **Rewrite `shapes`** into band 2's five cards — it is the only demo that touches the box today and it teaches `full pad` / `full fill flex v`, which this proposal deletes. **Delete `add`** (an API call; it belongs on `doc/method/add.md`) and **`deep`** (says nothing `children` does not).

**The `doc/*.md`:** keep `declaring.md` `css.md` `decisions.md` `labels.md` `columns.md`, and the API/Files trees (`method/*` ×28, `property/*` ×18, `file/*` ×25). **`layout.md` is answered by this audit** — its title is literally *"Nested or full — and why alternating between them is tricky. **Open.**"* Replace it with §5's verdict, or delete it when the verdict lands.
