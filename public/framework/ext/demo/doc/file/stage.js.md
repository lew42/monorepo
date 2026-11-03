The stage: the only resizable viewport on the site, and the whole chrome of a
leaf demo page. `stage(fn, board)` builds the four pieces — tools strip, screen,
render, size readout — and every other door (`demo()`, `page.demo()`,
`demo.exhibit()`, `demo.tree()`) composes the same `stage()` rather than building
its own, which is why the width readout is on every one of them. `pane.js` reuses
its `simulate`/`watch` pair for a fixed device frame.

## Three boxes, not one — and they can't merge

`.demo-stage` › `.demo-screen` › `.demo-render`. Two attempted merges both broke
silently: `overflow` on the stage clips the handle that hangs half outside its
edge (the drag stopped working, because the half of the handle you'd aim at was
the clipped half), and `overflow-x` on the render forces `overflow-y` off
`visible` for every demo on the site, because the two axes can't be set
independently except at `clip`. So: the stage owns width and the handle, the
screen owns padding and scrolling, the render is the bare content box —
`offsetWidth` on that bare box is what makes the readout honest.

## `simulate()` is `zoom`, never `transform: scale()`

`zoom` changes the element's own coordinate system, so a 390px layout drawn at
`zoom: 0.6` really does lay out at 390px and *look* smaller — a scaled box would
still occupy its unscaled footprint and nothing would reflow. `ruler()`'s
`offsetWidth` read depends on this: it's the element's own box, unaffected by
`zoom`, so a preset always reads back exactly the width that was picked.

## `drag()` coalesces to one move per animation frame

A 240Hz pointer fires far faster than a relayout can keep up with; `drag()`
keeps only the latest pointer event and runs `move` once per `requestAnimationFrame`.
Measured (design record §18): 200 raw `pointermove`s went from 781–807ms of main
thread to 0.4–2ms once this landed, alongside two other fixes in the same pass
(unchanged widths short-circuit, and reading both rooms before writing either
pane).

## `tools()`'s `fitted` flag is the whole "who owns the zoom" bookkeeping

A width computes a zoom; a reader can then zoom further on top of it. `fitted`
tracks whether the current zoom is still the one the width computed — a
container resize re-fits only while `fitted` is true, so a reader's own manual
zoom is never silently overwritten by a window resize. Releasing a width takes
its computed zoom with it; releasing a manual zoom leaves it alone. Getting this
backwards was measured and fixed before it shipped (§20 of the record).

## Improvements

1. **`tools()` is a 70-line closure with five pieces of mutable state
   (`width`, `fitted`, `$devices`, `$zoom`, `$custom`) captured across nine
   inner functions.** It reads clearly today because every function is small,
   but it's the one function in the module that would benefit from being a
   small class if a sixth control is ever added. *(medium, speculative — not
   worth it at the current size.)*
2. **`WIDTHS` and `ZOOMS` are module-level constants with no `demo.stage()`-level
   override.** Every stage on the site offers the same four widths; fine while
   true, but there's no seam if a future demo wants, say, a fifth "watch" width.
   *(medium, speculative.)*
