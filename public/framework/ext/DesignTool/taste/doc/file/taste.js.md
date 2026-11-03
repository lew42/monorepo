The front door of the third tier. `rate(target)` probes (or accepts an
already-probed model), derives the eleven values via `read()`, scores each
against `ranges.js`'s bands, and returns the total plus the three weakest —
the one function everything else in this module exists to feed.

## A missing range is dropped, not scored zero

A layout with no prose has no `measure` reading — `null`. Marking that as a
failure would rank every dashboard below every article, which is a category
error, not a taste judgement. `rate()` filters `bands` to the ones whose
`credit` is not `null` and **moves the divisor with them**: `weight` sums only
the live bands, and `score` divides by that, not by the book's full total.

## `covered` is what keeps two equal scores from telling the same story

`covered` reports `weight measured ÷ TOTAL` as a percentage — so a 62/B with
`covered: 40` and a 62/B with `covered: 95` are visibly different claims even
though the headline number matches. Without it, a page that happened to have
almost nothing measurable could tie a page that was actually rated on ten of
eleven bands.

## `grade()` is imported from `score.js`, not restated

It was a second, hand-typed ternary reproducing `score.js`'s `GRADES` table —
two numbers that have to change together with no way to find that out except
by grading something twice and comparing. Now it is a straight `import { grade }
from "../score.js"` and a re-export, so one ladder means one thing across
`analyze()`, `polish.js` and this tier.

## `ignored` and `mostly_picture` — the caveat this tier cannot fix

`rate()` reads `model.ignored` — the share of the root's area `probe()` was
told to skip — straight through, and adds `mostly_picture` at 50% or more. A
page whose subject is a demo stage measures the caption around it, not the
stage, so a low score there means the tool was blindfolded, not that the
layout is bad. See `DesignTool/readme.md`, "39% of what this tool audits, it
never looked at."

## Improvements

1. **`rate()` silently drops `opts` whenever `target` is already a probed model**
   (`target?.nodes` truthy) — a caller who re-probes with different options
   after already holding a model has no signal the second set of options did
   nothing. *(simple, speculative.)*
