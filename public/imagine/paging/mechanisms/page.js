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

	takeaway: "**One page, one piece of content, and four rows — and each row does something different when you click it.** Two of the four change the url and take you somewhere (`launch` opens a column, `takeover` takes the whole row); two never leave this box and leave the address bar alone (`expand`, `swap`). Each row's icon is its promise.",
	children: "launch expand swap takeover",

	content(){
		this.lede();

		md("Each row's icon is the promise it makes: " +
			Object.entries(MECHANISMS).map(([word, m]) => "`" + word + "` " + m.does).join(" · ") + ".");

		this.paging();

		md("**Which ones change the url.** `launch` and `takeover` are core's columns vocabulary — a child column and `width: \"full\"` — so both are real navigation with a real address, a back button and a link you can send. `expand` and `swap` are states of the page you are already on: no url, no back button, and every one of them offers the column as the way out. The full argument, and what was rejected: [the four mechanisms](/imagine/paging/doc/mechanisms.md).");

		md("Each row also has a page of its own, at full size and with the site's own machinery — not a demo frame. [Launch](/imagine/paging/mechanisms/launch/) opens real columns three levels deep; [Expand](/imagine/paging/mechanisms/expand/) never routes; [Swap](/imagine/paging/mechanisms/swap/) puts four different swap visuals on one bounded stage; [Takeover](/imagine/paging/mechanisms/takeover/) fills the row. [Code](/imagine/paging/mechanisms/code/).");
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
