import { div, span, demo } from "/app.js";
import layout from "/framework/ext/Layout/layout.js";
import { btn } from "/framework/ext/Layout/controls.js";
import { watch } from "/framework/ext/demo/stage.js";
import "/framework/ext/demo/responsive.js";   // ⚠ this import is what puts `responsive` on `demo`
import { site } from "./web.js";
import twin from "./twin.js";

/**
 * What every page-layout detail page is: `styles/layouts/detail.js` with the
 * TWO-UP in place of the single stage — the same layout at 390 and at 3440 with
 * one handle between them, the layout bar wired to it, the source open below.
 *
 *     export default new Page(detail({
 *         meta: import.meta, title: "Docs", parts: "header rail toc footer",
 *         layout(site){ return div.c("page full fill flex v", () => { … }); },
 *     }));
 *
 * `parts:` names the layout's modular regions. Each one is a chip in the right
 * drawer and a `this.shows(name)` in `layout()` — a checkbox, never a
 * with-and-without pair of sibling pages. Design record: readme.md.
 *
 * ⚠ `layout()` returns its own `div.c("page …")`: the class string is the whole
 *   lesson, so it has to be the first line the reader is shown.
 * ⚠ `default` is the arrangement contract's word for "shown without being routed
 *   to" (Page.css). Without it a `.page` no Router marked is `display: none`.
 */
export default config => ({
	classes: "standard",
	off: new Set(),

	shows(part){ return !this.off.has(part); },

	// The card simulates a SCREEN, so its layout fills a device viewport; the stage
	// simulates the page, so its layout takes whatever height it needs.
	preview(nav){ return this.preview_card(nav, () => twin(() => this.frame("100%"))); },

	content(){
		demo.exhibit({
			stage: steer => this.two_up(steer),
			def: this.layout,
			file: new URL("page.js", this.meta.url).pathname,
			note: this.note,
		});
	},

	// Both panes are built from one function, so both are captured on the way past:
	// the bar steers the wide one, and a toggle re-runs the pair.
	two_up(steer){
		const views = [];
		const $two = demo.responsive($render => { views.push($render); this.frame(); }, { narrow: 390 });

		// ⚠ The exhibit prints `layout()` below; the two-up's own pane would print
		// the two-line wrapper above it instead.
		$two.el.querySelector(".demo-panes")?.remove();

		steer(views[0]);
		this.toggles(views, level(views));

		return $two;
	},

	// Registered once, on the region: the panel draws the nearest registration at
	// or above the selection, so clicking any box in the layout finds these chips.
	toggles(views, relevel){
		if (!this.parts) return;

		const redraw = () => {
			views.forEach($view => $view.empty(() => this.frame()));
			relevel();
		};

		layout.context(views[0], () => {
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

	/* A simulated screen has a ground — a browser paints one behind every page, and
	   without it a layout's unpainted bands show the stage's board straight through. */
	frame(height){
		return this.layout(site).ac("default").style({ height: height ?? "", background: "var(--surface)" });
	},

	...config,
});

/* The TALLEST pane sets the height and the other grows to meet it. A `min-height`
 * on the page, never a height: it can only add, so no width can ever hide content —
 * and the short pane fills instead of leaving the stage's board under it. The
 * footer, the status bar and the composer still land on the bottom edge, because
 * what absorbs the extra is the layout's own `flex-1` band.
 *
 * ⚠ Cleared before measuring: a previous pass's floor is not evidence.
 * ⚠ `offsetHeight` is the render's OWN box and so is unaffected by `zoom` — the
 *   visual height is that times the factor the fit wrote. */
function level(views){
	const fit = () => {
		const roots = views.map($view => $view.el.firstElementChild);
		if (roots.some(root => !root)) return;

		roots.forEach(root => root.style.minHeight = "");

		const zooms = views.map($view => parseFloat($view.el.style.zoom) || 1);
		const tallest = Math.max(...views.map(($view, i) => $view.el.offsetHeight * zooms[i]));

		roots.forEach((root, i) => root.style.minHeight = Math.round(tallest / zooms[i]) + "px");
	};

	watch(views[0].el.parentElement, fit);
	return fit;
}
