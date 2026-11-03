import { Page, demo, md } from "/app.js";

const reader = () => new Page({
	title: "Reader",
	icon: "menu_book",

	children: [
		{ name: "parts", title: "Parts", content(){
			md("A document is elements, nested. Next come [the rules](/reader/rules/) that lay them out — or back to [the start](/reader/)."); } },

		{ name: "rules", title: "Rules", content(){
			md("A rule matches [elements](/reader/parts/) and declares what they look like. After that, [scripts](/reader/scripts/)."); } },

		{ name: "scripts", title: "Scripts", content(){
			md("Scripts run once the document exists. That is the whole tour — [start again](/reader/)."); } },
	],

	content(){
		md("No bar, no rail, no cards. The only way through this site is the prose: read [the parts](/reader/parts/), then [the rules](/reader/rules/), then [scripts](/reader/scripts/).");
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: reader,
	min: "20em",

	note: "**The baseline every other pattern refines.** An anchor in a sentence needs no component, carries its own reason for existing, and is the only navigation that still works with the stylesheet off. What it cannot do is tell you where you are or what else there is — so the moment a reader needs an overview, something persistent has to appear.",
}));
