import { Page, md, h2, demo, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Grid",
	description: "The .grid utilities for responsive, wrapping column layouts.",
	icon: "grid_view",

	content(){

		demo(() => {
			div.c("boxes grid auto gap", () => {
				for (let i = 1; i <= 6; i++) div(String(i));
			});
		}, "`.grid.auto` fills the row with as many columns as fit, each at least `--column` (14em) wide, then wraps. Drag the demo narrower to watch it reflow.");

		h2("Up to three across");

		demo(() => {
			div.c("boxes grid three gap", () => {
				for (let i = 1; i <= 6; i++) div(String(i));
			});
		}, "`.three` behaves like `auto` but never grows past three columns — for card layouts that should not stretch too wide.");

		h2("Tuning the column width");

		demo(() => {
			div.c("boxes grid auto gap", () => {
				for (let i = 1; i <= 6; i++) div(String(i));
			}).style("--column", "8em");
		}, "Both layouts key off `--column`. Override it inline to move the wrap point — no new CSS.");

		h2("Gaps");

		md("`.gap` gives a 1em gap, `.gap-2em` doubles it. The same classes work on flex and grid alike.");

		md("Next: [BEM](/alex/styles/bem/) — naming, once a component is big enough to need its own CSS.");
	},
});
