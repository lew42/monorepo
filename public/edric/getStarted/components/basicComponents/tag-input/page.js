import { Page, h2, demo, div, span } from "/app.js";
import tags from "/framework/styles/components/tags/component.js";
import { pill } from "/framework/styles/components/parts.js";

// Removable: each × filters itself out of the list and redraws. `.empty()`
// re-establishes the captor, so the redraw reads exactly like the first draw.
const removable_demo = () => {
	let $list;

	const render = list => $list.empty(() => list.forEach(t =>
		span.c("h4 flex v-center", () => {
			span(t);
			span("×").style({ cursor: "pointer", color: "var(--subtle)" })
				.click(() => render(list.filter(x => x !== t)));
		}).style({ ...pill, gap: "0.4em" })));

	$list = div.c("flex wrap v-center gap");
	render(["design", "engineering", "remote"]);
};

export default new Page({
	meta: import.meta,
	title: "Tag input",
	description: "Chips in a field, and the section's one override of framework.css.",

	content(){
		demo(tags, "The field's own theme border and padding, handed back with `border: none` on the inner input: a field inside a field has to give both up.").ac("mb");

		h2("Removable").ac("mb");
		demo(removable_demo, "Each × filters the list and redraws. No framework state here, a plain array and `.empty()`.");
	}
});