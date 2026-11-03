# render()

The whole layout pipeline, run once by `View`'s `initialize()`
(`this.append(this.render)`). In order: compute the domain (`span()`), set
the orientation/reverse classes, write the three root custom properties
(`--em-per-hour`, `--em-per-lane`, `--dur`), draw the ruler, then the track.

`--dur` is floored at `0.25` hours (`Math.max((to - from) / HOUR, 0.25)`) so
a domain with `from === to` — a single-instant dataset — still gets a
nonzero-width track instead of collapsing to nothing.

Inside the track, `window`-kind items are drawn **outside** `lay()`, straight
onto lane `0`, before `--lanes` is written — they never compete for a packed
slot (see `doc/property/items.md` and the readme's Item shape section for
why `day` does not get the same treatment). `live()` runs last, after
`--lanes` is set, so the "now" line's own `--t` write doesn't race the
layout pass.

## Improvements

Nothing ranked against this method itself — it is a clean, linear pipeline.
