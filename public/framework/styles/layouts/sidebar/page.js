import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Sidebar",
	description: "A fixed panel beside fluid content — two classes and one rule.",
	icon: "view_sidebar",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "`flex-1` names the fluid half. The fixed half is `.layout-side` — `flex: 0 0 var(--sidebar)`, the same token `.topic > .sidebar` uses, so this demo and the real sidebar beside it cannot disagree about a width.");


		md("To stack it on a narrow screen, swap `flex gap` for `flex gap auto` and drop the rule: `auto` gives every child `flex: 1 1 var(--column)` and wraps when two no longer fit. That is [Split](/framework/styles/layouts/split/), which is why this one keeps the fixed basis instead.");

		fit("A documentation section · Any app screen with persistent navigation · A settings page with a category list",
			"bleed",
			"The panel wants to reach the region's edge and scroll separately from the content — padding here would put a gutter between the nav and the window. `/framework/` is this layout, and it is `div.c(\"page topic flex\")`.");

		md("Next: [Cards](/framework/styles/layouts/cards/) — the one that needs no CSS at all.");
	}
});
