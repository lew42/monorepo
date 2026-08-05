import { Page, div, a, span, icon, md, pre, code } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "A no-build, native-ESM web framework — read the code, get it.",

	// I bring my own navigation, so the global one is noise while you're in here.
	// Inert: /styles.css decides what the class means, and Router.mark() unsets it.
	classes: "hides-nav",

	// Lazy: names, not imports. Nothing below here loads until you walk to it.
	children: "start core ext styles util dev",

	/* A label belongs to the parent's LIST and is there from the start; a title
	 * belongs to a page and only exists once that page is imported. Deriving the
	 * nav from titles would make it read differently depending on where you came
	 * from — the same bug tab bars already refuse.
	 *
	 * An icon is the same kind of thing, which is why it lives here and not on
	 * the page: it names this ENTRY in this menu. So it costs no import, and
	 * `previews()` below draws a complete card for a page that hasn't loaded. */
	nav: {
		start:  { label: "Start here", icon: "flag" },
		core:   { label: "Core",       icon: "dashboard" },
		ext:    { label: "Extensions", icon: "extension" },
		styles: { label: "Styles",     icon: "palette" },
		util:   { label: "Utilities",  icon: "build" },
		dev:    { label: "Dev server", icon: "terminal" },
	},

	/* A LAYOUT, not a content page — so it builds its own wrapper and the `.page`
	 * element IS the row. The default wrapper would have needed a `div.section`
	 * inside it whose only job was `display: flex`.
	 *
	 * Three things an override owes, all silent when missed (core/Page/readme.md):
	 * set `this.view`, carry `.page`, and never nest a second `.page` inside. */
	render(){
		return this.view ??= div.c("page topic", () => {

			div.c("section-nav", () => {
				// logo goes home; the wordmark is this section's own url
				this.app.brand(this.title, this.url);

				// names only — reading `children` imports nothing. nav_for() is the
				// one place that decides how a child is presented, so this bar and
				// the preview cards below can't disagree.
				this.children.forEach((page, name) => {
					const nav = this.nav_for(name);
					a.c("nav-link").href(nav.url).append(() => {
						if (nav.icon) icon(nav.icon);
						span(nav.label);
					});
				});
			});

			// My children mount HERE, inside my own view — so the nav beside them
			// is never rebuilt and never moves when you navigate between them.
			// `papers` gives every one of them the measure without each declaring it.
			this.$pages = div.c("pages papers", () => {

				// what /framework/ itself shows, and only then
				div.c("default", () => {

					md("Create `/path/page.js`:");

					code.js(`import { p } from "/app.js";

p("Hello world.")`);

					md("That's basically it.");

					this.previews();

					md.details(import.meta, "readme.md", "Design record — open questions & alternatives");
				});
			});
		}).ac(this.classes);   // `classes: "hides-nav"` still applies
	}
});
