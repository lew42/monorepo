import { Page } from "/app.js";

// A wall of cards; picking one opens a column to the right.

export default new Page({
	meta: import.meta,
	title: "Register",
	width: "large",
	index: true,

	children: "prose prose-2 tabs",

	content(){ return this.previews(); },
});
