import { Page, md } from "/app.js";

/* The same shape as the demo box next door, at page height and with real urls —
   every column below is an ordinary `page.js`-style child, and `columns()` in
   `initialize()` is the only line that knows about columns. */

export default new Page({
	meta: import.meta,
	title: "Finder",
	description: "The column shape at full page height — real urls, no box around it.",
	icon: "view_column",
	width: "small",

	initialize(){ this.columns(); },

	content(){ md("The whole tree is one screen. Pick a row."); },

	children: {
		Guides: {
			icon: "description",
			width: "small",
			content(){ md("Its children are the rows; the open one is lit."); },
			children: {
				Start(){ md("A page with no children is just its prose — the row stops here. No `width:` word, so this column is the default: a floor, and 40em to grow into."); },
				Words: {
					width: "small",
					content(){ md("The four width words, one column each."); },
					children: {
						Small(){ md('`width: "small"` — a fixed 14em rail. Lists, pickers, an index.'); },
						Default(){ md("No word at all. The column flexes between a floor and 40em, so two of them fill a wide screen instead of leaving it empty."); },
						Large: { width: "large", content(){ md('`width: "large"` — up to 64em, for a grid or a table.'); } },
						Full: { width: "full", content(){ md('`width: "full"` — this page claims the whole host and the columns left of it collapse. **Click a crumb above** to get them back.'); } },
					},
				},
				Deep: { children: { Deeper: { children: {
					Deepest(){ md("The row scrolls sideways when it runs out of room, and the newest column scrolls itself into view."); },
				} } } },
			},
		},

		Notes: {
			icon: "sticky_note_2",
			width: "small",
			children: {
				Contract(){ md("A column closes because it lost its mark, not because anything moved it — the arrangement contract at the top of `Page.css` is untouched."); },
				Seams(){ md("Transparent bodies over one `--wash` floor; every seam is a 1px `--line` hairline. Nothing here paints `--well`."); },
			},
		},

		About(){ md("The DOM is a tree; `display: contents` is what makes the layout a row."); },
	},
});
