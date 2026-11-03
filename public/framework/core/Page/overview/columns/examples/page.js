import { Page, md } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Examples",
	description: "Appearance recipes for column pages.",
	children: "looks grids",
	content(){
		md("How columns **look** — two labs:");
		md("[Looks](/framework/core/Page/overview/columns/examples/looks/) — backgrounds, padding, seams, scrollbars.");
		md("[Grids](/framework/core/Page/overview/columns/examples/grids/) — grid columns opening item columns, sizes at 3440.");
	},
});
