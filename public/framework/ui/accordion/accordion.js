import { div, details, summary, p, is } from "../../core/View/View.js";
import { component, css } from "../parts.js";

css(`@layer theme {
	.ui-accordion-item + .ui-accordion-item { border-top: 1px solid var(--line); }
	.ui-accordion-item > p { margin: 0.6em 0 0; }
}`);

/* One group name per accordion, so two on the same page stay independent. This
 * is the whole reason the component exists rather than being a template: a
 * hand-typed `name` is shared the second time you paste it. */
let groups = 0;

/**
 * accordion(["Is there a build step?", "No."], …) — one panel open at a time.
 *
 * A shared `name` is what makes the browser close the others: no listener, no
 * state, and the open panel is the DOM's own `open` attribute. An answer may be a
 * function when it is more than a sentence.
 */
export const accordion = component((...items) => {
	const name = "ui-accordion-" + ++groups;

	return div.c("ui-accordion ui-surface flex v", () => items.forEach(([question, answer]) =>
		details.c("ui-accordion-item pad", () => {
			summary(question);
			is.fn(answer) ? answer() : p.c("ui-muted", answer);
		}).attr("name", name)));
});

export default accordion;
