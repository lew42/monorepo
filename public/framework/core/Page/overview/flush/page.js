import { Page, demo, md } from "/app.js";

const tiles = () => new Page({
	title: "Tiles",

	children: "one two three four five six seven eight".split(" ").map(name => ({
		name,
		title: name,
		content(){ md("No gap, no padding — the cells meet on a shared hairline and the wall reaches the edges."); },
	})),

	content(){
		md("A grid always has padding — **unless it is flush**: `--gap: 0` and no gutter, so the cells touch and the wall runs edge to edge. Two tokens, no new arrangement.");

		// ⚠ `--gutter-x` too: Page.css pads a wall inside a page (`.page > .page-previews`),
		// so zeroing the gap alone leaves the grid inset and it is not flush at all.
		this.previews().style({ "--column": "6em", "--gap": "0", "--gutter-x": "0" });
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "A grid with 0 gap and 0 padding — cells meet, wall reaches the edge.",
	tree: tiles,
}));
