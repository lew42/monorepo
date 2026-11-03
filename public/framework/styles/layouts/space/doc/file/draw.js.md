## What this file is

The chaos dial, and the only place it exists. Every draw `gen.js` makes
(`pick`, `band`, `role`, `em`, `count`, `odds`, `some`) goes through
`draws(seed, chaos)`, so one number bends the whole model at once instead of
being threaded through forty call sites.

## The blend is linear, because "1" has to mean uniform

`p = (1−c)·w + c/n`, not a temperature (`w^(1/T)`). A temperature is the
textbook softening curve, but it reaches uniform only asymptotically — a dial
whose top end is labelled "1" and is not actually uniform is a dial that lies
about its own number. Linear means chaos 0.5 gives an off-model part exactly
half a uniform chance, predictable straight from the number on the slider.

## The blend is over the full vocabulary, not the weighted keys

`pick(weights, all)`'s `all` is `PARTS_ALL` for a role draw — every part the
format knows, not only the ones with a weight in that role. Blending toward
uniform over the model's own preferred keys could only reshuffle those
preferences; it could never place a `footer` in a `rail`, which is the entire
point of the dial.

⚠ `all` is opt-in per call site. `gen.js`'s `d.pick(DEPTHS)` omits it, so that
one draw's chaos only reshuffles within `DEPTHS`'s own keys — see
`model.js.md`'s Improvements for what that quietly caps.

## `band()` widens around the middle, not the edges

Four times as wide at chaos 1, centred on the same midpoint the model would
pick at chaos 0 — so a size stays recognisably close to what the shape wants
even as it stops being tasteful, rather than drifting toward one extreme.

## mulberry32, not `Math.random`

A seed has to be replayable — `gen(7, 3)` today and next year are the same
layout — and `Math.random()` cannot be seeded in the browser. One
multiply-heavy mixing step, 32 bits of state, same sequence everywhere.

## Improvements

1. **`all` is opt-in and easy to forget on a new call site.** `DEPTHS` already
   shows the failure mode: omit it and chaos silently narrows to "reshuffle
   what's already a key" instead of the "uniform over everything the format
   can say" the file's own header promises. A default of `PARTS_ALL` (with an
   explicit narrower list only where a draw genuinely isn't over parts) would
   make the omission the visible choice instead of the silent one. *(simple,
   useful)*
