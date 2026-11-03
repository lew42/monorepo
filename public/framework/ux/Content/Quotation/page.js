import { Doc, md, demo, div } from "/app.js";
import Quotation from "./Quotation.js";
import { quotation } from "../fixtures.js";

const live = () => new Quotation(quotation());

export default new Doc({
	meta: import.meta,
	title: "Quotation",
	description: "One prompt of yours as a quotation: the words, the time, and where it was said.",
	icon: "format_quote",

	files: "Quotation.js page.js readme.md",
	notes: "shape",

	content(){

		demo.exhibit({
			page: this,
			stage: steer => demo.stage(live, steer),
			def: live,
			file: new URL("page.js", import.meta.url).pathname,
			note: "**Read-only.** Open *As first transcribed* to see the raw words when a cleaned version differs.",
		});

		md.details(import.meta, "readme.md", "Readme");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", live)); },
});
