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

## Improvements

Nothing ranked: 29 lines, one selector plus a hover state, both already
plain — there is nothing here a next reader would need flagged.
