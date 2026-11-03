# Timeline.css

Layout-only theme-layer CSS: every rule resolves position/size from the four
custom properties `Timeline.js` writes (`--em-per-hour`, `--em-per-lane`,
`--dur`, `--lanes`) plus the per-item `--t`/`--d`/`--lane`. No JS-computed
pixel values anywhere — zoom and orientation are a property write and a class
swap because this file made every rule a `calc()` off them.

## `.h` vs `.v`'s cross axis is asymmetric on purpose

`.h`'s cross axis (lane height) is a fixed em value — the track may grow
tall and scroll. `.v`'s cross axis is *width*, and a page never scrolls
sideways, so `.v`'s lanes are **percentages of `--lanes`**, not fixed ems —
otherwise a catalog rail (half the region) would either overflow or leave
blank space depending on lane count. This asymmetry is the file's single
most load-bearing decision and is called out in its own comment
(`Timeline.css:26-30`).

## `.dot` is centered ON `--t`, not anchored at it

A bar's `left`/`top` starts exactly at `--t`; a dot subtracts half its own
size (`calc(var(--t) * var(--em-per-hour) - 0.35em)`) so the mark's *center*,
not its edge, lands on the instant it represents.

## `window`/`day` span the full cross axis, unconditionally

`.timeline-item:is(.window, .day) { top: 0; height: 100% }` (or
`left`/`width` in `.v`) overrides whatever `--lane` that item was assigned —
which is why `day` visually looks identical whether or not `lay()` gave it
its own lane (see `doc/method/lay.md` and the readme's Open section).

## Nested children never read `.reverse`

`.timeline-item-children > .timeline-item` has no `.reverse` variant at all —
intentional, per the readme's Decisions: the parent bar already flipped
itself, so its interior is an ordinary un-reversed box.

## Improvements

1. **`window`/`day` sharing one `:is()` rule for full-span but not for lane
   consumption** (CSS treats them identically; `lay()` in JS does not) is the
   CSS half of the Open question in the readme — worth resolving together
   with the JS side rather than separately. *(simple, useful)*
