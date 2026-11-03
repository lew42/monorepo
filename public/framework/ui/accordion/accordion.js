import { css } from "../parts.js";

/* The one fold (card plan, merge 5): a summary that pads like a row, and whatever opens
 * under it on the same inset. The hairline BETWEEN two items is a relationship, so it
 * cannot be an inline style. The AI folds wear this class too. */
css(`@layer theme {
	.ui-accordion-item + .ui-accordion-item { border-top: 1px solid var(--line); }
	.ui-accordion-item > summary { padding: 0.45em 0.6em; cursor: pointer; }
	.ui-accordion-item > :not(summary) { margin: 0; padding: 0 0.6em 0.6em; }
}`);
