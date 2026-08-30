import { Page, Sidebar, div, a, span, p } from "/app.js";
import { sections, of_section, section_url, url, featured, rest } from "./posts.js";
import { Post } from "./Post.js";

/* THE RAIL — the site's own Sidebar with ONE seam reopened: a group title is a LINK.
 *
 * A blog rail has two levels, sections over posts, and the whole reason a post lives
 * at `<section>/<post>/` is that the section is then a real ancestor of it — so
 * `Router.mark_links()` stamps `.active` on the post you are on and `.in-path` on the
 * section containing it, both DERIVED from the address bar and unable to disagree
 * with it (/imagine/blogx measured this as the right default under ~40 posts).
 * A caption cannot carry `in-path`, so the section has to be an anchor.
 *
 * ⚠ No subclass CSS to write: `View.classify()` walks the constructor chain, so this
 *   wears `.blog-nav.sidebar` and inherits every Sidebar rule — including the burger
 *   the whole site gets below 52em. */
class BlogNav extends Sidebar {

	group(group){
		if (!group.url) return super.group(group);

		return div.c("sidebar-group", () => {
			a.c("sidebar-group-title blog-nav-section").href(group.url).append(() => span.c("h4", group.title));
			group.pages.forEach(page => this.link(page));
		});
	}
}

/**
 * THE BLOG — one shell for the whole section, and everything else is a page in it.
 *
 * The rail and the region are built ONCE, here, and `$pages` is mine — so a section
 * index and a post mount inside this view and the rail beside them never moves. The
 * same shape `/framework/` uses; `hides-nav` because a second site strip over a rail
 * that already says where you are is two navigations to resolve.
 *
 * The front itself is the MAGAZINE: the lead, then every other post as a card, then a
 * rail of topics. At 3440 that is the whole archive above the fold, and the extra
 * width of a wide monitor buys MORE POSTS rather than a wider paragraph — the finding
 * eight candidate shells were built to test (/imagine/blogx/readme.md).
 *
 * doc/structure.md · doc/reading-page.md · doc/meta-tags.md
 */
export default new Page({
	meta: import.meta,
	title: "Blog",
	description: "Notes on building a web framework with no build step.",

	// Inert: /styles.css decides what it means, and Router.mark() unsets it.
	classes: "hides-nav",

	/* The three sections and the notes — a post is NOT declared, and that is the
	 * design: a declared child is imported eagerly, so declaring six posts would run
	 * six modules and their markdown fetches just to print six titles. `Page.child()`
	 * probes the filesystem for an undeclared name, so every post url still cold-loads;
	 * `posts.js` is what LINKS them, which is the half that matters. */
	children: "framework systems ai doc",

	/* A LAYOUT, not a content page. The three things an override owes (core/Page):
	 * set `this.view`, carry `.page`, never nest a second `.page` inside. */
	render(){
		return this.view ??= div.c("page topic flex fill blog-shell", () => {

			this.$nav = new BlogNav({
				app: this.app,
				header: () => this.app.brand(this.title, this.url),
				pages: this.rail(),
			});

			// My children mount HERE, so the rail beside them never moves.
			this.$pages = div.c("pages", () => {

				/* ⚠ `default` alone, and the magazine is the box INSIDE it. A display
				 *   utility on this box would win by layer over `.pages > .default {
				 *   display: none }` and the front would stay on screen underneath every
				 *   section and post. The contract in `@layer util` only covers `.page`
				 *   elements; a plain default block is hidden from `theme`. */
				div.c("default", () => this.front());
			});
		}).ac(this.classes);
	},

	// sections over posts, each section a link — see BlogNav above.
	rail(){
		return sections.map(section => ({
			title: section.title,
			url: section_url(section),
			pages: of_section(section.name).map(post => ({ label: post.title, url: url(post) })),
		}));
	},

	/* THE MAGAZINE. Two regions: the lead and the wall in one column, the topics rail
	 * beside them. `:has(> .rail)` (Page.css) makes THIS box the query container, so
	 * every breakpoint inside the front measures the row and not the window — which at
	 * 3440 is the window minus a 19em rail, and at 1280 is most of it. */
	front(){
		return div.c("flex gap wrap blog-front", () => {

			div.c("flex-1 blog-magazine", () => {
				Post.hero(featured());
				Post.wall(rest());
			});

			this.topics();
		});
	},

	/* The right edge, and every line in it is a link to something that exists — no
	 * `#about` anchors, which resolve to the page you are ON and would be marked
	 * `.active` on every screen (the one thing eight shell candidates all got wrong). */
	topics(){
		return div.c("rail blog-topics", () => {

			div.c("blog-rail-group", () => {
				span.c("blog-rail-title h4", "Topics");

				div.c("blog-chips", () => sections.forEach(section =>
					a.c("blog-chip", section.title + " " + of_section(section.name).length).href(section_url(section))));
			});

			div.c("blog-rail-group", () => {
				span.c("blog-rail-title h4", "About");

				p.c("blog-note", "One person, one framework, no build step. Every page here runs in the browser exactly as it is written — open the dev tools and the file you see is the file on disk.");

				a.c("blog-more-link", "The framework").href("/framework/");
				a.c("blog-more-link", "Résumé").href("/resume/");
				a.c("blog-more-link", "How this blog is built").href("/blog/doc/");
			});
		});
	},
});
