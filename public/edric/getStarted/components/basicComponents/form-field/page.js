import { Page, h2, demo, label, div, input, span } from "/app.js";
import field from "/framework/styles/components/field/component.js";

const valid_demo = () => label.c("flex v", () => {
	div.c("h4", "Email");
	input().attr("type", "email").attr("value", "mike@lew42.dev").style("borderColor", "var(--prim)");
	span("Looks good.").style("color", "var(--prim)");
}).style("gap", "0.4em");

export default new Page({
	meta: import.meta,
	title: "Form field",
	description: "Label, control, error: one flex column and two token colours.",

	content(){
		demo(field, "`aria-invalid` plus `border-color: var(--prim)` is the whole error state, body-sized text, not `h4`, so the message doesn't shout.").ac("mb");

		h2("Valid state").ac("mb");
		demo(valid_demo, "Same shape, same token, no literal colour: `--prim` reads as \"attention\" either way, the message decides which.");
	}
});