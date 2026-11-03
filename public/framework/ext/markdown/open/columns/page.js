import { Page, md } from "/app.js";

/* A columns tree whose every column lists the same three docs (../alpha.md …).
   Click one in the first column and it opens as the second; click one three columns
   deep and it opens as the fourth. Nothing here knows that: core's open_link() does
   it for any page in a columns tree. `folder` says where each column's docs live. */

const docs = new URL("../", import.meta.url).pathname;

const column = (text, children) => ({
	folder: docs,
	width: "small",
	content(){ md(text); this.md_files(); },
	children,
});

export default new Page({
	meta: import.meta,
	title: "Columns",
	description: "A columns tree: a doc opens as the column after the one you clicked in.",
	icon: "view_column",
	folder: docs,
	width: "small",

	initialize(){ this.columns(); },

	content(){ md("One column deep. Click a doc, and it opens as the second column."); this.md_files(); },

	children: {
		Two: column("Two columns deep.", {
			Three: column("Three columns deep. A doc opens as the fourth column."),
		}),
	},
});
