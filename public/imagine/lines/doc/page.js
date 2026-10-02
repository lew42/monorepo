import { Page, md } from "/app.js";
export default new Page({
	meta: import.meta,
	title: "Line filter notes",
	description: "The scoring ingredients and limits of the line map.",
	route(name){
		if (name !== "filter") return null;
		const meta = this.meta;
		return { title: "How the filter works", content(){ return md.file(meta, "filter.md", { h1: false }); } };
	},
	content(){ return md.file(this.meta, "filter.md", { h1: false }); },
});
