import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Performance",
	description: "Big data on a page without freezing the machine: draw only what's visible, one variable per drag, measure every load.",
	icon: "speed",
	children: "bench",

	content(){
		md(`**Draw only what's on screen, batch every update, measure every load.** A page should stay smooth with thousands of rows and multi-megabyte logs; the rules below are how. Try the [batching benchmark](/framework/code/performance/bench/).`);
		md.details(import.meta, "readme.md", "Readme");
	},
});
