import { Page, div, p } from "/app.js";
import { code, section } from "../../ui.js";
import { ChromeShell, sample, topbar, crumbs, prev_next, show_source, widths, demo } from "../chrome.js";

export default new Page({
	meta: import.meta,
	title: "Topbar",
	classes: "chrome",

	content(){
		demo(() => {
			// the leaf, and everything beside it at the same depth
			topbar(this);
		}, "The title says where you are; the tabs go sideways. Live, against this page's real parent.");

		show_source(topbar);

		section("Why a sidebar can't do this");

		code(`
sidebar    down the tree     root's children, and the section you're in
topbar     across one row    the current page's SIBLINGS
crumbs     up the tree       chain(), root to leaf`);

		p("Three axes, three pieces of chrome. A sidebar could show siblings — by expanding every level at once, which is the tree with nothing hidden and no longer a nav. Depth belongs to the sidebar, breadth to the bar, and the way back to the crumbs.").ac("note");

		section("Both bars, one shell");

		this.stacked();

		p("Crumbs above, siblings below: the pair reads as one address. Both are derived, both are rebuilt by `navigated()`, and both live in containers the chrome built once.").ac("note");

		section("What it costs");

		code(`
labels     a sibling that has never been imported shows its LABEL, same rule
           as the sidebar — nothing here reads a title it might not have
depth 1    a top-level page has no parent, so the bar has nothing to show;
           the honest fallback is the nav, which is already on screen
width      N siblings in a row is a horizontal list with no budget — 12 of
           them wrap onto three lines and push the page down`);

		this.crowded();

		prev_next(this);
	},

	// crumbs and siblings, stacked, both rebuilt per navigation
	stacked(){
		return demo(() => {
			new ChromeShell({
				root: sample(),
				start: "/guide/install/",

				chrome(shell){
					shell.$crumbs = div.c("chrome-box");
					shell.$topbar = div.c("chrome-box");
				},

				navigated(shell){
					shell.$crumbs.empty(() => crumbs(shell.page));
					shell.$topbar.empty(() => topbar(shell.page));
				},
			});
		});
	},

	/* The width problem, measured rather than asserted: this site's root has
	 * enough children that a sibling bar for it is three lines at 900px. */
	crowded(){
		const $stage = div.c("chrome-stage", () => div.c("chrome-box", () => topbar(this.parent)));

		widths($stage, "1400px 900px 500px auto");

		p(`\`${this.app.root.children.size}\` siblings, live from this site's root. A topbar is a good bar for a handful and a bad one for a list.`).ac("note");

		return $stage;
	},
});
