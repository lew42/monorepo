import { Page, demo, md, div } from "/app.js";

const feed = () => new Page({
	title: "Feed",

	children: "html css js http svg a11y fonts media forms".split(" ").map(name => ({
		name,
		title: name,
		content(){
			md("The row scrolls; nothing else on the page does.");
		},
	})),

	// the same cards previews() would arrange, in a row that scrolls instead
	previews(){
		return div.c("flex gap", () => this.children.forEach((page, name) =>
			page.preview(this.nav_for(name)).ac("basis")))
			.style({ "--basis": "7em", "--gap": "0.5em", overflowX: "auto" });
	},

	content(){
		md("The same cards in one scrolling row — `basis` is what stops them squeezing.");

		this.previews();
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Arrangements",
	tree: feed,
}));
