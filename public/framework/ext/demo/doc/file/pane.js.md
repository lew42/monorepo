`pane({ width, height }, fn)` — one device frame: a whole screen laid out at a
fixed width and painted down to fit the room it is given, nothing cropped.
The one consumer is `ext/Panel/Workspace/viewports.js`.

## The comparison IS the geometry — no second measured pass

Each pane is sized `flex: ${width/height} 1 0` with `aspect-ratio: width/height`
set directly, so fitting a row of them by *width* alone puts them on one *height*
with nothing cropped and no dead space — geometry doing arithmetic a second
`ResizeObserver` pass would otherwise have to do.

## ⚠ Hidden until the first fit

A frame may be built while detached from the document, so `clientWidth` reads `0`
until it actually lands — `visibility: hidden` until `fit()` runs once for
real, or you would see one frame of an unzoomed 1440px-wide render snapping down
to size on every load. Workspace relies on exactly this: a hidden viewport box
re-fits itself the instant a mode switch makes it visible again.

## The file used to be `twin.js`

It exported a `twin(fn)` that drew a 390 phone beside a 3440 monitor, for
`demo.layout({ twin: true })`'s card. That export had **no caller** —
`ext/demo/layout.js` imported it and never used it — and no width readout.
Deleted 2026-08-30 with `two.js`, and the file renamed for what is left of it
(demo-merge step 3). `twin:` survives as a config word meaning *the specimen is
a whole screen, so it paints its own ground*.

## Improvements

1. **No `watch()` teardown.** The `ResizeObserver` created per pane is never
   disconnected — consistent with the rest of the module (`stage.js`'s own
   `watch()` has the same shape), so not a new problem, but worth naming
   once rather than once per file. *(medium, speculative.)*
