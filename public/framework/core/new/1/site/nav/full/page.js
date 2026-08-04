import { Page, p, a, div } from "/app.js";
import { section } from "../../ui.js";
import { source } from "../ui.js";

export default new Page({
	meta: import.meta,
	title: "Full",

	// The entire opt-in. An inert string that lands on my `.page` div, read by
	// CSS and by nothing else.
	classes: "full",

	content(){
		// A full page covers the window, so it also owns scrolling — `.page.full`
		// is `overflow: hidden`. This is layout, not a claim: `container()` looks
		// for the `$pages` PROPERTY, and I never assign one.
		div.c("pages cols", () => {
			div.c("col", () => {
				div.c("row", () => {
					a.c("page-link", "← leave").href("/nav/");
					a.c("page-link", "preview  →").href("/nav/cards/");
				});

				source(import.meta);

				p("`classes: \"full\"` is positioning, not chrome management: `position: fixed; inset: 0`. Nothing on `.app` is set, kept in sync, or unset on the way out — inspect it, the class attribute is still just `app`.");

				section("Why that matters");

				p("The old version put a class on the app to hide the sidebar, which meant the App carried state, and it could never compose — one property had one winner. Covering the window and arranging a subtree are answers to different questions, so they live on different elements and never compete.").ac("note");

				section("The honest cost");

				p("The chrome is covered, not removed. It is still in the DOM, still tabbable, still read by a screen reader. `display: none` did not have that problem. If it matters, `inert` on the chrome is the fix, and it belongs to the site.").ac("note");

				section("Next");

				a.c("page-link", "preview  →").href("/nav/cards/");
			});
		});
	}
});
