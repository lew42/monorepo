/**
 * THE MANIFEST — the one place a section or a post's title and description are written.
 *
 * The front, the section index, the rail, the post itself and the static `index.html`
 * `meta.mjs` stamps all read from here, so a card, a page and a social preview can
 * never disagree. A `Post` and a `Section` look THEMSELVES up in it by the directory
 * they were imported from (`under_blog()` below).
 *
 * ⚠ Data only, on purpose: the front must be able to LIST every post without importing
 *   six post modules and running the markdown fetch in each. Same reason the homepage
 *   keeps `sections` as plain objects rather than `children`.
 *
 * ⚠ A post's directory may not exist yet — an entry here is what COMMISSIONS a post.
 *   Every reader of this file treats it as a list of links, so a half-written post is
 *   one card that 404s, never a broken front.
 *
 * Adding a post:
 *   1. one entry here    2. <section>/<slug>/page.js (two lines)    3. its .md files
 *   4. `node public/blog/meta.mjs --write` to stamp the meta shell
 */
// The one absolute origin. Only the static `index.html` files need it (og:url and
// canonical must be absolute); nothing in the app reads it.
export const site = "https://lew42.com";

/* THE SECTIONS — and a post's address is `<section>/<post>/` because of them.
 * A flat `/blog/<post>/` url has no ancestor, so a section could never light up as
 * `in-path` in the rail: the file structure IS the active state (/imagine/blogx). */
export const sections = [
	{
		name: "framework",
		title: "Framework",
		icon: "widgets",
		blurb: "The page system, the views, and the argument for no build step at all.",
	},
	{
		name: "systems",
		title: "Systems",
		icon: "handyman",
		blurb: "The machines built on top of the framework — generators, panels, playgrounds.",
	},
	{
		name: "ai",
		title: "AI",
		icon: "smart_toy",
		blurb: "The task board, the live logs, and how a model gets its hands on a real site.",
	},
];

export const posts = [
	{
		section: "framework",
		name: "hello-lew42",
		title: "Hello, lew42",
		date: "2026-08-30",
		description: "A web framework with no build step, and the site it builds. What a page is, what a view is, and why the whole thing fits in your head.",
		image: "/blog/framework/hello-lew42/no-build.png",

		// The front's lead post. One entry wears it; without it the newest is used.
		featured: true,
	},

	{
		section: "framework",
		name: "how-this-blog-works",
		title: "How this blog works",
		date: "2026-08-30",
		description: "A static index.html for the crawlers, the same url booting the app for you, and a reading page that stops wasting an ultrawide.",
		image: "/blog/framework/how-this-blog-works/lead.png",

		/* `lead: true` — this picture ALSO opens the post, in the exhibit track beside
		 * the title. Opt-in, because every other post's picture is one its own prose
		 * already shows in context, and drawing it again at the top is the same
		 * screenshot twice. See doc/meta-tags.md. */
		lead: true,

		// A MULTI-PART POST: `<file stem>: "<Part title>"`, in reading order.
		// Each part is a real Page at /blog/<section>/<slug>/<stem>/ rendering <stem>.md.
		parts: {
			"meta-tags": "Meta tags that actually work",
			"reading-page": "The un-centered reading page",
		},
	},

	{
		section: "systems",
		name: "layout-generators",
		title: "Generators: layouts and pages",
		date: "2026-08-26",
		description: "Two machines that draw pages — one searches a space of layouts against a rubric, the other redraws every stored seed the moment a rule changes.",
		image: "/blog/systems/layout-generators/space-ruler.png",
	},

	{
		section: "systems",
		name: "panel-playground",
		title: "Panel and Playground",
		date: "2026-08-22",
		description: "Two wireframing tools with different mechanisms — panel trees you drag, and a canvas where the data is the CSS.",
	},

	{
		section: "ai",
		name: "dashboard",
		title: "The AI dashboard",
		date: "2026-08-19",
		description: "Every task opens an append-only log before its first edit. The board reads those logs live over a socket, and never reloads a page.",
		image: "/blog/ai/dashboard/day-board.png",
	},

	{
		section: "ai",
		name: "claude-tooling",
		title: "MCP, Playwright, and skills",
		date: "2026-08-17",
		description: "Three ways to give a model hands on a real website, and the one rule that keeps all three honest.",
		image: "/blog/ai/claude-tooling/board.png",
	},
];

// ── addressing ───────────────────────────────────────────────────────────────
// One address per post, derived — so a url in the rail, on a card and in the
// generated index.html is the same string computed once.
export const slug = post => post.section + "/" + post.name;
export const url = post => "/blog/" + slug(post) + "/";
export const section_url = section => "/blog/" + section.name + "/";

/* A page's own segments under /blog/, from `import.meta` — `["framework"]` for a
 * section, `["framework", "hello-lew42"]` for a post. Both classes look themselves
 * up with it, which is what keeps a page.js down to two lines. */
export function under_blog(meta){
	return new URL(".", meta.url).pathname.split("/").filter(Boolean).slice(1);
}

// ── lookups ──────────────────────────────────────────────────────────────────
// Newest first. Sorted rather than hand-ordered, so appending an entry is enough.
export function listed(){
	return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export function of_section(name){ return listed().filter(post => post.section === name); }
export function section(name){ return sections.find(s => s.name === name); }
export function post(path){ return posts.find(p => slug(p) === path); }

/* The front's lead post, and everything else in date order beside it.
 * ⚠ `featured`, not `lead` — `lead: true` on an entry means something ELSE (draw the
 *   picture at the top of the post), and one word for two things is how a boolean
 *   ends up shadowing a method. */
export function featured(){ return posts.find(p => p.featured) ?? listed()[0]; }
export function rest(){ return listed().filter(p => p !== featured()); }

// "2026-08-30" -> "30 Aug 2026". A date is a string here, never a Date: `new
// Date("2026-08-30")` is UTC midnight, which is the day BEFORE in every American
// timezone, and the byline would be off by one for half the world.
export function dated(date){
	const [y, m, d] = date.split("-");
	return `${+d} ${"Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split(" ")[+m - 1]} ${y}`;
}

export default posts;
