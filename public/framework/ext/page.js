import { Page, md, pre } from "/app.js";
import markdown from "./markdown/page.js";
import demo from "./demo/page.js";
import syntax from "./syntax/page.js";

export default new Page({
	meta: import.meta,
	title: "Ext",
	description: "Opt-in addons. They may extend core; core never depends on them.",
	col: "narrow",
	children: [markdown, demo, syntax],
	content(){

		pre(`import md from "/framework/ext/markdown/md.js";`);

		md("Opting in is an import. Nothing else.");

		this.previews();

		md("Addons are allowed to do what core won't: patch `View`, bring a vendored dependency, ship their own CSS. Two rules — **core never imports an ext**, and **vendor the dependency** (a CDN import would make every render wait on someone else's uptime).");

		md("This site opts in for every page, once, in `app.js` — which is why `md()` and `demo()` come straight from `/app.js` here.");
	}
});
