import { Page, div, p, md, ui } from "/app.js";

// Container: data/'s row. Size: `large` — six columns want more than 40em. Own
// layout: `ui.table()`, bled to the column's edge. Regions: one.

export default new Page({
	meta: import.meta,
	title: "Table",
	description: "The filtered rows as one table, six columns.",
	icon: "table_rows",
	width: "large",

	content(){
		md("Same rows, read left to right instead of scanned as tiles.");

		div.c("bleed", $box => this.parent.watch(() => $box.empty(() => {
			const rows = this.parent.filtered();

			if (rows === null) return p.c("muted", "Loading…");
			if (!rows.length) return p.c("muted", "Nothing matches.");

			ui.table(
				["Name", "Place", "Year", "Height (m)", "Type", "Architect"],
				rows.map(r => [r.name, r.place, r.year, r.height_m, r.type, r.architect]),
			);
		})));

		md("**Verdict:** `ui.table(head, rows)`, two arguments — no per-column markup, and the same `filtered()` call as the other two.");
	},
});
