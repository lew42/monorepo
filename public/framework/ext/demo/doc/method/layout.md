`demo.layout(config)` is a whole PAGE as a demo page — the specimen is
`layout()`, a function that returns its own `div.c("page …")`, so the class
string is the first line the reader is shown, because it's the lesson. It
absorbed two now-deleted files (`styles/layouts/detail.js` and
`core/Page/layout/detail.js`), which is the reason this sugar exists at all
rather than every layout page hand-rolling its own `preview()`/`frame()` pair.

## `twin` changes both the card and the stage

With `twin: true` the card is `twin()` — a 390 phone beside a 3440 monitor, both
live — and the stage becomes the two-up (`two.js`) instead of a plain
`demo.stage()`. Without it, the card is `.ac("zoom-25")`, a quarter-scale render
of the page exactly as it would look full size, and the stage is a normal one.

## `parts` are checkboxes, never sibling pages

A space-separated list of region names becomes a row of chips in the layout
panel's own drawer (`panel.context()`, registered once per stage). Each chip
toggles `this.off`, and `layout()` is expected to read `this.shows(name)` for
each region — a checkbox a reader flips live, never a second page for "the
layout minus its sidebar."

## `frame()` needs `default`, and sometimes a ground

`.ac("default")` is the arrangement contract's own word for "shown without
being routed to" (`core/Page/Page.css`) — without it, a `.page` the Router never
marked is `display: none` and nothing throws. A `twin` card additionally paints
`--surface` under the layout, because a simulated *screen* needs a ground the
same way a real browser window would give it one; a plain, non-twin stage
frames a *shape*, whose own washed boxes are already the picture.

## Improvements

1. **`twin`/`parts`/`height` read as three unrelated flags rather than one
   coherent idea.** They're independent in practice (a page can be `twin` with
   no `parts`, or have `parts` with no `twin`), which is fine, but nothing in
   this file's own comment says so — a reader has to infer independence from
   the absence of an `if (twin) require parts` check. *(simple, useful.)*
2. **`toggles()` reads `this.parts` as a live property but never validates a
   part name against what `layout()` actually renders.** A typo in `parts:` is
   a chip that toggles nothing, silently — the exact failure mode this repo
   cares about most (CLAUDE.md, "a control that silently does nothing").
   *(medium, important.)*
