import { Page, demo, md, div, a } from "/app.js";

// ⚠ Opened on a real page: a shell with an empty region is not a demo of a shell.
const orbit = () => new Page({
	title: "Orbit",
	icon: "rocket_launch",

	children: [
		{ name: "product", title: "Product", content(){
			md("The bar above was built **once**, by the root page, and every page mounts underneath it. Click along it: this column swaps and nothing else moves."); } },

		{ name: "pricing", title: "Pricing", content(){
			md("Three tiers, one page. The bar did not repaint, reflow, or change what it says."); } },

		{ name: "docs", title: "Docs", content(){
			md("Same bar, deeper page. It is one element, alive for the whole visit — that is what *persistent* means."); } },

		{ name: "contact", title: "Contact", content(){
			md("A bar is the cheapest persistent nav there is: one row, the same links, always in the same place."); } },
	],

	/* The shell. An override owes three things, all silent when missed: set
	   `this.view`, carry `.page`, and never nest a second `.page` inside. */
	render(){
		return this.view ??= div.c("page full flex v", () => {

			div.c("flex v-center split gap pad surface", () => {
				div.c("h4", this.title);

				div.c("flex gap", () => this.children.forEach((page, name) => {
					const nav = this.nav_for(name);
					a.c("page-link", nav.label).href(nav.url);
				})).style("--gap", "1.2em");
			}).style("--pad", "0.7em 1em");

			// Children mount HERE, inside my own view, so the bar can never move.
			this.$pages = div.c("flex-1");
		});
	},
}).children.get("product");

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: orbit,
	height: "22em",

	note: "**A bar is a promise that the top of the window is stable.** It costs one row of vertical space forever, so it holds a handful of destinations and nothing else — the moment it needs a second line or a dropdown, the site has outgrown it and wants a [sidebar](/web/nav/sidebar/). It is the root that builds it, in `render()`, so the pages below know nothing about it.",
}));
