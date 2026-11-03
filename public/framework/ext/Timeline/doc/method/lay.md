# lay(items, base)

Greedy interval packing. Named-`lane` items each reserve one exclusive track
up front (`names`); everything else is sorted by start and dropped into the
first lane whose last occupant has already ended, else a new one — the
classic "minimum meeting rooms" algorithm. Returns the total lane count,
which `render()` writes to `--lanes`.

A lane frees at `end(it, start)` — the same call `item()` makes to size the
bar it draws — so a still-running (`to`-less) span keeps its lane reserved
until "now", not until its own start. See `doc/method/end.md`.

`kind: "window"` items never reach this method — `render()` filters them out
and draws them directly onto lane `0`.

## Improvements

1. **`ends.findIndex` is O(lanes) per item**, making the whole pass O(n ×
   lanes) — fine at today's scale (a day's worth of tasks), not something to
   worry about unless items counts grow by orders of magnitude. *(simple,
   speculative)*
