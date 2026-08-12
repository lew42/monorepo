import { Page, demo, md, div, p, h4 } from "/app.js";

const LONG = "A long line is not hard to read because it is long. It is hard to read because of the return sweep: at the end of every line the eye has to travel back and find the start of the next one, and the further it travels the more often it lands on the line it just read. Nothing about the letters changes. What changes is how many times you lose your place per paragraph, and past about a hundred characters that number stops being small.";

const both = () => {
	h4("No cap — the paragraph is as wide as its box");
	p(LONG);

	h4("`measure` — capped, wherever the box goes");
	div.c("measure", () => p(LONG)).style("--measure", "52em");
};

export default new Page({
	meta: import.meta,
	group: "Reading",
	icon: "straighten",

	// A 20em cap, not the page's 52: a card is 14em wide, so the real number would
	// never bind and both blocks would draw the same width.
	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad flow", () => {
		p(LONG);
		div.c("measure", () => p(LONG)).style("--measure", "20em");
	})); },

	content(){
		demo.stage(both).ac("bleed");
		demo.source.file(import.meta, "page.js", "Source").attr("open", "");

		md("**Drag the stage's right edge.** The top paragraph keeps growing and the return sweep gets longer with it; the bottom one stops and the extra width becomes margin. That is the whole trick — a cap, expressed in `em`, so it tracks the type rather than the screen.");

		md("`.page.standard` declares `--measure: 52em`. At the type ramp's `1.125rem` ceiling that is 936px, about **104 characters** — already generous, which is why it is the one width on this site that never scales with the monitor. What grows on a big screen is `--breakout`, so the exhibits get the room and the prose does not: measured across 166 routes, average fill was 81% at 1600 and 63% at 3440, and that gap is the breakout's problem, not the paragraph's.");

		md("Reference: [Page shapes](/framework/styles/layouts/fit/) — the tokens and the four stances · [Page](/framework/core/Page/) — the template that declares them.");
	},
});
