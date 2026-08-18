## display.css

The three `display` mode classes — layout only — and the overlay that draws
what each one is doing — structure only, never a colour of its own.

## The mode classes win by compounding, not by a layer trick

```css display.css
.panel-body.panel-d-block { display: block; }
.panel-body.panel-d-flex { display: flex; flex-direction: row; gap: 0.5em; }
.panel-body.panel-d-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(8em, 1fr)); gap: 0.5em; }
```

Compounded with `.panel-body` on purpose: two classes beat the base rule's
one at equal specificity regardless of which stylesheet loads first, so this
never has to reach for `@layer` ordering or `!important` to win over
`panel.css`'s own `.panel-body` rule.

## The overlay sits exactly where `.panel-align` does

```css display.css
.panel-display {
	position: absolute;
	inset: var(--panel-bar-h) 0 0 0;
	z-index: 1;
	overflow: hidden;
	pointer-events: none;
}
```

Same formula as `tools.css`'s `.panel-align` — clear the bar, cover the rest
of the body, never hit-test — so the two overlays can never fight for the
strip the bar owns. `z-index: 1`, **under** the align grid's `2`: the display
overlay is inert throughout, so it only ever needs to sit below chrome that
can actually be clicked. Full budget: [doc/overlays.md](../overlays.md).

## The axis arrow is a line plus a border-triangle, no image

```css display.css
.panel-display-axis::after {
	content: "";
	position: absolute;
	inset-inline-end: -1px;
	border-block: 0.3em solid transparent;
	border-inline-start: 0.4em solid var(--line);
}
```

The classic zero-width-border triangle, sized in `em` off the same token
(`--line`) the axis line itself uses, so the arrowhead can never drift out of
sync with the line's colour if a theme changes it.

## The badges are read, not styled, per instance

```css display.css
.panel-display-badge {
	position: absolute;
	font: 0.65em var(--mono);
	…
}
```

One rule for every badge `display.js` places — grow numbers and track widths
alike — positioned entirely by inline `style.left`/`style.top` the JS sets
per element; this file supplies the look, never the position.

## Improvements

Nothing ranked: 60 lines, three mode rules and one small overlay vocabulary.
No rule here duplicates `tools.css` or `panel.css`; the shared formula
(clear-the-bar, cover-the-rest) is copied deliberately, not accidentally.
