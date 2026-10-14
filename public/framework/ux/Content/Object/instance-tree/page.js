import { Page, md, div, h3, button, p } from "/app.js";
import InstanceTree from "../InstanceTree.js";

/** "InstanceTree" — the live instance hierarchy of this running site, beside a demo that changes it. Doc: ../doc/instance-tree.md */
export default new Page({
	meta: import.meta,
	title: "InstanceTree",
	description: "The running App and its pages as a live tree: class, title, children, the page you are on. Updates without a reload.",
	icon: "account_tree",

	content(){
		md("**This is the site's real instance tree, drawn from the live `App`.** Press a button on the left: the tree on the right follows with no reload. `view` on a row opens that instance's properties.");

		const page = this, app = this.app;
		let n = 0;

		// "Show the class": the rendered demo on the left, the live instance on the right (CLAUDE.md).
		div.c("cols half", () => {
			div(() => {
				h3("The demo");
				div.c("flex gap", $b => {
					$b.style({ flexWrap: "wrap" });   // the buttons wrap as a whole, never their words
					button("add a child page").click(() => { n++; page.add(`demo-${n}`, { title: `Demo ${n}` }); }).style({ whiteSpace: "nowrap" });
					button("rename this page").click(() => {
						const title = `InstanceTree ${++n}`;
						page.title = title;                       // a config title is a plain own property: silent,
						page.emit("change", "title", title);      // so announce it the way Item.set() does
					});
				});
				p("Each press changes the real Page instance this screen is. Its new children show under the highlighted row.");
			});
			div(() => {
				h3("The live instance");
				new InstanceTree({ app });
			});
		});

		md.details(import.meta, "../doc/instance-tree.md", "How this works");
	},
});
