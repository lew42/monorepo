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

	content(){ md('The whole tree is one screen. Pick a row. **Notes** is a `hug` rail — only as wide as its longest row; **Guides › Words › Fill** spends everything left over. Drag any seam to resize a column, double-click it to put the word back.'); },

	children: {
		Guides: {
			icon: "description",
			width: "small",
			content(){ md("Its children are the rows; the open one is lit."); },
			children: {
				Start(){ md("A page with no children is just its prose — the row stops here. No `width:` word, so this column is the default: a floor, and 40em to grow into."); },
				Words: {
					width: "small",
					content(){ md("The six width words, one column each. Drag any seam between two columns to override the word for this visit; double-click it to put the word back."); },
					children: {
						Small(){ md('`width: "small"` — a fixed 14em rail. Lists, pickers, an index.'); },
						Hug: { width: "hug", content(){ md('`width: "hug"` — only what the content needs. A paragraph has no natural width, so hug gives prose a 24em note; a list of rows is what it is for — **Notes**, in the first column, is one.'); } },
						Default(){ md("No word at all. The column flexes between a floor and 40em, so two of them fill a wide screen instead of leaving it empty."); },
						Large: { width: "large", content(){ md('`width: "large"` — up to 64em, for a grid or a table.'); } },
						Fill: { width: "fill", content(){ md('`width: "fill"` — the leftover row, and nothing else moves: every column left of this one keeps its floor. `full` is the other half of that trade.'); } },
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
			width: "hug",
			// ⚠ NO `content`. A paragraph's max-content is the paragraph on one line, so
			//   any prose here would put this column on its 24em ceiling and the word
			//   would demonstrate the opposite of itself. The label is on the root.
			children: {
				Contract(){ md("A column closes because it lost its mark, not because anything moved it — the arrangement contract at the top of `Page.css` is untouched."); },
				Seams(){ md("Transparent bodies over one `--wash` floor; every seam is a 1px `--line` hairline. Nothing here paints `--well`."); },
			},
		},

		About(){ md("The DOM is a tree; `display: contents` is what makes the layout a row."); },
	},
});
