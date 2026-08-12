import { Page, md, h2 } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "The shapes, first — and then eight pages built out of them.",
	icon: "dashboard_customize",

	children: "fit flex grid holy-grail sidebar cards dashboard split centered stack masthead",

	// Eleven live shapes as the rail, the page you are reading as its first card.
	initialize(){ this.catalog(); },

	content(){

		md("**Two arrangements, and that is the whole vocabulary.** Every shape in the rail is a class string you can put on any `div` on any page — nothing here is a component and nothing here is a file. **Click one** and it opens beside the rail on a stage you can drag narrower, with the layout bar wired to it and the function that built it open underneath — the same [exhibit](/framework/ext/demo/) every detail page on this site is.");

		md("A card is a **live render of the page behind it**, not a picture: `zoom-25` lays the layout out at four times the card's width and paints it back down. **Eight layouts, zero stylesheets** — the record of which rule each one nearly needed is in `doc/css-cost.md`, beside this page.");

		h2("The two arrangements");

		md("[Flex](/framework/styles/layouts/flex/) is nine class strings, each one word from its neighbour. [Grid](/framework/styles/layouts/grid/) is three, and one token between them. Every layout in the rail is built out of those twelve words and nothing else.");

		md("Not one of them contains a media query — they respond to the width of the *box*, which is why the same class string is correct in a sidebar, in a card, and across a 3440px monitor. Open the panel on any shape and drag `--column`: the break widths are a consequence, never a design.");

		h2("What a page does with them");

		md("A page layout is a class string too. Saying nothing gives you the reading column; `standard`, `pad`, `full` and `fill` are the four stances on the two tokens behind it, and they combine — `full fill flex v` is a five-region application page, `pad flex v gap` is an index. [Page shapes](/framework/styles/layouts/fit/) is the long version, with the breakout tracks.");

		md("Next: [Sections](/framework/styles/sections/) — these layouts, filled with real elements and components.");

		md.details(import.meta, "readme.md", "Design record — the page IS the layout, zoom vs transform, one card shape");
	},

	/* The layouts nav, as plain entries — handed to every layout that draws one, so a
	   thumbnail's rail is the same rail. Adoption, not an import: a child reaches UP
	   through `this.parent`, and a mutual import here would break deep reloads only. */
	rail(){
		return [...this.children]
			.filter(([, page]) => page?.layout)
			.map(([name]) => this.nav_for(name));
	},
});
