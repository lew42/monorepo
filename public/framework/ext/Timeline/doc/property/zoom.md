# zoom

Number, em per hour along the time axis. Defaults to `4` (`this.zoom ?? 4`,
`Timeline.js:40`), written once into `--em-per-hour` on the root at
`render()`. Every item's `left`/`top`/`width`/`height` and the ruler's tick
spacing are `calc()`s off that one custom property.

There is no live setter. "Zooming" a mounted `Timeline` means writing
`--em-per-hour` yourself via `.style()` — which the CSS-variable design
explicitly allows, since nothing else has to re-render — or constructing a
second `Timeline` at a different `zoom`, which is what `page.js`'s "two
zooms, side by side" demo does. A slider that writes `--em-per-hour` live is
`ext/layout`'s job (phase 2), not this class's.

⚠ Not the same value as `lane` (em per **lane**, the cross axis) — see
`doc/property/lane.md`.

## Improvements

1. **No sanity floor.** `zoom: 0` (or a negative number) produces
   `--em-per-hour: 0em`, collapsing every item to zero width with no error.
   A `Math.max(0.1, …)` clamp, or at least a console warning, would turn a
   blank timeline into a diagnosable one. *(simple, useful)*
