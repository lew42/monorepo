import View, { div, span, button, icon } from "/framework/core/View/View.js";
import drawer from "/framework/ext/drawer/drawer.js";
import { ALIGN, COMPASS, PLACE, glyph } from "./glyphs.js";
import { place } from "./toolbar.js";
import { coalesce } from "./grip.js";

/* The tools that sit ON a panel rather than in its bar — revealed by the same hover the
   bar is. `TOOLS` holds the module DEFAULTS only; `vocab.js`'s `tools(item)` resolves the
   live per-workspace flags, and each call here is gated at its one call site — `align_grid`
   in `overlays.js`, `zoom_scrub` in `view()`. Everything
   defaults on while the vocabulary is still being felt out (the owner, 2026-08-16): "I want to
   see all the core tools for now." css: .panel-align, .panel-tool, .panel-zoom.
   Record: readme.md. */
View.stylesheet(import.meta, "tools.css");

export const TOOLS = { align: true, zoom: true, inspect: true };

// The four codes sitting on the very strip split.css's edge target claims too — a corner
// gets to overlap it on purpose (split.css); these four back off it instead (tools.css).
const EDGE_MID = ["tc", "cl", "cr", "bc"];

/* Selecting a panel puts its words in the shared rail — which is the whole reason the rail
   was pulled out of ext/layout. `panel-focus` is the contract that already existed: a
   document event carrying the panel or `null`, so this reads a selection with no import in
   either direction and nothing here knows who announces it.

   ⚠ `properties.js` arrives LAZILY. It imports `workspace.js`, and a static import here
   would close the ring workspace → tools → properties → workspace — the kind that breaks
   on deep reloads only. ⚠ Nothing is built by a bare factory after the `await`: every
   element lands inside an `empty()` callback, which re-establishes the captor. */
document.addEventListener("panel-focus", async e => {
	if (!e.detail) return drawer.refresh();
	if (!(e.detail.root().tools?.inspect ?? TOOLS.inspect)) return;

	const { fields } = await import("./properties.js");

	drawer(($slot, $body) => {
		$slot.empty(() => { span.c("panel-props-tag", "panel"); });
		$body.empty(() => { div.c("panel-props", () => fields(e.detail)); });
	});
});

/* A selected run of TEXT is the same story one level down, and it takes the rail the same
   way — so the two selections cannot both be showing and the last thing you pointed at is
   the thing you are editing. `text.js` announces on the document exactly as focus does. */
document.addEventListener("panel-text", async e => {
	if (!TOOLS.inspect || !e.detail) return;

	const { text_fields } = await import("./text.js");

	drawer(($slot, $body) => {
		$slot.empty(() => { span.c("panel-props-tag", e.detail.el.tagName.toLowerCase()); });
		$body.empty(() => { div.c("panel-props", () => text_fields(e.detail)); });
	});
});

/* The 3×3, drawn ON the panel at the nine places it names — an arrow pointing at each
   corner and edge, a dot in the middle. A grid cell IS its placement, so a button's own
   alignment inside its cell is just the code it carries and nothing computes a position;
   the grid's padding is what keeps a corner arrow off the corner. */
export function align_grid(item, $body){
	/* ⚠ The overlay itself never hit-tests — only the nine buttons do. It covers the whole
	   body, so without that every click meant for the content under it would die here. */
	const $grid = div.c("panel-align");

	return $grid.append(() => ALIGN.forEach(code => {
		button.c("panel-btn panel-tool", glyph(COMPASS[code], code))
			.ac(EDGE_MID.includes(code) && "panel-tool-" + code)
			.style({ "--tool-y": PLACE[code[0]], "--tool-x": PLACE[code[1]] })
			.attr("title", "Align " + code)
			.ac(item.get("align") === code && "on")
			.click(function(){
				$grid.el.querySelectorAll(".panel-tool.on").forEach(el => el.classList.remove("on"));
				this.ac("on");
				item.set("align", code);
				place($body, code);
			});
	}));
}

/* Drag to zoom, click to show the thing whole. Lifted in shape from `ext/demo`'s
   `magnifier()` and rebuilt on this module's own `coalesce()` — ext/Panel importing the
   demo chrome would drag `stage.css` and the whole stage behind it, which is the same
   call `coalesce()` itself already records.

   ⚠ The `zoom` PROPERTY, never `transform: scale()`. Scale looks identical and lies: a
   scaled box still occupies its unscaled size, so nothing re-lays-out — and a panel's
   templates size themselves in `cq` units against the body, which only re-queries because
   `zoom` genuinely changes the box.
   ⚠ It MULTIPLIES: 240px of travel doubles the zoom whether you started at 25% or 200%. */
export function zoom_scrub(item, $body){
	const at = () => parseFloat($body.el.style.zoom) || 1;
	const set = factor => $body.style("zoom", Math.min(4, Math.max(0.1, factor)));

	return button.c("panel-btn panel-zoom", () => { icon("zoom_in"); })
		.attr("title", "Drag to zoom · click to fit")
		.on("pointerdown", function(e){
			e.preventDefault();
			this.el.setPointerCapture(e.pointerId);

			const from = at(), x = e.clientX;
			let moved = false;

			coalesce(this.el, ev => { moved = true; set(from * 2 ** ((ev.clientX - x) / 240)); });
			this.el.addEventListener("pointerup", () => moved || $body.style("zoom", ""), { once: true });
		});
}
