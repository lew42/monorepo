import { css } from "../parts.js";

/* "Scale, don't reflow" — for a fixed mockup (a Figma frame, a screenshot recreation)
   that is too wide for the box it now lives in. Reflowing it (stacking a two-column
   layout into one column) breaks the design it is copying; shrinking every length
   together, in proportion, keeps it. `.ui-scale` opens a size query on ITS OWN
   width, so `.ui-scale-body`'s font-size becomes a fraction of that width — and
   because every length inside the body is written in `em`, shrinking that one
   number shrinks the whole thing together, at any width, with no extra CSS. */
css(`@layer theme {
	.ui-scale { container-type: inline-size; }

	/* --scale-width is the design's own width, in 16px steps (a 856px Figma frame
	   is 53.5 — 856 / 16). font-size is 16px exactly when the container is that
	   wide, and shrinks below it; --scale-min/--scale-max are floor and ceiling so
	   it never disappears to nothing or grows past its own design size. */
	.ui-scale > .ui-scale-body {
		font-size: clamp(var(--scale-min, 7px), calc(100cqi / var(--scale-width, 53.5)), var(--scale-max, 16px));
	}
}`);
