import { Page, Sidebar, md, h1, h2, div, a } from "/app.js";

/* The site's sections, as plain data.
 *
 * Deliberately not imported Pages: a parent has to import its children to adopt
 * them, so `children: [alex, arya, …]` would pull every dev's entire page tree
 * into the first paint of the home page. A hardcoded title + url costs nothing
 * and loads nothing — and Sidebar.link() is duck-typed, so it takes these or
 * real Pages without caring which. */
const sections = [
	{ title: "Framework", url: "/framework/", desc: "The docs — View, Page, Router, App." },
	{ title: "Alex", url: "/alex/", desc: "Pages, subpages, and nesting." },
	{ title: "Arya", url: "/arya/", desc: "First steps with the framework." },
	{ title: "Castin", url: "/castin/", desc: "A tree you can walk — root to leaves." },
	{ title: "Edric", url: "/edric/", desc: "Framework and style documentation." },
	{ title: "Michael", url: "/michael/", desc: "Elements, layout, components, and the core classes." },
];

export default new Page({
	meta: import.meta,
	title: "Nice work, everyone",
	description: "Everything is merged and live. A note to the team.",

	// Every child a url can reach must be declared — the Router walks `children`
	// and never consults the filesystem. Lazy names, so none of these is imported
	// until you navigate into it.
	children: "framework alex arya castin edric michael notes path-1 path-2",

	// I bring my own sidebar, so the global nav would just say it twice.
	classes: "page-homepage hides-nav",

	/* Same layout as a topic: brand, sidebar, one paper column.
	 *
	 * Note what this deliberately does NOT do — assign `this.$pages`. The root is
	 * an ancestor of every url, so claiming a region would mount every section
	 * INSIDE this page and keep this sidebar on screen for the whole site, with
	 * each topic's own sidebar nested beside it. Children land in `app.$pages`
	 * instead, as siblings, so this page hides completely the moment you leave. */
	render(){
		return this.view ??= div.c("page topic flex", () => {

			// `sections` is already {title, url} — exactly what a Sidebar link
			// reads — so the site's nav and its cards come off one list.
			new Sidebar({
				header: () => this.app.brand("LEW42", "/"),
				pages: sections,
			});

			div.c("pages papers", () => {
				div.c("default", () => {
					h1.c("page-title", this.title);
					this.content();
				});
			});
		}).ac(this.classes);
	},

	content(){

		md("Everything is merged and live at [monorepo.lew42.workers.dev](https://monorepo.lew42.workers.dev).");

		md("I've been through every page each of you wrote. You each built your own framework and styles documentation from scratch — thank you, genuinely. It's good work and it shows.");

		h2("Go read each other's");

		md("It's one site now, so spend some time in someone else's directory. You solved a lot of the same problems in different ways, and the differences are the interesting part.");

		// Same markup Page.preview() emits — these sections are plain data, not
		// Pages (see above), so the cards are hand-rolled. Class names must track
		// Page.css: `.page-preview*`, prefixed.
		div.c("page-previews", () => {
			sections.forEach(section => {
				a.c("page-preview").href(section.url).append(() => {
					div.c("page-preview-title", section.title);
					div.c("page-preview-desc", section.desc);
				});
			});
		});

		h2("Styling counts");

		md("Layout, appearance and styling matter more here than they might seem to — they're most of what makes any of this feel usable. I'm working through Figma designs now, and I'm hoping to land a major visual upgrade before long.");

		h2("Sit tight");

		md("No new tasks just yet. Hold off for now and I'll have more for you shortly. When they land: `git switch main` and `git pull` before you branch, and keep to [the branch naming convention](/notes/git-branch-names/).");

		h2("If you're bored");

		md(`The framework picked up a lot while you were building:

- **[Start](/framework/start/)** — three files and a working site. Click through the real project.
- **[FAQ](/framework/faq/)** — the questions you're about to have, answered code-first.
- **[Router](/framework/core/Router/)** — no-reload page transitions. Write an ordinary \`<a href>\` and it upgrades the click for you.
- **[Page](/framework/core/Page/)** — a titled, linkable, dormant unit of content. Importing one renders nothing, so pages can link to each other freely.
- **[Elements](/framework/styles/elements/)** and **[Layouts](/framework/styles/layouts/)** — every element the framework styles, and eight page layouts you can click into full size.`);

		md("Every example on those pages is live: you see the code, directly beneath it the thing that code rendered, and — one click further — **the HTML it actually produced.**");

		md("The old `Pager` tier is gone, by the way. An arrangement is a CSS class a page opts into now, so there's no fifth class to learn. If you built anything on it, the records are in `core/legacy/`.");
	}
});
