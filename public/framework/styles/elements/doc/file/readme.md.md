## What this file is

The design record behind the element reference: why seven pages grouped by
task rather than one page grouped by spec category, why every element gets a
`demo()` and never a denser hand-rolled swatch helper, and why unstyled
elements are covered too ("not listed" reads as "not supported" when the
truth is "renders fine, nothing to override").

## The ratio is the design

Thirty-nine of about seventy factories have no rule anywhere in
`framework.css`, and the readme states that ratio is deliberate — the
cheapest way to hold "contains nothing you'd ever want to override" is to
style very little. Read this before `misc/page.js`, which is where that list
is printed in full.

## Findings recorded, not shipped

The readme is explicit that writing a doc page is not a licence to fix the
thing being documented mid-pass — every gap found while writing these seven
pages (the `:not()` list asymmetry, `audio`/`iframe` missing from the
replaced-elements rule, `kbd`/`samp` missing the mono font) is recorded in
`doc/framework-css.md` rather than silently patched.

## Improvements

1. **Nothing ranked.** The "no stylesheet, and one place it nearly broke"
   section is an honest accounting of the three inline-style exceptions this
   directory allows itself, which is exactly the kind of self-audit a
   design record should carry.
