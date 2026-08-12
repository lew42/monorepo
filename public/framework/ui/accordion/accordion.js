import { css } from "../parts.js";

/* Both rules are relationships — the hairline BETWEEN two items, and the answer's
 * margin under its own summary. Neither can be said from an inline style. */
css(`@layer theme {
	.ui-accordion-item + .ui-accordion-item { border-top: 1px solid var(--line); }
	.ui-accordion-item > p { margin: 0.6em 0 0; }
}`);
