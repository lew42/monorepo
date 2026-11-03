import { Page, p, md } from "/app.js";

// `this.tabs()` is a Page.prototype method (ext/tabs/tabs.js), already
// imported once by app.js — nothing to import here.

// Container: vary/place/'s own $pages region, `main` prose width. Size: one
// tab bar + one panel, ~40em. Own layout: `this.tabs()`'s own bar-and-panel.
// Regions: one (the tab panel). Preview: default card.

export default new Page({
	meta: import.meta,
	title: "Swap in place",
	description: "Tabs — clicking a name replaces the one panel, nothing accumulates.",
	icon: "tab",

	content(){
		md("Click a name below — it REPLACES the panel in place; nothing accumulates beside it.");
		this.tabs("alpha beta gamma delta");
		md("**Verdict:** one panel, one place — no growing trail, but only one item is ever visible at a time.");
	},

	children: {
		Alpha: { content(){ p("Alpha — first of four, nothing else to say."); } },
		Beta:  { content(){ p("Beta — second of four."); } },
		Gamma: { content(){ p("Gamma — third of four."); } },
		Delta: { content(){ p("Delta — fourth of four."); } },
	},
});
