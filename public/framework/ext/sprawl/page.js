import { Page, md, h2, div, p } from "/app.js";
import sprawl from "./sprawl.js";

// A synthetic wall of sections, deliberately uneven — one tall, most short — so a
// screenshot at different widths actually proves the balancing, not just "it draws
// a grid." Content length is the stand-in for "how important/big a section is" the
// same way framework/page.js's real sections will vary.
const SIZES = [1, 6, 2, 1, 1, 3, 1, 2, 1, 4, 1, 2];   // paragraph counts, in priority order

function demo_sections(){
	return SIZES.map((n, i) => div.c("card pad flex v gap").append(() => {
		h2(`Section ${i + 1} — ${n} paragraph${n === 1 ? "" : "s"}`);
		for (let p_i = 0; p_i < n; p_i++)
			// `.measure.start` (framework.css) caps a line of prose at the site's own
			// reading width and left-aligns it (`.measure` alone also CENTRES, which
			// reads wrong inside a left-aligned card) — review finding 7, 2026-10-02:
			// at 1920 a sprawl column is wide enough that a plain `p()` ran its text
			// 1201px wide, well past anything readable. Scoped to this demo page's
			// synthetic paragraphs; a real sprawl section (framework/page.js's own)
			// holds a grid of small module cards, never a long paragraph, so it never
			// hits this.
			p(`Paragraph ${p_i + 1} of a made-up section, just long enough to take up real vertical room so the greedy placement below has something uneven to balance.`).ac("measure start");
	}));
}

export default new Page({
	meta: import.meta,
	title: "Sprawl",
	description: "A wall of big blocks whose columns balance themselves — no tall column left standing over short ones.",
	icon: "view_column",

	content(){
		md("**Sprawl** is a wall of big sections that balances its own columns, so one never ends up towering over the rest the way plain source order would. Used by the new [`/framework/`](/framework/) home page. Under the hood: the grid itself is plain CSS (`repeat(auto-fit, minmax(min(100%, 60rem), 1fr))` — one column under ~60rem, about three at 3440); a small JS pass decides which column each section goes into, walking them in order and dropping each one into whichever column is shortest so far. [`doc/algorithm.md`](doc/algorithm.md) has the full reasoning.");

		h2("Twelve sections, twelve very different lengths");

		md("Resize the window (or look at this page at 400 / 1200 / 1920 / 3440) — the columns stay close in total length at every width, not just the usual \"first N in column one.\"");

		sprawl(demo_sections()).ac("wide");

		md("What this is NOT: equal-height grid rows (they match card heights within one ROW, not whole columns of a different section count) and CSS `columns:` (auto-balances with no JS, but reflows items into a different column on every unrelated reflow — a line wrapping differently, an image loading — which makes things jump under a reader mid-scroll). Both are named, with why, in [`doc/algorithm.md`](doc/algorithm.md).");
	},
});
