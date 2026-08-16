## What this file is

The live proof behind two of the five rule pages. `padding_ladder()` (used by
Proportion) renders the same card at three widths, twice — once at a fixed
20px padding, once at `clamp(0.75em, 3.5%, 3.5em)` — and prints the measured
ratio under each. `nesting_table()` (used by Nesting) builds all six of the
nesting table's row combinations and runs `ext/LayoutTool`'s `analyze()` on
each one live.

## The measurement is read off the DOM, not computed

```js
const pad = parseFloat(getComputedStyle(el).paddingLeft);
```

`verdict()` reads the *rendered* padding rather than re-deriving it from the
CSS source, so if `clamp()` resolves differently than expected at some width,
the page reports what actually happened rather than what the rule intended.
That is the whole argument this directory makes about itself: a claim quoted
in prose can go stale, a number read off the live box cannot.

## Improvements

1. **Nothing ranked.** Both exported functions do exactly one job, are
   already exercised on two live pages, and the file is under 120 lines with
   a comment at the top stating the trap (verdicts are measured, not
   asserted) that the rest of the module exists to keep true.
