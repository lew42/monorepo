import { div, span, button } from "/framework/core/View/View.js";
import { simulate, watch, magnifier, ruler, WIDTHS } from "/framework/ext/demo/stage.js";
import { pane } from "/framework/ext/demo/pane.js";

/* The viewport SET — `fill` (default, one bare box; the drawer's grip is the handle,
   zero code here) · `one` (a single device width) · `all` (all four tiled) · `twin`
   (390 beside 3440, one height via `pane()`). Every non-fill box is another VIEW of
   the same root (`ws.mount()` — N boxes, one tree), framed in a 1em `panel-viewport`
   border and labelled with its device px width. `Fit` zooms each to its cell
   (`simulate`/`watch`, imported, never wrapped); `100%` shows it literal; the
   magnifier drags a manual zoom on the one box a mode makes sense for (`fill`, or
   `one`'s device) — `all`/`twin` have no single box to drag. design §3, §6.

   ⚠ All seven boxes (fill + four devices + two twin panes) mount ONCE, here, and
   never again: `Workspace.mount()` only ever GROWS `$roots[]` (Workspace/doc/
   decisions.md — no `unmount`), so rebuilding boxes on every mode switch would leak
   one per switch. Switching modes only shows/hides what already exists — `pane()`'s
   own ResizeObserver re-fits itself the instant a hidden box becomes visible again
   (pane.js's own "hidden until the first fit" trap, which is exactly this case).
   Record: readme.md, doc/viewports.md. css: workspace.css. */

const DEVICES = WIDTHS.map(([width, name]) => ({ width, name }));
const TWIN = [{ width: 390, height: 844 }, { width: 3440, height: 1440 }];
const ONE_DEFAULT = "desktop";

// Built once per `Workspace`; stored as `ws.vp`. `viewport_controls()` is the bar's
// half — it only ever READS this, rebuilt fresh on every `draw_bar()`.
export function viewports(ws){
	let mode = ws.viewports[0] ?? "fill", fit = true;
	const frames = [];
	let $fill, $grid, $twin, $dial, $readout_fill, $readout_one;

	// ⚠ Built FIRST: `cell()` below hands the desktop frame's box straight to
	// `ruler()`, which needs `$readout_one` to already exist. `viewport_controls()`
	// re-parents both into the bar the instant it draws — where they land now (a
	// stray moment as the Workspace wrap's own children, never painted, the
	// constructor is still running) doesn't matter.
	$readout_fill = span.c("panel-workspace-readout muted");
	$readout_one = span.c("panel-workspace-readout muted").hide();

	const $stage = div.c("panel-workspace-stage flex-1", () => {
		$fill = ws.mount();

		$grid = div.c("panel-viewport-grid", () => {
			DEVICES.forEach(({ width, name }) => frames.push(cell(width, name)));
		});

		$twin = div.c("panel-viewport-twin flex gap", () => {
			TWIN.forEach(twin_cell);
		});
	});

	ruler($fill, $readout_fill);

	// One frame, `all`/`one` share it — `simulate`/`watch` do the fitting, imported
	// straight from stage.js rather than rebuilt.
	function cell(width, name){
		let $inner;
		const $frame = div.c("panel-viewport flex-1").attr("data-device", name);

		$frame.append(() => {
			$inner = ws.mount();
			span.c("panel-viewport-label", width + "px");
		});

		const refit = () => {
			if (!$frame.el.clientWidth) return;
			// ⚠ Capped at the device's OWN width, never past it — a 390px phone in a
			// 750px grid cell (two columns, "all") wants to sit at its real size with
			// room beside it, not blow up 2× to fill the cell. `simulate()` fits
			// whatever `room` it's handed; capping `room` at `width` is what turns
			// "fit" into "shrink, never enlarge" without touching stage.js.
			if (fit) simulate($inner, width, Math.min($frame.el.clientWidth, width));
			// `flex: 0 0 auto; width` too, not just cleared — `.panel-workspace` is
			// `flex: 1 1 0` by default (panel.css) and would stretch to the FRAME's
			// width instead of showing the device's literal one; the frame itself
			// scrolls to it (`overflow: auto`, workspace.css) rather than clipping it.
			else $inner.style({ flex: "0 0 auto", width: width + "px", zoom: ws.zoom === 1 ? "" : ws.zoom });
		};

		watch($frame.el, refit);
		if (name === ONE_DEFAULT) ruler($inner, $readout_one);

		return { $frame, name, width, $inner, refit };
	}

	// `pane()`'s own aspect-ratio trick — both devices land on one height with no
	// second measured pass. Always fitted; there is no "100%" for a device that has
	// to share a row with one 8.8× as wide. design §3.
	// ⚠ `pane()`'s box carries `flex: width/height 1 0` — that only means WIDTH if
	// the box is a DIRECT child of the ROW (`.panel-viewport-twin`, `flex gap`). A
	// column wrapper around it (box, then a label below) turns that flex-basis into
	// a HEIGHT instead and the two panes stop landing on one height — the label is
	// appended INSIDE the box instead (`position: absolute`, workspace.css).
	function twin_cell({ width, height }){
		pane({ width, height }, () => ws.mount()).ac("panel-viewport")
			.append(() => span.c("panel-viewport-label", width + "px"));
	}

	function refit_all(){
		if (mode === "fill") return $fill.style("zoom", ws.zoom === 1 ? "" : ws.zoom);
		if (mode === "twin") return;                 // pane() manages its own fit
		frames.forEach(f => f.refit());               // hidden ones no-op (clientWidth 0)
	}

	// A mode switch or a click on Fit/100% both land here.
	function set(next){
		mode = next;
		ws.viewports = [mode];

		if (mode === "fill") $fill.show(); else $fill.hide();
		if (mode === "one" || mode === "all") $grid.show(); else $grid.hide();
		if (mode === "twin") $twin.show(); else $twin.hide();

		if (mode === "one") $grid.ac("panel-mode-one"); else $grid.rc("panel-mode-one");
		frames.forEach(f => f.$frame[mode === "all" || (mode === "one" && f.name === ONE_DEFAULT) ? "show" : "hide"]());

		$readout_fill[mode === "fill" ? "show" : "hide"]();
		$readout_one[mode === "one" ? "show" : "hide"]();

		refit_all();
	}

	set(mode);   // the seed above only picked the word; this shows/hides for real

	function set_fit(on){
		fit = on;
		refit_all();
	}

	// The manual dial — `fill`'s own box, or `one`'s single device; `all`/`twin` have
	// no ONE box to drag, so it's a no-op there (still drawn, matching the readout).
	function ref(){
		return mode === "fill" ? $fill : mode === "one" ? frames.find(f => f.name === ONE_DEFAULT)?.$inner : null;
	}

	function zoomed(){
		const $r = ref();
		return $r ? parseFloat($r.style("zoom")) || 1 : 1;
	}

	function set_zoom(factor){
		const $r = ref();
		if (!$r) return;
		fit = false;
		ws.zoom = Math.min(4, Math.max(0.1, factor));
		$r.style("zoom", ws.zoom);
	}

	function whole(){
		fit = true;
		ws.zoom = 1;
		refit_all();
	}

	$dial = magnifier(set_zoom, zoomed, whole);

	return {
		$stage,
		get mode(){ return mode; },
		get fit(){ return fit; },
		set, set_fit,
		$dial, $readout_fill, $readout_one,
	};
}

/* The bar's half — three viewport-set buttons, Fit/100% (device modes only), the
   dial and the readout. Rebuilt on every `draw_bar()`; the boxes it moves into place
   (`$dial`, the readouts) are `viewports()`'s own, never rebuilt here — re-parenting
   an already-live View is a plain `appendChild`, not a second ResizeObserver. */
export function viewport_controls(ws){
	const vp = ws.vp;
	if (!vp) return;

	div.c("panel-workspace-vp flex gap v-center", () => {
		// ⚠ `draw_bar()` after every click: `vp.set()`/`vp.set_fit()` only touch the
		// stage — nothing else redraws the bar's own "on" class.
		["one", "all", "twin"].forEach(name => button.c("panel-workspace-mode", name === "one" ? "1" : name)
			.ac(vp.mode === name && "on")
			.attr("title", name === "one" ? "One viewport" : name)
			.click(() => { vp.set(vp.mode === name ? "fill" : name); ws.draw_bar(); }));

		if (vp.mode === "one" || vp.mode === "all"){
			[["fit", "Zoom to fit"], ["100%", "Actual size"]].forEach(([word, title]) => button.c("panel-workspace-mode", word)
				.ac(((word === "fit") === vp.fit) && "on")
				.attr("title", title)
				.click(() => { vp.set_fit(word === "fit"); ws.draw_bar(); }));
		}

		div.c("panel-workspace-dial flex v-center", vp.$dial, vp.mode === "one" ? vp.$readout_one : vp.$readout_fill);
	});
}
