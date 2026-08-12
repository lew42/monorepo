import { div, p, span } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* The line is the inline-start border of an empty `flex-1` box under each dot —
 * in the flow, owned by the row that draws it. The reflex is `::before` with
 * `position: absolute`, which is a pseudo-element AND a relationship. */
css(`@layer theme {
	.ui-timeline-when { flex: 0 0 6.5em; text-align: end; padding-top: 0.3em; }

	.ui-timeline-dot {
		width: 0.7em;
		height: 0.7em;
		margin-top: 0.4em;
		flex: 0 0 auto;
		border-radius: 999px;
		background: var(--eyebrow, var(--prim));
	}

	.ui-timeline-line { border-inline-start: 1px solid color-mix(in srgb, currentColor 25%, transparent); }
	.ui-timeline-entry { flex: 1 1 0; min-width: 0; padding-bottom: 1.8em; --gap: 0.2em; }

	/* The run has to STOP: a line trailing off below the final entry reads as a
	   loading state. Which row is last is the DOM's question, not JS's. */
	.ui-timeline-row:last-child .ui-timeline-line { border: none; }
	.ui-timeline-row:last-child .ui-timeline-entry { padding-bottom: 0; }
}`);

/**
 * timeline(["Aug 2026", "The sheet is the default", "A region hands every page the
 * measure."], …) — a date, a rail of dots, an entry.
 *
 * On a column, `v-center` centres *horizontally* — that is what puts the dots and
 * the line on one axis.
 */
export const timeline = component((...items) => div.c("ui-timeline flex v", () =>
	items.forEach(([when, what, note]) => div.c("ui-timeline-row flex gap", () => {
		p.c("ui-timeline-when h4 muted", when);

		div.c("flex v v-center", () => {
			span.c("ui-timeline-dot");
			div.c("ui-timeline-line flex-1");
		});

		div.c("ui-timeline-entry flex v gap", () => {
			p.c("h3", what);
			p.c("muted", note);
		});
	}))));

export default timeline;
