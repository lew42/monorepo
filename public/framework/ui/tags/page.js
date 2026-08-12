import { Page, md, demo, div, span, input } from "/app.js";
import { palette, copy } from "../parts.js";

// The template, verbatim — rendered in the palette AND handed to copy(), so the
// code on the page is the code that ran.
const tags = () => {
	const names = ["core", "no-build", "esm"];

	return div.c("surface pad flex wrap v-center gap", () => {
		names.forEach(name => span.c("ui-pill h4 flex v-center gap", () => {
			span(name);
			span.c("muted", "×").style("cursor", "pointer");
		}).style("--gap", "0.4em"));

		input().ac("ui-tags-input flex-1").attr("placeholder", "add a tag…");
	}).style("--gap", "0.4em");
};

const list = () => div.c("flex wrap gap", () =>
	["core", "no-build", "esm", "native"].forEach(name => span.c("ui-badge ui-pill h4", name)))
	.style("--gap", "0.4em");

export default new Page({
	meta: import.meta,
	title: "Tag input",
	description: "A template, plus the library's one opt-out of a base rule.",
	icon: "local_offer",

	content(){

		palette(
			["chips in a field", tags],
			["read-only — no field, no opt-out", list],
		);

		md("## Copy it");

		copy(tags);

		md("**There is no `ui.tags()`.** What it built was *inert* — the × had no listener and the input had no handler — so the first real use would have rewritten every line of it anyway. What survives is the one thing that was hard: the class that lets a field sit inside a field.");

		md("## The opt-out, and the layer it lives in");

		md("A field **inside** a field has to hand back the border and the padding the theme gives every text input. The rule it is opting out of is:");

		md("```css\ninput:not([type=\"checkbox\"], [type=\"radio\"], [type=\"color\"], [type=\"range\"]), select, textarea {\n\tpadding: 0.25em 0.6em;\n\tborder: 1px solid var(--subtle);\n}\n```");

		md("That `:not()` carries an attribute selector's specificity, so `input:not(…)` out-ranks a plain class — a `.ui-tags-input` in `@layer theme` would **lose**. So it sits in `util`, in `parts.js` with the other shared classes:");

		md("```css\n@layer util {\n\t.ui-tags-input { border: none; background: none; padding: 0; min-width: 7em; }\n}\n```");

		md("A later layer wins whatever the specificity, which is exactly what an opt-out needs. This was an inline style beating `@layer theme` before the move to `ui/` — the top rung of the escalation ratchet, spent on something a layer could do properly. **The same class is what every search box, inline editor and editable cell after this one will want**, which is why it lives in `parts.js` rather than here: `input().ac(\"ui-tags-input\")`.");

		md("## Want the simpler thing first");

		demo(list, "A tag *list* needs no field, so it needs no opt-out at all — `flex wrap gap` and four [badges](/framework/ui/badge/). This is the honest first answer, and the field above is for when they are editable.");

		demo(() => {
			div.c("flex v gap", () => {
				span.c("h4", "Tags");
				input().attr("placeholder", "core, esm, no-build");
			}).style("--gap", "0.4em");
		}, "And the version that fights nothing: a [form field](/framework/ui/field/) whose value happens to be a comma-separated list. Two lines, no chips, worth wanting before the pretty one.");

		md("Next: [Panel](/framework/ui/panel/) — a header, a body and a footer, held apart by two hairlines.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-75 pad", tags)); },
});
