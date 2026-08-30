import { Page, p, md } from "/app.js";

// Container: its own columns() row, `width: "small"` rail. Size: rail (14em)
// + up to four opened columns. Own layout: `column()`'s own rail-and-body.
// Regions: one column per open item. Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Add a column",
	description: "The default — clicking a name opens a new column beside it.",
	icon: "view_column",
	width: "small",

	initialize(){ this.columns(); },

	content(){
		md("Click a name below — it opens as a NEW column to the right; the rail itself never moves.");
		md("**Verdict:** the trail of open columns is its own history, good for drilling in — but four items deep is four columns wide.");
	},

	children: {
		Alpha: { content(){ p("Alpha — first of four, nothing else to say."); } },
		Beta:  { content(){ p("Beta — second of four."); } },
		Gamma: { content(){ p("Gamma — third of four."); } },
		Delta: { content(){ p("Delta — fourth of four."); } },
	},
});
