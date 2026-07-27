import { Page, p } from "/app.js";
import mvp from "./mvp/page.js";
import tree from "./tree/page.js";
import links from "./links/page.js";

export default new Page({
	meta: import.meta,
	title: "Page",
	description: "The dormant unit of content — and a node in a tree.",
	children: [mvp, tree, links],
	content(){
		p("`Page` is the one class you use for everything — `new Page(...)`, always. It's a titled, dormant unit of content, and a node in a tree. It knows nothing about routing or layout; those are opt-in (see Router and Pager).");
		p("Open a card to dig in — it becomes the column on the right:");
		this.previews();
	}
});
