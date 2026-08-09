import { Page, md, demo, code, h2, div } from "/app.js";
import variant from "../variant.js";
import layout from "../../../ext/layout/layout.js";

// three visible boxes — the same three in every comparison below
const boxes = () => ["one", "two", "three"].forEach(t => div.c("pad wash", t).style("--pad", "0.5em"));

export default new Page({
	meta: import.meta,
	title: "Flex",
	description: "A row, and the seven one-word steps away from it.",
	icon: "view_week",
	classes: "grid",

	content(){

		demo(() => {
			div.c("flex gap", () => {
				div.c("pad wash", "one");
				div.c("pad wash", "two");
				div.c("pad wash", "three");
			});
		}, "`flex gap` — a row with air in it. Two utility classes, no stylesheet, and the start of every layout on this site.");

		md("Everything below is **one word** away from that line. None of them is a component or a function: copy the class string. Every rendered box also wears `pad wash` so you can see it — that is the only difference between the template and the picture.");

		h2("One word away");

		div.c("grid gap auto", () => {
			variant("flex gap wrap", ["", "", ""],
				"`wrap` — boxes drop to a second line instead of squeezing. Add it to anything that could ever be narrow, which is everything.");

			variant("flex v gap", ["", "", ""],
				"`v` — a column. Same gap, other axis.");

			variant("flex gap v-center", ["h1", "", ""],
				"`v-center` — unequal heights line up on their middles.");

			variant("flex gap split", ["", ""],
				"`split` — `space-between`. A title left, a control right: this is every toolbar.");

			variant("flex gap auto", ["", ""],
				"`auto` — every child asks for `--column` and takes an equal share, so peers are equal without being measured. This is [Split](/framework/styles/layouts/split/).");

			variant("flex gap wrap", ["basis", "flex-1"],
				"`basis` beside `flex-1` — the fixed track and the fluid one. This is [Sidebar](/framework/styles/layouts/sidebar/), and with a second `basis` it is [Holy grail](/framework/styles/layouts/holy-grail/).");

			variant("flex gap three", ["", "", ""],
				"`three` — three columns, then straight to one. Two columns is the width nobody designed for.");
		}).ac("wide").style("--column", "21em");

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

		h2("Turn the knobs yourself");

		layout(boxes).ac("wide pad surface");

		md("Point at the panel: a toolbar fades in above its top-right corner. Flip it to `grid` and the same two tokens still mean the same two things — [Layout](/framework/ext/layout/) is the widget.");

		h2("The four templates");

		code.js(`div.c("flex v gap", () => { … })                    // a column
div.c("flex gap v-center split", () => { … })       // a bar: title | controls
div.c("flex gap wrap", () => { basis(); main(); })  // a rail beside the reading
div.c("flex gap auto", () => { … })                 // n equal panes that stack`);

		md("The one shape that needs a word from the page as well: **a footer at the bottom of the region.** `classes: \"fill flex v\"` on the page, then `flex-1` on the band that should take the slack — `fill` is what gives the page a height for the slack to come out of. [Page shapes](/framework/styles/layouts/fit/) has the rest of that vocabulary.");

		md("Next: [Grid](/framework/styles/layouts/grid/) — when the tracks matter more than the order.");
	},
});
