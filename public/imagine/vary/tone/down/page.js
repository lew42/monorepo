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
		content(){ p("Depth 1 — the ambient --wash."); },
		children: { "Depth 2": {
			width: "small", classes: "default vary-tone-d2",
			content(){ p("Depth 2 — one step darker."); },
			children: { "Depth 3": {
				width: "small", classes: "default vary-tone-d3",
				content(){ p("Depth 3 — deepest, darkest."); },
			} },
		} },
	});

	return root.children.get("depth-2").children.get("depth-3");
}

export default new Page({
	meta: import.meta,
	title: "Stepping down",
	description: "wash → a controlled color-mix of --ink, two steps darker — never --well.",
	icon: "swap_vert",

	content(){
		md('No token past `--wash` reads darker, so each step is `color-mix(in srgb, var(--ink) N%, var(--wash))` — never `--well` (a translucent shadow, not a palette colour; doc/columns.md).');
		div.c("vary-tone-down", () => demo.app(tree()).style("height", "16em"));
		md("**Verdict:** reads as recession, not elevation — a deeper column looks like it is further INTO the screen, a well rather than a stack. Legible, but the opposite feeling from stepping up.");
	},
});
