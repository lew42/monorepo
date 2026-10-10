# Step 4 — one structure for core/Page

Merged from the three new-user audits: [3a](audit/3a.md) (tabs and the page skill, [shot](audit/3a-page-1920.png)), [3b](audit/3b.md) (ways to make a page), and [3c](audit/3c.md) (layouts and `/imagine/`).

## Top tabs: add two, move one, clobber none

| # | Tab | What's under it (left nav) | Change |
|---|---|---|---|
| 1 | **Overview** | the preview wall, with a "start here" line and `jsonl` + `folders` cards added | build on it |
| 2 | **Make a page** | page.js · page.jsonl · `route()` · folders (index pages, no folder each) | **new** |
| 3 | **Layout** | Choosing a layout · Standard · Split · Columns · Floating page · Top-down shape · Catalogue ↗ | **new** |
| 4 | Generator | unchanged | — |
| 5 | **API** | Methods (one page each) · Properties (one page each), each opening with an object card | moved up |
| 6 | Docs | unchanged, with the "Read next" list grouped into three | — |
| 7 | Files | unchanged | — |
| 8 | Old | unchanged | **moved last** |

- The existing `page.jsonl` tab stays at its URL. "Make a page › page.jsonl" links to it.
- The left nav repeats the top-tab order exactly. Today it doesn't (3a).

## The layout words

| Owner's layout | Name | What it is today | Simplest example |
|---|---|---|---|
| 1: one column, 300–1000px | **Standard** | the default page (`main` track, 40em) | `new Page({ content(){ … } })` |
| 2: two columns, any proportion, stacks | **Split** | `arrangement: "main-aside"` / `equal` ([Layout](/framework/core/Layout/main-aside/)) | one `arrangement:` word |
| 3: three or more standard columns | **Columns** | `this.columns({ even: true })` ([doc](/framework/core/Page/doc/columns/)) | the Finder demo |
| inner sidebar beside a floating page (1:40 PM) | **Floating page** | not built yet | demo in step 6 |
| background · padding · full-bleed | **Top-down shape** | spread over `words.md`, `layout-system.md` and `columns.md` | one new page that gathers them |

**Why Split and Columns, not wide and fill.** Core already uses both of those words for something else. `width: "wide"` means one full-width track, and `fill` means one column that takes the leftover space (3c). Reusing them would make every doc ambiguous. The alternative is to rename core's words instead: that means about a dozen callers, which is major surgery.

## Concept pages (linked wherever the concept is mentioned)

Earn a page: **columns** (Miller) · **width words** · **page.jsonl as a route** · **folders / index pages** · **the page grid** (main / wide / bleed) · **top-down shape**.

Too trivial for their own page: `tabs()`, `vtabs()`, `list()`, and the `narrow` and `reading` words. The Overview card for each already shows it in full.

## Rewrite order (step 6): the most value per unit of space first

1. **Readme "Use"**: add `route()` and folders as the third and fourth ways. Link the page skill's structured content. (Tiny.)
2. **Layout › Choosing a layout**: a page made only of links, plus one callout on the word collision.
3. **Make a page**: the four ways, each simplest first. The `jsonl` demo is trimmed to two lines, and the full feature tour moves to a second example.
4. **Floating page**: the demo, compared side by side with core/Page's own inner left tabs.
5. **Top-down shape**: one page, gathered from three docs.
6. **Tab order**: Old moves last, the left nav matches the top tabs, and `doc/layout.md` is marked "open question".
7. **`doc/columns.md`**: the tuning history (about 600 lines) moves to `columns-history.md`.
8. **API pages** open with the object card (step 5).

Leave it where it is: even vs elastic mode, `fit` floor/round, and column-drag mechanics. Each one is real, but hard to show briefly.

## Past work in `/imagine/` to cite, not copy

- [/imagine/screens/](/imagine/screens/): what "next" does to the screen. Cited under Columns.
- [/imagine/paging/](/imagine/paging/): the six words, live. The "try it" link from the words doc.
- [/imagine/sections/](/imagine/sections/): multi-column bands. Cited under Split.
- [/imagine/shells/](/imagine/shells/): whole-app chrome. Cited under Top-down shape.
