## What this file is

The loop that ranks the generator's own choices: `sweep()` rolls N seeds
through `gen()`, rates each at three widths with `taste.rate()`, and returns
them sorted by fitness. `credit()` and `proposal()` then read back *which
draws* the good layouts had in common — the numbers `model.js`'s weights are
a claim about.

## Fitness is the worst width, not the mean

The module readme's own table is the proof: `mail` scores **B 87 at 1280 and
F 49 at 390**. A mean would report a B, and "works from mobile to mega" —
the prime objective — is exactly what a mean lets a wide-screen win pay for.
`worst: Math.min(...marks.map(m => m.score))` is what `sweep()` sorts by,
`mean` rides along only as a tiebreaker.

## The captor is set to nothing, in a `try/finally`

`measure()` calls `View.set_captor(null)` before `render()` and restores it
in `finally` — `render()` builds with bare factories, so a sweep started from
inside a page's own `content()` would otherwise append forty-eight throwaway
layouts into that page. `finally` is the shape that survives a rule throwing
partway through the loop.

## `setTimeout`, never `requestAnimationFrame`

A sweep is usually driven from a tab nobody is looking at, and a hidden tab
runs no animation frames at all — `pause()` uses `setTimeout(done, 0)` so the
loop keeps advancing in the background. Same trap `ruler.js` documents for
its `ResizeObserver`.

## `n` is what makes a `credit()` row worth believing

Nine shapes over forty-eight seeds is five layouts each, and `credit()`'s own
comment calls that a hint, not a result — before any number gets near
`model.js`.

## Improvements

1. **`proposal()`'s `now` formula cubes the lift** (`entry.w * g.lift ** 3`)
   with no comment saying why a cube rather than a linear scale. It is
   presumably meant to punish a weak `n` and reward a strong one harder than
   a straight multiply would, but that reasoning lives only in the exponent,
   not in the file. *(simple, speculative)*
