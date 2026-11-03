import { css } from "../parts.js";

/* One line in a list, on its parent's ground: it pads in its own em, takes a ground only when
 * hovered or selected, and never draws a border of its own (doc/architecture.md). */
css(`@layer theme {
	.ui-row {
		display: flex; align-items: center; gap: 0.6em; min-width: 0;
		padding: 0.45em 0.6em; border-radius: var(--radius);
	}
	.ui-row:hover, .ui-row.selected { background: var(--wash); }
}`);
