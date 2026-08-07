import { Page, md, div, a, icon } from "/app.js";
import { box, lines } from "/framework/styles/layouts/parts.js";

/* render(), not content(): Page draws an h1 for whatever title it has, and the
 * point of this page is that there is nothing above the layout. The three things
 * an override owes (core/Page/readme.md): set `this.view`, carry `.page`, never
 * nest a second one. */
export default new Page({
	meta: import.meta,
	title: "Full",
	description: "The thing IS the page — no measure, no inset, no heading.",
	icon: "open_in_full",

	render(){
		return this.view ??= div.c("page page-full flex v gap", () => {
			a.c("page-link", () => { icon("arrow_back"); }).href("/framework/core/Page/layouts/");

			box("The whole region", () => { lines(2); }).ac("flex-1 flex v");

			box("Footer");
		});
	}
});
