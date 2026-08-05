import { Page, md, demo, div, span, icon } from "/app.js";
import { pill } from "../parts.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Badges",
	description: "Six pills from one style object — and the tones the token set can't give you.",
	icon: "label",

	content(){

		demo(component, "`h4` is already a small, tracked, uppercase label, so a badge is that class plus `pill` from `parts.js` — `--wash`, a `999px` radius and `0.15em 0.7em` of padding. Every variant changes one property of it.");

		md("## Three tones, not five");

		md("The token set has **one accent**. `--prim`, `--bg`, `--wash`, `--subtle`, `--surface`, `--line` — no success, no warning, no danger. So a badge honestly offers *neutral*, *accent*, *dark* and *outline*, and a component that wants green-for-passing has to name a colour, which is the thing a component may not do.\n\nThat is a finding, not a workaround: **the framework is missing a status axis.** Three tokens (`--ok`, `--warn`, `--bad`) would give every alert, badge, meter and diff row on a future site the same vocabulary. On the [design record](/framework/styles/components/).");

		md("## Composed, not configured");

		demo(() => {
			const tag = (text, glyph) => span.c("h4 flex v-center", () => {
				if (glyph) icon(glyph).style("fontSize", "1em");
				span(text);
			}).style({ ...pill, gap: "0.35em" });

			div.c("flex wrap v-center", () => {
				tag("verified", "check");
				tag("draft", "edit");
				tag("archived", "inventory_2");
			}).style("gap", "0.4em");
		}, "An icon badge is the same object with a leading `icon()`. `pill` is a plain style object, so `{ ...pill, gap: \"0.35em\" }` is the whole extension mechanism — no options, no variants map.");

		md("Next: [Alerts](/framework/styles/components/alert/) — the same idea at block scale.");
	}
});
