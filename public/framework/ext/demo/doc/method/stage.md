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
in [the design record](/framework/ext/demo/docs/record/) §6.

## `demo.stage.two(fn, steer, opts)` — a mode, not a fifth door

The same stage shell, with two simulated panes in place of one render and the
split handle standing in for the width buttons — `{ wide, narrow }` name the two
ends, `level: true` floors the shorter pane to the taller one (what
`demo.layout({ twin: true })` needs; a plain comparison doesn't). It lives in
`two.js` and imports `filler()` from `stage.js` so there is exactly one
fullscreen implementation on the site, not two. `Doc`'s member lookup only
resolves one property level, so `demo.stage.two` doesn't get its own API page —
it's documented here, beside the door it's a mode of.

## Improvements

1. **`demo.stage.two` has no page of its own in the API tab**, because `Doc`
   only resolves `subject[name]`, never `subject[a][b]`. Harmless today — this
   note covers it — but the same gap will recur for `demo.source.file`.
   *(simple, useful — a `Doc` limitation, not a `demo` one; see the audit.)*
2. **The width buttons are unlabelled by number in the strip itself** — `390`
   only appears in the button's `title` and the readout underneath, never on the
   button. Deliberate (§17 of the record), but worth a tooltip-free affordance
   for a first-time reader who won't hover. *(simple, speculative.)*
