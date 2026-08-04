/* THE MANIFEST — the whole point of this section.
 *
 * Every other index on this site is built by importing pages and reading their
 * titles, which is exactly what laziness exists to avoid: `previews()` prints a
 * url segment because it refuses to import six modules for six strings, and the
 * tab bar prints declared names for the same reason. Both are paying for the
 * fact that a page's title lives INSIDE the page.
 *
 * Content doesn't have that problem, because content has a manifest. This module
 * is 60 lines of data and no imports. Reading it costs one module — not one per
 * entry — and it carries titles, dates, blurbs and tags, so an index, a tag
 * cloud, a prev/next and a search box are all just array methods over it.
 *
 * The body is the only thing that stays lazy, and the body is the only thing
 * that is actually big.
 */

export const posts = [
	{
		slug:  "2026-08-03-the-capture-boundary",
		date:  "2026-08-03",
		title: "The capture boundary",
		blurb: "Every content page fetches something, and every fetch lands on the wrong side of View.captor unless you place the container first.",
		tags:  ["capture", "async", "lazy"],
	},
	{
		slug:  "2026-07-22-the-manifest-is-the-index",
		date:  "2026-07-22",
		title: "The manifest is the index",
		blurb: "A page's title lives inside the page, so an index of pages must import them all. A post's title lives in a manifest, so an index of posts imports one module.",
		tags:  ["manifest", "lazy", "graph"],
	},
	{
		slug:  "2026-07-04-what-a-tree-cannot-say",
		date:  "2026-07-04",
		title: "What a tree cannot say",
		blurb: "An article in three tags is a graph. chain() walks one parent. Here is what breaks, and what it costs to build it anyway.",
		tags:  ["graph", "urls", "manifest"],
	},
	{
		slug:  "2026-06-18-dates-are-data",
		date:  "2026-06-18",
		title: "Dates are data, not structure",
		blurb: "/blog/2026-08-03-something/ has four segments of pure data. route() claims all of them for the price of zero directories.",
		tags:  ["urls", "manifest", "lazy"],
	},
	{
		slug:  "2026-05-30-one-fetch-two-urls",
		date:  "2026-05-30",
		title: "One fetch, two urls",
		blurb: "The same article reachable at two paths needs two Page instances and exactly one network request. md.cache is why.",
		tags:  ["graph", "capture", "urls"],
	},
	{
		slug:  "2026-05-11-reading-order-is-editorial",
		date:  "2026-05-11",
		title: "Reading order is editorial",
		blurb: "children is ordered within one parent. A reading order crosses parents, so it is a list, and a list is data.",
		tags:  ["urls", "graph", "async"],
	},
	{
		/* The one post with a real directory behind it. Its slug is DECLARED in
		 * blog/page.js's `children`, so child() imports a module instead of
		 * letting route() claim the name — the manifest still supplies its title
		 * and blurb for the index. Declaration is the switch; there is no flag. */
		slug:  "2026-04-02-a-post-that-outgrew-markdown",
		date:  "2026-04-02",
		title: "A post that outgrew markdown",
		blurb: "The escape hatch: one post gets a page.js, everything else stays in the manifest, and nothing branches.",
		tags:  ["lazy", "capture"],

		/* Its words are a MODULE, not a file — and that is not a detail, it is a
		 * constraint. A tag can build a second node for an article by fetching the
		 * same `.md` twice; it cannot do that for a module, because a module lives
		 * at exactly one url and rendering it elsewhere means importing a page and
		 * re-parenting it. So this post has one home, appears in tag listings only
		 * as a link, and is skipped by the full-text index. Found by a 404. */
		module: true,
	},
];

/* Newest first. Sorting HERE and not at every call site is the same rule as
   "derive inside the class": two indexes that sort differently are two indexes
   that disagree. */
export function chronological(){
	return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function post(slug){
	return posts.find(p => p.slug === slug);
}

/* THE canonical url for a post, decided here and nowhere else.
 *
 * A tagged article is reachable at two paths, and the framework has no opinion
 * about which one is the real address — `parent` is whoever adopted this node,
 * which is a fact about the path, not about the article. So the author picks,
 * once, in the module that owns the article's identity. Every page that renders
 * a non-canonical copy asks this and says so on screen.
 */
export function canonical(slug){
	return `/content/blog/${slug}/`;
}

/* Where the words actually live. Absolute, not relative, because two different
 * modules render the same article — blog/page.js and tags/page.js — and a
 * relative path would resolve to two different files depending on which one
 * asked. md.file() still takes an import.meta; an absolute url simply ignores it.
 */
export function body(slug){
	return `/content/blog/${slug}.md`;
}

// the posts whose words are a file — the only ones a second url can render, and
// the only ones a full-text index can read
export function fetchable(){
	return posts.filter(p => !p.module);
}

// [older, newer] by date — the blog's own order, not the editorial one
export function around(slug){
	const list = chronological();
	const i = list.findIndex(p => p.slug === slug);

	return [list[i + 1] ?? null, list[i - 1] ?? null];
}

// every tag, with its count, most-used first — the whole tag cloud in one line
export function tags(){
	const counts = new Map();

	posts.forEach(p => p.tags.forEach(tag => counts.set(tag, (counts.get(tag) ?? 0) + 1)));

	return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

export function tagged(tag){
	return chronological().filter(p => p.tags.includes(tag));
}

/* THE EDITORIAL ORDER — the sequence the author wants you to read, which is not
 * the date order and not the directory order. It crosses directories, so no
 * `children` map can hold it: `children` is ordered within ONE parent.
 *
 * Urls, not slugs, because the sequence deliberately mixes blog posts with
 * ordinary pages. A reading order is about reading, not about where a file sits.
 */
export const reading = [
	{ url: "/content/article/",                                    title: "A page whose content is a file" },
	{ url: "/content/blog/2026-06-18-dates-are-data/",             title: "Dates are data, not structure" },
	{ url: "/content/blog/2026-07-22-the-manifest-is-the-index/",  title: "The manifest is the index" },
	{ url: "/content/tags/",                                       title: "Tags — the case the tree cannot express" },
	{ url: "/content/blog/2026-07-04-what-a-tree-cannot-say/",     title: "What a tree cannot say" },
	{ url: "/content/toc/",                                        title: "A table of contents from headings" },
	{ url: "/content/book/",                                       title: "A book that is also a page tree" },
];

// [previous, next] in the editorial order — null at either end
export function neighbors(url){
	const i = reading.findIndex(step => step.url === url);

	return i === -1 ? [null, null] : [reading[i - 1] ?? null, reading[i + 1] ?? null];
}
