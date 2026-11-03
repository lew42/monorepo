# Tree architecture — markup and rules here, behaviour in the class

`ui/tree` is the look of a tree: icon + text rows, indented once per nesting level, with the `.ui-tree-*` CSS in [`tree.js`](../tree.js). It has no behaviour of its own. The main class is [`class Tree`](/framework/ux/Tree/) (in [`ux/Tree/Tree.js`](/framework/ux/Tree/Tree.js)), which holds the state, the listeners and the keyboard, and wears these same classes.

## Behaviour lives in the class, the look stays here

**Decided:** the stylesheet stays in `ui/tree`; state, listeners and lifecycle live in `class Tree`, which imports this file's CSS.
**Why:** a rule about a relationship (nesting) or a state (open, selected, focused) is what this tier is for. If the class took the stylesheet along, the look would fork the first time this one changed.
**Instead:** move the whole tree into `ux/` — one file, but two copies of the look within a year.
**Detail:** [doc/decisions.md](./decisions.md#the-graduation-2026-08-21-the-css-stayed-the-closure-left)

## Indent is nesting, not `depth × indent`

**Decided:** each `.ui-tree-children` list adds one `--ui-tree-indent` of padding; the browser sums them, and no row stores a depth.
**Why:** collapsing a branch is then one `display: none` on its list, with no walk over descendants.
**Instead:** a `--depth` value per row. Cheap to write, but every collapse must walk the subtree, and a stale depth can survive a redraw.
**Detail:** [doc/decisions.md](./decisions.md#indent-is-nesting-not-depth--indent)

## Icon and toggle always reserve their slot

**Decided:** every row renders a `.ui-tree-icon` and a `.ui-tree-toggle`, even when empty, and both take the same width.
**Why:** a row without an icon must still put its label in the same column as rows with one. Ragged text reads as a mistake.
**Instead:** render the slot only when present — shorter markup, but labels drift sideways.
**Detail:** [doc/decisions.md](./decisions.md#reserved-slots-not-ragged-text)

## One square frame for the fold and the icon

**Decided:** `.ui-tree-toggle` and `.ui-tree-icon` share `--ui-tree-frame: 1.3em`, with `aspect-ratio: 1`, `place-items: center` and `line-height: 1`. Neither sets its own font size.
**Why:** a fold that inherited `font-size: 0.7em` was a 9px glyph in a 9px box, too small to see or hit. And an `em` inside a custom property resolves where it is *used*, so a child's own font size changes the square.
**Instead:** a `@property` with a `<length>` syntax, which would resolve at the row but collapses to 0px outside one.
**Detail:** [doc/decisions.md](./decisions.md#2026-09-19--one-square-frame-and-a-fold-arrow-you-can-see)

## The focus ring is `:focus`, drawn inside the row

**Decided:** `.ui-tree-row:focus` draws a 2px ring at `outline-offset: -2px`, always visible.
**Why:** focus is moved by script on an arrow key, so `:focus-visible` is a browser guess. A positive offset is clipped by a 14em rail.
**Instead:** `:focus-visible`, which hides the ring on the very keypress that moved it.
**Detail:** [doc/decisions.md](./decisions.md#two-rules-came-back-from-the-class-2026-09-17)

## A row selects; only the caret toggles

**Decided:** a click on a row selects it, branch or leaf. The caret stops propagation and flips open, so expanding never selects.
**Why:** a Frame layer is still a layer, so branches must be selectable. The caret's click would otherwise bubble up and select too.
**Instead:** only leaves select — a branch is then no longer a layer.
**Detail:** [`Tree.js`](/framework/ux/Tree/Tree.js) (the caret's `stopPropagation`, around line 344)

## `.icon` stays sizing only; the square frame is not the site default

**Decided:** framework-wide `.icon` sets only `font-size: 1.25em; line-height: 1; flex: 0 0 auto`. The square frame is worn by tree rows and sidebar footer controls only.
**Why:** `icon()` is called from about 300 sites across 131 files, and `.icon` has no width today, so a global frame would move all of them at once.
**Instead:** make `.icon` itself a square frame — the right default, but it needs its own proposal and a sweep of every caller.
**Detail:** [sidebar-repair](/framework/ai/sessions/2026/09/19/sidebar-repair/)

## Checked against the code

No `⚠` mismatches on 2026-10-13: each entry above matches `tree.js`, `ux/Tree/Tree.js` and `framework.css:638` as they stand. `t.update()` is not listed: its decision belonged to the retired `tree()` closure, and the class has no such method.
