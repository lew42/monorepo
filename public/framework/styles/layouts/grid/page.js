import { Page, md, demo, code, h2, div } from "/app.js";
import word from "../word.js";

const n = count => Array(count).fill("");

// six visible cells — the same six in every comparison below
const cells = () => [1, 2, 3, 4, 5, 6].forEach(x => div.c("pad wash", "cell " + x).style("--pad", "0.5em"));

export default new Page({
	meta: import.meta,
	title: "Grid",
	description: "A wall that counts its own columns, and the one number that retunes it.",
	icon: "grid_on",

	// Inline object children: three real pages, three urls, no directories. Each one
	// draws its own card (word.js) and the wall below is those cards.
	children: [
		word({ name: "stack", label: "A single column", words: "grid gap", kids: n(3),
			note: "No column class at all — a plain `grid gap` is one column with even spacing, which is the cheapest stack there is." }),

		word({ name: "auto", label: "A wall that counts itself", words: "grid gap auto", kids: n(6), column: "3.5em",
			note: "`auto` — the browser counts the columns and you name a comfortable width. The default `--column` is `14em`; **drag the handle** and the count is a consequence. This is the wall on nearly every index page on the site." }),

		word({ name: "three", label: "Three, then straight to one", words: "grid gap three", kids: n(3), column: "3em",
			note: "`three` — exactly three columns, then straight to one. `clamp()` doing a breakpoint's job, and it never spends time at two." }),
	],

	content(){

		this.previews().style({ "--column": "13em", "--gap": "1.2em" });

		md("**Three class strings, and one token between them.** Click any of them: the wall opens at real size on a stage you can drag, and clicking a cell opens the panel — where `--column` is a slider and the count is whatever falls out of it.");

		md("```css\n.grid.auto { grid-template-columns: repeat(auto-fit, minmax(min(var(--column), 100%), 1fr)); }\n```");

		md("Three parts, and each one is load-bearing. **`auto-fit`** asks for as many tracks as fit. **`minmax(…, 1fr)`** lets a track grow past its floor so the row divides evenly. **`min(var(--column), 100%)`** is the guard: without it a `15em` track in a narrower box overflows sideways, because a track's floor does not know what it is inside.");

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

		h2("`auto-fit` or `auto-fill`");

		md("`auto-fit` **collapses** the tracks nothing landed in, so four cells in a ten-track box become four wide cells. `auto-fill` **keeps** them, so the same four cells stay their own size and the row ends in empty space. The utility picks `auto-fit`, because a wall that centres its own content reads better at the wide end — and `Page.previews()` picks `auto-fill` on purpose, so a two-card wall does not render two enormous cards.");

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
