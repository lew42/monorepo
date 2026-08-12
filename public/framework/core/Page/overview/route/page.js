import { Page, demo, md, div, a } from "/app.js";

const wiki = () => new Page({
	title: "Wiki",

	route(name){
		return ["html", "css", "js"].includes(name) && {
			title: name.toUpperCase(),
			content(){
				md("Nobody declared this page — `route()` built it the moment the url asked, and now it is remembered.");
			},
		};
	},

	content(){
		md("No `children:` at all, and these urls work anyway — `route()` sees **undeclared** names, after memory, before the filesystem:");

		div.c("flex gap", () => ["html", "css", "js"].forEach(name =>
			a.c("page-link", this.url + name + "/").href(this.url + name + "/")));
	},
});

export default new Page(demo.tree({
	meta: import.meta,
	group: "Basics",
	tree: wiki,
}));
