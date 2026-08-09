import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",

	// Names, not imports — this page's menu, in order. `/about/` would resolve
	// even without the line; what it buys is the card and its real title.
	children: "about",

	content(){
		p("My first page.");
	},
});
