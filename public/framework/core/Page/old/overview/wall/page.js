import { Page, demo, md } from "/app.js";

const shelf = () => new Page({
	title: "Shelf",

	children: "html css js http svg a11y fonts media forms".split(" ").map(name => ({
		name,
		title: name,
		content(){
			md("One of nine. The wall counted its own columns — nothing was declared per width.");
		},
	})),

	content(){
		md("The whole arrangement: `content(){ this.previews() }`. **Drag the handle** and the columns re-count.");

		this.previews().style({ "--column": "7.5em", "--gap": "0.5em" });
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	tree: shelf,
}));
