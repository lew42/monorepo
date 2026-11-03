The stage's own look: the resizable box, the drag handle, the tools strip, the
`bare`/`bleed`/`max` variants. `demo.css`, `exhibit.css` and `two.css` all steer
these classes from outside; this file is the one place their base shapes are
declared.

## The handle's overhang is exact, not approximate

`.demo-handle` sits `inset-inline-end: -0.125em`, and `.demo-stage` carries
`margin-inline-end: 0.125em` to match — the handle hangs exactly as far outside
the stage's box as the stage reserves for it. Mismatch either number and the
handle is either clipped by a parent's overflow or floating in dead space with
nothing under the second half of it.

## The container query has to sit after the rules it overrides

`@container (max-width: 34em)` on `.demo-tools` collapses the three-track grid
to one centred column when the stage itself runs out of room — a *container*
query on purpose, because what's narrow is the stage, and `@media` can't see
that. It's written after the base three-track rule in the same layer at the
same specificity, so it wins purely on document order; placed above it instead,
only `justify-items` would take and the tracks would silently stay put — which
reads exactly like "container queries are broken" rather than "this rule lost a
tie."

## `bare` dresses the handle and the readout like they're on a real border

`.demo-stage.bare` has no field of its own — `demo.tree()`'s bare stage sits
directly against a real bordered frame (`.demo-app`), so its handle grows
(`0.4em` vs `0.25em`) and gets a background, border and shadow to read as part
of that frame; the size readout becomes a pill centred on the bottom border
instead of a right-aligned strip of text.

## Improvements

1. **`.demo-stage.max`'s `z-index: 30` is a bare number with no scale
   documented anywhere in this file or the readme.** If another full-screen
   overlay is ever added elsewhere on the site, there's nothing here to check
   it against. *(simple, useful.)*
2. **Three classes (`bare`, `bleed`, `max`) modify the same three base rules
   (`.demo-stage`, `.demo-screen`, `.demo-tools` padding) in slightly different
   combinations** — readable today at this size, worth re-checking if a fourth
   stage variant is ever proposed. *(medium, speculative.)*
