import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, raw, folded, section } from "../show.js";
import { post, tagged, tags, canonical, body } from "../posts.js";
import { post_list, tag_links, tag_cloud, crumbs, order_nav } from "../list.js";

/* TAGS — the case a page tree cannot express.
 *
 * An article carries three tags; a tag lists several articles. That is a
 * many-to-many graph, and `chain()` walks exactly one `parent`. There is no
 * assignment of `parent` that is true at both urls, so the graph is flattened:
 * ONE NODE PER PATH. Same words, two Page objects, two views, one fetch.
 *
 * Both levels of route() live here, and reading them top to bottom is the whole
 * design: a tag claims its own name, and then claims the articles under it.
 */
export default new Page({
	meta: import.meta,
	title: "Tags",

	// /content/tags/<tag>/ — no directory, no page.js, no declaration.
	route(name){
		const list = tagged(name);

		return list.length && {
			title: `#${name}`,

			// /content/tags/<tag>/<slug>/ — the SECOND node for an article that
			// already exists under /content/blog/. Guarded by the tag, so
			// /content/tags/graph/<an-untagged-post>/ is a 404 rather than a
			// second copy reachable from a tag it does not belong to.
			/* `!entry.module` is the constraint a 404 taught us: a second node
			 * re-fetches the same `.md`, and a post whose words are a page.js has
			 * no `.md` to re-fetch. Content that is DATA can live at two urls;
			 * content that is CODE lives at one. */
			route(slug){
				const entry = post(slug);

				return entry?.tags.includes(name) && !entry.module && {
					title: entry.title,
					content(){ return article(this, entry, name); },
				};
			},

			content(){
				crumbs(this);

				section("Inside this tag");

				post_list(list.filter(p => !p.module), `/content/tags/${name}/`);

				md(`These link to \`/content/tags/${name}/<slug>/\` — a **second node** per article, with this tag as its parent. Breadcrumbs read \`Tags › #${name} › …\`, and prev/next below each article walks this tag rather than the calendar.`).ac("note");

				if (list.some(p => p.module))
					md(`One post in this tag is **missing from that list**: its words are a \`page.js\`, not a \`.md\`, so there is nothing for a second node to re-fetch. A tag can duplicate data; it cannot duplicate a module. It appears below, at its one and only url.`).ac("note");

				section("The same articles, canonical");

				div.c("row", () => list.forEach(entry =>
					a.c("page-link", entry.title).href(canonical(entry.slug))));

				md("These link to `/content/blog/<slug>/` — one node, honest breadcrumbs, no duplication. **Reach for this shape by default.** Open the same article both ways and compare the crumbs; that difference is the entire cost of the other shape.").ac("note");
			},
		};
	},

	content(){
		show(() => {
			// TWO levels of route(), and neither has a directory behind it.
			const tags_page = new Page({
				meta: import.meta,
				title: "Tags",
				route(name){
					const list = tagged(name);
					return list.length && {
						title: `#${name}`,
						route(slug){                      // an article INSIDE a tag
							const entry = post(slug);
							return entry?.tags.includes(name) && { title: entry.title, content(){ /* … */ } };
						},
						content(){ /* the list */ },
					};
				},
			});
		}, "content/tags/page.js — the routing, whole");

		md("`route()` is called for any name that was never declared, and the page it returns is an ordinary `Page` — so it can define a `route()` of its own. Two levels, no registration, and `/content/tags/graph/2026-07-04-what-a-tree-cannot-say/` is a real url with nothing on disk behind it.");

		section("The tags");

		tag_cloud("/content/tags/");

		section("What a tree cannot say");

		md("Ask the concrete question — *what is `parent` for an article reachable at both `/blog/x/` and `/tags/graph/x/`?* — and every answer is wrong differently:");

		md([
			"| answer | what breaks |",
			"| --- | --- |",
			"| the blog page | breadcrumbs at the tag url say `content › blog › x`, which is a lie about the url on screen |",
			"| the tag page | the same lie, mirrored onto the canonical url |",
			"| whoever adopted last | `add()` assigns `parent` unconditionally, so the second adoption silently rewrites the first — two urls that are each correct alone and wrong in sequence |",
		].join("\n"));

		md("The third is the one that happens **by accident**, the moment you reuse the instance instead of building a second one. It is not an error; nothing warns.").ac("note");

		section("So: one node per path");

		md([
			"| what | what it costs |",
			"| --- | --- |",
			"| identity | `blog_copy !== tag_copy`. Anything comparing pages by reference sees two articles. |",
			"| `parent` | means *\"my parent on the path you arrived by\"*, not *\"who owns this article\"*. |",
			"| `chain()` | correct — for the path taken. There is no way to ask for the other one. |",
			"| `.in-path` | marks the path you took. `/content/blog/` stays dark while you read the tag copy. |",
			"| `.active-ancestor` | likewise: the blog page is not an ancestor of the tag copy, because it isn't. |",
			"| DOM | two `view`s, both built, both retained — `render()` memoises per instance. |",
			"| canonical | undecidable by the framework. `posts.js` picks; every non-canonical copy says so on screen. |",
			"| network | **one** fetch. `md.cache` is keyed by resolved href, not by page. |",
			"| what can be duplicated | only content that is **data**. A post whose body is a `page.js` has one url and no second node. |",
		].join("\n"));

		md("The last row is why this is survivable at all: the duplication is structural, not transferred over the wire.").ac("note");

		section("The alternative that was not built");

		show(() => {
			// PROPOSED — not implemented, and not proposed lightly.
			const page = new Page({ url: "/content/blog/x/", also: ["/content/tags/graph/x/"] });

			page.chain();                            // ← which chain? there are two now
			page.chain("/content/tags/graph/x/");    // the shape it would have to become
		}, "one page, several urls");

		md("It needs `Router.load_segments` to resolve a second address onto an existing node, and it needs `chain()` to take the path as an argument — because with two addresses there is no longer *a* chain, there is a chain *per url*. `chain()` is the method every layout in the framework calls. **Dissent recorded: do not build this for tags.** Build it if and when a second feature wants it.");

		order_nav(this.url);

		folded("content/tags/page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});

/* The article, as rendered by a TAG. Deliberately not shared with blog/page.js's
 * version: the two differ in exactly the ways the graph costs — a canonical
 * banner, and prev/next that walks the tag instead of the calendar. Sharing them
 * would hide the difference this whole page exists to show.
 */
function article(page, entry, tag){
	const list = tagged(tag);
	const i = list.findIndex(p => p.slug === entry.slug);

	crumbs(page);

	md(`**A second node.** You are reading this article under [#${tag}](/content/tags/${tag}/) — a different \`Page\` object from the one at its canonical url, with a different \`parent\` and its own \`view\`. Canonical: [${canonical(entry.slug)}](${canonical(entry.slug)}).`).ac("canonical");

	div.c("post-meta", entry.date);
	div.c("article-body", md.file(import.meta, body(entry.slug), { h1: false }));

	section(`More in #${tag}`);

	div.c("order-nav", () => [list[i - 1], list[i + 1]].forEach((neighbour, side) =>
		neighbour
			? a.c("page-link", (side ? "Older → " : "← Newer ") + neighbour.title).href(`/content/tags/${tag}/${neighbour.slug}/`)
			: div.c("order-end", side ? "end of tag" : "start of tag")));

	section("Its other tags");

	tag_links(entry.tags.filter(t => t !== tag), "/content/tags/");
}
