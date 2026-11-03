import { Page, demo, md, div } from "/app.js";

const index = () => new Page({
	title: "Index",

	children: "install pages routing layout deploy".split(" ").map(name => ({
		name,
		title: name,
		content(){ md("One line each, in declaration order — the leanest way a page can present its children."); },
	})),

	content(){
		md("A **list** is one link per child. `link()` reads the child's own label, so a list, a rail and a crumb can never disagree about what a page is called.");

		div.c("flex v gap", () => this.children.forEach(page => page.link()))
			.style("--gap", "0.3em");
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "One link per child, in declaration order.",
	tree: index,
}));
