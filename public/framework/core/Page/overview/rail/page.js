import { Page, demo, md } from "/app.js";

const parts = () => new Page({
	title: "Parts",

	children: "html css js http svg".split(" ").map(name => ({
		name,
		title: name,
		content(){ md("The rail never moved — only this region swapped."); },
	})),

	// `catalog()` from ext/catalog: the children become a pinned rail beside the one
	// you picked, and this page's own content becomes the rail's first card.
	initialize(){ this.catalog(); },

	content(){
		md("A **rail** is nav that stays: it pins beside the routed child instead of being replaced by it. `initialize(){ this.catalog(); }` is the whole opt-in.");
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "Nav that stays beside the page it opens.",
	tree: parts,
}));
