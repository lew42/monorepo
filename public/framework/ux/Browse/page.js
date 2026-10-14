import { Page, a, p, div, md } from "/app.js";

// Browse's own page: the class architecture first, then the readme. The live Browse is the AI Inbox.
export default new Page({
	meta: import.meta,
	title: "Browse",
	icon: "view_sidebar",
	description: "One list-and-detail view: a resizable list on the left, the row you clicked on the right.",
	content(){
		p(() => a("See it live: the AI Inbox →").href("/framework/ai/"));
		div.c("flow").append(md.file({ url: import.meta.url }, "doc/architecture.md", { h1: false }));
		div.c("flow").append(md.file({ url: import.meta.url }, "readme.md", { h1: false }));
	},
});
