import { Page } from "/app.js";

// An inbox — core's own column draws my children as rows, so there is nothing to write here.

export default new Page({
	meta: import.meta,
	title: "Backlog",

	children: "wall",
});
