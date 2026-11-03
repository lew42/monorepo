# Layout notes

## A Layout Page

A Layout is a Page that declares AN ARRANGEMENT OF NAMED BOXES, the width range it is proven at, and the rules about where it may go — and owns no content. The stress fixtures are what goes in the boxes, and they are the separation: a layout that only looks right with particular content is a draft page, not a layout (the owner, addendum 2).

Every prop is a plain page prop, so a filter reads `layout.columns`, `layout.tags`, `layout.widths[0]` with nothing to register and no schema. The whole catalogue is `layouts.js`; readme.md has the prop table.

## CSS class naming

`Layout extends Page`, and `Page` is NOT a `View` — so `View.classify()` never sees this class and no CSS class is minted from its name. Every VIEW part built below is named `PageLayout*`, which mints `.page-layout-*`: `page-` is core/Page's reserved prefix and `layout-` belongs to `ext/layout` (styles/css-scopes.txt). `core/Page/Frame.js`'s `PageFrame` is the precedent.

## THE VIEWPORT

The site's one resizable stage (`ext/demo/stage.js`), opened at this layout's own FLOOR, because the floor is where a layout is hardest and where a reader learns the most. The handle and the strip are how you leave it.

The flex basis is the floor, not a token. A `1 1 24em` viewport gets whatever the row hands it, and the stage's `max-width: 100%` then caps a 1400px layout at 602px on a 1280 screen with nothing thrown — measured before this line existed. The basis asks the ROW for the floor, and the aside wraps below when there is not room for both.

## THE PROPS, AS A TABLE

Everything a filter reads, in the order the readme's prop table lists them — one drawing, so a prop that exists is a prop that shows.

## THE CARD

A PICTURE, never a live instance (the layout skill's rule): the arrangement drawn as grey boxes, at the card's size, with nothing to read. It is the layout's own shape rather than a generic word, which is what makes a wall of thirty a palette you can pick from.

The thumb is a `.stage` — 16/10, `overflow: hidden` — so the picture is flex-sized and `height` is dropped from the declarations. A ported entry that says `height: 16em` would otherwise be twice the thumb.

DRAWN AT 900px AND PAINTED DOWN, not drawn at the card's own width. A rail is `15em` and a measure is `40em` — real lengths — so a picture built inside a 200px thumb would show a wrapped stack for every one of the thirty and the wall would be thirty identical grey rectangles. `ext/demo/pane.js` lays the box out at a fixed width and fits it to the room, which is exactly this.

## Picture rendering

One block per track — and per REPEAT, capped at eight, so a wall looks like a wall rather than like one box. `kids` recurses: a split inside a split.

A picture of a STACK is a column of bars: `display: block` (and a decl that says no display at all) becomes a flex column here, so the boxes share the height instead of collapsing to three hairlines at the top of the card. `columns:` is left alone — masonry's whole picture IS its columns.

## Defaults

The defaults every layout inherits — on the PROTOTYPE, so a declared value shadows one without a line of code. `accepts: "any"` and `allowed_in: "any"` are the owner's own instruction: a layout that says nothing restricts nothing.

## Fixture

The fixture currently poured into the boxes: one place, so the viewport, the strip and the chips can never disagree about what is on screen.

Name → fixture kind mapping is DERIVED from `boxes`, never declared beside it: written twice, the two are one edit away from disagreeing about what a slot holds.

## Rendering

The arrangement with the current fixture in it, and the rules checked against the box it landed in. The box has no size yet: a page is built detached, so every rect right now reads 0 and rule 1 would fire on all thirty. The observer fires the moment it gets a size — and again on every drag of the handle, which is exactly when the width rule needs asking again.

One chip per fixture: clicking one redraws the render and the strip — the whole point of the fixtures is that you can see the layout survive them.

## Approval run

8 fixtures x 7 widths is 56 renders for one layout, which is why it is a click and not something that happens on load. The verdict written back into `layouts.js` came from the headless probe, which sets the REAL viewport to each width — a fixed-width box here answers container queries but not `@media`, and the button says so.

`click` binds `this` to the BUTTON's View, so the page is reached through the closure above — the shape every other button in core takes. One frame before the run: 56 renders block the paint, and a button that never says "Running…" reads as a button that did nothing.
