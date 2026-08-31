import { Page } from "/app.js";

// A wall of cards; picking one opens a column to the right.

export default new Page({
	meta: import.meta,
	title: "Queue",
	index: true,

	children: "prose list",

	content(){ return this.previews(); },
});
