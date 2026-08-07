import { Page, p } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Hello",

	// A name, not an import. `about/page.js` is fetched the first time
	// someone navigates to /about/ — and never before.
	children: "about",

	content(){
		p("My first page.");
	},
});
