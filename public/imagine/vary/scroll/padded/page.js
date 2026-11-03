import { Page, div, p, md } from "/app.js";

// Container: its own columns() row, default width (16-40em). Size: one narrow
// column. Own layout: `.page-column-prose flow`, holding a bounded box that is
// its own second layout. Regions: one column. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Padded inset",
	description: "The bad pattern — a scroll region boxed inside the column's own padding.",
	icon: "crop_square",

	initialize(){ this.columns(); },

	content(){
		md("The column's content already sits inset (`.page-column-prose`, doc/columns.md); this scroll region adds a SECOND inset around itself — the padding and the scrollbar box each other in on the same few pixels.");
		div.c("vary-scroll-box flow", () => {
			for (let i = 1; i <= 30; i++) p(`Row ${i} — filler, nothing else to say.`);
		});
		md("**Verdict:** cramped — two frames nested for one scroll region, and the content never even reaches the column's real width.");
	},
});
