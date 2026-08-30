/**
 * THE MANIFEST — the one place a post's title, date and description are written.
 *
 * Both the index and the post itself read from here (a post's page.js looks itself
 * up by its directory name), so a card and a page can never disagree — and `meta.mjs`
 * stamps the same three strings into each post's static `index.html`.
 *
 * ⚠ Data only, on purpose: the index must be able to LIST every post without
 *   importing five page modules and running their side effects. Same reason the
 *   homepage keeps `sections` as plain objects rather than `children`.
 *
 * Adding a post:
 *   1. one entry here      2. <slug>/page.js (two lines)      3. <slug>/*.md
 *   4. `node public/blog/meta.mjs --write` to stamp the meta shell
 */
// The one absolute origin. Only the static `index.html` files need it (og:url and
// canonical must be absolute); nothing in the app reads it.
export const site = "https://lew42.com";

export const posts = [
	{
		slug: "how-this-blog-works",
		title: "How this blog works",
		date: "2026-08-30",
		description: "A static index.html for the crawlers, the same url booting the app for you, and a reading page that stops wasting an ultrawide.",
		image: "/assets/img/favicon.png",

		// A MULTI-PART POST: `<file stem>: "<Part title>"`, in reading order.
		// Each part is a real Page at /blog/<slug>/<stem>/ rendering <stem>.md.
		parts: {
			"meta-tags": "Meta tags that actually work",
			"reading-page": "The un-centered reading page",
		},
	},
];

// Newest first. Sorted rather than hand-ordered, so appending an entry is enough.
export function listed(){
	return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

// One post, by directory name. `Post` calls this with its own url segment.
export function post(slug){
	return posts.find(p => p.slug === slug);
}

// "2026-08-30" -> "30 Aug 2026". A date is a string here, never a Date: `new
// Date("2026-08-30")` is UTC midnight, which is the day BEFORE in every American
// timezone, and the byline would be off by one for half the world.
export function dated(date){
	const [y, m, d] = date.split("-");
	return `${+d} ${"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[+m - 1]} ${y}`;
}

export default posts;
