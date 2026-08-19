import { Page, md, demo, code, h2, div } from "/app.js";
import word from "../word.js";

const n = count => Array(count).fill("");

// three visible boxes — the same three in every comparison below
const boxes = () => ["one", "two", "three"].forEach(t => div.c("pad wash", t).style("--pad", "0.5em"));

// a third box taller than its neighbours — same idiom, one class added
const uneven = () => { div.c("pad wash h1", "one").style("--pad", "0.5em"); div.c("pad wash", "two").style("--pad", "0.5em"); div.c("pad wash", "three").style("--pad", "0.5em"); };

// six numbered boxes — wrap vs squeeze needs more than three to be visible
const six = () => n(6).forEach((_, i) => div.c("pad wash", String(i + 1)).style("--pad", "0.5em"));

// no word says "grow twice as fast" or "don't blow out on a long word" — the two
// demos below are the only inline .style() on this page, and each one says so
const LONG = "Supercalifragilisticexpialidocious".repeat(4);

export default new Page({
	meta: import.meta,
	title: "Flex",
	description: "A row, and the eight one-word steps away from it.",
	icon: "view_week",
	group: "Guides",

	// Inline object children: nine real pages, nine urls, no directories. Each one
	// draws its own card (word.js) and the wall below is those cards.
	children: [
		word({ name: "row", label: "A row", words: "flex", kids: n(3),
			note: "`flex` and nothing else. No gap, so the boxes touch — and they squeeze rather than wrap, at any width." }),

		word({ name: "gap", label: "A row with air in it", words: "flex gap", kids: n(3),
			note: "`gap` — two utility classes, no stylesheet, and the start of every layout on this site." }),

		word({ name: "v", label: "A column", words: "flex v gap", kids: n(3),
			note: "`v` — a column. Same gap, other axis." }),

		word({ name: "v-center", label: "Middles lined up", words: "flex gap v-center", kids: ["h1", "", ""],
			note: "`v-center` — unequal heights line up on their middles." }),

		word({ name: "split", label: "Ends apart, middle empty", words: "flex gap split", kids: n(2),
			note: "`split` — `space-between`. A title left, a control right: this is every toolbar." }),

		word({ name: "auto", label: "Equal peers, that wrap", words: "flex gap auto", kids: n(3), column: "3em",
			note: "`auto` — every child asks for `--column` and takes an equal share, so peers are equal without being measured. Two panes that stack themselves, with no breakpoint and no number outside the token." }),

		// `words` is the title everywhere else; this one shares it with `gap`, and the
		// two item classes are what actually differ.
		word({ name: "basis", title: "flex gap › basis + flex-1", label: "A fixed rail, a fluid rest",
			words: "flex gap", kids: ["basis", "flex-1"],
			note: "`basis` beside `flex-1` — the fixed track and the fluid one. This is [Sidebar](/framework/styles/layouts/sidebar/), and with a second `basis` it is [App shell](/framework/styles/layouts/shell/)." }),

		word({ name: "wrap", label: "Wraps to a second line", words: "flex gap wrap", kids: n(6),
			note: "`wrap` — boxes drop to a second line instead of squeezing. **Drag the handle.** Add it to anything that could ever be narrow, which is everything." }),

		word({ name: "three", label: "Three, then straight to one", words: "flex gap three", kids: n(3), column: "3em",
			note: "`three` — three columns, then straight to one. Two columns is the width nobody designed for." }),
	],

	content(){

		this.previews().style({ "--column": "13em", "--gap": "1.2em" });

		md("**Nine class strings, each one word from its neighbour.** Click any of them: the shape opens at real size on a stage you can drag, the source is under it, and clicking a box opens the panel with the words it is wearing. Nothing here is a component or a function — you copy the string.");

		h2("Five things a row still needs");

		demo(() => {
			div.c("flex gap", () => {
				div.c("pad wash", "flex: 2").style({ "--pad": "0.5em", flex: "2" });
				div.c("pad wash", "flex: 1").style({ "--pad": "0.5em", flex: "1" });
			});
		}, "No class sets an unequal share — every flexible word splits space evenly, so a bigger box is inline `flex: 2` on purpose.").ac("wide");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("h4", "flex gap — a bare child");
				div.c("flex gap", () => {
					div.c("pad wash", "one").style("--pad", "0.5em");
					div.c("pad wash", LONG).style("--pad", "0.5em");
					div.c("pad wash", "three").style("--pad", "0.5em");
				});

				div.c("h4", "flex gap — min-width: 0, inline");
				div.c("flex gap", () => {
					div.c("pad wash", "one").style("--pad", "0.5em");
					div.c("pad wash", LONG).style({ "--pad": "0.5em", "min-width": "0" });
					div.c("pad wash", "three").style("--pad", "0.5em");
				});
			});
		}, "A bare child floors at its longest word and blows out the row; `.flex-1`/`.basis`/`.flex.auto > *` already carry `min-width: 0` — a bare child does not, so here it's inline.").ac("wide");

		demo(() => {
			div.c("flex gap", () => {
				div.c("flex-1 flex v gap", () => {
					div.c("h4", "align — v-center");
					div.c("flex gap v-center", uneven);
				});
				div.c("flex-1 flex v gap", () => {
					div.c("h4", "justify — split");
					div.c("flex gap split", uneven);
				});
			});
		}, "**align** moves boxes across the row, the cross axis; **justify** moves them along it, the main axis.").ac("wide");

		demo(() => {
			div.c("flex gap", () => {
				div.c("flex-1 flex v gap", () => {
					div.c("h4", "flex gap — squeezes");
					div.c("flex gap", six);
				});
				div.c("flex-1 flex v gap", () => {
					div.c("h4", "flex gap wrap — wraps");
					div.c("flex gap wrap", six);
				});
			});
		}, "**Drag the handle.** Same six boxes at the same width — one keeps shrinking them, the other drops to a second line.").ac("wide");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("pad wash", "top").style("--pad", "0.5em");
				div.c("flex gap", boxes);
				div.c("pad wash", "bottom").style("--pad", "0.5em");
			});
		}, "A column holds a row just as easily as a box — `flex v gap` outside, `flex gap` inside, two levels and nothing fancier.").ac("wide");

		h2("Where the same markup breaks");

		md("A row can be made to give up at several different widths **without touching the markup**. `--column` is not a width — it is the point at which the line runs out of room.");

		demo(() => {
			div.c("flex v gap", () => {
				["10em", "16em", "26em"].forEach(column => {
					div.c("h4", "--column: " + column);
					div.c("flex gap auto wrap").style("--column", column).append(boxes);
				});
			});
		}, "**Drag the handle.** Three identical rows — `boxes` is the three `div.c(\"pad wash\")` above. The `26em` one breaks first (three tracks want 78em), then `16em` at 48em, then `10em` at 30em. One token, three responsive designs.").ac("wide");

		h2("…and how it breaks");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("h4", "flex gap — squeezes, never wraps");
				div.c("flex gap").append(boxes);

				div.c("h4", "flex gap wrap — equal, then a second line");
				div.c("flex gap wrap auto").style("--column", "14em").append(boxes);

				div.c("h4", "flex gap wrap + basis — the first box keeps 14em, the rest drop under it");
				div.c("flex gap wrap", () => {
					div.c("pad wash basis", "basis").style("--pad", "0.5em");
					div.c("pad wash flex-1", "flex-1").style("--pad", "0.5em");
					div.c("pad wash flex-1", "flex-1").style("--pad", "0.5em");
				});
			});
		}, "Same three boxes, three break behaviours: no wrap at all, a whole line at once, or one child holding its width while its neighbours re-flow around it. Pick the one that matches what the content *is* — a fixed rail is fixed, a set of peers is peers.").ac("wide");

		h2("The four templates");

		code.js(`div.c("flex v gap", () => { … })                    // a column
div.c("flex gap v-center split", () => { … })       // a bar: title | controls
div.c("flex gap wrap", () => { basis(); main(); })  // a rail beside the reading
div.c("flex gap auto", () => { … })                 // n equal panes that stack`);

		md("The one shape that needs a word from the page as well: **a footer at the bottom of the region.** `classes: \"fill flex v\"` on the page, then `flex-1` on the band that should take the slack — `fill` is what gives the page a height for the slack to come out of. [Page shapes](/framework/styles/layouts/fit/) has the rest of that vocabulary.");

		md("Next: [Grid](/framework/styles/layouts/grid/) — when the tracks matter more than the order.");
	},
});
