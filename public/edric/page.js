import { Page, Sidebar, View, md, h1, h2, code, toc, div, details, summary, a, span, button } from "/app.js";

// One card, three tabs. Not Page.tabs() — that switches between real child
// *pages* (routes), and these three are just sections of this one page's prose,
// nothing to navigate to. A small local widget instead: one active index, swap
// the panel's content on click, no routing involved.
function steps(list){
	let $panel, $tabs = [], active = 0;

	const show = i => {
		active = i;
		$tabs.forEach((t, ti) => t.style("background", ti === active ? "var(--prim)" : "var(--subtle)"));
		$panel.empty(list[active].render);
	};

	return div.c("pad flow", () => {
		div.c("flex gap wrap", () => {
			list.forEach((step, i) => {
				$tabs.push(button.c("btn", step.label).style("background", i === 0 ? "var(--prim)" : "var(--subtle)").click(() => show(i)));
			});
		});

		$panel = div.c("flow", list[0].render);
	}).style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });
}

View.stylesheet(import.meta, "styles.css");

// Framework, Style and Custom Components are real sub-pages of /edric/getStarted/
// (declared below in `children`, and again on getStarted/page.js itself); Download
// Framework is external, so it's plain data here — Sidebar's link() is duck-typed
// and takes either. The FIRST entry has its own `.pages`, so it renders as a group
// (see the `group()` override below, which turns that group into a real <details>
// dropdown) — "Get Started" is both the group's title/toggle AND a link to that
// page. Credits and Download Framework are plain sibling entries, no nesting: one
// click each, same as any other top-level link.
//
// Custom Components has its OWN `.pages` too: the group() override recurses,
// same `page.pages ? group : link` test the base Sidebar.nav() already makes at
// the top level, just reached one level deeper. Five of the six categories are
// still anchors into components/page.js's own card grid (the slugs have to
// match that page's `slug(title)` exactly, or the link silently goes nowhere).
// Basic components is the exception: it moved to a real url once its 25 items
// got their own pages under components/basicComponents/, so the `link()`
// override below (the one that recovers a hash Router.click() would drop on a
// cross-page click) never fires for this one, a real link needs no recovering.
const links = [
	{
		title: "Get Started",
		url: "/edric/getStarted/",
		pages: [
			{ title: "Framework", url: "/edric/getStarted/framework/" },
			{ title: "Style", url: "/edric/getStarted/style/" },
			{
				title: "Custom Components",
				url: "/edric/getStarted/components/",
				navigate: true,
				pages: [
					{ title: "Basic components", url: "/edric/getStarted/components/basicComponents/" },
					{ title: "Navigation", url: "/edric/getStarted/components/#navigation" },
					{ title: "Content / Layout", url: "/edric/getStarted/components/#content-layout" },
					{ title: "Feedback", url: "/edric/getStarted/components/#feedback" },
					{ title: "Data / Complex components", url: "/edric/getStarted/components/#data-complex-components" },
					{ title: "Sections", url: "/edric/getStarted/components/#sections" },
				],
			},
		],
	},
	{ title: "Credits", url: "/edric/credits/" },
	{ title: "Download Framework", url: "https://github.com/lew42/monorepo" },
];

// Same three sections as the sidebar's dropdown, as cards instead of links — for
// the reader who lands here and hasn't opened the dropdown yet.
const cards = [
	{ title: "Framework", url: "/edric/getStarted/framework/", desc: "App and View, the two classes that run everything." },
	{ title: "Style", url: "/edric/getStarted/style/", desc: "framework.css, grouped the way a style guide usually is." },
	{ title: "Custom Components", url: "/edric/getStarted/components/", desc: "Button, Forms, Navbar, Card." },
];

export default new Page({
	meta: import.meta,
	title: "Get Started",
	description: "Framework and style documentation.",

	children: "getStarted credits",

	// I bring my own sidebar, so the global nav would just say it twice.
	classes: "hides-nav",

	// Same reasoning as every page nested under "Get Started": my own content
	// below is the same install material, so landing here (clicking "Edric" in
	// the sidebar header goes straight to this page) should show the dropdown
	// open too, not force a second click to see what it leads to.
	activated(){
		this.app.$app.el.querySelector(".sidebar-group")?.setAttribute("open", "");
	},

	// A topic: brand, sidebar, one column — and unlike the homepage, I DO claim
	// $pages, so Get Started/Credits (and everything under them) mount inside my
	// own layout and this sidebar stays on screen while you're anywhere under
	// /edric/.
	render(){
		return this.view ??= div.c("page topic flex", () => {
			new Sidebar({
				app: this.app,
				header: () => this.app.brand("Edric", "/edric/"),
				pages: links,

				// Sidebar's own group() is a static titled section, no toggle. A real
				// <details> gives us the dropdown for free — no JS, no new state to
				// manage. Closed by default: the sidebar shows only "Get Started" on
				// first load, and clicking it reveals the rest.
				group(group){
					let $details;

					return $details = details.c("sidebar-group", () => {
						// No `.sidebar-group-title` here — that class carries its own
						// padding, meant for a plain non-interactive label, and it was
						// double-indenting this link on top of .sidebar-link's own
						// padding. The bare <summary> lets the link fill the row exactly
						// like every other one (Credits, Framework, ...).
						//
						// "Get Started" is toggle-only, it has a `url` but doesn't navigate:
						// no href, so Router never intercepts its click and the native
						// <details> toggle would fire twice without the manual
						// preventDefault() below. Only the arrow is --prim; the label
						// stays the normal sidebar-link colour, same as every other row.
						//
						// Custom Components opts into `navigate: true` instead: it gets a
						// real href AND still toggles, so preventDefault() has to do double
						// duty here too, stop the native toggle (same reason as above) AND
						// stop the browser's own navigation, since router.go() below is what
						// actually navigates once the toggle's done.
						summary(() => {
							const $link = a.c("sidebar-link").append(() => {
								span.c("toggle-arrow", "›").style("color", "var(--prim)");
								span.c("sidebar-label", group.title);
							});

							if (group.navigate) $link.href(group.url);

							$link.click(e => {
								e.preventDefault();
								$details.el.open = !$details.el.open;
								if (group.navigate && location.pathname !== group.url) this.app.router.go(group.url);
							});
						});
						// Indented via .sidebar-group > .sidebar-link in styles.css, so
						// Framework/Style/Custom Components read as nested under the
						// "Get Started" header instead of sitting flush with it.
						//
						// Recursive: Custom Components has its own `.pages` (the five
						// category anchors), so this same test builds it as a nested
						// <details> instead of a link: `this.group` is still this
						// override at any depth, so no second copy of the toggle logic.
						group.pages.forEach(page => page.pages ? this.group(page) : this.link(page));
					});
				},

				// A category's href carries a #hash to Custom Components, but
				// Router.click() only ever passes link.pathname to go() (Router.js), so
				// a click from any OTHER page silently drops the hash and lands on the
				// bare page with nothing to scroll to, which is why it always opened
				// on "Basic components" regardless of which category was clicked. A
				// same-page click never hits this: Router already steps aside for those
				// (link_clicked()'s own #section guard) and the browser's native anchor
				// scroll handles it. This only intercepts the cross-page case, calling
				// router.load() directly instead of go() so the pushState can include
				// the hash go() would have thrown away, then scrolling once the target
				// page's headings exist.
				link(page){
					const $link = Sidebar.prototype.link.call(this, page);

					if ($link.el.hash && $link.el.pathname !== location.pathname)
						$link.click(async e => {
							e.preventDefault();

							const { pathname, hash } = $link.el;

							if (await this.app.router.load(pathname)){
								history.pushState({}, "", pathname + hash);
								document.getElementById(hash.slice(1))?.scrollIntoView();
							}
						});

					return $link;
				},
			});

			this.$pages = div.c("pages", () => {
				div.c("default", () => {
					h1.c("page-title", this.title);
					this.content();
				});
			});
		}).ac(this.classes);
	},

	// Same content as /edric/getStarted/, word for word — landing on the bare
	// section url shows the same install material and cards as clicking through
	// to it explicitly.
	content(){
		toc();

		md("New here? No worries, this page will get you up and running in a couple of minutes. No build tools, no config files to fight with.");

		steps([
			{
				label: "Install",
				render(){
					md("Grab [Node.js](https://nodejs.org) if you don't have it, then:");

					code.lang("bash", `git clone https://github.com/lew42/monorepo.git
cd monorepo
npm install
node server.js`);

					md("Open `http://localhost` in your browser.");
				},
			},
			{
				label: "Start Using It",
				render(){
					md("Every folder under `/public/` is its own site, named after whoever built it.");

					md("Every HTML tag is a function from `/app.js`, calling one adds it to the page. Make your own folder, add a `page.js`, and it shows up at that url:");

					code.js(`import { h1, p } from "/app.js";

export default function() {
    h1("Hello World");
    p("Some text");
}`);

					md("No build step, no JSX. Save, refresh, done.");
				},
			},
		]).ac("mb");

		h2("Explore");

		md("Three places to go next, same three as the sidebar's dropdown:");

		// .page-preview is `display: flex` (Page.css): title and desc have to
		// share one flex slot, wrapped, or they sit side by side as two
		// columns instead of desc stacking under the title.
		div.c("page-previews", () => {
			cards.forEach(section => {
				a.c("page-preview").href(section.url).append(() => {
					div(() => {
						div.c("page-preview-title", section.title);
						div.c("page-preview-desc", section.desc);
					});
				});
			});
		});
	}
});