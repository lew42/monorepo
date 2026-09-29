# scale

Shrink a fixed-width mockup to fit a narrow box, in proportion — never reflow it into a
different layout. Two classes, no JavaScript.

## Use

```js
div.c("ui-scale", () => {
	div.c("ui-scale-body", () => {
		// build the mockup here, every length in `em`
	});
}).style("--scale-width", "53.5");   // the design's own width in 16px steps (856px / 16)
```

`--scale-width` is the design's width divided by 16 — the number that makes the body's
font-size land on exactly 16px when the box is that wide. A Figma frame that is 856px wide
is `53.5`. Everything inside `.ui-scale-body` — padding, gap, radius, font sizes — must be
written in `em`, so the one font-size carries the whole thing down or up together.

## Watch out

- Only put an `em` size on the CONTAINER (`.ui-scale-body`'s own font-size). A second
  `font-size` shrink further down, inside the body, double-shrinks anything below it —
  measured once as avatars and icons collapsing to a few px of unreadable glyph.
- `--scale-min`/`--scale-max` (default 7px/16px) are the floor and ceiling; raise
  `--scale-max` if the design is meant to grow past its own pixel size, not just shrink to it.
- This is for copying a FIXED design at any size, not for a page's own responsive layout —
  ordinary content still uses the site's own `--gap`/`--pad`/`--flow` words, which scale with
  the viewport, not a container.

## More

- [page](/framework/ui/scale/) — one box shown at two widths
- Used by the Figma "Sept 2026" cards: [`/framework/ai2/2026/09/28/figma-sept-2026/`](/framework/ai2/2026/09/28/figma-sept-2026/)
- Back to [UI](/framework/ui/).
