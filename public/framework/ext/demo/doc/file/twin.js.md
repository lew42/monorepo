`twin(fn)` — one layout, twice, side by side: a whole 390×844 phone screen
beside a whole 3440×1440 monitor screen, both live, both landing on one height.
The only consumer is `demo.layout({ twin: true })`'s card.

## The comparison IS the card — no second measured pass

Each pane is sized `flex: ${width/height} 1 0` with `aspect-ratio: width/height`
set directly, so fitting both panes by *width* alone puts them on one *height*
with nothing cropped and no dead space — geometry doing arithmetic a second
`ResizeObserver` pass would otherwise have to do.

## ⚠ Hidden until the first fit

A card is built while detached from the document, so `clientWidth` reads `0`
until it actually lands — `visibility: hidden` until `fit()` runs once for
real, or the rail would show one frame of an unzoomed 1440px-wide render
snapping down to size on every load.

## Improvements

1. **`PHONE`/`MONITOR` are hardcoded constants with no override** — every
   `twin: true` card is the same two devices. Fine while there's one consumer;
   worth a config seam if a second caller ever wants different sizes.
   *(simple, speculative.)*
2. **No `watch()` teardown.** The `ResizeObserver` created per pane is never
   disconnected — consistent with the rest of the module (`stage.js`'s own
   `watch()` has the same shape), so not a new problem, but worth naming
   once rather than once per file. *(medium, speculative.)*
