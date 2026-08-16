The third exhibit sugar: `demo.layout(config)`, a whole page as a demo page. It
absorbed two now-deleted files — `styles/layouts/detail.js` and
`core/Page/layout/detail.js` — which is why this file, alone among the three
sugars, needed its own module rather than living in `exhibit.js` beside
`demo.page()` and `demo.tree()`: it pulls in `twin.js` (the card) and
`ext/layout`'s `panel`/`controls` (the `parts:` chips), neither of which the
other two sugars need.

## Imported as `panel`, so `layout` can stay this file's own word

`import panel from "../layout/layout.js"` — a deliberate rename at the import
site. `layout` is what every function and variable in this file calls the page
being demoed (`this.layout()`, `demo.layout`), so importing `ext/layout`'s
default export under its own name would collide with the word this file uses
constantly for something else.

## `toggles()` re-registers on every redraw

`panel.context($view, () => { … })` runs again each time a `parts` chip flips
and calls `redraw()` — registration isn't a one-time setup, it rides along with
whatever the panel's own "nearest registration wins" lookup finds current.

## Improvements

1. **`toggles()` has no validation that a name in `parts:` matches a region
   `layout()` actually checks with `this.shows()`.** Covered in the `demo.layout`
   method doc — flagged here too because the fix, if taken, lands in this file.
   *(medium, important.)*
2. **`this.off` is a `Set` initialized as a page-level config default
   (`off: new Set()`)**, which means every `demo.layout()` call shares the
   *shape* of the default but each page instance gets a fresh `Set` (config
   objects are spread per call, not shared) — worth a comment confirming that
   isn't accidentally shared state, since a `Set` default reads as suspicious
   at a glance. *(simple, speculative.)*
