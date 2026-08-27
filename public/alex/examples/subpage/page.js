import { Page, md, p } from "/app.js";
import nested from "./nested/page.js";

export default new Page({
	meta: import.meta,
	title: "Subpage",
	description: "A child that imports its own child, so it can link to it by title.",

	// Eager: the Page itself, not a name — so `nested.title` is real right now.
	children: [nested],

	content(){
		md("This page lives at `/alex/examples/subpage/`, one folder below its parent. The Router imported `/alex/page.js` and `/alex/examples/page.js` on the way here, which is why the sidebar to the left exists.");

		p("It has a child of its own: ", nested.link());
	},
});
