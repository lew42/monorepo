verdict: fix
1. [fix] At 400 the library is one 9.3-screen column and the collection filter (ui · figma) sits *below* the stage, so a phone user sees the item before the way to choose one (layout: order, flow) — layout.json library band share 9.298 at 400; shots/…-framework-library/400.png, band 3 (chips at y≈660, under the stage). The brief says "mobile first": the rails want to be a horizontal strip (or a sheet) on mobile, with the filter on top.
2. [note] At 1920 and 3440 the 400-wide render sits flush left in a stage box that spans the whole centre column, leaving ~60–75% of the stage empty (sizing) — shots/…-library/1920.png and 3440.png, centre band; layout.json empty 0.762 / 0.825. Centre the render in the stage, or let the stage hug it.
3. [note] `optimalWidth` exists only as collection defaults (ui 400, figma 1920); no template sets its own yet, and the "filter by 3440" grid and the span-by-width preview rule are recorded in doc/decisions.md §5 but not built (rails are one column). Acceptable for the first slice; the brief's "one preview layout rule" is only the zoom rule so far.
4. [note] The page's level-1 line is missing: the constructor has a good description ("Everything we built, browsable: pick one on the left…") but the shot shows only "Library", then "ui figma", then a "UI" label — a newcomer is not told what the three columns are (content 1) — shots/…-library/1200.png, top band. The "ui" chip and the "UI" rail title also repeat each other.
5. [note] The padding contract's red flag is never seen on the site: it is proved by a headless test only (readme "Watch out"), and the assembler refusal is deferred — both stated honestly in doc/decisions.md §7.
6. [note] The "media" variant thumb is mostly a blank grey block at every width (its image placeholder) — shots/…-library/1920.png, right rail band 2; it reads as a broken preview.

Widths given: 400, 1200, 1920, 3440 for /framework/library/, /framework/, /framework/ui/ and 16 /framework/ui/<component>/ pages (those only gained `specimen:` lines; their shots show no change, no overflow at any width).

## Requirements
- 1 "a browsable UI kit where the UI kit itself is designed with the UI kit" — yes, as a first slice — Library is a `Page`, its rails are `.card`s and the items render the kit's own specimens; shots/…-library/1920.png
- 2 "start with a mobile UI collection" — yes — `ui` collection, optimalWidth 400, is the default (`?at=ui/card`); 400.png
- 3 "one unified library" (Figma, ui, ux, sections, layouts, templates) — partly — ui + figma only; readme "Not built yet" lists the rest (expected for slice 1)
- 4 "Not now: the stage redesign" — yes — Stage.js is minimal: title, link, four width chips, a box
- 5 Left: a preview rail of the items in the category — yes — 1920.png left column: Card, Toolbar, Panel, Stat tiles…
- 6 Centre: the item at 100% with responsive-width tools — yes — 400·1000·1920·3440 chips, zoom-to-fit (Stage.fit)
- 7 Right: variants and related — yes — "Variants" (linked, media, action…) are the page's real `children`; "Related" from ui/page.js BANDS (a simple rule first, as asked); not visible above the fold
- 8 Variants as real children/clones — yes, cheaply — Item.variants() wraps `page.children`, never copies
- 9 "Clicking an item on the right makes it active" (siblings left, it centre, its variants right) — yes, by code — Library.show(): siblings = parent.variants(); not proved in a shot
- 10 Filter by category, route everything — yes — chips ui/figma; `?at=ui/card/media` + pushState + popstate
- 11 `optimalWidth` on every template (400/1000/1920/3440) — partly — Item.optimalWidth reads page → data → collection; only the collections set it (note 3)
- 12 Preview grid filtered "3440", same template at several widths — partly — the stage shows several widths; no filtered grid yet
- 13 Mixed heights: pick one, record the alternative, pick one zoom rule — yes — span-by-width chosen over masonry/grouping, zoom rule `card ÷ optimalWidth`, never transform (decisions §5–6); span not built yet
- 14 `needs_parent_padding` / `no_parent_padding` as template properties — yes — Item getters, Stage.mark()
- 15 Red flag: CSS shades red — yes — `.padding-misuse` in util layer
- 16 Red flag: JS logs so smoke.mjs fails — yes — PaddingContract.check() → console.error
- 17 Red flag: assembler refuses or suggests the fix — no — deferred, stated in decisions §7 (note 5)
- 18 Tree/data questions decided with alternative; say what slimmed `Page` holds — yes — doc/tree.md
- 19 Order: past work, plan.md + class architecture, smallest slice — yes — plan.md has "## Class architecture"; slice = ui + figma, three columns
- 20 Worktree, hold, smoke, commits, STATE.md — not checked by this review (STATE.md present)

## Page structure
- page 1 (title says what it is) — yes — "Library", h1, 1920.png top band
- page 2 (one-line gist under the title) — no — description not rendered (note 4)
- page 3 (most important first) — yes at ≥1200, no at 400 — filter below stage (fix 1)
- page 4 (reachable by a link) — yes — /framework/ children gains `library`; sidebar shows "Library", 1920.png
- page 5 (routed views) — yes — `?at=`

## Navigation
- navigation 1 — techniques: a sidebar (site), two preview rails (left, right), chip filters (collection, width)
- rails: persistent, active item marked — yes — orange outline + aria-current on "Card", 1200.png left rail
- chips: active state visible — yes — "ui" and "400" filled orange
- back/reload land in the same place — yes — popstate listener reads `?at`
- mobile navigation — no — rails become a long vertical list; no compact rail or sheet at 400 (fix 1)

## Layout
- three columns at ≥60em, one below — yes — grid minmax(12em,18em) · 1fr · minmax(12em,18em); 1200/1920/3440 show three
- order at 400 — no — stage, then filter, then siblings (fix 1)
- columns aligned to a shared top — yes — `align-items: start`; 1920.png
- rails sticky — yes — sticky, max-height 100dvh, own scroll

## Sizing
- no horizontal overflow — yes — overflow_x false at all four widths
- rails capped — yes — 18em max; 3440.png
- stage uses its width — no (note) — 400 render left-aligned in a full-width box; empty 0.762 at 1920, 0.825 at 3440
- preview thumbs capped in height — yes — MAX_HEIGHT 14em

## Wrapping
- unwanted wraps — no — layout.json wraps list only site chrome (drawer-rail buttons, mode-btn), none in the library
- tab rows — yes — tab_rows 1 at all widths

## Spacing and padding
- left stack consistent — yes — h1 28/38/67/90 px from `page` layer, cards add 18 + 11–14 px
- gap between title and columns — note — ~60–100 px of empty band between "Library" and the columns at 1200/1920 (band y 87→132, 101→160)
- the render box padded for `needs_parent_padding` items — yes — `.library-render` 1.5rem; the View card has room on every side, 1920.png

## Colour and contrast
- active state uses the prime token — yes — `var(--prime)` chips and outline
- red flag readable and distinct — yes — 22% red wash + dashed outline (not visible on the live page by design)
- muted rail titles legible — yes — "VARIANTS", "UI" grey on light grey, 1920.png

## Flow
- click → centre updates without reload — yes — Library.go() + pushState; epoch guard against overtaking clicks
- one takeaway per screen — partly — at ≥1200 yes; at 400 the stage comes before the choice (fix 1)

## Words
- content 1 (says what it is first) — no — the description is in the constructor but not shown (note 4)
- content 2 (plain names, no jargon in UI) — yes — "Variants", "Open the page →", widths as numbers
- content 3 (no repeated words) — note — "ui" chip and "UI" rail title back to back
- readme and docs — yes — readme.md is a short index; decisions.md lists each choice with its alternative; tree.md answers the brief's data questions
