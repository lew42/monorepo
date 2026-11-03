import { Page, div, p, md } from "/app.js";

// Container: its own columns() row, default width — same as padded/, so the
// only variable is the scroll region's own inset. Own layout: `.page-column-
// prose flow` holding one `bleed` box. Regions: one column. Preview: default
// card.

export default new Page({
	meta: import.meta,
	title: "Flush bleed",
	description: "The same scroll region, `bleed` to the column's real edge instead of boxed in the padding.",
	icon: "vertical_split",

	initialize(){ this.columns(); },

	content(){
		md("Same content, same height as Padded inset — `bleed` spends the column's own inset (doc/columns.md) instead of adding a second one, so the scroll region reaches the column's real left and right edges.");
		div.c("bleed vary-scroll-flush flow", () => {
			for (let i = 1; i <= 30; i++) p(`Row ${i} — filler, nothing else to say.`);
		});
		md("**Verdict:** reads as part of the column, not a widget dropped into it — same content, no wasted frame, no doubled inset.");
	},
});
