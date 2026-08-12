import { pick, menu, knob, toggle } from "./controls.js";

/* The control vocabulary: one word names one control over a target view, and a bar
   or a panel group is a space-separated list of them. Extensible from any call site
   — `layout.words.zoom = $el => knob($el, "--zoom", 1, 3, 0.1)` — which is how a bar
   gets a control this module knows nothing about. Design record: readme.md. */

export const MODES  = ["flex", "grid"];
export const SHAPES = ["standard", "sheet", "pad", "full"];

// The two defaults `layout.bar()` picks between when a call site names no list.
export const BOX  = "mode gap column";
export const PAGE = "shape fill flow measure";

export const words = {
	mode:  $el => pick(MODES, word => $el.rc(MODES.join(" ")).ac(word), MODES.find(word => $el.hc(word))),

	/* `sheet` is the plain `.page` — a shape with no class, which is why it writes
	   `false` rather than a word. `standard` is what a page renders as by default. */
	shape: $el => menu(SHAPES, word => $el.rc(SHAPES.join(" ")).ac(word !== "sheet" && word),
		SHAPES.find(word => $el.hc(word)) || "sheet"),

	/* ⚠ `.page.fill` carries `overflow: hidden` (Page.css), so a page taller than its
	   region clips with no scrollbar — the toolbar that wrote it included. The second
	   handler runs after the first, so the class is already flipped. */
	fill: $el => toggle($el, "fill").click(() => $el.style("overflow", $el.hc("fill") ? "auto" : "")),
	flow: $el => toggle($el, "flow"),

	gap:     $el => knob($el, "--gap", 1, 4, 0.25),
	column:  $el => knob($el, "--column", 14, 44, 1),
	pad:     $el => knob($el, "--pad", 1, 4, 0.25),
	basis:   $el => knob($el, "--basis", 14, 44, 1),
	measure: $el => knob($el, "--measure", 52, 90, 1),
};

// An unregistered word is skipped rather than thrown: a list may name a control
// some other module registers, and half a bar beats no bar.
export const draw = ($el, list) => list.split(" ").filter(Boolean).forEach(word => words[word]?.($el));
