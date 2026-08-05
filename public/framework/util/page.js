import { Page, md, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Util",
	description: "Small, dependency-free helpers.",
	col: "narrow",
	children: "is",

	nav: { is: { label: "is", icon: "rule" } },
	content(){

		// Sub-page nav first: what's under here, before what's on here.
		this.previews();

		pre(`import { is } from "/app.js";`);

		md("Plain functions. No classes, no state.");


		md("Next: [is](/framework/util/is/) — the type checks the dispatch logic runs on.");
	}
});
