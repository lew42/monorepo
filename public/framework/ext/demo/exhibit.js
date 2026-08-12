import View, { div, a, button, icon } from "../../core/View/View.js";
import demo, { caption } from "./demo.js";
import { stage, zoom } from "./stage.js";

/* Patches demo.app() on — the box demo.tree() builds. The side effect IS the import. */
import "./app.js";

/* ext/Layout is the site's one control surface, so the assembly hard-imports it
   rather than feature-testing: a bar every page has to remember is a bar half the
   detail pages won't have. An ext may lean on an ext; only core may never. */
import layout from "../Layout/layout.js";

/* css: .demo-steer — the slot the bar is drawn into, and redrawn into when the
   render moves. Also .tree-preview; the shell around it keeps .page-preview,
   which Page.css owns. */
View.stylesheet(import.meta, "exhibit.css");

/**
 * demo.exhibit({ stage, def, file, note }) — a demo as a PAGE, and the only shape
 * one has. Three things, in this order, always:
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
 */
demo.exhibit = ({ stage, def, file, note }) => {
	let $bar, target;

	// ⚠ The render first, so the stage lands above the bar — `steer` fires inside
	// it, before `$bar` exists, and the slot draws the first bar itself.
	const steer = next => { target = next; $bar?.empty(() => layout.bar(target)); };

	stage(steer);

	$bar = div.c("demo-steer bleed", () => { if (target) layout.bar(target); });

	demo.source(def, "Source", file).attr("open", "");

	if (note) caption(note);
};

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
 */
demo.page = (name, fn, config) => ({
	name,

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", fn)); },

	content(){
		demo.exhibit({
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
 *     demo.tree({ meta: import.meta, tree: guide, rail: true, height: "18em" })
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
			stage: steer => this.stage(steer),
			def: this.tree,
			file: this.meta && new URL("page.js", this.meta.url).pathname,
			note: this.note,
		});
	},

	// The stage, bare: no field around the tree, the handle on its edge, the width
	// pill on its bottom border — and the controls in the demo app's own titlebar.
	stage(steer){
		let app;
		const { $stage, measure } = stage(() => { app = this.box(this.height, steer); });

		app.$url.append(() => {
			zoom(app.$pages, measure);   // the page region, not the box — the titlebar stays put
			button.c("demo-btn", () => icon("open_in_full")).attr("title", "Fill the window")
				.click(function(){ this.tc("on"); $stage.tc("max"); });
		});

		return $stage.ac("bare");
	},

	// `shown` is what re-points the bar: the box hands it every page it shows.
	box(height, shown){
		return demo.app(this.tree(), { nav: this.rail, shown }).style("height", height ?? "");
	},

	...config,
});

export default demo.exhibit;
export { demo };
