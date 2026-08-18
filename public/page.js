import { Page, Sidebar, md, h1, div, a } from "/app.js";

// Plain {title, url} data on purpose — declaring these as `children` would
// auto-import every section's tree (and its side effects) into the home page.
const sections = [
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

	/* Same layout as a topic: brand, sidebar, one paper column.
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
				div.c("default", () => {
					h1.c("page-title", this.title);
					this.content();
				});
			});
		}).ac(this.classes);
	},

	content(){

		md("**A web framework with no build step.** Native ES modules, served exactly as written: you add a `page.js`, the browser runs it. This site is that framework documenting itself, so every example on it is live code you can click into.");

		// These sections are plain data, not Pages (see above), so the cards are
		// hand-rolled: an `<a.page-preview>`, where Page.preview() emits a div with
		// the link inside. Borrowed class names — they must track Page.css.
		div.c("page-previews", () => {
			sections.forEach(section => {
				a.c("page-preview").href(section.url).append(() => {
					div.c("page-preview-title", section.title);
					div.c("page-preview-desc", section.desc);
				});
			});
		}).style("--column", "24em");

		md("Also here: short working [notes](/notes/), and five personal sandboxes — [Alex](/alex/), [Arya](/arya/), [Castin](/castin/), [Edric](/edric/), [Michael](/michael/).");
	}
});
