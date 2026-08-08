import { Page, h2, p, pre, div } from "/app.js";

export default new Page({
	meta: import.meta,
	title: "Framework",
	description: "App and View, the two classes that run everything.",

	children: "app view router page sidebar extensions utilities",

	// I'm one of the three pages nested under the sidebar's "Get Started"
	// dropdown — landing here directly (a card click, a bookmark, back/forward)
	// shouldn't leave that dropdown closed with no clue where I live. Scoped to
	// $app, never document, same rule as Router's own marking.
	activated(){
		this.app.$app.el.querySelector(".sidebar-group")?.setAttribute("open", "");
	},

	content(){
		p("The whole framework is really just two classes.").ac("mb");

		p("`App` boots the site once: it creates `window.app`, and loads your `page.js` based on the current URL.").ac("mb");
		p("`View` is what every tag function (`h1, p, div, a`...) returns. It wraps one DOM element and gives you chainable helpers to build with.").ac("mb");

		h2("Example").ac("mb");

		p("Building with `View` looks like this:").ac("mb");

		pre(`div.c("flex gap", () => {
    p("child 1");
    p("child 2");
});`).ac("pad mb").style({ background: "var(--bg)", color: "white", "border-radius": "0.3em" });

		h2("Full Reference").ac("mb");

		this.previews();
	}
});