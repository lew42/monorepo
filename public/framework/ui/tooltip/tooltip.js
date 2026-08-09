import { span } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* This one cannot be built from utilities and the reason is worth naming: the
 * bubble resolves against a positioned ancestor (a RELATIONSHIP between two
 * elements) and appears on `:hover` (a STATE). Neither can be said inline. */
css(`@layer theme {
	.ui-tooltip { position: relative; }
	.ui-tooltip-word { border-bottom: 1px dotted var(--subtle); cursor: help; }

	/* Above, because a bubble below covers the line you are about to read. */
	.ui-tooltip-bubble {
		position: absolute;
		bottom: 100%;
		left: 50%;
		translate: -50% -0.4em;

		width: max-content;
		max-width: 18em;
		padding: 0.4em 0.7em;
		border-radius: var(--radius);

		background: var(--bg);
		color: white;
		font-size: 0.85em;
		line-height: 1.4;
		text-transform: none;
		letter-spacing: normal;

		/* Both, always: opacity alone leaves an invisible box on the hit-testing
		   map, swallowing clicks aimed at the line above. */
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.12s;
	}

	/* One selector list, so the keyboard path cannot drift from the pointer one.
	   .shown holds it open for a screenshot. */
	.ui-tooltip:hover > .ui-tooltip-bubble,
	.ui-tooltip:focus-visible > .ui-tooltip-bubble,
	.ui-tooltip.shown > .ui-tooltip-bubble { opacity: 1; visibility: visible; }
}`);

/**
 * tooltip("synchronous", "append_fn restores the captor when your function
 * returns.") — a dotted word and a bubble, reachable by tab.
 *
 * ⚠ The bubble is out of flow, so an ancestor with `overflow: hidden` clips it.
 */
export const tooltip = component((word, bubble) => span.c("ui-tooltip", () => {
	span.c("ui-tooltip-word", word);
	span.c("ui-tooltip-bubble", bubble);
}).attr("tabindex", "0"));

export default tooltip;
