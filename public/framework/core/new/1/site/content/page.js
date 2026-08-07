import { Page, View, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, section } from "./show.js";
import { post, tagged } from "./posts.js";
import { tag_cloud } from "./list.js";

/* The loading edge for content.css. Router.load_segments walks root -> content ->
 * child, so this module is imported before ANY page in the section — which makes
 * it the one guaranteed place to load a stylesheet whose classes are emitted by
 * blog/, tags/, toc/, search/ and order/.
 *
 * css: .post-list .post .post-date .post-title .post-blurb .post-tag
 *      .toc-layout .toc .toc-link .order-nav .search-field .search-empty
 *      .content-peek .folded
 */
View.stylesheet(import.meta, "content.css");

/* Prose is written as ONE line per paragraph, on purpose. A wrapped template
 * literal indents its continuation lines, and marked reads a tab-indented line
 * as an indented code block — so a nicely formatted paragraph renders as grey
 * monospace with no error anywhere. Long lines, or dedent() on every string.
 */

// The recipes, with real titles. This IS a manifest — the same trick posts.js
// plays, applied to pages — and it has the flaw posts.js does not: the title is
// written twice, here and in the child's own page.js, with nothing to catch the
// drift. /content/index/ is about exactly that difference.
const recipes = [
	["article", "Content is a file",  "md.file() — a promise, placed by a synchronous container"],
	["blog",    "Dated entries",      "route() over a manifest — segments that are data"],
	["tags",    "The graph",          "many-to-many, and exactly what it costs"],
	["index",   "Index from data",    "the general escape from the lazy-title trap"],
	["toc",     "Headings",           "navigation INSIDE one document"],
	["order",   "Prev / next",        "an editorial sequence across directories"],
	["search",  "Search",             "possible at all only because content is data"],
	["book",    "A book",             "chapters as urls AND one long read"],
];

export default new Page({
	meta: import.meta,
	title: "Content-driven navigation",
	children: "article blog tags index toc order search book",

	content(){
		show(() => {
			// ONE article, THREE tags — and chain() walks exactly ONE parent.
			const article = post("2026-07-04-what-a-tree-cannot-say");

			article.tags;      // ["graph", "urls", "manifest"]
			tagged("graph");   // 4 posts, this one among them

			// So the article has two addresses, and therefore two Page objects:
			//   /content/blog/2026-07-04-what-a-tree-cannot-say/         canonical
			//   /content/tags/graph/2026-07-04-what-a-tree-cannot-say/   a second node
		}, "the graph problem");

		md("A page tree gives every node one `parent`. Tags are many-to-many, so a tree can hold them only by flattening the graph into **one node per path** — same words, two objects, two chains, one network request. What that costs, line by line, is on [/content/tags/](/content/tags/).");

		section("The recipes");

		div.c("post-list", () => recipes.forEach(([name, title, blurb]) =>
			a.c("post", () => {
				div.c("post-date", name + "/");
				div.c("post-title", title);
				div.c("post-blurb", blurb);
			}).href("/content/" + name + "/")));

		section("The same list, from the page tree");

		this.previews();

		md("`previews()` draws the *declared names*, because reading a real title would mean importing all eight modules — the trap this council keeps rediscovering. The list above reads properly because its titles came from **data**, and [/content/index/](/content/index/) is where that difference is measured.").ac("note");

		section("Tags");

		tag_cloud("/content/tags/");

		md("Six tags, counted with a `reduce` over a 60-line manifest. Zero imports, zero fetches, and every count is right before a single article has been opened.").ac("note");
	}
});
