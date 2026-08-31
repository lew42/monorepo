import { Doc, div, span, p, md, h2, h3 } from "/app.js";
import { WORDS, demo } from "./words.js";

export default new Doc({
	meta: import.meta,
	title: "Columns",
	label: "Column words",
	description: "Six words for a 2- or 3-column row whose ratio is arithmetic, not a leftover — and the four numbers that say where .flex.auto stops serving 3440.",
	icon: "view_column",
	group: "Reference",

	children: "matrix",
	notes: "indictment words adoption",
	files: "page.js words.js cols.css readme.md",

	content(){

		md("**`.flex.auto` is a wrap threshold, and a column layout is a ratio.** Those are "
			+ "different questions, and the second one is what a 2- or 3-column page is actually "
			+ "asking. Every row below prints what it *claims* beside what it *measured*, live, at "
			+ "whatever width you are reading this at — drag the window and watch the numbers.");

		md("The verdict in one line: **`.flex.auto` holds a ratio exactly, and that was never the "
			+ "problem.** What it cannot do is stop — no track has a ceiling, so at 3440 a 32% aside "
			+ "is 1100px of a 416px list — and its stack point is written in `em`, which on this site "
			+ "is a *viewport* clamp, so the same 560px container stacks on a phone and does not on a "
			+ "monitor. [The indictment](/framework/styles/layouts/cols/doc/indictment/) has the numbers at four widths.");

		h2("The word set");

		md("One rule computes every track: **the row, less the fixed tracks and one gap each, times "
			+ "this track's share of the weights.** A percentage basis, per the decks lab — a zero "
			+ "basis floors at its own padding and reads 1.527 where the page claimed 1.618. Grow is "
			+ "the weight rather than 1, so the slack is divided in the same proportion as the bases "
			+ "and the ratio is exact at 400 and at 3440 alike.");

		this.set();

		md("**Stacking needs no container query.** A container query never matches its own container, "
			+ "so the stack rule would need a wrapper element; instead each basis is "
			+ "`max(share, (floor - 100%) * 999)` — `.flex.three`'s own idiom with a floor you name. "
			+ "The floor is `rem`, never `em`: this site never sets a root font size, so `rem` is 16px "
			+ "at every viewport and `em` moves 14px → 18px.");

		h2("All six, at all four widths");

		md("[The matrix](/framework/styles/layouts/cols/matrix/) renders every word — and every way of saying the same thing today — "
			+ "at 400, 1280, 1920 and 3440 side by side, with the measured px in every track. "
			+ "[Which words earn framework.css](/framework/styles/layouts/cols/doc/adoption/), and the hand-rolled rows they would "
			+ "replace, is the adoption note.");

		md.details(import.meta, "readme.md", "Readme");
	},

	/* Full bleed, because a demo of a column ratio measured inside a 52em prose track is a
	   demo of the prose track (the layout skill's own caveat about sizing a demo against
	   the box it will actually live in). Here the box IS the page. */
	set(){
		return div.c("bleed flex v gap-2em", () => WORDS.forEach(word => {
			div.c("flex v gap", () => {

				div.c("flex gap wrap v-center", () => {
					h3("cols-" + word.name);
					span.c("cols-px", word.claim);
					span.c("cols-note", "stacks below " + word.floor);
				}).style("--gap", "0.6em");

				p.c("cols-note", word.note);
				demo(word);

			}).style("--gap", "0.5em").attr("data-word", word.name);
		}));
	},
});
