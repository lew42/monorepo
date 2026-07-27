import { Page, p } from "/app.js";
import markdown from "./markdown/page.js";

export default new Page({
	meta: import.meta,
	title: "Ext",
	description: "Opt-in addons. They may extend core; nothing loads them by default.",
	children: [markdown],
	content(){
		p("`core/` has the classes, `dev/` the local tooling, `util/` the helpers. `ext/` is the fourth tier: **opt-in addons**, free to patch core — `md.js` installs `View.prototype.md()`, which is exactly the kind of thing core shouldn't do to itself.");
		p("Nothing in `app.js` imports an ext — a page opts in by importing the module directly. So `/michael/`, `/alex/` and every other page outside this branch never load a markdown parser. Inside it they do: a `Page` imports its children to build the sidebar, so the framework docs tree reaches this topic and pulls `md.js` with it. Opting in is per-tree, not per-page.");
		p("The other rule for this tier: **vendor the dependency**. `marked.esm.js` sits next to `md.js` rather than being imported from a CDN — the site's premise is files served as-is, and a CDN import would make every render wait on someone else's uptime.");
		this.previews();
	}
});
