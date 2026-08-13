import { Page, View, div, span, h4, code, icon } from "/app.js";
import detail from "/framework/styles/layouts/detail.js";
import layout from "/framework/ext/Layout/layout.js";
import { chips, btn } from "/framework/ext/Layout/controls.js";
import { widget } from "../parts.js";

View.stylesheet(import.meta, "editor.css");

/* Three artboards, as data. A node is a class string and either kids or a word —
   which is the whole model, because on this site a design IS a class string. */
const ARTBOARDS = {
	Hero: { name: "Hero", words: "flex v gap pad", kids: [
		{ name: "Eyebrow", words: "h4 muted", text: "NEW" },
		{ name: "Headline", words: "h1", text: "Ship the shape" },
		{ name: "Actions", words: "flex gap", kids: [
			{ name: "Primary", words: "pad surface", text: "Get started" },
			{ name: "Secondary", words: "pad wash", text: "Read the docs" },
		] },
	] },
	Wall: { name: "Wall", words: "grid gap auto pad", kids: [
		{ name: "Card", words: "pad surface", text: "One" },
		{ name: "Card", words: "pad surface", text: "Two" },
		{ name: "Card", words: "pad surface", text: "Three" },
	] },
	Shell: { name: "Shell", words: "flex gap pad", kids: [
		{ name: "Rail", words: "basis pad wash", text: "Rail" },
		{ name: "Main", words: "flex-1 pad surface", text: "Main" },
	] },
};

// Pages + layers on the left, the artboard in the middle, the selection's own words
// on the right. One selection drives all three.
function editor(){
	let $layers, $canvas, $props, $sel, nodes = [];

	const select = $node => {
		$sel?.rc("on");
		$sel = $node?.ac("on");
		$props.empty(() => properties($sel));
		$layers.empty(() => layers(nodes, select, $sel));
	};

	const open = name => {
		nodes = [];
		$canvas.empty(() => node(ARTBOARDS[name], 0, nodes, select));
		select(nodes[0].$view);
	};

	const $editor = widget(div.c("apps-editor surface flex v", () => {
		// Placed now, filled last: its toggles point at panels built below.
		const $bar = div.c("apps-bar flex v-center gap wash pad").style("--pad", "0.3em 0.6em");

		div.c("apps-body flex", () => {
			$layers = div.c("apps-panel basis flex v wash pad").style({ "--basis": "9em", "--pad": "0.5em" });
			$canvas = div.c("apps-canvas flex-1 pad");
			$props  = div.c("apps-panel basis flex v gap wash pad").style({ "--basis": "14em", "--gap": "0.6em", "--pad": "0.6em" });
		});

		$bar.append(() => {
			Object.keys(ARTBOARDS).forEach(name => btn(name, () => open(name)));
			div.c("flex-1");
			eye($layers, "layers");
			eye($props, "properties");
		});
	}));

	open("Hero");
	return $editor;
}

// A panel is modular, so it is a toggle rather than a second example page.
const eye = ($panel, label) =>
	btn(label, function(){ this.tc("on"); $panel.tc("apps-off"); }).ac("on");

/* ⚠ The entry is pushed BEFORE its kids are built, so the layer list comes out
   parent-first — the order a tree is read in. */
function node(spec, depth, nodes, select){
	const entry = { spec, depth };
	nodes.push(entry);

	entry.$view = div.c("apps-node " + (spec.words ?? ""), () => {
		if (spec.kids) spec.kids.forEach(kid => node(kid, depth + 1, nodes, select));
		else span(spec.text ?? spec.name);
	}).click(function(e){ e.stopPropagation(); select(this); });

	return entry.$view.assign({ spec });
}

const layers = (nodes, select, $sel) => nodes.forEach(({ spec, depth, $view }) =>
	btn(() => { icon(spec.kids ? "folder" : "crop_square"); span(spec.name); }, () => select($view))
		.ac("apps-layer").ac($view === $sel && "on")
		.style("padding-inline-start", 0.4 + depth * 0.9 + "em"));

/* The panel is ext/Layout's, in the box: the same word registry (`layout.words`),
   the same chips, and the line that would build the selection at the top. A parallel
   vocabulary here would be a second answer to "what is this box". */
function properties($el){
	if (!$el){ span.c("muted", "Nothing selected."); return; }

	h4(`${$el.spec.name} — ${$el.spec.kids ? "container" : "item"}`);
	code(`div.c("${words_of($el)}")`);

	if ($el.spec.kids){
		row(() => layout.words.mode($el));
		row(() => chips($el, "v wrap auto gap"));
		row(() => { layout.words.gap($el); layout.words.column($el); });
	}

	row(() => chips($el, "pad surface wash flex-1 basis"));
	row(() => layout.words.pad($el));
}

const row = fn => div.c("flex wrap gap", fn).style("--gap", "0.3em");
const words_of = $el => [...$el.el.classList].filter(word => word !== "apps-node" && word !== "on").join(" ");

export default new Page(detail({
	meta: import.meta,
	title: "Editor",
	description: "Layers, a canvas, and a properties panel that really edits — the Figma shape.",
	icon: "design_services",

	layout: editor,

	note: "**Click a box on the canvas** — or a row in the layers list — and the right panel fills with the words that box wears. The chips and knobs are `ext/Layout`'s own (`layout.words`, `chips()`), so a property here is a real class or token on a real element, and the line at the top of the panel is what you would paste into a page. The two panels are toggles in the titlebar, not two example pages.",
}));

export { editor };
