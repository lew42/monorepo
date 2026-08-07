import { Page, div, p } from "/app.js";
import { code, section } from "../ui.js";
import { ChromeShell, sample, nav, crumbs, prev_next, demo } from "./chrome.js";

export default new Page({
	meta: import.meta,
	title: "Chrome",
	classes: "chrome",

	children: "sidebar crumbs topbar siblings drawer palette marks focus",

	// Inert data, read by nav() — a label the parent declares for a child it has
	// not imported. Nothing in Page knows this property exists.
	labels: { siblings: "Prev / next", marks: "Active state", focus: "Focus & inert" },

	content(){
		demo(() => {
			new ChromeShell({
				root: sample(),

				// runs ONCE, in render()
				chrome(shell){
					nav(shell.root, shell.root).ac("across");
					shell.$stamp = div.c("chrome-stamp");
				},

				// runs on every navigation — and touches nothing but its own text
				navigated(shell){
					shell.$stamp.text(`chrome built ${shell.builds}× · navigated ${shell.navigations}×`);
				},
			});
		}, "Click the nav. `builds` is printed by the chrome builder, so if a navigation ever rebuilt the chrome it would climb. It doesn't — only `$pages` changes.");

		p("Chrome is everything around the pages: the nav you steer with, the crumbs that say where you are, the bar that gets you sideways. It is not layout — it is built once, outside the page container, and navigation must never touch it.").ac("note");

		section("Where it lives");

		code(`
render(){
    this.$app = div.c("app", () => {
        this.$sidebar = div.c("sidebar", …);   // chrome — built ONCE
        this.$pages   = div.c("pages");        // everything the Router swaps
    });
    View.set_captor(this.$pages);
}`, "site/app.js — the whole of it");

		p("`$pages` is the only thing a navigation is allowed to reach. That single line — the captor is the region, not the app — is what makes chrome structurally safe rather than carefully maintained.").ac("note");

		section("Two kinds of chrome");

		code(`
persistent   brand · nav · drawer toggle · palette      built once, never again
derived      crumbs · topbar · prev/next · "you are here"   a function of the leaf`);

		p("Derived chrome still lives outside `$pages` — its `position` is built once and its `contents` are recomputed. Today nothing tells it the leaf changed; the request for the one line that would is in the report.").ac("note");

		section("The eight");

		this.previews();

		p("The cards say `marks` and `focus`; a derived nav says `Active state` and `Focus & inert`. Same children, two labels, one screen — that is Open #6, and `/chrome/sidebar/` settles it.").ac("note");

		prev_next(this);
	},
});
