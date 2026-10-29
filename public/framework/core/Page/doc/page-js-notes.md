# page.js notes

> **Old way (deprecated 2026-10-28):** this page teaches or uses `page.children`; the replacement is `page.pages` (a List). Guide: [migration-children-to-pages.md](/framework/core/Page/doc/migration-children-to-pages.md).

## The Overview as a palette

The Overview is the **palette**: every building block a page can be made of, each card a picture of the shape and nothing else.

The first band is the page generator's own vocabulary — `columns` and the five words that say WHERE a child goes when you pick it — so what you can browse here is exactly what a generated page can be built from. `rail`, `grid`, `flush` and `crumbs` moved down to Recipes on 2026-08-27: each only changed how the child links LOOKED, which makes it a shape you compose, not a word the generator knows.

## Band layout constraints

**NO BAND UNDER SIX** (measured 2026-08-26): `browse()`'s grid collapses its empty tracks, so a band of two stretches its cards over the whole wall — 659px each at 1920, 1400 at 3440, which is what the old "JS, last" pair did. `labels` is a nav entry and `render` is how a page draws its own box, so both had a band already. It is also why `columns` moved UP rather than the five standing alone.

## Loading order tiles

"How a url becomes a page" was a paragraph one click down in the Docs tab — the owner called it "foundational to understanding what goes where", so it gets a picture on the Overview itself, not just a link. Seven tiles, same order and words as doc/loading.md's own numbered list ("The order, in one glance") — keep the two in sync if that list ever changes. Each tile links to its own step by id; today a cross-page click still lands at the TOP of doc/loading/ (Router.js's activate() always resets scroll), same as any other link to that page, so the url is exact even though the scroll isn't yet.

**Update [fix-2026-09-29-2 finding 2]**: "loading" was never in the notes list, so its url fell through the page.js probe to the bare-.md fallback and 404'd. First on purpose: "how a url becomes a page" is the one doc a reader needs before any other note makes sense.

## Tab order design

Tab order, top to bottom of `bar()`: Overview · Make a page · Layout · Navigation · Generator · API · Docs · Files · Old. `make` and `layout` are new top tabs (proposal.md rewrite order items 2 and 3); `old` moved last (item 6). `navigation` added 2026-09-29 (page-system task): persistent vs switching, the levels that stack, the class-doc go-to, the alternatives. `ai` (the page-based AI system) and `dynamic` (a url with no page.js, loaded through an ancestor's route()) added the same day, so every sub-system the readme lists is a tab. `jsonl` stays declared here, at its existing url — "Make a page › page.jsonl" links to it, same as before. `settings` (same day, tabs-settings task): tabs that manage themselves via a `tab` line, and a page's own nav switch.

**Every name in the bar() array must be kept in sync with what `children:` actually declares; a name that ISN'T here never becomes a tab**, no matter how it entered `this.children`. [fix-2026-09-29-2 finding 1]: "jsonl" was missing from the bar() array, so `bar()`'s filter always dropped it — the whole reason storage had no top tab even though the comment claimed "every sub-system the readme lists is a tab". `settings` added 2026-09-29, right after `jsonl` — the two storage/state tabs together.

## API section design

Doc.overview_section()'s default calls catalog() — a rail, wrong for a wall this size. The api_section() override keeps the section's real children but swaps catalog() for browse(). The API tab OPENS with a card, not a wall of words: "oh, this is a Page and it has a property of this that equals this" (the owner, 2026-09-28), before the member rail even loads. Doc's own api_section() builds the rail; this only swaps its render() to draw the card first — same seam core/Page/page.js already uses on overview_section().

## The unmounted example in API

A small, unmounted example — nothing here is added to the real tree or fetched, `declare()` only records the two names — so the card can show real VALUES ("title = Intro"), which a bare `Page` class never has (the owner's own ask: "this is a Page, and its property X = Y").

## Child rendering and the palette

**THE PALETTE IS DRAWN HERE**, not by the 29 pages. `add()` is the one place a child becomes a Page, so stamping the card as it arrives is one seam instead of one edit per demo — and a palette has to be ONE hand at ONE scale to be readable at all. The old wall was a live app zoomed to 0.5 per card: chrome and content noise, and no two alike (the owner, 2026-08-26). A page's own `preview()` still governs anywhere else it is shown.

## Flow and spacing

`flow` = the site's page rhythm between blocks (the row of three, then the wall). No `--pad-y` override: `.doc-section`'s own `--pad-y: 1.5em` (Doc.css) is now the ONLY top inset above the first block, since Doc.css's `.tab-panel` stopped paying its own 3em on 2026-09-29 (that 3em was for a bare tab strip with no `.doc-section` below it; here there always is one). Zeroing it would have left the tiles flush against the tab bar — fixed 2026-09-29.

## The live instance block

The live "this is a page instance" block. `page_object()` (core/Page/object.js, owned by item-ui) draws EVERY own field flat, 25 rows deep — that used to run right here and crowd the palette wall below it off the first screen (finding 6, 2026-09-29 review). Rather than edit object.js, this wraps it: five named fields a reader actually wants first, then the whole tree one click down inside a plain closed `<details>` ("All fields") — nothing removed, just reordered. `flex v`, not `flow`: `flow` put a paragraph gap (45px at 3440) between rows that already carry their own padding, so the five rows stood 88px apart and half the card was air.

## Design principle: Show, don't tell

Show, don't tell: the loading order as a strip of small linked tiles, above everything else on the page — one click into the full doc. `wrap` (design-bands 2026-09-30): seven tiles need ~700px, so without it the row ran off the right edge at 400 and the last three tiles were cut off.
