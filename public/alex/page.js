import { Page, Sidebar, View, div, main, a, h1, md } from "/app.js";

// The Router walks every segment, so reaching /alex/styles/bem/ has already
// imported this file — one stylesheet for the whole section.
View.stylesheet(import.meta, "styles.css");

export default new Page({
	meta: import.meta,
	title: "/ Alex",
	description: "A short tour of the framework — the classes, and the styles.",
	icon: "menu_book",

	children: "framework styles examples",

	// Labels and icons for children nobody has imported yet.
	nav: {
		framework: { label: "Framework", icon: "widgets" },
		styles:    { label: "Styles",    icon: "palette" },
		examples:  { label: "Examples",  icon: "science" },
	},

	// I bring my own sidebar.
	classes: "hides-nav",

	// My children mount in `this.$pages`, beside a nav that is built once.
	render(){
		return this.view ??= div.c("page topic flex", () => {

			new Sidebar({
				app: this.app,
				header: () => div.c("brand", () => {
					a.c("brand-logo", () => this.app.logo()).href("/").attr("aria-label", "Home");
					a.c("brand-text", this.title).href(this.url);
				}),
				pages: [...this.children.keys()].map(name => this.nav_for(name)),
			});

			this.$pages = main.c("pages", () => {
				div.c("page default flow", () => {
					h1.c("page-title", this.title);
					this.content();
				});
			});
		}).ac(this.classes);
	},

	content(){
		md("A short, friendly tour of this framework for people who have never seen it before. There is no build step and no config: plain ES modules served straight from disk, a handful of classes, and some opt-in CSS.");

		md("Start with whichever half you need:");

		this.previews();
	},
});
