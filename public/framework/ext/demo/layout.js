import { div, span } from "../../core/View/View.js";
import demo from "./demo.js";
import { two } from "./two.js";
import twin from "./twin.js";

/* Patches demo.exhibit() on — this is config over that assembly. */
import "./exhibit.js";

/* The site's one control surface, where `parts:` puts its chips. Imported as
   `panel` so `layout` can stay the page's own method throughout this file. */
import panel from "../layout/layout.js";
import { btn } from "../layout/controls.js";

/**
 * demo.layout(config) — a whole PAGE as a demo page, the way `demo.page()` is a
 * function and `demo.tree()` is a site tree. One catalog leaf, config only:
 *
 *     export default new Page(demo.layout({
 *         meta: import.meta, title: "Docs",
 *         twin: true, parts: "header rail toc footer",
 *         layout(){ return div.c("page full fill flex v", () => { … }); },
 *     }));
 *
 * `layout()` returns its own `div.c("page …")` — the class string is the lesson, so
 * it has to be the first line of what the reader is shown — and it is what prints as
 * the definition. The three optional keys:
 *
 *   twin    the specimen is a SCREEN: the card is a phone beside a 3440 monitor
 *           and the stage is the two-up, one handle between two live widths
 *   parts   the layout's modular regions, space separated. Each is a chip in the
 *           panel and a `this.shows(name)` in `layout()` — a checkbox, never a
 *           with-and-without pair of sibling pages
 *   height  a height for the frame, only where the shape wears `fill`
 *
 * Design record: readme.md.
 */
demo.layout = config => ({
	classes: "standard",
	off: new Set(),

	shows(part){ return !this.off.has(part); },

	// A twin card simulates two SCREENS, so its layout fills a device viewport; a
	// plain card is the shape at quarter size, framed exactly as the page is.
	preview(nav){
		return this.preview_card(nav, () => this.twin
			? twin(() => this.frame("100%"))
			: div.c("zoom-25", () => this.frame()));
	},

	content(){
		demo.exhibit({
			page: this,
			stage: steer => this.stage(steer),
			def: this.layout,
			file: this.meta && new URL("page.js", this.meta.url).pathname,
			note: this.note,
		});
	},

	// Both panes of a two-up are built from one function, so both are captured on the
	// way past: the bar steers the wide one, and a chip re-runs the pair.
	stage(steer){
		if (this.twin){
			const { $stage, $views, redraw } = two(() => this.frame(), { narrow: 390, level: true });

			steer($views[0]);
			this.toggles($views[0], redraw);

			return $stage.ac("bleed");
		}

		return demo.stage(() => this.frame(), $render => {
			steer($render);
			this.toggles($render, () => $render.empty(() => this.frame()));
		}).ac("bleed");
	},

	// Registered once, on the region: the panel draws the nearest registration at or
	// above the selection, so clicking any box in the layout finds these chips.
	toggles($view, redraw){
		if (!this.parts) return;

		panel.context($view, () => {
			span.c("layout-tag h4", "parts");

			div.c("layout-chips flex wrap", () => this.parts.split(" ").forEach(part => {
				const $chip = btn(part, () => {
					this.off.has(part) ? this.off.delete(part) : this.off.add(part);
					$chip[this.shows(part) ? "ac" : "rc"]("on");
					redraw();
				}).ac(this.shows(part) && "on");
			}));
		});
	},

	/* ⚠ `default` is the arrangement contract's own word for "shown without being
	     routed to" (Page.css). Without it a `.page` no Router marked is `display: none`
	     and nothing throws.
	   ⚠ A simulated SCREEN has a ground — a browser paints one behind every page, and
	     without it a layout's unpainted bands show the stage's board straight through.
	     A single stage frames a SHAPE, whose own washed boxes are the picture. */
	frame(height){
		return this.layout().ac("default").style({
			height: height ?? this.height ?? "",
			background: this.twin ? "var(--surface)" : "",
		});
	},

	...config,
});

export default demo.layout;
export { demo };
