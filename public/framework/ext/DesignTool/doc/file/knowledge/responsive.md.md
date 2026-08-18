A robust layout behaves predictably across widths — it reflows at a few places
it was told to, and does nothing surprising in between. This file is the case
for `sweep.js`'s coarse-stride-then-bisect approach over a per-pixel scan, plus
the one worked example that justifies it existing at all.

## "An edge nobody chose" is the actual finding

Not "is it right at 1920" but "where does behaviour change, and did anyone
choose those places" — an edge you can name (a `--column` running out, a
`clamp()` bottoming out) is the layout working; an edge nobody chose is nearly
always a fixed width, a missing `min-width: 0`, or `auto-fit` where
`auto-fill` was meant.

## The worked example is the whole argument in one paragraph

An `illegible` band that exists only between ~840px and ~1208px on the "Good
widescreen" corpus case — invisible to checking 400/1280/1920/3440 by hand, and
found in 13 samples / ~25 loads / 9 seconds by the sweep. No amount of
checking the four standard widths finds a window that narrow.

## "A rule firing is not a rearrangement either" is the second-order version

The file already said a continuous metric cannot be bucketed into a signature;
a 174-edge site sweep showed that the *discrete* replacement had the same
disease one level up. Five pages "changed" at 1272px, all of them only because
`line-height` crossed its threshold. The signature now takes structural rules,
the scroll flag, the cut count and a measure band — and the generalization is
stated: **a signature term earns its place by naming a thing the layout did,
not a threshold it happens to sit near.**

## Improvements

1. **This file documents `sweep.js` well but nothing in the module's own UI
   currently exposes it** (see `tests/page.js.md`'s and the readme's matching
   findings) — the lesson is complete and the feature it justifies is only
   reachable from the console. `frame()`'s new timeout removes the reason not
   to wire it in, so the gap is now a decision rather than a risk. *(simple,
   important — cross-referenced in the audit report.)*
2. **The new signature is reasoned, not measured.** Nothing has re-run the
   174-edge sweep against it to confirm the noise edges disappear and the real
   ones survive — the wave-2 re-crawl is where that gets settled. *(medium,
   important.)*
