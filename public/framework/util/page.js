import { Page, md, pre } from "/app.js";
import is from "./is/page.js";

export default new Page({
	meta: import.meta,
	title: "Util",
	description: "Small, dependency-free helpers.",
	col: "narrow",
	children: [is],
	content(){

		// Sub-page nav first: what's under here, before what's on here.
		this.previews();

		pre(`import { is } from "/app.js";`);

		md("Plain functions. No classes, no state.");

	}
});
