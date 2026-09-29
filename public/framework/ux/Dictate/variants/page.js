import { Page, p } from "/app.js";

/**
 * A wall of every `Dictate` VARIANT — a variant is a subclass that overrides one or two
 * of its methods (which one is named in the class's own doc comment: `build_output()` for
 * the container shape, `draw_caption()` for how a settled sentence and the live guess are
 * drawn). Nothing about the engines, the errors, or the start sound's real timing ever
 * needs restating — every variant inherits all of that from `Dictate` untouched.
 *
 * **v1 is kept here on purpose, unchanged** — the owner's own rule: a new idea never
 * deletes a working one; it becomes a sibling, reachable on its own url forever.
 */
export default new Page({
	meta: import.meta,
	title: "Variants",
	description: "Today's box (v1), the mobile prompt-cards flow, and a compact one-line toolbar mic — three ways of drawing the same dictation, each its own subclass.",
	icon: "grid_view",

	children: ["v1", "cards", "compact"],

	content(){
		p("Each card below is a real, working `Dictate` — press its 🎤 right on the card. Open any one for its own page: what it overrides, why, and where it fits.");
		this.previews();
	},
});
