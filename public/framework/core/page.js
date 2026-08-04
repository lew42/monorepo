import { Page, md, pre } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Core",
	description: "The core classes: View, Page, Router, App.",

	// Lazy names. The old Pager tier is gone — an arrangement is now a CSS class
	// a page opts into, so there is no fifth class to meet.
	children: "View Page Router App",

	content(){

		pre(`import { View, Page, Router, App } from "/app.js";`);

		md("Four classes, in the order you meet them. Only the first is unavoidable.");

		this.previews();
	}
});
