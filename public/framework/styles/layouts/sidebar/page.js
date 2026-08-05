import { Page, md, demo, a } from "/app.js";
import layout from "./layout.js";

export default new Page({
	meta: import.meta,
	title: "Sidebar",
	description: "A fixed panel beside fluid content — two classes and one rule.",
	children: "full",

	content(){
		demo(layout, "`flex-1` names the fluid half. The fixed half is `.layout-side` — `flex: 0 0 var(--sidebar)`, the same token `.topic > .sidebar` uses, so this demo and the real sidebar beside it cannot disagree about a width.");

		a.c("page-link", "Full size ↗").href(this.url + "full/");

		md("To stack it on a narrow screen, swap `flex gap` for `flex gap auto` and drop the rule: `auto` gives every child `flex: 1 1 var(--column)` and wraps when two no longer fit. That is [Split](/framework/styles/layouts/split/), which is why this one keeps the fixed basis instead.");

		md("Next: [Cards](/framework/styles/layouts/cards/) — the one that needs no CSS at all.");
	}
});
