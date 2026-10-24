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

	// `even` — every open column the same width, and how many fit is computed from the
	// row (doc/columns.md). The four `uses/*` screens next door stay on the elastic
	// mode, so the two are one click apart.
	initialize(){ this.columns({ even: true }); },

	content(){ md('The whole tree is one screen, and every column in it is the **same width**. How many fit is the room\'s answer, not the page\'s: `N = floor(row / recommended)`. So opening a column moves nothing that is already on screen — its slot was already there — and the only thing that changes a width is changing the size of the window. Drag a seam to overrule one column for this visit; double-click it to put the even width back.'); },

	children: {
		Guides: {
			icon: "description",
			width: "small",
			content(){ md("Its children are the rows; the open one is lit."); },
			children: {
				Start(){ md("A page with no children is just its prose — the row stops here. No `width:` word, so this column is the default: 40em of reading width, and it keeps it whatever opens beside it."); },
				Words: {
					width: "small",
					content(){ md("The six width words, one column each. **This Finder runs `even` columns, so five of the six are standing down right here** — every column in the row is the same width whatever word it says. Each description below is the word with the mode OFF, which is how the [demo box](/framework/core/Page/overview/columns/) and the four [uses](/framework/core/Page/overview/columns/uses/) next door still run. `full` is the exception and still works: it is the one word that means *claim the host*, not a width."); },
					children: {
						Small(){ md('`width: "small"` — a rail: 14em, growing with the row to 24em at 3440. Lists, pickers, an index.'); },
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
