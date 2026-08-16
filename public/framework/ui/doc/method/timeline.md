`ui.timeline(...items)` draws a rail of dots down the left of a column of dated
entries — a changelog, a release history. Each item is a `[when, what, note]`
triple.

## What a caller must know

The connecting line is **not** a pseudo-element. It is the inline-start border
of an empty `flex-1` div sitting under each dot, in the flow — a pseudo-element
positioned absolutely would also have worked (it is both a relationship and a
state, [tooltip](/framework/ui/tooltip/)'s test) but needs a selector either
way, and this needs no selector at all: `flex: 1 1 0` on the dot's sibling is
enough. `:last-child` rules stop the line and the padding on the final row, so
"which row is last" is a question the DOM answers rather than an index the
caller has to pass in.

⚠ **On a column, `v-center` centers horizontally.** `.flex.v` swaps which
property means which visual axis, so `flex v v-center` is what lines the dots
and the line up on one axis — this reads as backwards until you remember
`align-items` is always the cross axis.

The dot color reads `var(--eyebrow, var(--prim))`: a timeline can land on any
of a changelog band's four tones, and a fixed `--subtle` measured 1.06:1
contrast on the accent one. `--eyebrow` is the band's own safe accent, handed
down by whatever drew it; off a band it falls back to `--prim`.

## Not `ext/Timeline`

[`ext/Timeline`](/framework/ext/Timeline/) is a different, larger component — a
zoomable h/v axis with lanes, live updates and its own `--t`/`--em-per-hour`
positioning model. They share an English name and nothing else; see "Where
this module overlaps others" in the [audit](/framework/audit/modules/ui.md).

## Improvements

1. **The name collision with `ext/Timeline` costs a reader a beat.** Both
   docs now cross-link, which is the cheap fix; a rename of either is not —
   see the audit for the full weighing. *(medium, useful)*
