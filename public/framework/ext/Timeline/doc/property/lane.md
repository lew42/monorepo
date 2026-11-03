# lane

Number, em per lane across the cross axis. Defaults to `2.2`
(`this.lane ?? 2.2`, `Timeline.js:41`), written once into `--em-per-lane` on
the root.

⚠ **This is a different `lane` from an item's own `lane` field.** An item's
`lane` is a *string* — a named track that pins related items together in
`lay()` (`{ lane: "tab-1" }`, see `page.js`'s "Named lanes" demo and
`doc/method/lay.md`). The constructor's `lane`, documented here, is a
*number* — a sizing constant with no connection to packing at all. Same
five-letter name, same module, two unrelated meanings; a reader skimming
`new Timeline({ lane: … })` cannot tell which one a value is for without
checking the type. Flagged in the readme's Traps and in the audit report's
Recommendations.

In `.h` mode, `--em-per-lane` is a fixed height per stacked lane (the track's
own height grows with lane count, since `.h`'s cross axis may scroll). In
`.v` mode the cross axis is *width*, which a page never scrolls sideways, so
`Timeline.css` divides the track's given width into `--lanes` **percentage**
shares instead of fixed ems — `lane` still sets the default lane count's
notional size, but the rendered width is `100% / var(--lanes)`.

## Improvements

1. **Rename one of the two `lane`s.** The instance property could become
   `lane_size`/`laneEm`, or the item field could become `track`. Either
   removes the collision above for good. *(simple, important — a one-word
   rename with no behavior change, blocked only by the fence: I can propose
   it here, not make it.)*
