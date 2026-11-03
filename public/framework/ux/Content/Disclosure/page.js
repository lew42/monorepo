import { Page, md, div } from "/app.js";
import Disclosure from "./Disclosure.js";
import { disclosure } from "../fixtures.js";

export default new Page({
	meta: import.meta,
	title: "Disclosure",
	description: "A title that opens into a section, in three stacking styles.",
	icon: "expand_circle_down",

	content(){
		div.c("ux-content-wall wide", () => {
			for (const s of ["faq", "flush", "lines"]) div.c("flex v gap", () => { md(`### ${s}`); new Disclosure(disclosure(s)); });
		});
		md.details(import.meta, "readme.md", "Readme");
	},
});
