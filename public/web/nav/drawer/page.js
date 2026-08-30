import { Page, demo, md, div, a, button, icon } from "/app.js";

// ⚠ Opened on a real page: a shell with an empty region is not a demo of a shell.
const pocket = () => new Page({
	title: "Pocket",
	icon: "inbox",

	children: [
		{ name: "inbox", title: "Inbox", content(){
			md("**Push** is the default here: the drawer takes a column and the page gives one up. Nothing is covered, so you can read while it is open."); } },

		{ name: "saved", title: "Saved", content(){
			md("Hit **overlay** in the corner and the same panel goes `position: absolute` — the page keeps its full width and the drawer floats over it."); } },

		{ name: "tags", title: "Tags", content(){
			md("Push is honest and overlay is cheap. Push needs width to give away; overlay does not, which is why phones get overlay."); } },

		{ name: "settings", title: "Settings", content(){
			md("Either way the drawer is one element, built by the root — closing it is `display`, not a rebuild."); } },
	],

	render(){
		let $drawer;

		return this.view ??= div.c("page full flex v", () => {

			div.c("flex v-center gap pad surface", () => {
				button(() => icon("menu")).attr("title", "Open or close the drawer")
					.click(() => $drawer.style("display", $drawer.style("display") === "none" ? "flex" : "none"));

				div.c("h4", this.title);
				div.c("flex-1");

				// The whole difference between the two modes, in one declaration.
				button("push").attr("title", "Push or overlay").click(function(){
					const over = this.el.textContent === "push";

					this.text(over ? "overlay" : "push");
					$drawer.style({ position: over ? "absolute" : "static", zIndex: "2" });
				});
			}).style("--pad", "0.6em 0.9em");

			div.c("flex flex-1", () => {

				/* ⚠ `--drawer` on `.app` is how the real one pushes (framework.css,
				   ext/layout) — a shell this size can just be a flex row. */
				$drawer = div.c("basis flex v gap pad wash", () => this.children.forEach((page, name) => {
					const nav = this.nav_for(name);
					a.c("page-link", nav.label).href(nav.url);
				})).style({ "--basis": "9em", "--gap": "0.5em", "--pad": "1em", top: "0", bottom: "0", insetInlineStart: "0" });

				this.$pages = div.c("flex-1");
			}).style("position", "relative");
		});
	},
}).children.get("inbox");

export default new Page(demo.tree({
	meta: import.meta,
	group: "Patterns",
	tree: pocket,
	min: "26em",

	note: "**A drawer is a [sidebar](/web/nav/sidebar/) that admits it does not always fit.** Push keeps the page readable and is what `ext/layout`'s panel does — one `--drawer` token, and the shell yields a rail (`framework.css`). Overlay costs no width and is the only option under about 26rem, which is why the real one is self-limiting rather than breakpointed. The button that opens it must be persistent even when the drawer is not.",
}));
