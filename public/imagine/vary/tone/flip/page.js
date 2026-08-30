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
				content(){ p("Depth 3 — flipped dark."); },
			} },
		} },
	});

	return root.children.get("depth-2").children.get("depth-3");
}

export default new Page({
	meta: import.meta,
	title: "Flip at depth",
	description: "Light for two columns, then one hard flip to a dark step at depth 3.",
	icon: "swap_horiz",

	content(){
		md("Wash, then tint — then one hard flip to a dark `color-mix` step, not a gradual one.");
		div.c("vary-tone-flip", () => demo.app(tree()).style("height", "16em"));
		md("**Verdict:** the flip reads as emphasis, not depth — depth 3 says \"you are here\" or \"this one is different,\" closer to a modal than a smooth hierarchy. Best saved for a genuinely distinct column, not a plain fourth level.");
	},
});
