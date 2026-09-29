import { Page, p, div, span } from "/app.js";
import CompactDictate from "./Compact.js";

/* The desktop compact inline variant — meant to sit in a toolbar or a single form row,
 * never grow. Overrides ONE method (`draw_caption()`) — the smallest possible variant,
 * proving the seam works for a tiny change too, not only a whole new layout like Cards. */
export default new Page({
	meta: import.meta,
	title: "Compact",
	description: "One short line, never a growing block — for a toolbar or a single form row.",
	icon: "unfold_less",

	files: "Compact.js Compact.css",

	content(){
		p("Press 🎤 and talk. Only ONE short line ever shows — the live guess while you talk, or the last finished sentence once it settles, truncated from the front so the newest words stay visible. This is `CompactDictate` — a `Dictate` subclass overriding two small methods, `build_output()` and `draw_caption()`.");

		div.c("pad card flex gap v-center", () => {
			span.c("muted", "Ask something:");
			new CompactDictate({});
		}).style("max-width", "32em");

		p.c("muted", "Where this fits: a toolbar mic that must never push its neighbours around, or a single-line \"quick note\" field.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => { new CompactDictate({}); })); },
});
