import { Page, md, demo, code, h2, div } from "/app.js";
import variant from "../variant.js";
import layout from "../../../ext/layout/layout.js";

// six visible cells — the same six in every comparison below
const cells = () => [1, 2, 3, 4, 5, 6].forEach(n => div.c("pad wash", "cell " + n).style("--pad", "0.5em"));

export default new Page({
	meta: import.meta,
	title: "Grid",
	description: "A wall that counts its own columns, and the one number that retunes it.",
	icon: "grid_on",
	classes: "grid",

	content(){

		demo(() => {
			div.c("grid gap auto").style("--column", "9em").append(() => {
				div.c("pad wash", "one");
				div.c("pad wash", "two");
				div.c("pad wash", "three");
				div.c("pad wash", "four");
			});
		}, "`grid gap auto` — a responsive wall with **no stylesheet and no media query.** The browser counts the columns; you name a comfortable width.");

		md("```css\n.grid.auto { grid-template-columns: repeat(auto-fit, minmax(min(var(--column), 100%), 1fr)); }\n```");

		md("Three parts, and each one is load-bearing. **`auto-fit`** asks for as many tracks as fit. **`minmax(…, 1fr)`** lets a track grow past its floor so the row divides evenly. **`min(var(--column), 100%)`** is the guard: without it a `15em` track in a narrower box overflows sideways, because a track's floor does not know what it is inside.");

		h2("One step away");

		div.c("grid gap auto", () => {
			variant("grid gap auto", ["", "", ""],
				"The default `--column` is `14em`. This is the wall on nearly every index page on the site.");

			variant("grid gap three", ["", "", ""],
				"`three` — exactly three columns, then straight to one. `clamp()` doing a breakpoint's job, and it never spends time at two.");

			variant("grid gap", ["", "", ""],
				"No column class at all — a plain `grid gap` is one column with even spacing, which is the cheapest stack there is.");
		}).ac("wide").style("--column", "21em");

		h2("A cell that wants more");

		demo(() => {
			div.c("grid gap auto").style("--column", "9em").append(() => {
				div.c("pad wash", "span 2").style({ "--pad": "0.5em", gridColumn: "span 2" });
				div.c("pad wash", "two").style("--pad", "0.5em");
				div.c("pad wash", "three").style("--pad", "0.5em");
			});
		}, "**A span, never a width.** A width fights the track; a span rides it, so the cell stays right at every count. ⚠ Spans do not clamp themselves: `auto-fit` must generate at least as many tracks as the widest span demands, so a `span 2` invents a second track even at one column and the wall overflows — measured, 94px of horizontal scroll at 320px. Any wall with a span owes one query back: `@media (max-width: 28em) { … span 1 }`.");

		h2("Where the same markup breaks");

		md("Six identical cells, three values of one token. The count, the break widths and the shape of the last row are all consequences — nothing below was designed per width.");

		demo(() => {
			div.c("flex v gap", () => {
				["7em", "12em", "20em"].forEach(column => {
					div.c("h4", "--column: " + column);
					div.c("grid gap auto").style("--column", column).append(cells);
				});
			});
		}, "**Drag the handle.** `cells` is the six `div.c(\"pad wash\")` above. At a 900px stage: six across, four, then two. The `20em` wall is a card wall, the `7em` one is a stat strip, and the difference between them is a number — this is [Cards](/framework/styles/layouts/cards/) and [Dashboard](/framework/styles/layouts/dashboard/), which are the same class.").ac("wide");

		h2("Turn the knobs yourself");

		div.c("layout wide pad surface", () => {
			const $wall = div.c("grid gap auto", cells).style("--column", "9em");
			layout.bar($wall);
		});

		md("The container is this page's, not the widget's — `layout.bar($wall)` is [Layout](/framework/ext/layout/) with the box handed to it. Point at the wall and drag `column`: the count is a consequence, never a number in a rule.");

		h2("`auto-fit` or `auto-fill`");

		md("`auto-fit` **collapses** the tracks nothing landed in, so four cells in a ten-track box become four wide cells. `auto-fill` **keeps** them, so the same four cells stay their own size and the row ends in empty space. The utility picks `auto-fit`, because a wall that centres its own content reads better at the wide end — and `styles/gallery/`'s wall picks `auto-fill` on purpose, so a two-card row does not render two enormous cards.");

		code.css(`repeat(auto-fit,  minmax(min(var(--column), 100%), 1fr))   /* fewer cells → wider */
repeat(auto-fill, minmax(min(var(--column), 100%), 1fr))   /* fewer cells → gaps */`);

		h2("The three templates");

		code.js(`div.c("grid gap auto", () => { … })                       // a wall, any count
div.c("grid gap auto").style("--column", "8em")           // a strip of tiles
div.c("grid gap three", () => { … })                      // three, then one`);

		md("For the asymmetric case — a fixed rail beside fluid content — reach for [Flex](/framework/styles/layouts/flex/) instead: `basis` and `flex-1` say it in two words, and there is no utility for a hand-written `grid-template-columns` because every one of them is a different template.");

		md("Next: [Holy grail](/framework/styles/layouts/holy-grail/) — both of these, in one page.");
	},
});
