import { Page, demo, md, div, a } from "/app.js";

// ⚠ Opened on a real page: a shell with an empty region is not a demo of a shell.
const atlas = () => new Page({
	title: "Atlas",
	icon: "map",

	children: [
		{ name: "start", title: "Start", content(){
			md("A rail can hold more names than a [bar](/web/nav/bar/) can, because it spends width — which a page has more of than it has height."); } },

		{ name: "guides", title: "Guides",
			children: [
				{ name: "regions", title: "Regions", content(){
					md("**The nested entry.** A section's own pages sit under its name, indented, and the rail did not move to show them."); } },
				{ name: "borders", title: "Borders", content(){
					md("Two levels is the useful depth. At three the indent stops reading as hierarchy and starts reading as noise."); } },
				{ name: "scale", title: "Scale", content(){
					md("Everything in the rail comes from `nav_for()`, so a label is declared once, beside the page it names."); } },
			],
			content(){ md("A section with children of its own. Its pages are listed under it, always expanded — a rail that hides half of itself is a rail you cannot scan."); } },

		{ name: "data", title: "Data", content(){
			md("The rail is the root's `render()`; these pages know nothing about it."); } },

		{ name: "about", title: "About", content(){
			md("Nine links would still be fine here. Nine tabs would not."); } },
	],

	render(){
		return this.view ??= div.c("page full flex", () => {

			div.c("basis flex v gap pad", () => {
				div.c("h4", this.title);

				this.children.forEach((page, name) => {
					const nav = this.nav_for(name);
					a.c("page-link", nav.label).href(nav.url);

					if (page?.children.size)
						div.c("flex v gap", () => page.children.forEach((_, sub) => {
							const kid = page.nav_for(sub);
							a.c("page-link", kid.label).href(kid.url);
						})).style({ "--gap": "0.3em", "padding-inline-start": "1em", "font-size": "0.9em" });
				});
			}).style({ "--basis": "10em", "--gap": "0.55em", "--pad": "1em" });

			this.$pages = div.c("flex-1");
		});
	},
}).children.get("guides").children.get("regions");

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: atlas,
	min: "28em",

	note: "**A sidebar is a bar that gave up height for width**, and that trade buys two things a bar cannot have: room for a section's children, and a column that scrolls on its own. Keep it expanded — collapsible groups hide exactly the overview the rail exists to give. This site's own sidebar is the `Sidebar` class, fed from [`nav_for()`](/framework/core/Sidebar/); the demo builds the same thing by hand so you can see what it is.",
}));
