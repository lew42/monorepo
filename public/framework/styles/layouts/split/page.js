import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Split",
	description: "Two equal panes that stack themselves — no CSS, no breakpoint.",
	icon: "vertical_split",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "`flex gap auto` gives every child `flex: 1 1 var(--column)`. Equal basis, equal grow, so the panes are equal — and when two `18em` panes no longer fit, they wrap. Narrow the window and watch it happen.");


		md("**The stacking is intrinsic**: it responds to the width of *this box*, not of the viewport, so the same layout stacks correctly inside a sidebar-narrowed region and inside a `zoom-25` preview. A media query cannot do that.");

		fit("A before/after comparison · A form beside its preview · Two related explanations · A pricing pair",
			"measured",
			"Two panes of *reading*, so the measure applies to the pair and each pane gets half of it. Give this one no measure and each pane becomes a line too long to follow.");

		md("Next: [Centered](/framework/styles/layouts/centered/) — the one thing flexbox can't hand you.");
	}
});
