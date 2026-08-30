import { Page, demo, div, p, md } from "/app.js";

// Container: vary/tone/'s own $pages region, `main` prose width. Size: the
// tree is three `small` (14em) columns, ~44em — fits `main` comfortably. Own
// layout: `.flow` (the default) holding one embedded demo.app() box. Regions:
// one. Preview: default card.

// Returns the DEEPEST page, not the root: demo.app's mark() only re-marks
// `page.chain()` of whatever it is SHOWING, so handing it the root strips
// Depth 2/3's `default` and never restores it — the whole nested cascade
// renders, then Page.css hides it (examples/looks/backgrounds does the same).
function tree(){
	const root = new Page({
		title: "Depth 1", width: "small", classes: "vary-tone-d1",
		initialize(){ this.columns(); },
		content(){ p("Depth 1 — the ambient --wash."); },
		children: { "Depth 2": {
			width: "small", classes: "default vary-tone-d2",
			content(){ p("Depth 2."); },
			children: { "Depth 3": {
				width: "small", classes: "default vary-tone-d3",
				content(){ p("Depth 3 — deepest."); },
			} },
		} },
	});

	return root.children.get("depth-2").children.get("depth-3");
}

export default new Page({
	meta: import.meta,
	title: "Stepping up",
	description: "wash → tint → surface — deeper columns read lighter.",
	icon: "layers",

	content(){
		md("Three columns, one scheme: wash, then tint, then surface — each one step lighter than its parent.");
		div.c("vary-tone-up", () => demo.app(tree()).style("height", "16em"));
		md("**Verdict:** reads as hierarchy — each column sits visibly ABOVE the one before it, like a stack of cards lifting toward the reader.");
	},
});
