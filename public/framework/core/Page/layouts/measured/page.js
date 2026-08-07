import { Page, md, code, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Measured",
	description: "The default: a reading column on a sheet.",
	icon: "notes",
	classes: "paper",

	content(){

		code.js(`classes: "paper"        // this page
div.c("pages papers")   // every page in this region`);

		md("`--measure: 60em`, `--page-pad: 3em 4em`. **This is the shape most pages should be**, and it is what every page under `/framework/` gets from its region without saying anything.");

		h2("Why a measure at all");

		md("Somewhere between 60 and 80 characters a line stops being comfortable to read — the eye loses its place on the return sweep. `60em` lands in that band for body copy, and is still wide enough that a code block does not wrap.");

		md("Resize this window: the column stops growing and the page does not. That gap is the measure doing its job.");

		h2("A measure, not a sheet");

		md("There is no background here. A `.page` is a **hole onto the shell** — the site decides what colour that is, and the framework decides only how wide the reading is. That split is why the same page can be white on this site and paper-textured on another with no component edited.");

		md("← [Page layouts](/framework/core/Page/layouts/)");
	}
});
