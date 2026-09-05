import { Page, demo, div, md, h2 } from "/app.js";
import { Paging } from "../../paging.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  the paging realm's middle. Prose in `main` (40em), and both demo
                boxes claim `wide` — a row of columns needs a row.
   2 SIZE       `wide` is ~1000px at 1280 and ~2950px at 3440. That matters: under
                32em of row the columns arrangement already pages one column at a
                time, so a demo in the 40em `main` track could not show the thing
                being demonstrated at all.
   3 OWN LAYOUT prose, then two live column browsers, one above the other, so the
                same click can be made twice and compared.
   4 REGIONS    one.
   5 PREVIEW    core's default card.                                               */

/* THE TREE BOTH BOXES SHOW. Two of these are built, one per box, so the two
   demos have separate state and you can click the same row in each.
   ⚠ The middle column takes the DEFAULT width word on purpose. `small` is already
     fixed-width (`flex: 0 0` — Page.css), so a rail proves nothing; the default and
     `large` tracks are the ones that negotiate, and they are what reflows. */
const tree = () => {
	const root = new Page({
		title: "Docs",
		// ⚠ `hug` and NO `content()`. A hug column's basis is its MAX-CONTENT width, and
		//   the max-content width of a paragraph is the paragraph on one line — so a hug
		//   rail carrying prose measures the prose (core/Page/doc/columns.md). It hugs
		//   these three rows instead, which leaves the box room for four columns at 1280.
		width: "hug",

		children: {
			Guide: {
				content(){ md("An ordinary column."); },
				children: {
					Setup: {
						content(){ md("**This is the column you are reading.** Click `Detail` below and watch this column's left edge."); },
						children: {
							Detail(){ md("The column that just opened. In the top box, every column to my left gave up width to make room for me."); },
							More(){ md("And another."); },
						},
					},
					Usage(){ md("Another page."); },
				},
			},
			Notes(){ md("Nothing here."); },
		},
	});

	root.columns();

	// Arrive three columns in, so the row is already FULL: that is the only state in
	// which an elastic row has to take width off somebody to open a fourth column.
	return root.children.get("guide").children.get("setup");
};

export default new Paging({
	meta: import.meta,
	title: "Fixed columns",
	description: "A column opens and nothing already open moves.",
	icon: "view_column",
	axes: "",

	takeaway: "**Click `Detail` in both boxes below and watch the left edge of the `Setup` column.** In the top box it slides left, because the fourth column is paid for out of its neighbours' width. In the bottom box it does not move at all.",

	content(){
		this.lede();

		this.box("As the site works today", "Every column is elastic: it has a floor and a ceiling and takes a share of the row. A new column means a new share for everybody, so every open column narrows and slides.", false);

		this.box("With one rule added", "Each column takes its own ceiling as a fixed width and neither grows nor shrinks. The new column is simply appended, and when the row runs out of space it scrolls — a scroll you can undo, rather than a reflow you cannot.", true);

		h2("The rule");

		md("One selector, in `navigation.css`. Put the class on a columns host and every column under it stops negotiating.\n\n```css\n.paging-nav-fixed .page.columns .page-column-body:not(.page-column-fill, .page-column-full) {\n\t--page-column-flex: 0 0 var(--page-column-max, clamp(40em, 42cqi, 46em));\n\t--page-column-min: 0;\n}\n```\n\n`fill` and `full` are left out because their ceiling is the word `none`, and `flex: 0 0 none` is an invalid declaration — it would drop the whole rule with no error. The proposal to move this into `core/Page/Page.css` as a real word, with the diff, is in [the task log](/framework/ai/2026-09-05/nav-stability/).");

		md("Measured, clicking `Detail` in each box: the `Setup` column moved **134px at 1280 and 161px at 3440** in the top box, and **0px at both** in the bottom one. On the real site the same gesture moves a column **126px at 1280**, and a link that opens two columns at once moves it **194px**. [How every number was taken](/imagine/paging/navigation/doc/measurements/).");
	},

	/* ONE BOX — a name, a sentence, and a real column browser. `demo.app()` plays
	   App and Router for one tree inside a box, so these are real Pages doing real
	   `render_column()`, not a picture of one. */
	box(name, says, fixed){
		return div.c("paging-nav-demo paging-nav-cols wide").ac(fixed && "paging-nav-fixed").append(() => {
			div.c("paging-nav-demo-name", name);
			div.c("paging-nav-demo-body", () => {
				md(says);
				demo.app(tree());
			});
		});
	},
});
