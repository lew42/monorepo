import { Page, View, div } from "/app.js";

View.stylesheet(import.meta, "old.css");

export default new Page({
	meta: import.meta,
	title: "Page — old docs",
	label: "Old",
	description: "The first page docs, kept while they are rewritten.",
	children: "intro overview nav children previews shell flow",
	render(){ return this.view ??= div.c("page doc-section", () => this.tabs().ac("vertical")).ac("page--" + this.name); },
});
