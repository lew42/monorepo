import { Page, demo, md, div, p } from "/app.js";
import layout from "/framework/ext/layout/layout.js";
import { toggle } from "/framework/ext/layout/controls.js";

const box = (title, body) => div.c("pad surface", () => { p.c("h4", title); p(body); });

const boxes = () => {
	box("Alpha", "One axis. Every word on the bar is one decision about it.");
	box("Beta", "`v` turns the axis; the boxes become a column and the gap follows.");
	box("Gamma", "Unequal heights — turn `v-center` on and the middles line up instead of the tops. This one is deliberately the tall one, so there is something to see.");
	box("Delta", "`auto` makes every child ask for `--column` and take an equal share.");
	box("Epsilon", "`wrap` lets a box drop to a second line rather than squeeze.");
	box("Zeta", "Whatever you settle on is a class string you paste.");
};

export default new Page({
	meta: import.meta,
	group: "Arrangers",
	icon: "view_week",

	// One row, no wrap: at card size the axis is the whole message, and it is what
	// tells this card apart from `grid`'s wall.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () =>
		div.c("flex gap", () => "Alpha Beta Gamma Delta Epsilon".split(" ")
			.forEach(word => div.c("pad surface h4 flex-1", word)))
			.style({ "--pad": "0.8em" }))); },

	content(){
		// `layout.words` is the documented extension point — one word, one control
		// over the target. These five are utility classes, so each is one toggle.
		"v v-center split auto wrap".split(" ").forEach(word => layout.words[word] = $el => toggle($el, word));

		div.c("layout bleed", () => {
			const $row = div.c("flex gap wrap", boxes).style({ "--gap": "1em", "--column": "14em" });

			layout.bar($row, "v wrap auto v-center split gap column");
		});

		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Click the words on and off.** `flex` on its own is a row that squeezes. `gap` is the air. `v` turns the axis. `split` pushes the ends apart — that is every toolbar ever built. `auto` makes the children equal peers by having each ask for `--column` and take a share, and `wrap` lets them drop to a new line instead of being crushed.");

		md("Nine of these strings are the whole of flex on this site, each one word from its neighbour. Click a box to open the panel: it reads back the words the element is wearing and the two tokens behind them, which is the string you paste into a page.");

		md("Reference: [Flex](/framework/styles/layouts/flex/) — the nine strings, one page each · [Layout](/framework/ext/layout/) — the toolbar, and `layout.words`.");
	},
});
