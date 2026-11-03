import { Page, demo, md } from "/app.js";

const api = () => new Page({
	title: "API",

	children: {
		append(){ md("The same set as the top bar, stood on its end — one word, `vertical`."); },
		empty(){ md("A left rail suits a long list: it can hold thirty members where a strip would scroll."); },
		style(){ md("This is the shape a `Doc`'s **API** tab uses, and the one a nested Doc should reach for instead of a second top row."); },
	},

	content(){ this.tabs().ac("vertical"); },
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Building blocks",
	description: "The tab bar stood on its end — the inner left tabs.",
	tree: api,
}));
