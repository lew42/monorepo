import { Page, demo, div, p, md } from "/app.js";

// Container: vary/tone/'s own $pages region, `main` prose width. Size: three
// `small` columns, ~44em. Own layout: `.flow` holding one demo.app() box.
// Regions: one. Preview: default card.

// Returns the DEEPEST page, not the root: demo.app's mark() only re-marks
// `page.chain()` of whatever it is SHOWING, so handing it the root strips
// Depth 2/3's `default` and never restores it — the whole nested cascade
// renders, then Page.css hides it (examples/looks/backgrounds does the same).
function tree(){
	const root = new Page({
		title: "Depth 1", width: "small", classes: "vary-tone-d1",
		initialize(){ this.columns(); },
		content(){ p("Depth 1 — --wash."); },
		children: { "Depth 2": {
			width: "small", classes: "default vary-tone-d2",
			content(){ p("Depth 2 — --tint."); },
			children: { "Depth 3": {
				width: "small", classes: "default vary-tone-d3",
				content(){ p("Depth 3 — back to --wash."); },
			} },
		} },
	});

	return root.children.get("depth-2").children.get("depth-3");
}

export default new Page({
	meta: import.meta,
	title: "Alternating",
	description: "wash → tint → wash — no direction, just a beat.",
	icon: "compare",

	content(){
		md("Two tones, alternating: wash, tint, wash again.");
		div.c("vary-tone-alt", () => demo.app(tree()).style("height", "16em"));
		md("**Verdict:** reads as zebra-striping, not hierarchy — depth 3 matches depth 1, so the eye reads a REPEATING pattern rather than a direction to travel in.");
	},
});
