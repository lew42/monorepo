import { Page, md, files } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Servex mastermind",
	description: "Cards that show the thing: the card standard, one object widget, a cheap check. Earlier: module agents.",
	icon: "hub",
	children: "page-assistant",

	content(){
		md("**A card shows the thing: its folder, its live objects, its checklist. Words come last.**");
		md("![The Servex card, drawn to the standard](card-quality.svg)");
		md("The standard, the Servex card's own folder today, and this design, as files. Click one:");
		files(import.meta, "../../../ai2/doc/card-standard.md ../../2026/09/24/servex/page.jsonl card-quality.md card-quality.svg").ac("wide");
		return md.file(import.meta, "card-quality.md", { h1: false });
	},
});
