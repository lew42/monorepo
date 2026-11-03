import { div, span, button, icon } from "/app.js";
import { gen } from "/framework/styles/layouts/space/gen.js";
import { render, parse } from "/framework/styles/layouts/space/spec.js";
import PRESETS from "/framework/styles/layouts/space/presets.js";
import Panel from "./Panel.js";

/* The one seam between the layout space (`styles/layouts/space/`) and ext/Panel, in two
   directions: `generate(panel)` draws a seed as a PICTURE in one leaf, `structure(seed)`
   translates the same seed into real panels, and `sow()` is the bar's verb for it. A seed
   is an ADDRESS — the picture keeps it, the translation does not, because by then the
   tree is. Look: templates.css. Design record: doc/generator.md. */

const roll = () => Math.floor(Math.random() * 1e6);

export function generate(panel){
	let $screen, $seed;
	let seed = panel?.get?.("seed") ?? roll();

	// ⚠ The screen is refilled inside a callback — `render()` builds with bare
	// factories, so anywhere else it appends to whatever the captor has since become.
	const show = at => {
		seed = Math.max(0, at);
		panel?.set?.("seed", seed);
		$seed.text("#" + seed);
		$screen.empty(() => { render(gen(seed)); });
	};

	const step = (name, by, title) =>
		button(() => icon(name)).click(() => show(seed + by)).attr("title", title);

	div.c("panel-t panel-t-space", () => {
		$screen = div.c("panel-t-screen");

		div.c("panel-t-dial", () => {
			step("chevron_left", -1, "Previous seed");
			$seed = span.c("panel-t-seed");
			step("chevron_right", 1, "Next seed");
			button(() => icon("casino")).click(() => show(roll())).attr("title", "Roll a layout");
		});
	});

	show(seed);
}

/* ⚠ Every name on the right must exist in the T vocabulary: `paint()` draws a blank body
   for one that doesn't, and logs nothing. ⚠ And every part `gen()` can emit must be on
   the LEFT — `notes` was added to the spec's `PARTS` a day before it was added here, and
   a depth roll then drew checkerboard where a third of its panels should have been. This
   map and `spec.js`'s `PARTS` are one commit-unit. Why these twelve: doc/generator.md. */
const PANELS = {
	topbar: "navbar", toolbar: "navbar", brand: "brand",     hero:  "hero",  footer: "footer",
	menu:   "rail",   toc:     "toc",    sections: "split",  notes: "testimonials",
	cards:  "features", tiles: "logos",  rows: "changelog",
};

/* (seed | text, depth) → a detached `Panel` tree, pure: `gen` and `parse` are, so the same
   pair is the same tree forever. A node with children is a split — `v` in its class list
   runs it as a column — and a node without is a leaf wearing its part's template.

   TWO doors, because a layout is text either way: a NUMBER is a seed and `gen()` writes
   the text; a STRING is the text itself, or the name of one of the nine in
   `styles/layouts/space/presets.js` — which is what makes every preset a starting
   arrangement rather than a picture of one.
   ⚠ `depth` is the generator's MAX nesting, and a deep roll is a deep tree: past about
     4 the panels are slivers, which is the layout space's own trade (its readme) and not
     something to clamp here — a translation that quietly disagreed with the picture
     beside it would be the worse bug. Text ignores it: a preset has its own shape. */
export function structure(seed, depth){
	const text = typeof seed === "string" ? PRESETS[seed] ?? seed : gen(seed, depth);

	return node(parse(text)[0] ?? { line: "", kids: [] });
}

function node(spec){
	const [head = "", tail = ""] = spec.line.split(">");
	const words = head.trim().split(/\s+/).filter(Boolean);
	const grow = share(words);

	if (!spec.kids.length) return new Panel({ data: { template: PANELS[part(tail)] ?? "blank", grow, ...arrangement(words) } });

	// A spec nests a box per declaration, so a rail-less body is a row inside a row. One
	// child is not a split — `close()` would absorb it on sight, so never build it.
	const kids = spec.kids.map(node);
	if (kids.length === 1) return kids[0].assign({ data: { ...kids[0].data, grow } });

	return new Panel({ data: { dir: words.includes("v") ? "col" : "row", grow }, items: kids });
}

const part = tail => tail.trim().split(/\s+/)[0];

/* The spec's own layout words as PANEL words, so a preset arrives with its arrangement on
   rather than as a tree of block bodies. A LEAF only: a node with children is a split, and
   a split's arrangement is `dir` plus the grips between its panels — `wrap` and `gap` have
   no reader there, so writing them would be data that draws nothing.
   ⚠ `gen()` emits no `grid` word at ALL (its claims are `flow measure fluid full --basis:`),
     which is why 0 of 8 sown seeds ever became one — that is the grammar's gap, not this
     translator's, and `presets.masonry` is the one shipped spec that says grid today. */
const DISPLAYS = { grid: "grid", wall: "grid", masonry: "grid", flex: "flex" };

function arrangement(words){
	const display = words.map(word => DISPLAYS[word]).find(Boolean);
	if (!display) return {};

	const on = { display };

	if (words.includes("gap")) on.gap = "1em";                                        // framework.css's `.gap`
	if (display === "flex" && words.includes("v")) on.dir = "col";
	if (display === "flex" && words.includes("wrap")) on.wrap = "wrap";
	if (display === "grid" && words.some(word => word.startsWith("--column:"))) on.cols = "auto";

	return on;
}

/* `flex-1` and `--basis:15em` are both claims on a share, which is Panel's `grow`. One
   share is 8em: a fluid track claims eight, a fixed track its own measure, and a track
   claiming nothing takes one — measured against the real page in doc/generator.md. */
function share(words){
	const basis = words.find(word => word.startsWith("--basis:"));

	if (basis) return +(parseFloat(basis.slice(8)) / 8).toFixed(2);
	return words.some(word => word === "flex-1" || word === "fluid") ? 8 : 1;
}

/* The bar's verb: this panel becomes a rolled layout. `Panel.absorb()` in reverse — the
   same remove/move pair, so there is no fifth way to change structure.
   ⚠ `depth` rides the ROOT panel (`root.depth`), never `data` — it is a roll parameter,
     not a property of any panel, and the tree it produces is its own address the moment
     it exists. Same instance-state rule as `templates` and `focus`. */
export function sow(item, seed, depth = item.root().depth){
	const made = structure(seed ?? address(item), depth);

	/* ⚠ The FIFTH verb that replaces `data` wholesale, and it widows live duplicates exactly
	   as `split()` did until 2026-08-16: a master keeps its id and still resolves, while
	   holding none of the shared keys, so every copy of it reads blank. Hand the mastership
	   on FIRST — before the keys are gone — and each copy is promoted rather than emptied. */
	item.walk(panel => panel.bequeath());

	[...item.items].forEach(kid => item.remove(kid));
	item.data = { ...made.data, grow: item.get("grow") };
	delete item.draw;
	[...made.items].forEach(kid => kid.move(item));

	// ⚠ A one-leaf seed moves no children, so nothing above reaches the workspace and the
	// click is dead — no save, no repaint. `data` was replaced wholesale, so say so plainly.
	if (!made.items.length) item.emit("change");

	return item;
}

// A panel showing `space` materializes the layout it is SHOWING; anywhere else rolls one.
const address = item => (item.get("template") === "space" ? item.get("seed") : undefined) ?? roll();

export default generate;
