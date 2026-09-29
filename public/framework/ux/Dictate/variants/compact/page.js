import { Page, p, div, span } from "/app.js";
import CompactDictate from "./Compact.js";

// One sample sentence: the whole point of this variant is a single line, so
// feeding more than one would just show the truncation, not the shape (the
// owner's own rule: "I want to see" — `ai/2026-09-29/mobile-nav/review.md`,
// finding 1).
const SAMPLES = ["let's also add the audio source panel and the live level meter"];

/* The desktop compact inline variant — meant to sit in a toolbar or a single form row,
 * never grow. Overrides TWO methods (`build_output()`, `draw_caption()`) — the
 * smallest possible variant, proving the seam works for a tiny change too, not only a
 * whole new layout like Cards. */
export default new Page({
	meta: import.meta,
	title: "Compact",
	description: "One short line, never a growing block — for a toolbar or a single form row.",
	icon: "unfold_less",

	files: "Compact.js Compact.css",

	content(){
		p("Press 🎤 and talk. Only ONE short line ever shows — the live guess while you talk, or the last finished sentence once it settles, truncated from the front so the newest words stay visible. This is `CompactDictate` — a `Dictate` subclass overriding two small methods, `build_output()` and `draw_caption()`. The line below is sample text, shown so the truncation is visible before you say anything.");

		div.c("pad card flex gap v-center", () => {
			span.c("muted", "Ask something:");
			new CompactDictate({}).sample(SAMPLES);
		}).style("max-width", "32em");

		p.c("muted", "Where this fits: a toolbar mic that must never push its neighbours around, or a single-line \"quick note\" field.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => { new CompactDictate({}).sample(SAMPLES); })); },
});
