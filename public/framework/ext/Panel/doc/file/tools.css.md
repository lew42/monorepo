## tools.css

Structure and placement for the two overlays `tools.js` builds. The **button**
itself is `toolbar.css`'s `.panel-btn`, the same box every other control on
the site wears — this file never draws one from scratch.

## `.panel-align` — a grid whose cells are the picture

```css tools.css
.panel-align {
	position: absolute;
	inset: var(--panel-bar-h) 0 0 0;
	z-index: 2;
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	grid-template-rows: repeat(3, 1fr);
	padding: var(--panel-tool-pad, 0.5em);
	pointer-events: none;
}
.panel-align > .panel-tool {
	align-self: var(--tool-y);
	justify-self: var(--tool-x);
	pointer-events: auto;
}
```

`inset-block-start: var(--panel-bar-h)` is why the top row of arrows sits
*below* the bar rather than under it — the bar wins the strip it occupies, and
the grid's own row simply starts past it.

⚠ **`pointer-events: none` on the grid, `auto` on each button.** The overlay
covers the whole body; without the split, every click meant for the panel's
own content would land on empty grid instead.

## Reveal: innermost wins, exactly like the bar

```css tools.css
.panel:hover:not(:has(.panel:hover)) > .panel-align,
.panel:focus-within:not(:has(.panel:focus-within)) > .panel-align { opacity: 1; }
```

The same test `panel.css`'s bar and `display.css`'s overlay both use — an
ancestor's copy of this rule stands down the moment any descendant panel is
under the pointer, so a deeply nested leaf lights exactly one 3×3, never four
stacked ones. The full z-index picture across every overlay that uses this
idiom, and the one that can't: [doc/overlays.md](../overlays.md).

## `.panel-zoom`

```css tools.css
.panel-zoom { cursor: ew-resize; touch-action: none; }
```

⚠ **`touch-action: none` is load-bearing, not decoration.** Without it a touch
drag pans the page instead of scrubbing the zoom; `ew-resize` tells a mouse
user the gesture is sideways before they try it.

## Improvements

Nothing ranked: 45 lines, two rules and a reveal selector shared with three
other files. Nothing here is duplicated, oversized, or doing a second job.
