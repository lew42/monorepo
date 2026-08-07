import { Page, md, demo, div, label, input, span, select, option } from "/app.js";
import component from "./component.js";

export default new Page({
	meta: import.meta,
	title: "Form field",
	description: "Label, control, error — one flex column and two token colours.",
	icon: "input",

	content(){

		demo(component, "`flex v` stacks it, `h4` is the label level, and the error state is `var(--prim)` in two places: the border and the message. **No stylesheet, no error class.** `aria-invalid` is the part a screen reader reads — the colour is for everyone else.");

		md("The label *wraps* its control, so the whole thing is a click target with no `for`/`id` pair to keep in sync. Everything else is the base theme: `input` already fills its container and already has padding and a border.");

		md("The message is **body size, not `h4`**. `h4` is the scale's small level and it is `text-transform: uppercase`, so an error written with it SHOUTS — and the scale has nothing else below body. That gap is on the findings list.");

		demo(() => {
			div.c("flex v gap", () => {
				label.c("flex v", () => {
					div.c("h4", "Branch");
					input().attr("value", "michael/dev");
					span("Lower-case, one slash.").style("color", "var(--subtle)");
				}).style("gap", "0.4em");

				label.c("flex v", () => {
					div.c("h4", "Tier");
					select(() => { option("core"); option("ext"); option("util"); });
				}).style("gap", "0.4em");
			});
		}, "The same shape with help text instead of an error — `var(--subtle)` rather than `var(--prim)` — and with a `select`, which needs nothing different. Two fields in a `flex v gap` column is a form.");

		md("`gap` is `1em`, which is right between fields and far too much inside one, so the `0.4em` is inline. That is the single most common inline style in this section — see the [findings](/framework/styles/components/).");

		md("Next: [Breadcrumbs](/framework/styles/components/crumbs/) — a row of links that marks itself.");
	}
});
