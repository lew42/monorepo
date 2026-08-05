import { Page, md, demo, a } from "/app.js";
import layout from "./layout.js";

export default new Page({
	meta: import.meta,
	title: "Split",
	description: "Two equal panes that stack themselves — no CSS, no breakpoint.",
	children: "full",

	content(){
		demo(layout, "`flex gap auto` gives every child `flex: 1 1 var(--column)`. Equal basis, equal grow, so the panes are equal — and when two `18em` panes no longer fit, they wrap. Narrow the window and watch it happen.");

		a.c("page-link", "Full size ↗").href(this.url + "full/");

		md("**The stacking is intrinsic**: it responds to the width of *this box*, not of the viewport, so the same layout stacks correctly inside a sidebar-narrowed region and inside a `zoom-25` preview. A media query cannot do that.");

		md("Next: [Centered](/framework/styles/layouts/centered/) — the one thing flexbox can't hand you.");
	}
});
