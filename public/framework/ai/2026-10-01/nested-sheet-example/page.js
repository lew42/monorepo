import { AITask, View, md, h2, div, p, span, label, input } from "/app.js";
import grip from "/framework/ext/grip/grip.js";

View.stylesheet(import.meta, "demo.css");

/* THE OWNER'S QUESTION (2026-10-01, part of the clean-dictate-mode thread):
   if Clean mode removes the ✦ sheet's text area, the bottom bar that used to
   be pushed down by it should become its own responsive-height bar — "its own
   mini sheet system" living inside the main sheet. Does ext/drawer's sheet
   support nesting one sheet inside another?

   SHORT ANSWER, proven live below: yes, a bar inside the sheet CAN have its
   own independent, draggable height — but not by putting one
   `DrawerRailSheetV1` (ext/drawer/rail.js) inside another. That class is a
   SINGLE fixed-position box glued to the real screen's own edge and to the
   browser's address bar (open/full/closed, ext/drawer/doc/sheet.md) — a
   second instance of it would not sit inside the first at all; it would pin
   itself to the real screen's edge too (`position: fixed` always measures
   from the viewport, or the nearest `contain`/`transform` ancestor, never
   from its own DOM parent) and float on top of the first one's content
   instead of living inside it.

   What actually works is one level down: the sheet's own height is just a
   CSS variable (`--sheet-h`) that `ext/grip`'s handle writes on every drag
   (`ext/drawer/rail.js`'s `handle()`). Nothing about `grip()` ties it to
   being used once per page — it reads its OWN parent element's own edge, so
   a second `grip()` call, mounted inside a second box, drags THAT box's own
   height, completely unaware of the first. Two nested boxes, two grips, two
   CSS variables — that is the whole trick, and it needs no new code. */
export default new AITask({
	meta: import.meta,

	extra(){
		md("**Yes — a bottom bar inside the sheet can resize on its own, independently of the sheet around it.** Not by nesting the `DrawerRailSheet` class inside itself (that breaks — see below), but by giving the bar its own [`ext/grip`](/framework/ext/grip/) handle and its own height, the exact two things the sheet itself is already built from. Try it:");

		this.demo();

		h2("Why not two real sheets");
		md("The real ✦ sheet (`DrawerRailSheetV1`, [`ext/drawer/rail.js`](/framework/ext/drawer/)) is `position: fixed`, which always measures from the screen's own edge — never from whatever box happens to contain it in the markup. Put a second one inside the first and it would not nest: it would pin itself to the real screen's edge too, landing on top of the first sheet's content instead of carving out its own room inside it. Flip the switch below to watch that happen, safely, inside this demo's own box instead of the real screen.");

		label.c("nested-sheet-toggle flex v-center", () => {
			const $box = input().attr("type", "checkbox");
			$box.on("change", e => this.$inner?.el.classList.toggle("nested-sheet-inner-escaped", e.target.checked));
			span("Make the nested bar use the real sheet's own CSS (this breaks it)");
		});

		md("The fix already shipped once, by accident of how the sheet is built: `ext/drawer/rail.js`'s bar is never a second `position: fixed` box, it is a plain last child in a flex column, so it already \"nests\" today — it just has no height of its own to drag yet. Giving it one is this demo's whole point, and the `ext/grip` call above is the entire change it would take.");
	},

	/* The live demo: an OUTER box standing in for the ✦ sheet, pinned to the
	   bottom of a small stage (standing in for the phone screen, so this
	   works on any browser width, not only one narrowed below 52em) — and an
	   INNER box, last in its flex column, standing in for the bottom bar the
	   owner described. Each has its own `grip()` call, each writes its own
	   CSS variable, and neither one knows the other exists. */
	demo(){
		let $outer, $outer_read, $inner, $inner_read;
		const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

		div.c("nested-sheet-stage", $stage => {
			$outer = div.c("nested-sheet-outer", () => {
				grip({
					axis: "y",
					write(px){
						const max = $stage.el.getBoundingClientRect().height - 32;
						const h = Math.round(clamp(px, 110, max));
						$outer.style("--outer-h", h + "px");
						$outer_read.text(h + "px");
						return h;
					},
				});
				div.c("nested-sheet-outer-head flex split v-center", () => {
					span("Main sheet");
					$outer_read = span.c("nested-sheet-readout", "60%");
				});
				div.c("nested-sheet-outer-content flow", () => {
					p("Drag the handle right above this box's heading — this outer box stands in for the real ✦ sheet, sized the same way: `ext/grip`'s y-axis handle writing a CSS height variable.");
					p("This line exists only to fill space, so the bar below has something to cover once you flip the switch under this demo.");
				});
				$inner = div.c("nested-sheet-inner", () => {
					grip({
						axis: "y",
						write(px){
							const outer_h = $outer.el.getBoundingClientRect().height;
							const h = Math.round(clamp(px, 56, outer_h - 56));
							$inner.style("--inner-h", h + "px");
							$inner_read.text(h + "px");
							return h;
						},
					});
					div.c("nested-sheet-inner-head flex split v-center", () => {
						span("Nested bottom bar");
						$inner_read = span.c("nested-sheet-readout", "5em");
					});
					p.c("muted", "Drag MY own top edge. My height is a second, separate variable — resizing me never touches the outer sheet's own height, and resizing the outer sheet never touches mine.");
				});
			});
		});

		this.$inner = $inner;
	},
});

