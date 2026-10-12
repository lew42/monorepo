import { Page, div, p, b, a, code, img, table, thead, tbody, tr, th, td } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page on the day's board — the ordinary `main` reading
                column, except the shots, which claim `wide`.
   2 SIZE       one screen: one sentence saying what was wrong, the before/after
                table, the command, then the pictures. The two 3440 shots are
                only legible about a picture wide, so they take `wide` and stack;
                everything else stays inside the measure.
   3 OWN LAYOUT prose is the page's own `.flow`. The counts are a real `table` —
                four rows of two numbers each is a table, not four cards. The
                shots are a `flex v gap-25` stack with a caption above each.
   4 REGIONS    three: the rule and the counts; the command; the pictures and
                what is left.
   5 PREVIEW    the day board's card; one line naming the two numbers. */

const SHOTS = name => new URL(`shots/${name}`, import.meta.url).pathname;

// Pages carrying text under 4px from an edge, and how many pieces of text that
// was, at each width. One instrument, one page list, measured either side of
// four one-declaration CSS changes.
const COUNTS = [
	["400",  66, 4, 183, 23],
	["1280", 62, 1, 141, 18],
	["1920", 62, 1, 302, 18],
	["3440", 62, 1, 270, 16],
];

export default new Page({
	meta: import.meta,
	title: "padding-law",
	icon: "format_indent_increase",
	description: "Text never sits at 0 from an edge — what broke it on 68 of 107 pages, fixed in four lines, and the command that keeps it fixed.",

	preview(nav){
		return this.preview_card(nav, () =>
			p.c("muted", "Text touching an edge: 68 of 107 pages before, 4 after. Four one-line fixes and a check anyone can run."));
	},

	content(){

		p(b("A page's left and right padding is not padding — it is the first and last column of the page's grid, and the table-of-contents layout was replacing that grid with one that has no such columns."),
			" Every page with an ", b("ON THIS PAGE"), " rail lost both gutters above 1312px. Same page, before and after:");

		div.c("wide flex v gap-25", () => {

			p.c("muted", "Before — /framework/styles/ at 3440. The heading and the sentence start at the sidebar's right edge, 0px; the card row between them sits 90px in.");
			img.c("card").attr("src", SHOTS("styles-3440-before.png"))
				.attr("alt", "The Styles page at 3440 before the fix: the heading Styles and the paragraph below the cards both start exactly at the sidebar's right edge, while the row of cards is indented.")
				.style({ display: "block", width: "100%" });

			p.c("muted", "After — one left edge for the heading, the cards and the sentence, and the rail on the right gets a gutter of its own too.");
			img.c("card").attr("src", SHOTS("styles-3440-after.png"))
				.attr("alt", "The same page after the fix: heading, cards and paragraph all share one left edge 90px from the sidebar, and the ON THIS PAGE column no longer touches the window's right edge.")
				.style({ display: "block", width: "100%" });
		});

		p("The card row had looked fine all along because a card row pays its own gutter back out of its own pocket — only the prose sat on the edge. ",
			b("Three more rules had the same shape"), " — a box that paints a background of its own, holding text with nothing between the text and the edge. All four are fixed at the rule, not on the pages.");

		p.c("h3", "Before and after, everywhere");

		table.c("ui-table", () => {
			thead(() => tr(() => {
				th("Window");
				th("Pages with text at an edge");
				th("Pieces of text");
			}));
			tbody(() => COUNTS.forEach(([w, pb, pa, tb, ta]) => tr(() => {
				td(w + "px");
				td(`${pb} → ${pa}`);
				td(`${tb} → ${ta}`);
			})));
		});

		p.c("muted", "107 pages, the same list and the same measuring code on both runs. 68 pages carried a violation at one width or another before; 4 do now, and 68 of the 75 pieces of text left are one page's contrast chips, which have real padding that simply measures under four pixels.");

		p.c("h3", "The command");

		p("Before landing any page, at any window size:");

		// ⚠ `code.lang(name, src)` is the general form; there is no `code.sh` accessor
		//    (the registered ones are js/html/css/md/json), and an unregistered
		//    grammar renders as plain text rather than throwing.
		code.lang("bash", "node Server/padding-check.mjs /framework/styles/");

		p("It loads the page at 400, 1280, 1920 and 3440, and exits non-zero naming the text and how far it was from the edge. ",
			b("The page-health watcher now runs the same check"), " on every page you change — it had been looking at 1280 alone, which is the one width just under where this bug starts, and that is why nothing caught it.");

		div.c("flex v gap-25", () => {
			p.c("muted", "The AI board at 1280 after — the date and every card on one edge, 42px from the rail.");
			img.c("card").attr("src", SHOTS("board-1280-after.png"))
				.attr("alt", "The AI board for 2026-09-22 at 1280 after the fix, with the date heading and the task cards sharing one left edge.")
				.style({ display: "block", width: "100%" });
		});

		p.c("h3", "What is left, and why");

		p("Four pages. Three of them are small chips — a contrast label on ",
			a("Stacking").href("/framework/styles/stacks/"), " and a toolbar chip on ",
			a("ext/layout").href("/framework/ext/layout/"),
			" — whose own padding is real and deliberate and lands at 2.8–3.8px, just under a floor measured in pixels. Widening them to satisfy a number would be fitting the site to the ruler. The fourth, ",
			a("ext/Panel").href("/framework/ext/Panel/"),
			" at a phone width, is not a padding bug at all: its workspace toolbar runs 13px past the window, which is a row that neither wraps nor shrinks.");

		p.c("h3", "The detail");

		p("Every measurement, the four wrong versions of the measuring tool that came before the honest one, and the reason each fix is where it is: ",
			a("this task's log").href("/framework/ai/2026-09-22/padding-law/"),
			". The law itself is now a line in the ", code("css"), " and ", code("layout"), " skills, and the measurement has exactly one definition, in ", code("Server/padding-check.mjs"), ", which the probe and the health watcher both import.");
	},
});
