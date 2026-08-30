`demo.stage(fn, steer)` is the render alone: the site's one resizable viewport,
with nothing above it but its own strip and nothing below it but the width
readout. It carries `wide` like any exhibit — a stage is something you *look at*,
not something you read — and `.ac("bleed")` is what takes it the rest of the way
to the window's edge.

## `steer` fires on every change, not once

If given, `steer` is called with the `$render` view — and it fires again every
time the stage's content changes, not just at build. That is the seam
`demo.exhibit()` uses to keep its layout bar pointed at the right thing: a tree
demo navigates *inside* its own box, so a bar wired once to the root would, three
clicks later, be editing a page that has scrolled off screen.

## ⚠ A div is not a viewport

The one trap worth knowing before trusting the handle. Everything intrinsic
responds to a drag or a simulated width — `auto-fit`, `%`, `flex-wrap`,
container queries — because the stage really does lay its content out narrower.
A `@media` query inside the example does not: it asks the real browser viewport,
which never moved. Drag a demo to 390px and it will still render its desktop
branch. The fix, when it's wanted, is an iframe — deferred deliberately, costed
in [the design record](/framework/ext/demo/doc/record/) §6.

## ⚠ `demo.stage.two()` and `two.js` are gone

There used to be a two-up mode: one builder at two simulated widths with a split
handle between them, which was that stage's width dial. It was a **second width
mechanism** saying what the strip's own `mobile`…`mega` presets already say, and
it had two call sites. Deleted 2026-08-30 (demo-merge step 3) along with
`two.js`, `two.css` and `twin.js`'s unused `twin()`. The rAF coalescing it bought
survives in `stage.js`'s `drag()`, which the handle and the magnifier share.

## Improvements

1. **The width buttons are unlabelled by number in the strip itself** — `390`
   only appears in the button's `title` and the readout underneath, never on the
   button. Deliberate (§17 of the record), but worth a tooltip-free affordance
   for a first-time reader who won't hover. *(simple, speculative.)*
