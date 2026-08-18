## What this file is

The second chapter: two floors (legibility, against the font size; composition,
against the box's own width) collapse into one `clamp()`. Backed live by
`padding_ladder()` in `demos.js`, rendered after the prose via the `doc()`
helper's `.then()` chain.

## Padding inside padding

The `double-pad` test — "does the paint change, not is there a background" —
is the sharpest single idea in the chapter, and it is stated as a rule
`ext/DesignTool` also enforces, so a violation here and a violation the tool
flags cannot silently disagree.

## Improvements

1. **Nothing ranked.** Short, rule-plus-live-proof, and the live numbers are
   read off the rendered DOM rather than asserted — see `demos.js.md`.
