import { Page, Sidebar, demo, md, h1, div, a, span, time, p } from "/app.js";
import { listed, url as post_url, dated } from "./blog/posts.js";

// Plain {title, url} data on purpose — declaring these as `children` would
// auto-import every section's tree (and its side effects) into the home page.
const sections = [
	{ title: "Blog", url: "/blog/", desc: "Working notes on the framework, the tools built on it, and the AI board that watches it get built." },
	{ title: "Framework", url: "/framework/", desc: "The docs — View, Page, Router, App, and the CSS layers." },
	{ title: "Web", url: "/web/", desc: "The guide — how to build things on the web, shown live." },
	{ title: "Résumé", url: "/resume/", desc: "Design engineer, 12+ years — and a 3D parallax scroll running underneath it." },

	// ⚠ Trailing slash is load-bearing: `/fly/` is a real index.html outside the SPA,
	// and the dev server's `express.static` won't redirect `/fly` onto it.
	{ title: "Fly", url: "/fly/", desc: "A three.js flight demo — drag to fly, space to boost." },
];

export default new Page({
	meta: import.meta,
	title: "lew42",
	description: "A web framework with no build step — and the site it builds.",

	// I bring my own sidebar, so the global nav would just say it twice.
	classes: "page-homepage hides-nav",

	/* Same layout as a topic: brand, sidebar, one region.
	 *
	 * Note what this deliberately does NOT do — assign `this.$pages`. The root is
	 * an ancestor of every url, so claiming a region would mount every section
	 * INSIDE this page and keep this sidebar on screen for the whole site, with
	 * each topic's own sidebar nested beside it. Children land in `app.$pages`
	 * instead, as siblings, so this page hides completely the moment you leave. */
	render(){
		return this.view ??= div.c("page topic flex fill", () => {

			// `sections` is already {title, url} — exactly what a Sidebar link
			// reads — so the site's nav and its cards come off one list.
			// `app`, so the footer can render the colour-scheme toggle.
			new Sidebar({
				app: this.app,
				header: () => this.app.brand("LEW42", "/"),
				pages: sections,
			});

			// bare `pages` — the region default IS the sheet now (Page.css)
			div.c("pages", () => {
				div.c("default", () => this.content());
			});
		}).ac(this.classes);
	},

	/* THE FRONT — four regions, laid out by /styles.css so that the thesis, the
	 * demo, the latest posts and the section nav are all above a 1000px fold at
	 * 400, 1920 and 3440. Which region may take a share of a wide screen and which
	 * gets a fixed track is core/Page/doc/findings.md: a nav LIST does not scale,
	 * everything else does.
	 *
	 * ⚠ The `h1` lives HERE, in the hero, not above `content()` — the brand is
	 *   already in the sidebar two inches to the left, so the biggest type on the
	 *   page says what this is instead of saying the name twice. */
	content(){
		div.c("home-front", () => {

			div.c("home-hero flow", () => {
				h1.c("page-title", "A web framework with no build step");

				md("Native ES modules, served exactly as written: you add a `page.js`, the browser runs it. This site is that framework documenting itself, so every example on it is live.");
			});

			this.stage();
			this.posts();
			this.cards();

			// The owner's line. Everything here is a real page; nothing is a stub.
			md.c("home-more", "Also here: [imagine](/imagine/) — a place built out of column pages, short working [notes](/notes/), and five personal sandboxes — [Alex](/alex/), [Arya](/arya/), [Castin](/castin/), [Edric](/edric/), [Michael](/michael/).");
		});
	},

	/* THE DEMO — the framework being itself, in one box. `demo()` prints the
	 * function it ran, so the code above the render is literally the code that
	 * built it; `demo.app()` plays App and Router for that one tree, so the rail,
	 * the crumbs and the cards are the real ones. Four pages, no build step, and
	 * the whole thing is on this page.
	 *
	 * ⚠ One demo, and it is not the Panel — `/framework/` opens with that one.
	 *
	 * ⚠ `urls: false` — the tree lives in memory, so `/web/html/` and its three siblings
	 *   are NAMES, not addresses. With real hrefs the four links worked on click (the box
	 *   intercepts them) and dead-ended on middle-click, open-in-new-tab and every crawler:
	 *   four 404s advertised from the site's highest-authority page. ext/demo/app.js hands
	 *   the address to `data-demo-url` instead.
	 *
	 * ⚠ Nothing explanatory goes INSIDE the `demo()` callback — `demo()` prints the
	 *   function it ran, so a comment in there is printed on the homepage as if it were
	 *   part of the lesson. This one was, for one build. */
	stage(){
		return div.c("home-stage", () => {

			demo(() => {
				demo.app(new Page({
					title: "Web",
					children: {
						HTML: { icon: "code", content(){ p("Every element is a word."); } },
						CSS: { icon: "palette", content(){ p("Which elements a rule reaches."); } },
						JS: { icon: "data_object", content(){ p("The grammar under everything else."); } },
						SVG: { icon: "polyline", content(){ p("Drawings that are also documents."); } },
					},
					content(){ this.previews(); },
				}), { nav: true, urls: false });
			}, "Four pages and their navigation, running here. Click one.");
		});
	},

	/* THE BLOG, from `blog/posts.js` — the manifest is the only copy of a post's
	 * title, date and description, so this front cannot drift from the blog's own.
	 * Data only: listing six posts must never import six post modules.
	 *
	 * ⚠ Hand-rolled `.page-preview` cards, like the section cards below and for the
	 *   same reason — borrowed class names, and they must track Page.css. */
	posts(){
		return div.c("home-blog", () => {

			div.c("home-head", () => {
				span.c("h4", "Latest posts");
				a.c("home-head-link", "All posts").href("/blog/");
			});

			// A stack, never a wall: three cards in a column track, and the same
			// three still reading as a list when the track is 1000px wide.
			div.c("flex v gap", () => listed().slice(0, 3).forEach(post => {
				a.c("page-preview").href(post_url(post)).append(() => {
					div.c("page-preview-title", post.title);
					time.c("home-date", dated(post.date)).attr("datetime", post.date);
					div.c("page-preview-desc", post.description);
				});
			}));
		});
	},

	/* THE SECTION NAV — the same list the sidebar reads, with the sentence each
	 * one needs. Blog is left out on purpose: it is the region above, with three
	 * real posts in it, and a card saying "working notes" beside them would be the
	 * same link twice.
	 *
	 * ⚠ `cards()`, NOT `nav()` — `Page.nav()` is a real method (the entry a parent's
	 *   `nav_for()` and `preview_card()` read), and shadowing a View or Page member
	 *   never warns. */
	cards(){
		return div.c("home-nav", () => {

			/* `flex auto`, not `wall`: a wall is `auto-fill`, so four cards in a
			   3000px row would sit in the first four of seven tracks and leave the
			   rest of the screen empty. A flex row has exactly the tracks it has,
			   and `--column` is the width below which it wraps (framework.css). */
			div.c("flex auto gap", () => sections.filter(s => s.url !== "/blog/").forEach(section => {
				a.c("page-preview").href(section.url).append(() => {
					div.c("page-preview-title", section.title);
					div.c("page-preview-desc", section.desc);
				});
			}));
		});
	},
});
