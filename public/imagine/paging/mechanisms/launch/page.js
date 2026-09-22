import { h2, md } from "/app.js";
import { Paging, leaf } from "../../paging.js";

/* Container: a column in /imagine/'s row, opened to the right of Mechanisms.
   Size: the default track (16em floor, 40–46em cap) — prose plus three rows.
   Own layout: prose then the stage. Regions: one. Preview: core's card.

   ⚠ THREE LEVELS ARE PREPARED, on purpose. The owner's report on the old page was
     that "the launch demo … only goes 1 level deep, and it's contained in that demo
     area" — so this page's children have children, and theirs have children, and
     every one of them is a REAL column of the site's own row with a REAL url. There
     is no demo frame here at all: `launch` is core's columns, and the only way to
     show that honestly is to use them.                                            */

export default new Paging({
	meta: import.meta,
	title: "Launch",
	description: "A click opens a new column to the RIGHT. The page you clicked from stays exactly where it was.",
	icon: "chevron_right",
	axes: "mech style",
	mode: { mech: "launch", style: "card" },

	takeaway: "**Click any row below and a new column opens to the right of this one — and the url in your address bar changes to that page.** Nothing closes: this column stays exactly where it is, and the crumb strip along the top grows by one. Keep clicking and you can go three levels deeper; every level is a real page at a real address you could paste to somebody.",

	/* Real depth, in the site's own columns. A leaf is declared inside this module
	   rather than as a directory — there is nothing on disk to fetch, so the whole
	   tree costs one module and no server probe — but `Page.add()` gives each one a
	   real url all the same, which is the only thing `launch` needs. */
	children: [
		leaf("Alpha", "One column to the right. Nothing above it moved.", {
			children: [
				leaf("Alpha · deeper", "Level two. The row is now four columns long and scrolls sideways if it has to.", {
					children: [
						leaf("Alpha · deepest", "Level three, and the gesture has not changed once. That is what makes it a row rather than a stack of special cases."),
					],
				}),
				leaf("Alpha · sideways", "A sibling at level two. Open it and the column at level three closes, because a row shows one path."),
			],
		}),
		leaf("Beta", "The crumb strip above never changes shape — only its length.", {
			children: [
				leaf("Beta · deeper", "Every column in the row keeps its own state while you are down here."),
			],
		}),
		leaf("Gamma", "Three deep is the same gesture as one deep — that is the whole point."),
	],

	content(){
		this.lede();

		h2("What to click, and what to watch");

		md("**Click `Alpha`.** A column opens to the right and the address bar reads `/imagine/paging/mechanisms/launch/alpha/`. **Click `Alpha · deeper` in it, then `Alpha · deepest`** — three columns, three url changes, and this page still on screen the whole time. Then press the browser's Back button three times and walk back out of it.");

		md("**Launch is a child column — core's, not this module's.** A page under a columns host lays out as a full-height column to the right of its parent, and every ancestor stays open ([columns](/framework/core/Page/doc/columns/)). Nothing here reimplements it, which is why the crumbs, the ×, the deep-link and the Back button all work without a line of code in this realm.");

		this.paging();

		md("Switch the **mechanism** chip and the same rows behave differently: `takeover` gives the one you click the whole row (still routed), while `expand` and `swap` never leave this box and never touch the url.");
	},
});
