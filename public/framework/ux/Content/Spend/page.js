import { Doc, md, demo, div } from "/app.js";
import Spend from "./Spend.js";
import { spend } from "../fixtures.js";

const live = () => new Spend(spend());

export default new Doc({
	meta: import.meta,
	title: "Spend",
	description: "Dollars over time as a bar chart that fills any width: when was the money spent?",
	icon: "bar_chart",

	files: "Spend.js page.js readme.md",

	content(){
		demo.exhibit({
			page: this,
			stage: steer => demo.stage(live, steer),
			def: live,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Bursts show as bars.** Real data: `{ task: \"2026-09-25/css-audit\" }`.",
		});
		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("pad", live)); },
});
