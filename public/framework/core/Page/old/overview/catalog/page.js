import { Page, demo, md, div } from "/app.js";

const parts = () => {
	const site = new Page({
		title: "Parts",

		children: "html css js http".split(" ").map(name => ({
			name,
			title: name,
			content(){
				md("Clicking a card on the left swapped **this** region — the rail never moved.");
			},
		})),

		content(){
			div.c("flex gap", () => {

				// the cards, in one column
				div.c("basis", () => this.previews().style({ "--column": "100%", "--gap": "0.4em" }))
					.style("--basis", "8.5em");

				// and the region they open in
				this.$pages = div.c("flex-1");
			});
		},
	});

	// open on a child, so the arrangement is doing its job on arrival
	return site.children.get("html");
};

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	tree: parts,
}));
