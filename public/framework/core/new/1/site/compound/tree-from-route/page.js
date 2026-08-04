import { Page, p, div, a } from "/app.js";
import { section } from "../../ui.js";
import { this_file, when, cost } from "../recipe.js";

/* Data, not files. Every url below this page is claimed at the moment it is
 * asked for, at any depth, from this one object. */
const tree = {
	framework: { note: "The framework tier.", children: {
		core: { note: "App, Page, Router. Three classes.", children: {
			Page: { note: "A node: url, content, children." },
			Router: { note: "url → page, the chain diff, two classes." },
		} },
		ext: { note: "Opt-in addons. Core never imports one.", children: {
			markdown: { note: "Installs View.prototype.md()." },
			highlight: { note: "Enhances the code factory in place." },
		} },
	} },
	site: { note: "The pages this framework serves.", children: {
		compound: { note: "Ten recipes, and you are inside one of them." },
	} },
};

/* One function, called recursively. A node's page is its note, its children as
 * links, and a route() that can make the next one — so the tree is as deep as
 * the data and nothing on disk grows with it. */
function node(name, data){
	return {
		title: name,

		content(){
			p(data.note);

			if (data.children)
				div.c("row", () => Object.keys(data.children).forEach(key =>
					a.c("page-link", key + " →").href(this.url + key + "/")));
			else
				p("A leaf: my `route()` returns nothing, so anything deeper is a real 404 rather than a blank column.").ac("note");
		},

		route(key){
			const child = data.children?.[key];
			return child && node(key, child);
		},
	};
}

export default new Page({
	meta: import.meta,
	title: "Tree from route()",

	route(key){ return tree[key] && node(key, tree[key]); },

	content(){
		when("the hierarchy lives in data rather than in files — a bucket listing, an org chart, a JSON document, a database of categories.");

		div.c("row", () => Object.keys(tree).forEach(key =>
			a.c("page-link", key + " →").href(this.url + key + "/")));

		// My own content stays ABOVE the grid rather than taking a column of it —
		// at three levels deep, a fourth track would squeeze every one of them.
		this.$pages = div.c("pages cols");

		section("Two mechanisms, no wiring");

		p("`route()` claims the segment; `container()` walks past the synthetic parent — which claimed nothing — to my `$pages`. So every level lands as another equal column, and the tree browses like a Finder window.");

		p("Measured: `/compound/tree-from-route/framework/core/Page/` cold costs three module imports — the root, `/compound/`, and this file. Depth is free, because a synthetic page is an object rather than a download.").ac("note");

		section("The file");

		this_file(import.meta);

		cost("these pages are real and permanent — `add()` puts every claimed node in the children map, so browsing a large tree grows it. Fine for a menu, wrong for ten thousand rows; at that size the detail should be one page reading a query rather than one page per node.");
	}
});
