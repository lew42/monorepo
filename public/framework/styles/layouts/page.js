import { Page, md, h2, div, demo } from "/app.js";
import card, { wall } from "../gallery/gallery.js";
import preview from "./preview.js";

const n = count => Array(count).fill("");

// Both ladders run simplest-first, and each rung is one more word than the one
// above it. The class string is on every preview as its `title`.
const flex = () => {
	preview("A row", "flex", n(3));
	preview("A row with air in it", "flex gap", n(3));
	preview("A column", "flex v gap", n(3));
	preview("Ends apart, middle empty", "flex gap split", n(2));
	preview("Equal peers, that wrap", "flex gap auto", n(3), "3em");
	preview("A fixed rail, a fluid rest", "flex gap", ["basis", "flex-1"]);
	preview("Wraps to a second line", "flex gap wrap", n(6), "3em");
	preview("Three, then straight to one", "flex gap three", n(3), "3em");
};

const grid = () => {
	preview("A single column", "grid gap", n(3));
	preview("A wall that counts itself", "grid gap auto", n(6), "3.5em");
	preview("Three, then straight to one", "grid gap three", n(3), "3em");
	preview("A card wall", "grid gap auto", n(4), "5em");
	preview("A strip of tiles", "grid gap auto", n(8), "2.5em");
};

const section = (title, url, rungs) => div.c("flex v gap", () => {
	md(`### [${title} →](${url})`);
	div.c("grid gap auto", rungs).style({ "--column": "13em", "--gap": "1.5em" });
});

export default new Page({
	meta: import.meta,
	title: "Layouts",
	description: "The shapes, first — and then eight pages built out of them.",
	icon: "dashboard_customize",

	// the previews and the wall want the room; the prose stays a column — `grid`'s
	// breakout tracks give both without a second word
	classes: "grid",

	children: "fit flex grid holy-grail sidebar cards dashboard split centered stack masthead",

	content(){

		demo.stage(() => div.c("flex gap auto").style({ "--column": "24em", "--gap": "2.5em" }).append(() => {
			section("Flex", "/framework/styles/layouts/flex/", flex);
			section("Grid", "/framework/styles/layouts/grid/", grid);
		})).ac("wide");

		md("**Two arrangements, and that is the whole vocabulary.** Every shape above is a class string you can put on any `div` on any page — nothing here is a component and nothing here is a file. Hover a name to see its classes; **[Flex](/framework/styles/layouts/flex/)** and **[Grid](/framework/styles/layouts/grid/)** have the code, one word at a time.");

		md("**Drag the handle** on the right edge and every shape re-flows at once. Not one of them contains a media query — they respond to the width of the *box*, which is why the same class string is correct in a sidebar, in a card, and across a 3440px monitor.");

		h2("Eight worked pages");

		// Each card is the child page's own `layout()`, run here with the same rail
		// the real page gets — so a thumbnail cannot drift from the page it links to.
		// A child with no `layout()` (fit, flex, grid) is a doc page, linked above.
		wall(() => this.children.forEach((page, name) =>
			page?.layout && card(this.nav_for(name), () => page.layout())))
			.style({ "--column": "17em", "--thumb-min": "9em", "--thumb-max": "11em" });

		md("Every card is a **live render of the page behind it**, not a picture: `zoom-25` lays the layout out at four times the card's width and paints it back down. Click one and you are standing in that layout at full size. **Eight layouts, zero stylesheets** — the record of which rule each one nearly needed is in `doc/css-cost.md`, beside this page.");

		h2("What a page does with them");

		md("A page layout is a class string too. Saying nothing gives you the reading column; `grid`, `pad`, `full` and `fill` are the four stances on the two tokens behind it, and they combine — `full fill flex v` is a five-region application page, `pad flex v gap` is an index. [Page shapes](/framework/styles/layouts/fit/) is the long version, with the breakout tracks.");

		md("Next: [Sections](/framework/styles/sections/) — these layouts, filled with real elements and components.");

		md.details(import.meta, "readme.md", "Design record — the page IS the layout, zoom vs transform, why the gallery reads `children`");
	},

	/* The layouts nav, as plain entries — handed to every layout that draws one, and
	   to the gallery so a thumbnail's rail is the same rail. Adoption, not an import:
	   a child reaches UP through `this.parent`, and a mutual import here would break
	   deep reloads only. */
	rail(){
		return [...this.children]
			.filter(([, page]) => page?.layout)
			.map(([name]) => this.nav_for(name));
	},
});
