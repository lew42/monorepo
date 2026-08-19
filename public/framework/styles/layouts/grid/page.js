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
	group: "Guides",

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

		md("A grid is a **table with no lines drawn**: rows and columns you never see, called tracks, and every cell claims one of each.");

		h2("`fr` vs a fixed length");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("grid gap").style({ gridTemplateColumns: "1fr 200px" }).append(() => {
					div.c("pad wash", "1fr").style("--pad", "0.5em");
					div.c("pad wash", "200px").style("--pad", "0.5em");
				});
				div.c("grid gap").style({ gridTemplateColumns: "1fr 1fr" }).append(() => {
					div.c("pad wash", "1fr").style("--pad", "0.5em");
					div.c("pad wash", "1fr").style("--pad", "0.5em");
				});
			});
		}, "**`fr` divides whatever is left over; a fixed length keeps its own and doesn't share.** `1fr 200px` gives the second track exactly 200px and hands the rest to the first; `1fr 1fr` splits everything down the middle. No word in the vocabulary writes `grid-template-columns` by hand — every hand-written template is its own case — so this is a raw declaration, same as every other one below.");

		this.previews().style({ "--column": "13em", "--gap": "1.2em" });

		md("**Three class strings, and one token between them.** Click any of them: the wall opens at real size on a stage you can drag, and clicking a cell opens the panel — where `--column` is a slider and the count is whatever falls out of it.");

		md("```css\n.grid.auto { grid-template-columns: repeat(auto-fit, minmax(min(var(--column), 100%), 1fr)); }\n```");

		md("Three parts, and each one is load-bearing. **`auto-fit`** asks for as many tracks as fit. **`minmax(…, 1fr)`** lets a track grow past its floor so the row divides evenly. **`min(var(--column), 100%)`** is the guard: without it a `15em` track in a narrower box overflows sideways, because a track's floor does not know what it is inside.");

		h2("`auto-fit` or `auto-fill`");

		md("`auto-fit` **collapses** the tracks nothing landed in, so four cells in a ten-track box become four wide cells. `auto-fill` **keeps** them, so the same four cells stay their own size and the row ends in empty space. The utility picks `auto-fit`, because a wall that centres its own content reads better at the wide end — and `Page.previews()` picks `auto-fill` on purpose, so a two-card wall does not render two enormous cards.");

		code.css(`repeat(auto-fit,  minmax(min(var(--column), 100%), 1fr))   /* fewer cells → wider */
repeat(auto-fill, minmax(min(var(--column), 100%), 1fr))   /* fewer cells → gaps */`);

		h2("`gap`");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("grid auto").style("--column", "8em").append(cells);
				div.c("grid gap auto").style("--column", "8em").append(cells);
			});
		}, "**Same wall, one word.** The first row has no `gap` class, so the cells touch edge to edge; add `gap` and framework.css's default `1em` `--gap` opens a seam between every row and column. It's the word that's been sitting in every string on this page already.");

		h2("A cell that wants more");

		demo(() => {
			div.c("grid gap auto").style("--column", "9em").append(() => {
				div.c("pad wash", "span 2").style({ "--pad": "0.5em", gridColumn: "span 2" });
				div.c("pad wash", "two").style("--pad", "0.5em");
				div.c("pad wash", "three").style("--pad", "0.5em");
			});
		}, "**A span, never a width.** A width fights the track; a span rides it, so the cell stays right at every count. ⚠ Spans do not clamp themselves: `auto-fit` must generate at least as many tracks as the widest span demands, so a `span 2` invents a second track even at one column and the wall overflows — measured, 94px of horizontal scroll at 320px. Any wall with a span owes one query back: `@media (max-width: 28em) { … span 1 }`.");

		h2("A span that is fine");

		demo(() => {
			div.c("grid gap three").style("--column", "4em").append(() => {
				div.c("pad wash", "hero").style({ "--pad": "0.5em", gridColumn: "span 2" });
				div.c("pad wash", "b").style("--pad", "0.5em");
			});
		}, "**A span inside a fixed count doesn't invent anything.** `three` only ever sits at one column or three — never two — so a `span 2` hero beside one plain cell adds up to exactly three, the count the wall already lands on. Nothing above 28em is asked for a track that isn't already there.");

		h2("Where the same markup breaks");

		md("Six identical cells, three values of one token. The count, the break widths and the shape of the last row are all consequences — nothing below was designed per width.");

		demo(() => {
			div.c("flex v gap", () => {
				["7em", "12em", "20em"].forEach(column => {
					div.c("h4", "--column: " + column);
					div.c("grid gap auto").style("--column", column).append(cells);
				});
			});
		}, "**Drag the handle.** `cells` is the six `div.c(\"pad wash\")` above. At a 900px stage: six across, four, then two. The `20em` wall is a card wall, the `7em` one is a stat strip, and the difference between them is a number — this is [Gallery](/framework/styles/layouts/gallery/)'s wall and [Dashboard](/framework/styles/layouts/dashboard/)'s numbers, which are the same class.").ac("wide");

		h2("Template areas");

		demo(() => {
			div.c("grid gap").style({ gridTemplateColumns: "1fr 1fr", gridTemplateAreas: '"a a" "b c"' }).append(() => {
				div.c("pad wash", "a").style({ "--pad": "0.5em", gridArea: "a" });
				div.c("pad wash", "b").style({ "--pad": "0.5em", gridArea: "b" });
				div.c("pad wash", "c").style({ "--pad": "0.5em", gridArea: "c" });
			});
		}, "**A picture of the layout, not a count of tracks.** `grid-template-areas: \"a a\" \"b c\"` draws the wall as ASCII, and each cell claims a letter with `grid-area`. Raw declaration again — one template already doubles what a beginner can build by hand.");

		h2("`min-width: 0` / `minmax(0, 1fr)`");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("grid gap").style({ gridTemplateColumns: "1fr 1fr" }).append(() => {
					div.c("pad wash", "pneumonoultramicroscopicsilicovolcanoconiosis").style("--pad", "0.5em");
					div.c("pad wash", "normal cell").style("--pad", "0.5em");
				});
				div.c("grid gap").style({ gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)" }).append(() => {
					div.c("pad wash", "pneumonoultramicroscopicsilicovolcanoconiosis").style("--pad", "0.5em");
					div.c("pad wash", "normal cell").style("--pad", "0.5em");
				});
			});
		}, "**`1fr` alone still keeps a cell's content minimum** — a word with no spaces can't shrink to get smaller, so it blows the track out sideways anyway. `minmax(0, 1fr)` (or `min-width: 0` on the cell) drops that floor to zero. Not the same guard as `.grid.auto`'s `min(var(--column), 100%)` above: that one stops a track's WIDTH floor overflowing its box; this one stops a track's CONTENT overflowing its track.");

		h2("`dense`");

		demo(() => {
			div.c("flex v gap", () => {
				div.c("grid gap auto").style("--column", "10em").append(() => {
					div.c("pad wash", "1").style("--pad", "0.5em");
					div.c("pad wash", "big").style({ "--pad": "0.5em", gridColumn: "span 2" });
					div.c("pad wash", "2").style("--pad", "0.5em");
					div.c("pad wash", "3").style("--pad", "0.5em");
				});
				div.c("grid gap auto").style({ "--column": "10em", gridAutoFlow: "dense" }).append(() => {
					div.c("pad wash", "1").style("--pad", "0.5em");
					div.c("pad wash", "big").style({ "--pad": "0.5em", gridColumn: "span 2" });
					div.c("pad wash", "2").style("--pad", "0.5em");
					div.c("pad wash", "3").style("--pad", "0.5em");
				});
			});
		}, "**A wide cell leaves a hole beside it; `dense` fills it.** Sparse auto-placement never backtracks — `big` can't fit next to `1`, so it drops to a new row and the cell beside `1` stays empty; `2` skips it too. `grid-auto-flow: dense` lets `2` slot in instead, out of DOM order. Opt-in only: it reorders what you READ, so it's never the default.");

		h2("Alignment inside a cell");

		demo(() => {
			div.c("grid gap auto").style("--column", "8em").append(() => {
				div.c("pad wash", "start").style({ "--pad": "0.5em", justifySelf: "start" });
				div.c("pad wash", "center").style({ "--pad": "0.5em", justifySelf: "center" });
				div.c("pad wash", "end").style({ "--pad": "0.5em", justifySelf: "end" });
			});
		}, "**A track and what's in it are two different sizes.** `justify-self` (`place-self` for both axes) moves the CONTENT inside its track without moving the track itself. Every other cell on this page fills its track by default — this is the opt-out.");

		h2("A nested grid");

		demo(() => {
			div.c("grid gap auto").style("--column", "10em").append(() => {
				div.c("pad wash", "1").style("--pad", "0.5em");
				div.c("pad wash grid gap auto", () => {
					div.c("pad wash", "2a").style("--pad", "0.3em");
					div.c("pad wash", "2b").style("--pad", "0.3em");
				}).style({ "--pad": "0.5em", "--column": "4em" });
				div.c("pad wash", "3").style("--pad", "0.5em");
			});
		}, "**A cell can be a grid too.** The middle cell is itself `grid gap auto`, with its own `--column` — two levels, and each one only knows its own tracks. The outer wall never sees the inner one's count.");

		h2("The three templates");

		code.js(`div.c("grid gap auto", () => { … })                       // a wall, any count
div.c("grid gap auto").style("--column", "8em")           // a strip of tiles
div.c("grid gap three", () => { … })                      // three, then one`);

		md("For the asymmetric case — a fixed rail beside fluid content — reach for [Flex](/framework/styles/layouts/flex/) instead: `basis` and `flex-1` say it in two words, and there is no utility for a hand-written `grid-template-columns` because every one of them is a different template.");

		md("Next: [App shell](/framework/styles/layouts/shell/) — both of these, in one page.");
	},
});
