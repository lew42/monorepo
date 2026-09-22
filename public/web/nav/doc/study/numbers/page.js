import { Page, md, p, table, thead, tbody, tr, th, td, div } from "/app.js";

/* Container: a column of /web/nav/doc/study/'s row. Size: `full` — a
   five-column table of numbers wants the row, not a 40em note.
   Own layout: the column's prose flow; the table is wrapped in a scroller so a
   phone scrolls it sideways instead of compressing its columns.
   Regions: none. Children: none. Preview: the default card. */

/* Measured 2026-09-17, headless Chromium, one fresh context per page and width.
   Every number is the LARGEST shift of a column that was ALREADY OPEN when the
   click landed: its x on screen, its width, and the top of one of its first five
   nav links. Raw json: /framework/ai/2026-09-17/nav-stability/measurements.json */
const ROWS = [
	["/imagine/", "0 / 0 / 0", "0 / 0 / 0", "0 / 0 / 0", "400 / 0 / 0"],
	[".../columns/finder/", "0 / 0 / 0", "0 / 0 / 0", "0 / 0 / 0", "400 / 0 / 0"],
	[".../columns/uses/docs/", "181 / 181 / 170", "0 / 0 / 0", "0 / 0 / 26", "400 / 0 / 0"],
	[".../columns/uses/workbench/", "242 / 181 / 146", "235 / 235 / 52", "0 / 0 / 0", "400 / 0 / 0"],
];

export default new Page({
	meta: import.meta,
	title: "Numbers",
	description: "The measured before/after: how far an already-open column moves when another one opens, on four real pages at four widths.",
	icon: "straighten",
	width: "full",

	content(){
		p("Four real columns pages, four widths. Arrive, then click nav links one at a time until nothing deeper opens. After every click, every column that was already open is measured again: where it sits, how wide it is, and where its first five nav links are.");

		md("Each cell is **x shift / width change / nav-link drop**, in pixels, taking the worst column and the worst click on that page at that width.");

		/* A bare `table()`, never `.ui-table`: that class is `width: 100%`, which
		   stretches five short columns across the whole row for nothing. The table
		   shrink-wraps and the scroller around it is what a phone gets instead of
		   compressed columns. Block-bodied callbacks throughout — a callback that
		   RETURNS a view appends it a second time. */
		div().style({ overflowX: "auto" }).append(() => {
			table(() => {
				thead(() => { tr(() => { ["Page", "1280", "1920", "3440", "400"].forEach(h => { th(h); }); }); });
				tbody(() => { ROWS.forEach(row => { tr(() => { row.forEach((cell, i) => {
					td(cell).ac(i && cell.startsWith("0 / 0 / 0") ? "muted" : "");
				}); }); }); });
			});
		});

		md(`**Three things the table says.**

1. **The jump is real and it is at 1280.** The worst click moved an open column 242px sideways, changed its width by 181px, and pushed a nav link 170px down its own column. 1280 is the width most readers have.
2. **Only elastic columns move.** \`/imagine/\` and the Finder demo read zero everywhere, because their nav columns say \`width: "small"\` — and \`small\` is already \`flex: 0 0\` in \`core/Page/Page.css\`. The columns that jump are the ones with no width word (and \`large\`), which are \`flex: 1 1 0\`: their width is a function of how many siblings are open.
3. **3440 is quiet for the wrong reason.** Almost every cell is zero there because the row is never full, so nothing has to give — and the same screen shows 80% grey. The fix has to keep that screen used, not just keep it still.`);

		md("**At 400 the row pages one column at a time**, so the previous column slides out by exactly the viewport width: 400 / 0 / 0, on every page, on every click. Nothing resizes and no nav link moves. The crumb strip above the row does not move either — 37.7px tall and its first link at the same pixel, through four levels of depth on all four pages.");

		md("Raw numbers, every column and every click: [measurements.json](/framework/ai/2026-09-17/nav-stability/measurements.json). The method and the probe live with [the task](/framework/ai/2026-09-17/nav-stability/).");
	},
});
