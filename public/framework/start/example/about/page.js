import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "About",
	children: "team",

	content(){
		p("A folder with a page.js in it is a url.");

		// A card per child, with no import — the parent already knows the name and
		// the url that name must have.
		this.previews();
	},
});
