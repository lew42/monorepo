import { Page, div, a } from "/app.js";
import md from "/framework/ext/markdown/md.js";
import { show, raw, folded, section } from "../show.js";
import { posts, chronological, tags } from "../posts.js";
import { post_list } from "../list.js";

/* An index built from CONTENT, not from files — and the reason it matters far
 * beyond this page: it is the general escape from the lazy-title problem that
 * every other seat in this council has hit from the page-tree side.
 */
export default new Page({
	meta: import.meta,
	title: "An index built from data",

	content(){
		show(() => {
			// THE TRAP, three costumes, one sentence.
			this.previews();          // draws url segments — importing 8 pages for 8 strings
			this.tabs("a b c");       // labels tabs with declared NAMES, for the same reason
			// site/app.js's sidebar: hand-typed, with a comment explaining why

			// THE ESCAPE. One import, and every title is already here.
			chronological().map(p => p.title);
		}, "the lazy-title problem, and the way out");

		md("A **page's** title lives inside the page, so an index of pages must import every one of them to read it. A **post's** title lives in a manifest, so an index of posts imports one module. That is the entire difference, and it is not a trick — it is the observation that content is data with a body attached, and data can be read without being run.");

		section("The manifest");

		show(() => {
			const posts = [
				{
					slug:  "2026-08-03-the-capture-boundary",
					date:  "2026-08-03",
					title: "The capture boundary",
					blurb: "Every content page fetches something…",
					tags:  ["capture", "async", "lazy"],
				},
			];
		}, "posts.js — one record");

		md("No imports, no framework, no `Page`. Just an array, which means it can be read, sorted, filtered, counted and searched by anything, at any time, for the price of one module fetch.");

		section("What it buys, at zero extra cost");

		md([
			"| you want | you write | fetches |",
			"| --- | --- | --- |",
			"| reverse-chronological index | `chronological()` | 0 |",
			"| a tag cloud with counts | `tags()` | 0 |",
			"| articles in a tag | `tagged(tag)` | 0 |",
			"| prev / next | `neighbors(url)` | 0 |",
			"| search over titles and tags | `posts.filter(…)` | 0 |",
			"| the article body | `md.file(meta, body(slug))` | 1, on demand |",
		].join("\n"));

		md("Only the last row costs anything, and the last row is the only thing that is actually large. This manifest is about two kilobytes; the seven bodies it describes are roughly thirty.").ac("note");

		section("Proof — this index, drawn now");

		post_list(chronological(), "/content/blog/");

		md(`**${posts.length} entries, ${tags().length} tags, every title real** — and not one page module has been imported to build it. Compare the preview cards on [/content/](/content/), which show \`article\`, \`blog\`, \`tags\` because they refuse to import eight modules for eight strings.`).ac("note");

		section("The trade, stated plainly");

		md("Two sources of truth, hand-maintained, no build step. A `.md` with no manifest entry is **invisible** — nothing crawls the filesystem, and on static hosting nothing can. A manifest entry with no file renders `Error loading …` in red. Both failures are loud, which is the best you get without a generator.");

		md("A build step reading front matter would remove the drift, and would also be the first build step in a repository whose defining constraint is not having one. Six lines of hand-written front-matter parsing would too, at the cost of a second format nobody validates. **The manifest is the cheaper honest option**; it is one line per post in one file.").ac("note");

		section("The rule");

		md("> If the thing you are indexing is **content**, put its metadata in data and the lazy-title problem disappears entirely.\n>\n> If it is **code**, accept the lazy title — the alternative is importing the site to draw a list.");

		md("The recipe list on [/content/](/content/) is the awkward middle case: a manifest *of pages*, which reads properly and duplicates each title, with nothing to catch the drift. Content escapes that because the manifest is the title's only home. Pages do not, because a page already has one.").ac("note");

		folded("content/index/page.js, verbatim", () => raw(import.meta, "page.js"));

		folded("posts.js, verbatim", () => raw(import.meta, "../posts.js"));
	}
});
