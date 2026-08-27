import { Page, demo, md } from "/app.js";

const swatches = () => new Page({
	title: "Swatches",

	children: "red rose pink plum violet indigo blue cyan teal green lime amber".split(" ").map(name => ({
		name,
		title: name,
		content(){ md("Twelve of these fit where six cards would. Density is the only difference."); },
	})),

	content(){
		md("A **grid** is the same `previews()` wall at a smaller `--column`. Nothing else changes — density is a token, not a second arrangement.");

		this.previews().style({ "--column": "4.5em", "--gap": "0.4em" });
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "The wall at a smaller --column — density is a token.",
	tree: swatches,
}));
