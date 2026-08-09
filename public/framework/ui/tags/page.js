import { Page, md, demo, div, span, input } from "/app.js";
import { palette } from "../parts.js";
import { badge } from "../badge/badge.js";
import { tags } from "./tags.js";

export default new Page({
	meta: import.meta,
	title: "Tag input",
	description: "Chips in a field — and the library's one opt-out of a base rule.",
	icon: "local_offer",
	classes: "grid",

	content(){

		palette(
			["ui.tags(…)", () => tags("core", "no-build", "esm")],
			["empty", () => tags()],
			["read-only — no component", () => div.c("flex wrap gap", () => {
				["core", "no-build", "esm"].forEach(name => badge(name));
			}).style("--gap", "0.4em")],
		);

		md("## Calling it");

		demo(() => {
			tags("core", "no-build", "esm");
		}, "Names in, chips out, with room to type after the last one. The chips are [badges](/framework/ui/badge/) — `ui-pill h4` — and `flex-1` gives the input whatever row is left. `wrap` means a fourth tag starts a second line and the field follows it down.");

		md("## The opt-out, and the layer it lives in");

		md("A field **inside** a field has to hand back the border and the padding the theme gives every text input. The rule it is opting out of is:");

		md("```css\ninput:not([type=\"checkbox\"], [type=\"radio\"], [type=\"color\"], [type=\"range\"]), select, textarea {\n\tpadding: 0.25em 0.6em;\n\tborder: 1px solid var(--subtle);\n}\n```");

		md("That `:not()` carries an attribute selector's specificity, so `input:not(…)` out-ranks a plain class — a `.ui-tags-input` in `@layer theme` would **lose**. So it sits in `util`:");

		md("```css\n@layer util {\n\t.ui-tags-input { border: none; background: none; padding: 0; min-width: 7em; }\n}\n```");

		md("A later layer wins whatever the specificity, which is exactly what an opt-out needs. This was an inline style beating `@layer theme` before the move to `ui/` — the top rung of the escalation ratchet, spent on something a layer could do properly. **The same class is what every search box, inline editor and editable cell after this one will want**, and it is now reachable: `input().ac(\"ui-tags-input\")`.");

		md("## Want the simpler thing first");

		demo(() => {
			div.c("flex wrap gap", () => ["core", "no-build", "esm", "native"].forEach(name => badge(name)))
				.style("--gap", "0.4em");
		}, "A tag *list* needs no field, so it needs no opt-out at all — `flex wrap gap` and four badges. This is the honest first answer, and `tags()` is for when they are editable.");

		demo(() => {
			div.c("flex v gap", () => {
				span.c("h4", "Tags");
				input().attr("placeholder", "core, esm, no-build");
			}).style("--gap", "0.4em");
		}, "And the version that fights nothing: a [form field](/framework/ui/field/) whose value happens to be a comma-separated list. Two lines, no chips, worth wanting before the pretty one.");

		md("Next: [Panel](/framework/ui/panel/) — a header, a body and a footer, held apart by two hairlines.");
	},
});
