import { div, span } from "/framework/core/View/View.js";

/* The canvas column — moved out of Playground.js once it passed design §9's ~150-line
 * guide (a move, not a rewrite; every line below was already Playground.js's own).
 * Selection, repaint, `set_viewport` and the properties column stay in Playground.js —
 * `set_viewport` also has to repaint `toolbar.js`'s preset buttons, and importing THAT
 * from here would import canvas.js back from toolbar.js (`code` skill's own warning:
 * a parent↔child cycle breaks only on deep reload). This file only ever touches
 * `.pg-canvas` / `.pg-canvas-body` / `.pg-viewport`. */

// Builds `.pg-canvas`: the delegated click listener (`closest` walks up from whatever
// was actually clicked, so a leaf under your pointer wins on the FIRST click — never the
// enclosing group first (panel-insight §Carry — `focus.js:93`'s counter-example) — and
// `pg.$body`, the node `paint_canvas()`/`Playground.apply_change()` write into.
export function canvas(pg){
	return pg.$canvas = div.c("pg-canvas", () => {
		pg.$body = div.c("pg-canvas-body").on("click", e => {
			const hit = e.target.closest?.("[data-id]");
			if (hit) pg.select(hit.dataset.id);
		});
	});
}

// `.pg-viewport` is the "canvas box" of design §4 — its `width` is the preset, and
// `.pg-canvas-body`'s `justify-content: center` (playground.css) centres it.
export function paint_canvas(pg){
	pg.$body.empty(() => { div.c("pg-viewport", () => { pg.constructor.Canvas.render(pg.doc); }); });
}

// `static Canvas` — a part, not a method, so a subclass could replace only how the
// canvas draws (`code` skill §3). `render` never reads a framework class — inline style
// beats every `@layer`, and it makes the future readout free (design §4). Attached onto
// `Playground` itself (`Playground.Canvas = Canvas`, back in Playground.js) so
// `pg.constructor.Canvas.render` above still resolves through the live class, not this
// module's lexical binding.
export class Canvas {
	static render(item){
		return div.c("pg-node", () => {
			if (item.data.label) span.c("pg-node-label", item.data.label);
			item.items.each(kid => this.render(kid));
		}).attr("data-id", item.id).attr("style", item.styles());
	}
}

export default canvas;
