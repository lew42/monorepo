import { div, md } from "/app.js";
import { Paging, MECHANISMS } from "../paging.js";

/* Container: one column in /imagine/'s row. Size: `large` (28–64em). Own layout:
   prose, then the stage (toolbar, one sample, four items). Regions: one, core's.
   Preview: core's card.

   ONE PAGE, ONE CONTENT, FOUR ITEMS — and each item carries a DIFFERENT mechanism,
   so the four are felt against the same words from the same place. Two of them
   navigate (a column, then the whole row); two never leave this box. The style and
   content chips are live; there is no mechanism chip here, because the mechanism
   is what each ROW is. */

export default new Paging({
	meta: import.meta,
	title: "Mechanisms",
	description: "The four things a click can do, all four on one page, against the same content.",
	icon: "alt_route",
	width: "large",
	axes: "style content",

	takeaway: "**One page, one piece of content, and four rows — and each row does something different when you click it.** That is the whole point of this page: the four mechanisms, felt against the same words, from the same place.",
	children: "launch expand swap takeover",

	content(){
		this.lede();

		md("Each row's icon is the promise it makes: " +
			Object.entries(MECHANISMS).map(([word, m]) => "`" + word + "` " + m.does).join(" · ") + ".");

		this.paging();

		md("Each row also has a page of its own — a small tree that uses ONLY that word, with the mechanism chips live so you can switch the same tree between all four. [Code](/imagine/paging/mechanisms/code/).");
	},

	/* THE SEAM. Core's `items()` gives every row the toolbar's mechanism; here the
	   row's own NAME is its mechanism, which is what puts all four on one page. */
	items(){
		return div.c("paging-items", () => this.children.forEach((child, name) => {
			if (!child || !MECHANISMS[name]) return;   // `code` arrives here once opened
			this.item(name, name);
			if (this.opened === name) this.panel(child);
		}));
	},
});
