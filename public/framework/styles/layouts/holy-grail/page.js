import { Page, md, demo } from "/app.js";
import layout from "./layout.js";
import full from "../full.js";
import fit from "../fit.js";

export default new Page({
	meta: import.meta,
	title: "Holy grail",
	description: "Header, sidebar, main, aside, footer — the five-region page.",
	icon: "view_quilt",

	route(name){ return name === "full" && full(this, layout); },

	content(){
		demo(layout, { full: this }, "`flex v gap` stacks the three bands; the middle one is `flex gap flex-1`, so it takes any leftover height and pushes the footer to the bottom — which you can only see full size, where the layout has the whole region. `.layout-rail` is the only rule, `flex: 0 0 var(--column)`, because no utility says *fixed basis*.");


		md("The five-region page, and the one that most wants width. At the measure of a docs column the two rails eat the middle; open it full size and the proportions come back.");

		fit("An IDE or admin console — nav left, inspector right, work in the middle · A mail client · A monitoring board with a filter rail",
			"full",
			"Five regions need every pixel, and the middle band is `flex-1` — it can only prove that against a real viewport height. In a docs column the two rails eat the article.");

		md("Next: [Sidebar](/framework/styles/layouts/sidebar/) — the same row with one column instead of two.");
	}
});
