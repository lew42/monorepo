import { Page, a, p, div, md } from "/app.js";

// The Inbox module's own page: the way into its timeline, then its readme.
export default new Page({
	meta: import.meta,
	title: "Inbox",
	icon: "inbox",
	children: "timeline",
	content(){
		p(() => a("Open the inbox timeline →").href(this.url + "timeline/"));
		div.c("flow").append(md.file({ url: import.meta.url }, "readme.md", { h1: false }));
	},
});
