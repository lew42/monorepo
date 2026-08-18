import { div, h3, p } from "/app.js";

/* Eight wireframes from the Figma frame "AI Slop" (node 51:1477), each as ONE class
 * string. The file draws boxes with labels in them and nothing else — the question the
 * owner asked is "can our words produce these outcomes", so the words have to be the
 * only thing on the screen.
 *
 * ⚠ Two spacing values in the whole file, and both live in region() below: `--pad`
 *   untouched at its 1em default, and `--gap: 0.4em` between a label and its line. Every
 *   other number here is a `--column` — a WRAP THRESHOLD, which is the layout decision
 *   itself, not spacing. That is what makes `div.pad` + `h3` identical in all eight.
 *
 * ⚠ TWO tones, `wash` and bare, and that is not a taste decision — the Figma's ladder is
 *   three greys (#e5e5e5 / #f4f4f4 / #fff) and we have TWO surface classes. `--tint` is a
 *   real token and there is no `.tint` class; typing one paints nothing and throws
 *   nothing. Measured, and written up in doc/decisions.md. No new colour, no new text
 *   style either: a region label is `h3`, its line is `p.muted`.
 */

/* A simulated SCREEN has a ground — a browser paints one behind every page, and without
 * it `wash` sits on the app's own grey and the alternation disappears. `demo.layout`'s
 * frame() says the same thing for the card; this is the `/full/` url's half. */
const screen = { background: "var(--surface)" };

/* Every box on every one of these eight. `measure start` is the whole Mega answer — a
 * 34em cap with the centring taken off, so a column 1100px wide on a 3440 screen still
 * holds a readable line instead of a 140-character one. Measured: 544px at 1920. */
const region = (label, line, tone = "") =>
	div.c("pad flex v gap " + tone, () => {
		h3(label);
		if (line) p.c("muted measure start", line);
	}).style("--gap", "0.4em");

/* The scrolling middle of a `fill` page — `min-height: 0` or the band never shrinks and
 * `overflow-y` never engages (styles/layouts/doc/decisions.md). Per-layout state, so
 * inline is where it belongs. */
const scrolls = { minHeight: "0", overflowY: "auto" };

/* ⚠ Only on a row whose wrapped LINES are uneven — a 14em rail beside a wall. The
 *   default (`stretch`) hands a short rail half the screen once it takes its own line.
 *   Where the children are peers (three equal columns, two bento stacks) `stretch` is
 *   right and this is deliberately absent. doc/decisions.md has the measurement. */
const ragged = { ...scrolls, alignContent: "start" };

export const specs = [

	{
		name: "bands", title: "Header, Three, Footer",
		description: "A band, three equal columns, a band — `flex auto` and one `--column`.",
		note: "**`flex auto` is the whole middle.** `.flex.auto` sets `flex-wrap: wrap` and gives every "
			+ "child `flex: 1 1 var(--column)`, so `--column: 20em` says *three across while three fit, "
			+ "fewer when they do not*. Three at 1280 and 1920, one at 400, and no breakpoint is written "
			+ "down anywhere. At 3440 it stays three — the columns get wide, and the `measure start` "
			+ "inside each one is what keeps the line readable rather than 140 characters long.",
		layout(){
			return div.c("page full fill flex v", () => {
				region("Header", "One band, full width, `pad wash`.", "wash");

				div.c("flex auto flex-1", () => {
					region("Column one", "Each column is `flex: 1 1 20em` — the class said it, not a query.", "wash");
					region("Column two", "Below 20em apiece the row wraps and this becomes the second row.");
					region("Column three", "Above it, three. That is the entire responsive rule.", "wash");
				}).style({ "--column": "20em", ...scrolls });

				region("Footer", "The closing band, and the page's last row.", "wash");
			}).style(screen);
		},
	},

	{
		name: "left", title: "Left Sidebar",
		description: "A `basis` rail beside a wall that re-counts its own columns.",
		note: "**`flex wrap`, a `basis` rail, and a wall with a REAL basis.** `--basis: 14em` fixes the "
			+ "rail; the wall is `flex: 1 1 26em`. ⚠ Not `.flex-1` — that is `flex: 1` with a **zero** "
			+ "basis, so the wall shrinks for ever instead of wrapping, and at 400 it lands on ~155px of "
			+ "a 390 screen. That exact bug is recorded twice in `layouts/doc/decisions.md`. "
			+ "`align-content: start` is the other half: without it the rail takes its own line at 400 "
			+ "and *stretches* to half the viewport.",
		layout(){
			return div.c("page full fill flex wrap", () => {
				div.c("basis wash pad flex v gap", () => {
					h3("Sidebar");
					p.c("muted", "`basis` with `--basis: 14em`. Fixed track, fluid neighbour.");
				}).style({ "--basis": "14em", "--gap": "0.4em" });

				div.c("grid gap auto", () => {
					region("Section A", "The wall is `grid gap auto` at `--column: 24em`.", "wash");
					region("Section B", "Two across on a desktop, one at 400, more on a wall.");
					region("Content", "`auto-fit` re-counts the tracks; nothing counts them here.", "wash");
					region("Details", "The rail never moves while the wall changes shape.");
					region("Item 1", "Six children, and the number of columns is not one of them.", "wash");
					region("Item 2", "`--column` is a threshold, not a width.");
				}).style({ "--column": "24em", "--gap": "0", flex: "1 1 26em", ...scrolls });
			}).style({ ...screen, ...ragged });
		},
	},

	{
		name: "right", title: "Right Sidebar",
		description: "The same row, source order flipped — and the mobile stack stays right.",
		note: "**The mirror is source order, not a class.** Content first, rail second: the rail sits on "
			+ "the right of one line and *below* the content when the line wraps, which is what a phone "
			+ "wants. `flex reverse wrap` is the other option and it is a different answer — reverse puts "
			+ "the rail on the right too, but the wrapped rail becomes the FIRST line and lands on top "
			+ "(that is [hero](/framework/styles/layouts/hero/), where the picture belongs above the "
			+ "copy). Two outcomes, one word apart; pick the one whose 400 is right.",
		layout(){
			return div.c("page full fill flex wrap", () => {
				div.c("grid gap auto", () => {
					region("Title", "Identical to Left Sidebar with the two children swapped.", "wash");
					region("Subtitle", "No `reverse`, no query, no second string.");
					region("Main Content", "At 400 this stack comes first, because it is first.", "wash");
					region("Supporting", "The rail follows it down rather than sitting on top.");
					region("Footer Left", "Which of the two you want is a 400 question, not a 1920 one.", "wash");
					region("Footer Right", "Ask it before you pick the word.");
				}).style({ "--column": "24em", "--gap": "0", flex: "1 1 26em", ...scrolls });

				div.c("basis wash pad flex v gap", () => {
					h3("Sidebar");
					p.c("muted", "Second in source, so second on a phone.");
				}).style({ "--basis": "14em", "--gap": "0.4em" });
			}).style({ ...screen, ...ragged });
		},
	},

	{
		name: "hero", title: "Hero and Grid",
		description: "A full-bleed band over two rows of three — `grid three`, which never shows two.",
		note: "**`grid three` is three or one, never two.** `.grid.three`'s `clamp()` collapses straight "
			+ "from three tracks to one the moment `--column * 3` stops fitting, so a row of three "
			+ "features never spends a width showing two-and-an-orphan. `grid auto` would show the two. "
			+ "This is the one place in the eight where the *ragged last row* is the thing to avoid, and "
			+ "the vocabulary already had the word for it.",
		layout(){
			return div.c("page full fill flex v", () => {
				region("Hero Section", "A band with nothing in it but its own padding — the page's one full-bleed region.", "wash");

				div.c("flex v flex-1", () => {
					div.c("grid three", () => {
						region("Feature 1", "`grid three`, `--column: 18em`.", "wash");
						region("Feature 2", "Three tracks, or one.");
						region("Feature 3", "It will not stop at two.", "wash");
					}).style("--column", "18em");

					div.c("grid three", () => {
						region("Detail A", "The second row reads the same token.");
						region("Detail B", "So both rows break at the same width.", "wash");
						region("Detail C", "One value, two rows, no query.");
					}).style("--column", "18em");
				}).style(scrolls);
			}).style(screen);
		},
	},

	{
		name: "bento", title: "Bento",
		description: "A two-thirds feature beside a third of stacked cards — and the one thing we have no word for.",
		note: "**This is the layout our vocabulary cannot say, and it is the pilot's most useful "
			+ "finding.** Every flexible word here splits its row EQUALLY: `.flex.auto` gives every child "
			+ "`flex: 1 1 var(--column)`, `.all-1` gives every child `flex: 1`, `.basis` is a *fixed* "
			+ "track. There is no word for **twice the other, and still fluid** — so the 2:1 seam below "
			+ "is an inline `flex: 2 1 30em`. Two candidate fixes are in [doc/bento.md](./doc/bento.md); "
			+ "one of them needs no new CSS at all.",
		layout(){
			return div.c("page full fill flex wrap", () => {

				/* ⚠ The finding. `flex: 2` is the only declaration in this file that no class
				   string can make — see doc/bento.md. */
				div.c("flex v", () => {
					region("Featured Content", "Two of three, and still fluid — an inline `flex: 2 1 30em`, because no class says it.", "wash")
						.style({ flex: "1 1 auto" });

					div.c("flex auto", () => {
						region("Related A", "The pair beneath it is `flex auto` again.");
						region("Related B", "Peers, so they split evenly and the word fits.", "wash");
					}).style("--column", "14em");
				}).style({ flex: "2 1 30em" });

				div.c("flex v all-1", () => {
					region("Card 1", "A third of the row.");
					region("Card 2", "Three stacked, sharing the column's height.", "wash");
					region("Card 3", "At 400 this column follows the feature down.");
				}).style({ flex: "1 1 16em" });

			}).style({ ...screen, ...scrolls });
		},
	},

	{
		name: "columns", title: "Three Full Columns",
		description: "The flex twin of `grid three` — three full-height columns that collapse to one.",
		note: "**`flex three` is `grid three` in the other engine.** `.flex.three > *` runs the same "
			+ "`calc(((var(--column) * 3) - 100%) * 999)` trick on `flex-basis`: three columns while three "
			+ "fit, one the instant they do not, and never a two. Flex rather than grid because each "
			+ "column here is itself a `flex v all-1` of three cells that must share the column's height "
			+ "— which flex does with one word and a grid track would need told.",
		layout(){
			const column = (a, b, c, flip) => div.c("flex v all-1", () => {
				region(a[0], a[1], flip ? "" : "wash");
				region(b[0], b[1], flip ? "wash" : "");
				region(c[0], c[1], flip ? "" : "wash");
			});

			return div.c("page full fill flex three flex-1", () => {
				column(["Navigation", "`flex three` at `--column: 16em`."],
					["Menu Items", "Each column is a `flex v all-1`."],
					["Settings", "`all-1` makes the three cells share the height."]);

				column(["Main Content", "Three across, or one."],
					["Et commodo", "The middle column carries the Figma's only real sentence."],
					["Details", "Everything else on the frame was a label."], true);

				column(["Preview", "At 400 the three columns become nine stacked cells."],
					["Properties", "In order, because flex wrap keeps source order."],
					["Actions", "Which is the reason this one is not `masonry`."]);
			}).style({ "--column": "16em", ...screen, ...scrolls });
		},
	},

	{
		name: "board", title: "Dashboard",
		description: "Metrics, a two-thirds panel beside a third, a status bar.",
		note: "**Three bands, and the middle one has the bento's problem.** The metric row is `flex auto` "
			+ "and the status bar is a plain band — both are one word. The main-and-side row is the 2:1 "
			+ "seam again, and again it is an inline `flex`. This is the second of eight layouts to want "
			+ "the same missing word, which is what makes it worth a rule rather than a workaround "
			+ "([doc/bento.md](./doc/bento.md)). The whole-page version of this screen, with real "
			+ "numbers on it, is [dashboard](/framework/styles/layouts/dashboard/).",
		layout(){
			return div.c("page full fill flex v", () => {
				div.c("flex auto", () => {
					region("Metric A", "`flex auto`, `--column: 15em` — three, two, or one.", "wash");
					region("Metric B", "Peers, so the even split is the right one.");
					region("Metric C", "No inline anything on this row.", "wash");
				}).style("--column", "15em");

				div.c("flex wrap flex-1", () => {
					region("Main Dashboard Content", "`flex: 2 1 30em`. The missing word again.")
						.style({ flex: "2 1 30em" });
					region("Side Panel", "`flex: 1 1 16em` — filters and controls.", "wash")
						.style({ flex: "1 1 16em" });
				}).style(scrolls);

				region("Status Bar", "The third band, and the page's last row.", "wash");
			}).style(screen);
		},
	},

	{
		name: "grail", title: "Holy Grail",
		description: "Header, two rails around a fluid centre, footer — five regions, one string.",
		note: "**Two `basis` rails and a centre with a real basis.** The row is `flex wrap`: rails at "
			+ "`--basis: 11em`, centre at `flex: 1 1 26em`. At 400 all three take their own line in source "
			+ "order — nav, content, aside — which is the reading order you want and costs nothing to "
			+ "get. ⚠ `align-content: start` matters most here: three lines of wildly different height, "
			+ "and the default would hand each a third of the viewport. The toggleable version of this "
			+ "screen is [shell](/framework/styles/layouts/shell/), where the same five regions are five "
			+ "checkboxes — which is why this tier deleted its own `holy-grail` once already.",
		layout(){
			const rail = (label, line) => div.c("basis wash pad flex v gap", () => {
				h3(label);
				p.c("muted", line);
			}).style({ "--basis": "11em", "--gap": "0.4em" });

			return div.c("page full fill flex v", () => {
				region("Header", "Full width, above the row.", "wash");

				div.c("flex wrap flex-1", () => {
					rail("Nav", "`basis`, 11em.");
					region("Primary Content", "`flex: 1 1 26em` — a real basis, so the row can wrap instead of squeezing this to nothing.")
						.style({ flex: "1 1 26em" });
					rail("Aside", "`basis` again, same token.");
				}).style(ragged);

				region("Footer", "Full width, below it.", "wash");
			}).style(screen);
		},
	},

];

export default specs;
