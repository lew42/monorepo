import { Page, Sidebar, h2, md, code, demo, div } from "/app.js";

const pages = [
	{ title: "Framework", pages: [
		{ title: "Start",  url: "/framework/start/" },
		{ title: "Core",   url: "/framework/core/" },
		{ title: "Styles", url: "/framework/styles/" },
	]},
	{ title: "View",   url: "/framework/core/View/" },
	{ title: "Page",   url: "/framework/core/Page/" },
];

export default new Page({
	meta: import.meta,
	title: "Sidebar",
	description: "A brand over a list of links. Not owned by any layout, any page can render one.",

	content(){
		demo(() => {
			new Sidebar({ brand: "LEW42", pages: [
				{ title: "Start", url: "/framework/start/" },
				{ title: "Core",  url: "/framework/core/" },
			]}).style({ width: "13em" });
		}, "The whole API is `brand` and `pages`. An entry is a `{title, url}` or a real `Page`, both answer `.title` and `.url`.").ac("mb");

		h2("Groups").ac("mb");
		demo(() => {
			new Sidebar({ brand: "LEW42", pages }).style({ width: "15em" });
		}, "An entry with `pages` of its own is a titled group, inert data, so a `Page` takes it straight in its constructor.").ac("mb");

		h2("The footer").ac("mb");
		demo(() => {
			new Sidebar({ brand: "LEW42", app: this.app, pages }).style({ width: "15em", height: "20em" });
		}, "The nav scrolls, the footer doesn't. Pass `app: this.app` to get the colour-scheme toggle for free, `footer` to replace it, `footer: null` for none.").ac("mb");

		h2("Narrow screens").ac("mb");
		md("Below `52em` the panel becomes a sticky top bar with a hamburger, and the whole menu drops below it when tapped. No resize listener, no configuration: a media query in `Sidebar.css` decides what narrow means.").ac("mb");

		h2("Your own brand").ac("mb");
		code.js(`new Sidebar({
    header: () => this.app.brand("Framework", this.url),
    pages: [...this.children.keys()].map(name => this.nav_for(name)),
});`).ac("mb");
		md("The constructor is assign-based, so passing `header` replaces the default logo-and-wordmark rather than configuring it.").ac("mb");

		h2("No colours of its own").ac("mb");
		demo(() => {
			div.c("flex gap", () => {
				new Sidebar({ brand: "Dark", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#1f1f1f", "--sidebar-ink": "#e6e6e6" });
				new Sidebar({ brand: "Light", pages: pages[0].pages }).style({ width: "11em", "--sidebar-bg": "#fff", "--sidebar-ink": "#3f3f3f" });
			});
		}, "Two tokens, `--sidebar-bg` and `--sidebar-ink`, and everything else (group title, icons, hover, active row) is a `color-mix` off that one ink.").ac("mb");

		md("Next: [Extensions](/edric/getStarted/framework/extensions/), everything core deliberately refused to do.");
	}
});