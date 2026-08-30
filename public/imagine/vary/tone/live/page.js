import { Page, demo, div, button, p, md } from "/app.js";

// Container: vary/tone/'s own $pages region, `main` prose width. Size: three
// `small` columns, ~44em, plus a control row. Own layout: `.flow` holding one
// bordered wrap (controls + demo.app() box). Regions: one. Preview: default
// card.

const SCHEMES = [
	["vary-tone-up",   "Up"],
	["vary-tone-down", "Down"],
	["vary-tone-alt",  "Alternating"],
	["vary-tone-flip", "Flip"],
];
const SCHEME_CLASSES = SCHEMES.map(([cls]) => cls).join(" ");

// Returns the DEEPEST page, not the root: demo.app's mark() only re-marks
// `page.chain()` of whatever it is SHOWING, so handing it the root strips
// Depth 2/3's `default` and never restores it — the whole nested cascade
// renders, then Page.css hides it (examples/looks/backgrounds does the same).
function tree(){
	const root = new Page({
		title: "Depth 1", width: "small", classes: "vary-tone-d1",
		initialize(){ this.columns(); },
		content(){ p("Depth 1."); },
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
	title: "Live control",
	description: "One tree, one class swapped on click — no extra page.js per scheme.",
	icon: "tune",

	content(){
		md("Controls over files: the same tree as the four fixed exemplars, one class swapped on click instead of four near-identical pages. Pick a scheme:");

		let $wrap, $buttons = [];

		$wrap = div.c("vary-tone-live-wrap", () => {
			div.c("vary-tone-controls", () => {
				SCHEMES.forEach(([cls, label], i) => {
					const $btn = button(label).ac(!i && "active").click(() => {
						$wrap.rc(SCHEME_CLASSES);
						$wrap.ac(cls);
						$buttons.forEach($b => $b.rc("active"));
						$btn.ac("active");
					});
					$buttons.push($btn);
				});
			});

			demo.app(tree()).style("height", "16em");
		}).ac(SCHEMES[0][0]);

		md("**Verdict:** a control that swaps one class beats four near-identical page.js files for exploring the same question — the fixed exemplars are for a link worth sharing; this one is for poking at it.");
	},
});
