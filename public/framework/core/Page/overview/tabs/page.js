import { Page, demo, md } from "/app.js";

const guide = () => new Page({
	title: "Guide",

	children: {
		HTML(){ md("Every tab is a **real url** — Back works, and a deep link opens straight here."); },
		CSS(){ md("The open tab and its panel share an edge. That connected look is the whole shape."); },
		JS(){ md("`this.tabs()` with no argument takes every child in declaration order; the first is the panel you land on."); },
	},

	// The whole opt-in. `ext/tabs` patches tabs() onto every Page, and the children
	// mount into the panel because tabs() filled `regions` with it.
	content(){ this.tabs(); },
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "One strip of links over a panel — children flip between.",
	tree: guide,
}));
