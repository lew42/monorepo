import { Page, div, span, p, md, h2, h3 } from "/app.js";
import { WORDS, TODAY, row, measure, demo } from "../words.js";

/* 460 is not a screen — it is `.flex.auto`'s two-track threshold, caught in the act. Two
   children at `--column: 14em` need 28em, and 28em is 392px when the body font clamp is at
   14px and 504px when it is at 18px. So a 460px container is two columns on a phone and a
   stack on a monitor, from the same markup. Open this page at 400 and at 3440 and compare
   that one box; the `cols-*` rows above it do not move, because their floor is `rem`. */
const WIDTHS = [400, 460, 1280, 1920, 3440];

/* A screen, faked. Every word in this lab is percentage arithmetic off its parent, so a
   1280px box lays out exactly as a 1280px screen does — with one honest exception, which
   is also the finding: `rem` is 16px in both, and `em` is the host viewport's clamp. So
   the FLOORS in this matrix are true and the `16em` rail is the reading screen's em. */
const screen = (word, width) => div.c("cols-screen", () => {
	span.c("cols-screen-tag", width + "px");

	let $row;
	div.c("cols-screen-box", () => { $row = row(word); });

	measure($row, word, div.c("cols-read"));
}).style("width", width + "px");

const strip = word => div.c("flex v gap", () => {

	div.c("flex gap wrap v-center", () => {
		h3(word.cls ? word.name : "cols-" + word.name);
		span.c("cols-px", word.claim);
		if (word.floor) span.c("cols-note", "stacks below " + word.floor);
	}).style("--gap", "0.6em");

	p.c("cols-note", word.note);

	div.c("cols-strip", () => WIDTHS.forEach(width => screen(word, width)));

}).style("--gap", "0.5em").attr("data-word", word.name);

export default new Page({
	meta: import.meta,
	title: "Matrix",
	description: "Every column word at 400, 1280, 1920 and 3440 at once — the proposal above, the vocabulary we have today below.",
	icon: "grid_view",

	content(){

		md("**Twelve rows, five widths each, all at true size.** The strips scroll sideways: 3440 does "
			+ "not fit inside 1280 and a scaled thumbnail would only pretend it did. Every track prints "
			+ "the px it measured, and every strip prints the ratio it wanted beside the one it got.");

		md("**460 is not a screen** — it is `.flex.auto`'s own threshold, caught in the act. Two "
			+ "children at `--column: 14em` need 28em, and 28em is 392px when the body font clamp sits "
			+ "at 14px and 504px when it sits at 18px. Open this page at 400 and again at 3440 and "
			+ "compare that one box: same markup, same container, two columns on the phone and a stack "
			+ "on the monitor. The `cols-*` rows do not move, because their floor is `rem`.");

		h2("The proposal");

		md("Six words. Read the right-hand end of each strip first — 3440 is where the question was "
			+ "asked — then the left, where the floor engages and the row becomes a stack.");

		this.wall(WORDS);

		h2("Today");

		md("The same intents said with the words that exist. `.flex.auto` is *right* for the first "
			+ "one and for nothing else here: the second decays from 2.00 toward 1.00 as the row "
			+ "widens, the fourth puts an orphan on a second line, and the fifth has no ceiling to "
			+ "hit. [The indictment](/framework/styles/layouts/cols/doc/indictment/) is the same "
			+ "numbers written down.");

		this.wall(TODAY);

		h2("Today, at this screen's real width");

		md("**And this is the first finding.** Every `cols-*` word above is percentage arithmetic, so "
			+ "its 400px box and a real 400px screen agree exactly. `.flex.auto` is `em` arithmetic, "
			+ "and `em` on this site is a *viewport* clamp — 14px at 400, 18px at 3440 — so its 400px "
			+ "box and a real 400px screen do **not** agree. Compare a row here with its 400 box above: "
			+ "same container width, different layout, because of how wide the window happens to be.");

		div.c("bleed flex v gap-2em", () => TODAY.forEach(word => div.c("flex v gap", () => {
			h3(word.name);
			demo(word);
		}).style("--gap", "0.5em").attr("data-word", word.name)));
	},

	/* `bleed`, because these strips ARE the page — a column demo measured inside a 52em
	   prose track would be a demo of the prose track. */
	wall(set){
		return div.c("bleed flex v gap-2em", () => set.forEach(strip));
	},
});
