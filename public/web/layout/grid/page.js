import { Page, demo, md, div } from "/app.js";
import layout from "/framework/ext/layout/layout.js";
import { toggle } from "/framework/ext/layout/controls.js";

const cells = () => [1, 2, 3, 4, 5, 6, 7, 8].forEach(x =>
	div.c("pad wash", "cell " + x).style("--pad", "0.9em"));

const wall = () => div.c("grid gap auto", cells).style({ "--gap": "1em", "--column": "14em" });

export default new Page({
	meta: import.meta,
	group: "Arrangers",
	icon: "grid_on",

	// A tighter `--column` than the demo's: at card size the count is the message.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () =>
		wall().style({ "--column": "6em", "--gap": "0.6em" }))); },

	content(){
		// `layout.words` is the documented extension point — one word, one control
		// over the target. Both of these are utility classes, so both are toggles.
		"auto three".split(" ").forEach(word => layout.words[word] = $el => toggle($el, word));

		div.c("layout bleed", () => {
			const $wall = wall();

			layout.bar($wall, "mode auto three gap column");
		});

		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Drag `--column` and watch the count change.** `grid gap auto` is one declaration — `repeat(auto-fit, minmax(min(var(--column), 100%), 1fr))` — and you never type a column count anywhere. You name a comfortable width; the browser counts the tracks, and every break width on the wall is a consequence of that one number rather than a decision someone made per screen size.");

		md("`three` is the other stance: exactly three, then straight to one, because two columns is the width nobody designed for. And `mode` flips the same box to `flex` — both arrangers read the same two tokens, so `--gap` and `--column` mean the same thing on either side of the switch. Reach for grid when the tracks matter more than the order; reach for [flex](/web/layout/flex/) when one child is fixed and the rest are fluid.");

		md("Reference: [Grid](/framework/styles/layouts/grid/) — `auto-fit` vs `auto-fill`, and the span trap · [Gallery](/framework/styles/layouts/gallery/) — the same class as a whole page's wall.");
	},
});
