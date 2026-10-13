# Layouts architecture — every layout is a class string on one wall

A layout is one whole-page arrangement, built from the utility words in `framework.css`. Each one is a `Page` made by `demo.layout()` ([`ext/demo/layout.js`](/framework/ext/demo/layout.js)), and the index is [`page.js`](./../page.js), which draws them all as one filterable wall. Use it when you need to show or pick a page shape; the wall is [`/framework/styles/layouts/`](/framework/styles/layouts/).

## A layout is a page, with no stylesheet of its own

**Decided:** a layout directory holds `page.js` that calls `new Page(demo.layout({ meta, title, layout(){ … } }))`, and its look is class strings.
**Why:** the claim under the whole tier is that a page layout *is* a class string, so any layout that needs its own CSS is a finding about the utility set.
**Instead:** a private stylesheet per layout. It was rejected so every layout falls back to the same twelve words and three page shapes. ⚠ Not fully true today: [`catalog/`](./../catalog/), [`cols/`](./../cols/) and [`space/`](./../space/) each ship a `.css` file. The rule holds for the whole-page layouts only.
**Detail:** [doc/decisions.md](./decisions.md#the-shape), [doc/css-cost.md](./css-cost.md).

## The index declares its bands, and children derive from them

**Decided:** [`page.js`](./../page.js) lists the bands once in `BANDS`, and `children:` is built from that list.
**Why:** `group:` on each child cannot say that Words is made of grandchildren, or that `space/` belongs to another effort.
**Instead:** derive bands from each child's `group:` (the old way, reversed on 2026-08-17).
**Detail:** [doc/decisions.md](./decisions.md#the-wall-the-owner-actually-asked-for-2026-08-17).

## Children are the only list, and a page reaches UP for its nav

**Decided:** `children` is the single list of layouts, and a layout gets its rail from its parent with `this.parent.rail()`.
**Why:** a mutual import between the index and a layout breaks only on a deep reload, so the parent is the one that knows about children.
**Instead:** importing the index from each layout, which was rejected for that reload trap.
**Detail:** [doc/decisions.md](./decisions.md#three-things-that-will-bite-you). Used today in [`sidebar/page.js`](./../sidebar/page.js).

## One card per layout: a whole screen at quarter size

**Decided:** every card is one `zoom-25` frame at `56em`, and the two-up "twin" lives only on the stage.
**Why:** a twin card put two panes at about 0.07× on a 3440 screen, unreadable. A card four times narrower than the layout makes `56em` close to 16:10, so the wall crops nothing.
**Instead:** a phone-and-desktop twin card (rejected: unreadable), and a per-layout `layout.js` preview (overturned).
**Detail:** [doc/twin.md](./twin.md), [doc/previews.md](./previews.md).

## Full view is a url, not a flag

**Decided:** maximising a layout is a route segment: [`full.js`](./../full.js) claims the name through `route()`, and the page is `.page.layout-full`.
**Why:** a live reload and the back button must land in the same place, and the router only understands path segments.
**Instead:** a query flag or a modal, which the router cannot restore.
**Detail:** [doc/full-view.md](./full-view.md).

## The wall rebuilds from its model when you filter

**Decided:** filtering rebuilds the wall from the layout model rather than hiding DOM cards.
**Why:** hiding cards left empty headings behind and took about 60 lines. Rebuilding is about 10, and the needle now matches a card's own words, so `mail` stops matching `Stack`.
**Instead:** tagging every card and walking the DOM (rejected).
**Detail:** [`ext/catalog/browse.js`](/framework/ext/catalog/browse.js) and [doc/decisions.md](./decisions.md#the-wall-the-owner-actually-asked-for-2026-08-17).

## Thumbnails never show a scrollbar

**Decided:** `scrollbar-width: none` on every thumb and everything inside it.
**Why:** a scrollbar paints at full size whatever the `zoom` above it, so a quarter-scale render wore a grey bar four times too wide. A thumb is `pointer-events: none`, so no reader could use the bar anyway.
**Instead:** `overflow: hidden` alone, which was already set, but the inner scroller still drew a bar.
**Detail:** [doc/decisions.md](./decisions.md#a-preview-is-a-picture-so-it-has-no-scrollbar-2026-08-17). Verified in [`core/Page/Page.css`](/framework/core/Page/Page.css) (the thumb rule).

## Measure with `offsetHeight`, never `getBoundingClientRect()`

**Decided:** any size read on a card or stage uses `offsetHeight`.
**Why:** a rect is in viewport space and a zoomed twin scales it, while computed lengths stay in author space. Mixing them cost `pack()` a note-sized hole.
**Instead:** `getBoundingClientRect()`, which reports zoomed sizes that do not match the layout.
**Detail:** [doc/previews.md](./previews.md).

## Only masonry needs JS, and wrapping rows must say `align-content: start`

**Decided:** [`masonry/`](./../masonry/) ships JS for its measuring pass, and both masonry pages set `alignContent: "start"`.
**Why:** a wrapping row defaults to `stretch`, so a tall band grows every wrapped line; the masonry pages measured it.
**Instead:** leaving `stretch` on, which pushed the wall about 390px down at 400px.
⚠ The rule "masonry is the only JS in layouts" is out of date. [`400/entry.js`](./../400/entry.js), [`catalog/LayoutCatalog.js`](./../catalog/LayoutCatalog.js) and the `space/` modules all ship `.js`. The other sixteen wrapping layouts have never been checked for `stretch`, and that stays open.
**Detail:** [`masonry/readme.md`](./../masonry/readme.md), [doc/decisions.md](./decisions.md#three-things-that-will-bite-you).

## Panels are not used on the index

**Decided:** the index is a plain `flex gap wrap` with a fixed-basis rail (`12em`) and a wall at `flex: 1 1 22em`.
**Why:** at 3440 a panel wall got 1450px of 3440, and at 390 the rail kept its width and the wall got 155px.
**Instead:** `ext/Panel` for a draggable seam, which was rejected as a dependency with its own traps. `ext/Panel` itself stays where it is used as a workspace.
**Detail:** [doc/decisions.md](./decisions.md#verdict-reversed-no-panel-here-2026-08-17). Verified: `page.js` has no panel call.

## Open

- Sixteen layouts still need a check for `align-content` at a width where their band runs tall. [doc/decisions.md](./decisions.md#open)
- Media queries do not follow `zoom`, so a layout with a breakpoint previews wrongly on the index.
