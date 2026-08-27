import { Page, div, p, md } from "/app.js";

/* One page, no `width:` word — the default column, holding ordinary 2-column
   content. The question this pairing answers: at 3440, is that still readable,
   or should this kind of page just claim `large`? */

export default new Page({
	meta: import.meta,
	title: "Measure at 3440",
	description: "A default-width column, ordinary 2-column content, measured.",

	initialize(){ this.columns(); },

	content(){
		md("No `width:` word — the **default** column: a 16em floor, 40em to grow into. Six fields, two columns.");
		div.c("grid auto gap pad tint", () => {
			[["Name", "Ada"], ["Role", "Engineer"], ["Team", "Core"], ["Since", "2019"], ["Status", "Active"], ["Level", "L5"]]
				.forEach(([k, v]) => p(`${k}: ${v}`));   // p() reads backticks only, not bold — plain text
		});
		md("**Measured** (headless, this page, 900 tall):");
		md("| viewport | row | column | dead space |\n|---|---|---|---|\n"
			+ "| 1280 | 1051px | 602px | 449px (43%) |\n"
			+ "| 1920 | 1677px | 640px | 1037px (62%) |\n"
			+ "| 3440 | 3166px | 720px | 2446px (77%) |");
		md("The column itself isn't flat 40em in pixels — the site's own root font-size grows with the viewport (15→16→18px here), so the *cap* grows too. It just can't keep up with the row.");
		md("**Verdict:** readable at every width, never cramped — six short fields have room to spare even at 602px. The dead space is the finding, not the readability: 43% at 1280 is a gutter, 77% at 3440 is most of the screen. `layout`'s own rule applies — widening this one column is not the fix; a page that expects a 3440 monitor wants a real second column (or `large`), not a wider single one.");
	},
});
