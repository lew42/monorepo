import { Page, div, p, md } from "/app.js";

const tiles = ["A", "B", "C", "D", "E", "F"];

export default new Page({
	meta: import.meta,
	title: "Flush Wall",
	description: "A 0-gap 0-pad grid, edge-to-edge, against the padded version.",
	width: "small",

	initialize(){ this.columns(); },

	content(){
		md("Two treatments of the same six tiles — pick one.");
		md("**Verdict:** flush reads better once the grid IS the column's content (a wall of media, no prose beside it); padded is the safer default the moment there is a caption or a verdict line near it.");
	},

	children: {
		Flush: { width: "large", classes: "default", content(){
			md("0 gap, 0 pad — the grid reaches the column's real edges.");
			div.c("bleed grid auto tint", () => tiles.forEach(t => div.c("surface pad", () => p(t))));
		} },
		Padded: { width: "large", content(){
			md("Gap + pad — the grid sits inset, tiles on a tint floor.");
			div.c("grid auto gap pad tint", () => tiles.forEach(t => div.c("surface pad", () => p(t))));
		} },
	},
});
