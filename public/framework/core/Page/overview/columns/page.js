import { Page, demo, md } from "/app.js";

/* Nothing here draws a column. `columns()` on the root is the whole opt-in — the
   shape, the reveal and the crumb strip are core/Page's (Page.class.js, Page.css);
   this file is an ordinary tree with a `width:` word on some of its pages. */

const finder = () => {
	const site = new Page({
		title: "Finder",
		width: "small",
		content(){ md("Every page in this tree draws itself as one **column**."); },

		children: {
			Docs: {
				icon: "description",
				width: "small",
				content(){ md("Its children are the rows; the open one is lit."); },
				children: {
					Intro(){ md("A page with no children is just its prose — the row stops here."); },
					Guide: {
						width: "small",
						content(){ md("Click a row and the next column opens to its right."); },
						children: {
							Setup(){ md("Nothing in the tree knows about columns — `columns()` on the root is the whole opt-in."); },
							Usage(){ md("Click a row in a column further left and everything right of it closes."); },
							Wide: {
								width: "large",
								content(){ md('`width: "large"` — the column a grid or a table gets, up to 64em. No word at all is the default: a floor, and 40em to grow into.'); },
							},
							Reader: {
								width: "full",
								content(){ md('`width: "full"` — this page claims the whole host and the columns left of it collapse. **Click a crumb above** to get them back.'); },
							},
							Deep: { children: { Deeper: { children: {
								Deepest(){ md("Six columns. The row scrolls sideways when it runs out of room, and the newest one scrolls itself into view."); },
							} } } },
						},
					},
					API(){ md("Ordinary pages, ordinary `children:` — the arrangement is CSS."); },
				},
			},
			Blog: {
				icon: "rss_feed",
				width: "small",
				children: {
					Latest(){ md("Coming back up a branch closed the columns that were open to the right."); },
					Archive(){ md("Drag the stage narrow: under two columns' width the row pages one at a time."); },
				},
			},
			About(){ md("The DOM is a tree; `display: contents` makes the layout a row."); },
		},
	});

	site.columns();

	return site.children.get("docs").children.get("guide");   // arrive three columns in
};

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	children: "finder examples refs panels uses",
	tree: finder,
	min: "26em",
	note: "Miller columns — a core page shape. `page.columns()` on the host and its whole subtree lays out as full-height columns, each child opening to the right; `width:` picks the track (**small**, nothing, **large**, **full**). The tree is real; `display: contents` is what flattens it.\n\n**A box is not the shape.** The same tree at page height, with real urls: [Finder](/framework/core/Page/overview/columns/finder/). The detail is [`doc/columns.md`](/framework/core/Page/doc/columns/).",
}));
