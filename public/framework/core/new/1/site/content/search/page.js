import { Page, div, input, button } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, run, raw, folded, section } from "../show.js";
import { posts, body, fetchable } from "../posts.js";
import { post_list } from "../list.js";

// slug -> the rendered text of that article. Empty until the reader asks, because
// filling it is the one expensive thing on this page.
const full = new Map();

const matches = (post, q) =>
	[post.title, post.blurb, post.date, ...post.tags].join(" ").toLowerCase().includes(q)
	|| (full.get(post.slug) ?? "").includes(q);

/* The expensive half, opt-in.
 *
 * fetchable(), not posts: one post's words are a page.js, and a module cannot be
 * fetched as text — indexing it produced a silent 404, which is how the
 * data/code asymmetry was found. md.file caches by resolved href, so an article
 * the reader has already opened costs nothing here, and textContent rather than
 * the raw markdown means search matches what is on screen, not the syntax.
 */
async function index(){
	await Promise.all(fetchable().map(async post => {
		const doc = await md.file(import.meta, body(post.slug), { h1: false });
		full.set(post.slug, doc.el.textContent.toLowerCase());
	}));

	return full.size;
}

export default new Page({
	meta: import.meta,
	title: "Search over content you actually have",

	content(){
		run(() => {
			let $field, $hits, $note;

			const find = query => {
				const q = query.trim().toLowerCase();
				const hits = q ? posts.filter(post => matches(post, q)) : posts;

				$hits.empty(() => post_list(hits, "/content/blog/"));
				$note.text(`${hits.length} of ${posts.length}${full.size ? " · full text" : " · titles, blurbs, dates and tags"}`);
			};

			div.c("search-box", () => {
				$field = input.c("search-field").attr("type", "search")
					.attr("placeholder", "capture · manifest · 2026-07 · graph …")
					.on("input", e => find(e.target.value));

				button("Index the full text").click(async function(){
					this.text("indexing…");
					this.text(`full text: ${await index()} of ${posts.length} indexed`);
					find($field.el.value);
				});
			});

			$note = div.c("note");
			$hits = div.c("search-hits");

			find("");
		}, "content/search/page.js — and it is running below");

		md("Search over a page tree can only offer what has already been imported — the command-palette version of the same wall the sidebar, `previews()` and the tab bar all hit. Search over **content** has no such limit, because the manifest is data and the data is already here.");

		section("Two tiers, and what each costs");

		md([
			"| tier | source | fetches | ready |",
			"| --- | --- | --- | --- |",
			"| titles, blurbs, dates, tags | `posts.js` | 0 (already loaded) | instantly |",
			"| full text | every `.md` | one per **file-backed** article, once | on request |",
			"| a page-tree palette | every `page.js` | one per page, and it defeats laziness | never, honestly |",
		].join("\n"));

		md("The button is the honest version of the second row: opt-in because it costs real requests, it says so, and articles you have already read are free — `md.file` caches by resolved href, so indexing after reading three posts fetches three files, not six.").ac("note");

		md("It indexes **six of seven**. The seventh post's words are a `page.js`, and a module cannot be fetched as text — the first version of this button tried, and produced a silent 404 in the console. That asymmetry is the one tags hit too: data can be read twice, code cannot.").ac("note");

		section("What is NOT indexed");

		md("Everything that is a page rather than a post: this page, `/content/tags/`, `/content/toc/`, the recipes. Their titles live inside their modules, so indexing them means importing them. **Search is a content feature, not a navigation feature** — a site that wants both has to write the page half by hand.");

		show(async root => {
			// what a page-tree palette would cost, written out honestly
			const everything = await Promise.all(
				[...root.children.keys()].map(name => root.child(name)));   // imports the site

			everything.map(page => page.title);   // …to read N strings
		}, "the version nobody should ship");

		folded("content/search/page.js, verbatim", () => raw(import.meta, "page.js"));
	}
});
