`demo.layout(config)` is a whole PAGE as a demo page — the specimen is
`layout()`, a function that returns its own `div.c("page …")`, so the class
string is the first line the reader is shown, because it's the lesson. It
absorbed two now-deleted files (`styles/layouts/detail.js` and
`core/Page/layout/detail.js`), which is the reason this sugar exists at all
rather than every layout page hand-rolling its own `preview()`/`frame()` pair.

## It renders through `page.demo()`

Since demo-merge step 4 this is a page SHAPE, not a way of drawing a demo: its
`content()` calls `demo.exhibit()`, which is `page.demo({ run: … })`. The band,
the path strip, the source column and the layout bar are the one shell's; what
`demo.layout` still owns is the specimen — a `frame()` on a bleeding stage — and
its quarter-scale card.

## `twin` is what a specimen paints, not how it is compared

With `twin: true` the frame paints `--surface` under itself, because a simulated
*screen* needs a ground the same way a real browser window would give it one; a
plain stage frames a *shape*, whose own washed boxes are already the picture.

⚠ It used to also swap the stage for a two-up — a live 390 beside a live 3440,
one handle between them. That was a **second width mechanism** beside the stage's
own `mobile`…`mega` presets, saying the same thing, and it went with `two.js` on
2026-08-30 (demo-merge step 3). The card was never the twin anyway: two device
panes in one card are half a card wide each, and a 3440 screen at a fourteenth of
size is a grey smudge.

## `parts` are checkboxes, never sibling pages

A space-separated list of region names becomes a row of chips in the layout
panel's own drawer (`panel.context()`, registered once per stage). Each chip
toggles `this.off`, and `layout()` is expected to read `this.shows(name)` for
each region — a checkbox a reader flips live, never a second page for "the
layout minus its sidebar."

## `frame()` needs `default`, and sometimes a ground

`.ac("default")` is the arrangement contract's own word for "shown without
being routed to" (`core/Page/Page.css`) — without it, a `.page` the Router never
marked is `display: none` and nothing throws. The ground `twin:` adds is the
other half — see above.

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
