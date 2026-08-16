The band: `.demo-exhibit`'s render + definition columns, the "ground" a specimen
sits on inside a `bleed` stage, and the one-title-per-surface rule that hides a
demo app's own `h1` when it's shown on a stage.

## One band, not four siblings

`stage`, the layout bar, `source` and the caption used to be four direct
children of `.page.standard`, each choosing its own grid track — on a 3440
monitor that was a 3020px render sitting above a 936px code block with 2000px
of grey beside it. `.demo-exhibit` wraps all four in one `flex-wrap` row instead,
so the definition moves *beside* the render once there's room for both, and
nothing moves at all below roughly a 2.5K-wide monitor.

## The ground is the screen's, not the page's

A layout paints `--surface`; the page under it paints `--wash`; in light mode
those are close enough that a specimen and the page around it read as one
field. `.demo-exhibit .demo-stage.bleed .demo-screen` paints `--bg` (the site's
dark chrome colour, used in both themes) so a specimen reads as a screen sitting
on a canvas — which is what it is.

## The readout's ink doesn't flip with the theme, here

`.demo-exhibit .demo-stage.bleed .demo-size` is a literal
`rgba(255, 255, 255, 0.5)` rather than `--subtle`, because it sits on `--bg`,
which is dark in *both* themes — the one place on the site the size readout's
colour doesn't follow light/dark.

## Improvements

1. **The phone breakpoint (`@media (max-width: 36em)`) and the definition
   column's `min-width: 0` guard are two separate mechanisms solving two
   related problems** (gutter payback, and a long line not blowing out the
   flex row) that read as one paragraph in the file's own comment. Splitting
   the comment in two would make each rule's reason easier to find on a second
   pass. *(simple, speculative.)*
2. **No `doc/file` coverage existed for this file before this pass**, despite
   the design record (`doc/record.md` §19, §14) already carrying the numbers
   this file's comments summarize. *(simple, important — done in this pass.)*
