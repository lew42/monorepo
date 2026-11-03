import { Shell } from "../Shell.js";
import { div, span, md } from "/app.js";

/* Container: the app region, full viewport. Size: four pieces of chrome, and the
   stage takes every pixel they left — `minmax(0, 1fr)` on both middle tracks IS
   `fill`, said in grid. Own layout: the one grid, all five areas. Regions: five.
   Preview: default card.

   ⚠ The stage does not scroll. A working surface that scrolls is a document; this
     one is clipped, and the board floats on it. */

export default new Shell({
	meta: import.meta,
	title: "Canvas centre",
	description: "The app-as-tool shape — chrome on four sides, a stage that owns the leftover.",
	icon: "brush",
	group: "Canvas",

	head(){ return this.bar("head"); },
	left(){ return this.rail("left", this.tools); },
	right(){ return this.rail("right", this.inspector); },
	foot(){ return this.bar("foot", this.status); },

	tools(){
		div.c("shell-inner-title h4", "Tools");
		["Select", "Frame", "Text", "Shape", "Pen", "Hand"].forEach(name => div.c("shell-link", name));
	},

	inspector(){
		div.c("shell-inner-title h4", "Board");
		div.c("shell-doc flow", () => { md("Fill · surface\n\nRadius · 8px\n\nShadow · soft"); });
	},

	status(){
		span.c("shell-end", "100%  ·  1 object selected");
	},

	// The stage, and it measures ITSELF: "the surface is the viewport minus the
	// chrome" is a claim this lab should show rather than assert.
	main(){
		return div.c("shell-canvas", () => {
			div.c("shell-board flow", () => {
				md("### The stage owns the leftover\n\nFour pieces of chrome are `auto` tracks; the stage is `minmax(0, 1fr)` in both directions, so it is exactly the region minus the four of them — no height arithmetic, nothing to keep in step.");
				this.verdict();
			});

			this.$size = div.c("shell-size", "measuring");
		});
	},

	// ⚠ Guarded: activated() runs on every navigation back to this page, and a
	//   second observer on the same box is a second live measurement of it.
	activated(){
		if (this.watching) return;

		const el = this.$size.el.parentNode;

		this.watching = new ResizeObserver(() => this.$size.text(`stage ${el.clientWidth} x ${el.clientHeight}`));
		this.watching.observe(el);
	},

	finding: "chrome as `auto` tracks and the stage as `minmax(0, 1fr)` needs arithmetic nowhere — the surface is the region minus the chrome by construction, and the readout in the corner is measuring the grid, not correcting it.",
});
