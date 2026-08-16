# ruler(base, to)

Draws the hour-tick strip. `step` keeps labels at least `~4em` apart by
scaling with `zoom` (`Math.max(1, Math.ceil(4 / (this.zoom ?? 4)))`) —
zoomed-out timelines get sparser ticks automatically, no separate
"labelDensity" option. `first` rounds the domain start up to the next whole
hour so ticks always land on the hour, not at an arbitrary offset from
`base`.

The tick *lines* themselves come from a `repeating-linear-gradient` in
`Timeline.css`, not from this method — `ruler()` only places the text labels.
See `doc/file/Timeline.css.md`.

## Improvements

Nothing ranked: 9 lines, one job, matches its CSS counterpart exactly.
