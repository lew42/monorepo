import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, raw, folded, section } from "../show.js";
import { chronological, post, body, around } from "../posts.js";
import { post_list, tag_links, crumbs, order_nav } from "../list.js";

export default new Page({
	meta: import.meta,
	title: "Blog",

	/* ONE post is declared, and therefore file-backed: `child()` reads the map,
	 * finds `null`, and imports 2026-04-02-…/page.js. Every other slug is never
	 * declared, so it falls through to route() below.
	 *
	 * That is the whole "manifest by default, a file when a post earns one"
	 * story, and it needs no flag — `route()` runs after the DECLARATION, so a
	 * declared name structurally cannot be shadowed by a dynamic one.
	 */
	children: "2026-04-02-a-post-that-outgrew-markdown",

	// A url with no file behind it. `name` is the slug from the address bar; the
	// manifest turns it into a title, and the title is available BEFORE the body
	// is fetched — which is why document.title is right on the first paint.
	route(name){
		const entry = post(name);

		return entry && {
			title: entry.title,
			content(){
				crumbs(this);
				div.c("post-meta", entry.date);
				div.c("article-body", md.file(import.meta, body(entry.slug), { h1: false }));
				section("Tags");
				tag_links(entry.tags, "/content/tags/");
				section("Older / newer");
				div.c("order-nav", () => around(entry.slug).forEach((neighbour, i) =>
					neighbour
						? a.c("page-link", (i ? "Newer → " : "← Older ") + neighbour.title).href("/content/blog/" + neighbour.slug + "/")
						: div.c("order-end", i ? "newest" : "oldest")));

				// …and, if this post happens to sit in the editorial sequence, that
				// bar too. Two orders, both real, neither derived from the tree.
				order_nav(this.url);
			},
		};
	},

	content(){
		show(() => {
			// /content/blog/2026-08-03-the-capture-boundary/ — five segments, and
			// three of them are a database row spelled with hyphens.
			const blog = new Page({
				meta: import.meta,
				title: "Blog",
				children: "2026-04-02-a-post-that-outgrew-markdown",   // one real directory
				route(name){                                          // …everything else
					const entry = post(name);
					return entry && { title: entry.title, content(){ return md.file(import.meta, body(name), { h1: false }); } };
				},
			});
		}, "content/blog/page.js — the routing half");

		md("`child(name)` reads `children` **first**: a declared name is imported, an undeclared one is offered to `route()`. So a post that outgrows markdown gets a real directory by adding its slug to `children`, and nothing else in the file changes. Declaration is the switch.");

		section("The index");

		post_list(chronological(), "/content/blog/");

		md("Seven entries, seven titles, seven dates, seven blurbs — from **one** module. No page in this list has been imported, and none of them needs to be until you click.").ac("note");

		section("What each shape costs");

		md([
			"| shape | directories | modules to draw this index | index has real titles |",
			"| --- | --- | --- | --- |",
			"| a directory per post | 7 | 7 (one import per post) | only if you import them |",
			"| `route()` over a manifest | 0 | 1 (`posts.js`) | yes |",
			"| both, as here | 1 | 1 | yes |",
		].join("\n"));

		md("The measured cost of this page cold: `/page.js`, `/content/page.js`, `/content/blog/page.js`, `posts.js` — **four modules**, and it stays four whether the manifest holds six posts or six hundred. Opening one post adds exactly one `.md`.").ac("note");

		folded("content/blog/page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});
