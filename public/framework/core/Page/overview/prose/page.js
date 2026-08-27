import { Page, demo, md } from "/app.js";

const note = () => new Page({
	title: "Note",

	// No children at all — that IS the block. Nothing to present, so the content is
	// the whole page and `.flow` gives it its rhythm.
	content(){
		md("**Prose is the leaf.** A page with no children has nothing to present, so it presents itself: a title, `.flow`, and the measure the page shell already gives it.");
		md("Every other block word is about *children*. This one is what the tree ends in — and most pages on any site are this one.");
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "The leaf: no children, so the content is the page.",
	tree: note,
}));
