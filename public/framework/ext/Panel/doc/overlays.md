# The five things drawn on a panel's body

`tools.js` (align, zoom), `split.js` (edge, ghost) and `insert.js` (the `+`)
each draw absolutely-positioned chrome directly over `.panel-body` or
`.panel-items`, alongside `panel.css`'s own bar and `display.js`'s overlay.
None of them import each other, so nothing enforces that they stay out of
each other's way — this page is where the coordination is written down
instead, per no-black-magic (`CLAUDE.md` RULE#8).

## The z-index budget, low to high

| z-index | element | file |
|---|---|---|
| 1 | `.panel-edge` (split targets), `.panel-display` (the flex/grid overlay) | `split.css`, `display.css` |
| 2 | `.panel-align` (the 3×3), `.panel-grip` (the seam), `.panel.focus::after` (the selection ring), `.panel-t-dial` (a `space` template's own seed readout, holding `.panel-t-seed`) | `tools.css`, `grip.css`, `panel.css:92`, `templates.css:190` |
| 3 | `.panel-bar` | `toolbar.css` |
| 4 | `.panel-ghost` (the split preview) | `split.css` |
| 5 | `.panel-insert` (the `+` stub) | `insert.css` |
| 41 | `.panel-text-gauge` (fixed, one per document) | `text.css` |

Picking a "free-looking" number for a new overlay is how this drifts — a
sixth surface has to read this table first, not guess a gap.

`repeat.js`'s `+` — the one at the end of a repeating run, not the interior
one above — deliberately sits in **normal flow** and takes no z-index at
all: appending has exactly one valid target, so a grid or flex row sizes the
tile like any other item and the budget above did not grow to six.

The gauge sits far above everything on purpose: it is not scoped to any one
panel (`position: fixed`, appended to `document.body`, reused across every
selection — see `text.js` in the [Files tab](/framework/ext/Panel/files/)),
so it has to clear the highest thing any panel could be showing, not just its
own.

## Two different "innermost wins" idioms, and why

Every leaf-level overlay that reveals on hover uses the same test:

```css
.panel:hover:not(:has(.panel:hover)) > .panel-X { opacity: 1; }
```

— an ancestor stands down for whichever descendant panel the pointer is
actually over. `.panel-align`, `.panel-bar` and `.panel-display` all gate
**opacity** with it. `.panel-edge` reads the identical selector but gates
**`pointer-events`** instead, never opacity — the strips have no look of
their own to fade in, so only whether they hit-test changes; they are
painted (inertly) at every width.

`insert.js`'s bar cannot use either form of the test: a split *contains* panels by
definition, so `.panel:hover:not(:has(.panel:hover))` is false for every split
that has ever been hovered, and the bar would never appear. Its question is
different — is this the **deepest split** under the pointer? — so it tests on
`.panel-items` instead:

```css
.panel-items:hover:not(:has(.panel-items:hover)) > .panel-insert.on { opacity: 1; }
```

A future overlay that lives on a split (rather than a leaf) needs the second
idiom, not the first; copying the leaf test onto a split-level surface is the
mistake `insert.css`'s own comment records having made once already.

## What each surface actually hit-tests

Every one of these overlays covers the *whole* body or items box, and every
one keeps `pointer-events: none` on that outer box — only the thing actually
drawn (a button, the ghost, the stub) turns it back on. An overlay that hit-
tests as a block eats every click meant for the content or the edge beneath
it; this bit the bar itself once (the readme's "the chrome is faint" trap) and
every overlay added since has copied the pattern rather than repeating the
mistake.

## Open

Nothing here currently negotiates a *shared* pointer position — the edge
strips, the align grid and the insert bar all read the same `pointermove`
independently, each against its own geometry. Fine at today's five surfaces;
a sixth would be the moment to ask whether they should read one shared
pointer sample instead of five.
