The component whose CSS is the whole component — five rules, and the sharpest
statement in the directory of when a rule needs a selector.

## The test, stated precisely

Not "is this a look?" (a fill is a look too, and that goes inline elsewhere in
this library) but "is this about one element, at one moment?" `position:
absolute` on the bubble is a **relationship** between two elements — it
resolves against a positioned ancestor, which an inline style can't speak
about. `:hover`/`:focus-visible` is a **state**, and there's no inline syntax
for one.

## Two details worth stealing

`visibility` alongside `opacity` — opacity alone leaves an invisible box on
the hit-testing map, swallowing clicks aimed at the line above it. And the
reveal is **one selector list** (`:hover`, `:focus-visible`, `.shown`
together) so the keyboard path can never drift from the pointer path — and
`.shown` makes the component screenshot-testable for free.

## Improvements

Nothing ranked: five rules, both non-obvious lines commented in place, and
the ink/surface color pair already replaced a hardcoded `white` per the
review.
