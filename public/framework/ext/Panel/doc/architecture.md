# Panel architecture — every region is an Item, and the right rail is the only control surface

`ext/Panel` is chrome for arranging layouts: divide, drag, align, fill and persist regions. Main class: [`Panel`](/framework/ext/Panel/) in [`Panel.js`](../Panel.js), which extends `Item`; a document lives in a `Workspace` ([`workspace.js`](../workspace.js)). Words and verbs are drawn by [`properties.js`](../properties.js).

## A panel is an Item
**Decided:** `Panel extends Item` and holds its children in a `List`.
**Why:** undo and persistence come from the Item stack, so Panel writes neither.
**Instead:** a standalone tree class, which would duplicate both.
**Detail:** [decisions](./decisions.md)

## The rail is the UI
**Decided:** every word (template, tone, display, align, size, pad, gap, mode) is a row in the right rail; the strip on a panel (`.panel-bar`) holds only a drag grip and, on a leaf, the magnifier.
**Why:** a control that floats over the thing it controls covers it, and 15 icons with popovers were unmemorable and 365 popovers were clipped at 1280.
**Instead:** a hover bar with popovers; it cost clipping, covering, and unclickable tabs underneath.
**Detail:** [decisions](./decisions.md#the-bar-is-deleted-and-the-rail-took-its-last-four-controls-2026-09-18)
⚠ `toolbar.js` (63 lines, imported by nothing) still sits in the module although decisions say it was deleted; it is dead code.

## Selecting a panel opens the rail
**Decided:** a selection docks the rail (`tools.js`, `dock()` is idempotent).
**Why:** with no bar there is no other door to a panel's words, e.g. a one-off `panel(fn)` on a page that never docked.
**Instead:** only filling an already-open rail; it left such panels without controls.
**Detail:** [decisions](./decisions.md)

## One selection per page, announced by `panel-focus`
**Decided:** a `panel-focus` document event carries the selected thing or `null`, `.panel-ring` is the one site-wide selection outline, and neither side imports the other (`focus.js`).
**Why:** two editors with their own ideas of "selected" drift apart.
**Instead:** a private event and ring per editor. Cost: `tools.js` and `focus.js` must tolerate a detail that is not a panel.
**Detail:** [doc/focus.md](./focus.md)

## Sizing is a hug/fill model, no container queries
**Decided:** a panel is a block in flow: width fills, height hugs its content above a floor; `size.js` writes classes and custom properties, `size.css` reads them.
**Why:** content grows the panel and its ancestors instead of cropping or scrolling inside them.
**Instead:** fixed boxes or container queries, which cannot restyle themselves.
**Detail:** [doc/sizing.md](./sizing.md)

## Every gesture is a replayable step
**Decided:** `flow.js` records each workspace mutation in memory as a step that can be scrubbed and replayed; `mount()` starts one per workspace.
**Why:** you see exactly what was built, step by step.
**Instead:** undo only, which loses the sequence.
**Detail:** [doc/flow.md](./flow.md)

## The playground is a thin wrapper
**Decided:** `playground/` shows one document full-window with the drawer as a responsive handle; the document list lives in Make's tree (`/imagine/paging/make/`).
**Why:** a second list of documents beside an editor that already has one was redundant; the `Workspace` chrome (viewport set, drawer grip) is what Make lacks.
**Instead:** a redirect to Make, which deletes a working tool to save a file.
**Detail:** [decisions](./decisions.md)
