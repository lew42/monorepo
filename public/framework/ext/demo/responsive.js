import View, { div, pre, icon, is } from "../../core/View/View.js";
import { source } from "../../util/source/source.js";
import demo, { btn, caption, source_code } from "./demo.js";
import { simulate, watch, drag } from "./stage.js";

/* css: .demo-responsive, .demo-sims, .demo-sim, .demo-split — plus the `.demo`
   shell (demo.css), whose module is imported above. */
View.stylesheet(import.meta, "responsive.css");

const WIDE = 3440, NARROW = 400, MIN = 0.25, SPLIT = 1 - MIN;

/* demo.responsive(fn) · (fn, "caption") · (fn, { wide: 1440, narrow: 375 })
   ⚠ Importing this file is what puts `responsive` on `demo`. readme.md §8. */
demo.responsive = function(...args){
	const fn = args.find(is.fn);

	if (!fn) return div.c("demo demo-error", "demo.responsive() needs a function");

	const opts = args.find(is.pojo) ?? {};
	const note = args.filter(is.str).join(" ");
	const wide = opts.wide ?? WIDE, narrow = opts.narrow ?? NARROW;

	return div.c("demo demo-responsive", $demo => {
		const $bar = div.c("demo-bar");

		div.c("demo-panes", () => { pre.c("demo-code", () => source_code(source(fn))); });

		let panes;

		const $sims = div.c("demo-sims", () => {
			panes = [pane(fn)];
			handle(split);
			panes.push(pane(fn));
		});

		if (note) caption(note);

		// Log-spaced between the named widths, mirrored around the middle: centered,
		// the panes are twins; either extreme is exactly `wide` beside `narrow`.
		const simulated = share => Math.round(narrow * (wide / narrow) ** ((share - MIN) / (1 - 2 * MIN)));

		// Each pane's factor is measured — `clientWidth / simulated` — rather than
		// derived from the share, so the handle's own width is already accounted for.
		// ⚠ Both rooms read BEFORE either pane is written: interleaved, the second
		// read re-lays-out the document the first write just dirtied.
		function fit(){
			if (!$sims.el.clientWidth) return;   // not laid out yet — the observer is coming

			// Capped at 1:1, the verdict the width presets took — a phone pane in a wide
		// room shows at phone size, never magnified.
		const rooms = panes.map(sim => Math.min(sim.$box.el.clientWidth, sim.width));

			panes.forEach((sim, i) => sim.$size.text(sim.width + "px · "
				+ Math.round(simulate(sim.$view, sim.width, rooms[i]) * 100) + "%"));
		}

		// The drag re-simulates as it re-splits: both widths follow the handle, in
		// opposite directions.
		// ⚠ Unchanged widths mean there is nothing to do, and that is every frame the
		// pointer spends past the clamp — the expensive half must not run for them.
		function split(share){
			share = Math.min(1 - MIN, Math.max(MIN, share));

			const widths = [simulated(share), simulated(1 - share)];

			if (widths.every((width, i) => width === panes[i].width)) return;

			panes.forEach((sim, i) => sim.width = widths[i]);
			panes[0].$box.style("flex", `0 0 ${(share * 100).toFixed(2)}%`);
			fit();
		}

		$bar.append(() => {
			div.c("demo-spacer");
			btn(() => icon("open_in_full"), "Fill the window", function(){
				this.tc("on");
				$demo.tc("max");
			});
		});

		split(SPLIT);
		watch($sims.el, fit);
	});
};

function pane(fn){
	let $view, $size;

	const $box = div.c("demo-sim checkered", () => {
		$view = div.c("demo-render flow", fn);
		$size = div.c("demo-size");
	});

	return { $box, $view, $size, width: 0 };
}

function handle(split){
	return div.c("demo-split")
		.attr("title", "Drag to re-split · right-click to reset")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);

			// the row is the handle's own parent, and only its height moves as you drag
			const row = this.el.parentElement.getBoundingClientRect();

			drag(this.el, ev => split((ev.clientX - row.left) / row.width));
		})
		.on("contextmenu", function(e){
			e.preventDefault();
			split(SPLIT);
		});
}

export default demo.responsive;
