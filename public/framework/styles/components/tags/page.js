import { Page, md, demo, div, span, input } from "/app.js";
import { pill } from "../parts.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Tag input",
	description: "Chips in a field — and the section's one override of framework.css.",
	icon: "local_offer",

	content(){

		demo(component, "`pad flex wrap v-center` on a `surface` box, the chips are [badges](/framework/styles/components/badge/), and `flex-1` lets the input take whatever row is left. `wrap` means a fourth tag starts a second line and the field follows it down.");

		md("## The override");

		md("A field **inside** a field has to hand back the border and the padding the theme gives every text input:\n\n```js\n.style({ border: \"none\", background: \"none\", padding: \"0\", minWidth: \"7em\" })\n```\n\nThat is an inline style beating `@layer theme`, which is the top rung of the escalation ratchet — and by this repo's rule, **an override is a bug report about `framework.css`.** The rule it fights is:\n\n```css\ninput:not([type=\"checkbox\"], [type=\"radio\"], [type=\"color\"], [type=\"range\"]), select, textarea {\n\tpadding: 0.25em 0.6em;\n\tborder: 1px solid var(--subtle);\n}\n```\n\nThe rule is right for a field standing on its own and there is no way out of it. A `.bare` opt-out in `@layer util` — one class, `border: none; background: none; padding: 0` — would retire this and the same override in every search box, inline editor and cell input after it. Filed on the [design record](/framework/styles/components/); this section may not edit `framework.css` itself.");

		md("## Read-only, and the override goes away");

		demo(() => {
			div.c("flex wrap v-center", () => {
				["core", "no-build", "esm", "native"].forEach(text =>
					span.c("h4", text).style(pill));
			}).style("gap", "0.4em");
		}, "A tag *list* needs no input, so it needs no override — `flex wrap` and a pill. Reach for the field version only when the tags are editable.");

		demo(() => {
			div.c("flex v", () => {
				span.c("h4", "Tags");
				input().attr("placeholder", "core, esm, no-build");
			}).style("gap", "0.4em");
		}, "And the version that fights nothing at all: a [form field](/framework/styles/components/field/) whose value happens to be a comma-separated list. Two lines, no chips, no override — worth wanting before the pretty one.");

		md("Next: [Panel](/framework/styles/components/panel/) — a header, a body and a footer, held apart by two hairlines.");
	}
});
