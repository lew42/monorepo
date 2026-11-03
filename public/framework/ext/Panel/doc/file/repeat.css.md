## repeat.css

The look of `repeat.js`'s tile — a dashed square with a centred `+`, styled
like an empty slot waiting to be filled rather than a floating control.

```css repeat.css
.panel-repeat-add {
	display: grid;
	place-items: center;
	border: 1px dashed var(--line);
}
```

## No `position`, no `z-index` — the one overlay-free rule in this module

Every other surface in `doc/overlays.md`'s budget is absolutely positioned
chrome drawn *over* a panel's body. This tile is a real element in **normal
flow**, appended as a sibling inside the run's own container, so a grid or
flex row sizes it exactly like the items beside it. It needed no entry in
the z-index table and none was added — the budget did not grow.

## Hidden until you point at its panel (2026-08-19)

The owner: *"the + … should probably only appear when hovered"*, and *"that
hover should be restricted to when the parent is selected."* Both come free
from `focus.js`'s `.panel-hover` — the class that already means *this is what
a click would select*, so inside an unopened group a leaf's tile stays hidden
until that group is the selection.

```css repeat.css
.panel-repeat-add { opacity: 0; pointer-events: none; }
.panel-hover > .panel-body .panel-repeat-add,
.panel.focus > .panel-body .panel-repeat-add { opacity: 1; pointer-events: auto; }
```

⚠ **`opacity`, never `display` or `visibility: hidden`** — the tile is a real
grid item and has to keep its slot, or every card beside it moves the instant
you point at one. Measured: twelve tile rects, zero moved.
⚠ Scoped `> .panel-body`, so a split's hover never lights a nested panel's tile.

## Improvements

Nothing ranked: one selector, a hover state and the reveal pair — there is
nothing here a next reader would need flagged.
