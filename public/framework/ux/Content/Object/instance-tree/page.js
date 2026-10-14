import { Page, md, div, button } from "/app.js";
import InstanceTree from "../InstanceTree.js";

/** "InstanceTree" — the live instance hierarchy of this running site. Doc: ../doc/instance-tree.md */
export default new Page({
	meta: import.meta,
	title: "InstanceTree",
	description: "The running App and its pages as a live tree: class, title, children, the page you are on. Updates without a reload.",
	icon: "account_tree",

	content(){
		md("**This is the site's real instance tree, drawn from the live `App`.** Press the buttons: the tree follows with no reload. `view` on a row opens that instance's properties.");

		const page = this, app = this.app;
		let n = 0;

		div.c("flex gap", () => {
			button("add a child page").click(() => { n++; page.add(`demo-${n}`, { title: `Demo ${n}` }); });
			button("rename this page").click(() => {
				const title = `InstanceTree ${++n}`;
				page.title = title;                       // a config title is a plain own property: silent,
				page.emit("change", "title", title);      // so announce it the way Item.set() does
			});
		});

		new InstanceTree({ app });

		md.details(import.meta, "../doc/instance-tree.md", "How this works");
	},
});
