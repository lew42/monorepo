import { Page, demo, md, div, a, h1, h4 } from "/app.js";

// The same three links, wherever the page that calls this decides to put them.
const links = page => div.c("flex gap", () => page.parent.children.forEach((_, name) => {
	const nav = page.parent.nav_for(name);
	a.c("page-link", nav.label).href(nav.url);
}));

/* (a) Three pages, three layouts. Every one of them is defensible on its own —
   that is the trap. Nothing is shared, so every click re-draws the whole window. */
const drift = () => new Page({
	title: "Drift",

	children: [
		{ name: "home", title: "Home", render(){ return this.view ??= div.c("page full flex v gap pad", () => {
			links(this);
			h1.c("page-title", this.title);
			md("Each page here brings its **own** layout. Click along the row and watch the title jump."); }); } },

		{ name: "docs", title: "Docs", render(){ return this.view ??= div.c("page full flex", () => {
			div.c("basis flex v gap pad", () => { links(this).ac("v"); }).style("--basis", "9em");

			div.c("flex-1 flex v gap pad", () => {
				h1.c("page-title", this.title);
				md("The nav moved to the left, so the title moved right. Nothing here is *wrong* — each page is simply its own design."); }); }); } },

		{ name: "about", title: "About", render(){ return this.view ??= div.c("page full flex v gap pad", () => {
			h1.c("page-title", this.title);
			md("And now no nav at all until the bottom. Three clicks, three places to look for the same two things.");
			links(this); }).style("--pad", "2.5em"); } },
	],

	content(){ md("Pick a page — each brings its own."); this.previews(); },
}).children.get("home");

/* (b) The same three pages as plain content, under one shell the root builds once. */
const anchor = () => new Page({
	title: "Anchor",

	children: [
		{ name: "home", title: "Home", content(){ md("Same three pages, one shell. The rail and the title column are fixed; **only this region swaps.**"); } },
		{ name: "docs", title: "Docs", content(){ md("Click along the rail: the title lands in exactly the same place every time, so there is nothing to re-find."); } },
		{ name: "about", title: "About", content(){ md("The eye keeps its anchor, and the page gets read instead of re-scanned."); } },
	],

	render(){
		return this.view ??= div.c("page full flex", () => {
			div.c("basis flex v gap pad", () => {
				div.c("h4", this.title);
				this.children.forEach((_, name) => {
					const nav = this.nav_for(name);
					a.c("page-link", nav.label).href(nav.url);
				});
			}).style({ "--basis": "9em", "--gap": "0.5em" });

			this.$pages = div.c("flex-1");
		});
	},
}).children.get("home");

// `pad` because a bleed stage has no inset of its own, and these columns are labelled.
const screen = () => div.c("flex auto gap pad", () => {
	div.c("flex v gap", () => { h4("Per-page layouts — it jumps"); demo.app(drift()).style("height", "25em"); });
	div.c("flex v gap", () => { h4("One persistent shell — no jump"); demo.app(anchor()).style("height", "25em"); });
}).style("--column", "26em");

export default new Page({
	meta: import.meta,
	group: "Studies",

	// ⚠ 25, not the usual 50: at half size the card crops to the first box, and the
	// whole point of this one is the pair.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-25 pad", screen)); },

	content(){
		demo.stage(screen).ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Click along the left box, then the right one.** Same content, same three destinations. On the left the title, the nav and the reading column land somewhere new every time, so each click costs a re-scan before you can read. On the right nothing moves but the region.");

		md("**An occasional jump is fine — a jump per click is not.** Changing scheme at a real boundary (marketing site → app, docs → playground) is information: it says *you have crossed into something else*. Paying that cost between two sibling pages says nothing, and the reader pays it anyway.");

		md("The rule that falls out: **keep the shell, swap the region.** A shell is a root page that overrides `render()` and hands its children a `$pages` — which is what `/framework/` and this page's own [rail](/web/nav/rail/) do. Then a jump becomes a thing you can *choose*, at the one place it means something.");
	},
});
