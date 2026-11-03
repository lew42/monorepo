`demo.tree(config)` is a site TREE as a demo page, the way `demo.page()` is a
function as one — the specimen is a whole fictional `Page` tree, navigating
inside its own box. `export default new Page(demo.tree({ meta: import.meta,
tree: shop }))` is the whole file.

## `tree` must be a function

Never a built `Page` instance. A `Page` memoises its own `.view`, so the card's
copy and the stage's copy would fight over one DOM node the instant both tried
to render it. A function is the only shape that can be handed to two different
places and stringified for a third (the definition under the render).

## The card IS the tree, at half scale — no separate thumbnail

`preview()` renders `this.box()` — the real mini app, at `zoom: 0.5` — inside the
card, with an invisible `<a>` laid *over* it rather than around it. Wrapping a
live, clickable tree in an `<a>` would nest two anchors, which the browser
silently un-nests; the overlay link is the workaround, and it's why the card
looks interactive but every click actually just navigates to the demo's own page.

## `rail`, not `nav`

`nav` is already a `Page` method (`nav_for()` reads it), so a config key of that
name would shadow it the moment the mini app asked this child for its own menu
entry. `rail: true` is what turns on `demo.app()`'s left-hand list.

## The stage is bare

`stage()` here returns `$stage.ac("bare")` — no field around the tree, the
handle rides the frame's own edge, the width pill centers on the bottom border
rather than sitting under a padded box. That's a visual difference from every
other door's stage, made once, here, because a demo app already draws its own
frame (`.demo-app`'s border) and a second one around it would be a frame around
a frame.

## Improvements

1. **A tall bare stage letterboxes on a wide monitor.** A `demo.tree()` with
   `min: "18em"` (was `height:` — 2026-08-30, demo-merge step 1) sits inside a
   render column that can be 1900px wide on a 3440 screen — a 7:1 strip.
   Recorded open in the design record (§19.6); the fix belongs on the tree
   (its own config), which is the one thing that knows it wanted a window.
   *(medium, useful.)*
2. **See `demo.page()`'s doc for the config-shape inconsistency** between this,
   `demo.layout()`, and the name-first `demo.page()`. *(medium, useful — one
   finding, documented once.)*
