import { Page, md, h2 } from "/app.js";
import specs from "./specs.js";
import entry from "./entry.js";

export default new Page({
	meta: import.meta,
	title: "400",
	description: "Five class strings, one column at 400px, unstacking on their own — the same site rendered five ways.",
	icon: "smartphone",
	group: "Instrument",

	children: specs.map(entry),

	initialize(){ this.catalog(); },

	content(){

		md("**Five class strings, one column at 400.** Every card renders the same `web.js` `site` — a "
			+ "header, a hero, sections, a footer — inside a phone-and-monitor twin, which *is* the question: "
			+ "how do the same boxes look at 390 and at 3440.");

		md("Nothing here is new CSS. Each card is a curated point in the shipped vocabulary, citing the "
			+ "[library](/framework/ext/LayoutTool/library/) arrangement it echoes and the `bad/` trap it steps "
			+ "around. **Column is the exception** — it *is* that trap, kept live so the other four have "
			+ "something to answer.");

		h2("Measured");

		md("Every card wires a bare `/full/` url — no stage, no `zoom` — so [Layout library](/framework/ext/LayoutTool/library/)'s "
			+ "`frame()` can read it in a real viewport at 400, 1280, 1920 and 3440. The readme has the numbers.");

		md.details(import.meta, "readme.md", "Design record — the five, the measurements, and Column's one deliberate finding");
	},
});
