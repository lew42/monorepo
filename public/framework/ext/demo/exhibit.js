import View, { div, a, h2 } from "../../core/View/View.js";
import demo, { caption } from "./demo.js";
import { stage } from "./stage.js";

/* Patches demo.app() on — the box demo.tree() builds. The side effect IS the import. */
import "./app.js";

/* ext/layout is the site's one control surface, so the assembly hard-imports it
   rather than feature-testing: a bar every page has to remember is a bar half the
   detail pages won't have. An ext may lean on an ext; only core may never. */
import layout from "../layout/layout.js";

/* css: .demo-exhibit, .demo-exhibit-render, .demo-exhibit-def, .demo-steer — the band
   and the slot the bar is drawn into. Also .tree-preview; the shell around it keeps
   .page-preview, which Page.css owns. And the ground under a `bleed` stage, which is
   stage.js's box but this page's decision — a specimen with no edge is an exhibit
   problem, not a stage one. */
View.stylesheet(import.meta, "exhibit.css");

/**
 * demo.exhibit({ page, stage, def, file, note }) — a demo as a PAGE, and the only
 * shape one has. Three things, in this order, always:
 *
 *   1. the thing running, on a stage you can drag narrower;
 *   2. a layout bar wired to it — inspect it, toggle its words;
 *   3. the definition that built it, open, with the whole file one click away.
 *
 * `stage(steer)` builds the render into the page and calls `steer(target)` with
 * whatever the bar points at — again, every time that target moves, which is what
 * keeps the bar on the page a tree demo has just navigated to.
 *
 * `def` is a FUNCTION and its source is the lesson: the reader gets the tree or
 * the render in front of them, not the imports and the `export default` wrapped
 * around it. `file` is for whoever wants those too.
 *
 * `page` is the page being built — hand it `this` and its children become the
 * Variants wall below. One band holds the render and the definition, so on a
 * wide monitor the code moves beside the thing instead of under it (exhibit.css).
 *
 * Three sugars are config over this: `demo.page()` and `demo.tree()` below, and
 * `demo.layout()` in layout.js — a function, a site tree and a whole page.
 */
demo.exhibit = ({ page, stage, def, file, note }) => {
	let $bar, target;

	// ⚠ The render first, so the stage lands above the bar — `steer` fires inside
	// it, before `$bar` exists, and the slot draws the first bar itself.
	const steer = next => { target = next; $bar?.empty(() => layout.bar(target)); };

	div.c("demo-exhibit bleed", () => {
		div.c("demo-exhibit-render", () => {
			stage(steer);
			$bar = div.c("demo-steer", () => { if (target) layout.bar(target); });
		});

		div.c("demo-exhibit-def", () => {
			demo.source(def, "Source", file).attr("open", "");
			if (note) caption(note);
			overrides(def);
		});
	});

	if (page?.children.size) variants(page);
};

/* What a consumer can change, read off the definition itself: the argument it takes —
   `source()` prints an arrow's BODY, so a parameter is otherwise never shown — and the
   tokens it sets. Neither, and there is no line rather than a boilerplate one. */
function overrides(def){
	const src = String(def);
	const args = src.match(/^[\w\s]*\(([^)]*)\)/)?.[1].trim();
	const tokens = [...new Set([...src.matchAll(/["'](--[\w-]+)["']\s*[,:]/g)].map(m => `\`${m[1]}\``))];
	const has = [args && `its argument \`${args}\``,
		tokens.length && `the token${tokens.length > 1 ? "s" : ""} ${tokens.join(", ")}`].filter(Boolean);

	if (has.length) caption(`**Overrides:** ${has.join(", ")} — in the source above.`);
}

/* The simple example IS the category for the complex ones: a demo page's children
   are its variants, drawn with the ONE card system rather than a wall of its own.
   ⚠ Called after the band, as direct children of the page — `previews()` carries
   `bleed`, and both the track and its gutter payback need the child combinator. */
function variants(page){
	h2("Variants");
	return page.previews();
}

/**
 * demo.page(name, fn, config) — a function as a demo page: the visual-ToC entry.
 *
 *     children: [ demo.page("range", ranges), demo.page("buttons", buttons) ],
 *     initialize(){ this.catalog(); }
 *
 * The card is the render at half size, drawn fresh per call. The bar steers the
 * render, so the reader can point at any box inside the example and read back the
 * line that builds it. The title derives from the name, so a demo is called what
 * its url is called; `file:` in the config adds the "whole file" link, for a demo
 * whose function is worth reading in its own module.
 *
 * `children:` in the config makes this demo the category for its own variants.
 */
demo.page = (name, fn, config) => ({
	name,

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", fn)); },

	content(){
		demo.exhibit({
			page: this,
			stage: steer => demo.stage(fn, steer).ac("bleed"),
			def: fn,
			file: this.file,
			note: this.note,
		});
	},

	...config,
});

/**
 * demo.tree(config) — a site TREE as a demo page, the way demo.page() is a
 * function as one.
 *
 *     export default new Page(demo.tree({ meta: import.meta, tree: shop }));
 *     demo.tree({ meta: import.meta, tree: guide, rail: true, min: "18em" })
 *
 * The card in the rail IS the tree at half size — no chrome, no label; the mini
 * app speaks for itself, and an invisible link rides over it (an `<a>` *around* a
 * live tree would nest anchors).
 *
 * ⚠ `tree` is a function, and what prints as the lesson: a `Page` caches its view,
 * so the card's copy and the stage's copy would fight over one DOM node — and a
 * function is the only thing that can be stringified.
 *
 * ⚠ `rail`, not `nav`: `nav` is a Page method, and a property of that name would
 * shadow it the moment `nav_for()` asked this child for its own menu entry.
 */
demo.tree = config => ({

	preview(nav){
		return div.c("page-preview tree-preview", () => {
			div.c("page-preview-thumb", () => this.box());
			a.c("page-preview-link").href(nav.url).attr("aria-label", nav.label);
		});
	},

	content(){
		demo.exhibit({
			page: this,
			stage: steer => this.stage(steer),
			def: this.tree,
			file: this.meta && new URL("page.js", this.meta.url).pathname,
			note: this.note,
		});
	},

	// The stage, bare: no field around the tree, the handle on its edge, the width
	// pill on its bottom border. The controls are the stage's own strip above it —
	// they were in the demo app's titlebar while a bare stage had nowhere to put
	// them, and they pointed at the page region rather than at the box, so the
	// readout could not report what a width had simulated. Both fixed by moving out.
	stage(steer){
		const { $stage } = stage(() => { this.box(this.min, steer); });

		return $stage.ac("bare");
	},

	// `shown` is what re-points the bar: the box hands it every page it shows.
	// ⚠ `min-height`, never `height` — a floor can only add, so no tree config can
	// ever clip itself (app.css `.demo-app-pages` used to force `overflow: auto`
	// under a fixed `height`, cutting anything taller off with no sign it happened —
	// demo-merge proposal §1, the 17-site fix).
	box(min, shown){
		return demo.app(this.tree(), { nav: this.rail, shown }).style("min-height", min ?? "");
	},

	...config,
});

export default demo.exhibit;
export { demo };
