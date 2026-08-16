The timeline exhibit (three releases) plus one variant (`single` — the run
stopping after one entry, the trickiest case for a "last row" rule).

## Not `ext/Timeline`

States the disambiguation directly: this is a dated **list** with no time
axis, no scale, no lanes — [`ext/Timeline`](/framework/ext/Timeline/) is the
zoomable h/v axis component. Both link to each other's page; see "Where this
module overlaps others" in the [audit](/framework/audit/modules/ui.md) for
the full case.

## Improvements

Nothing ranked: the `v-center`-centers-horizontally trap and the
`--eyebrow`/`currentColor` color derivation are both already stated as
prose, and the `single` variant exists specifically because "the run has to
stop" is easiest to get wrong at n=1.
