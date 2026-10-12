import { Page, p, b, code, h2, table, thead, tbody, tr, th, td, ul, li, a } from "/app.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a child of the analysis page — the ordinary `main` column.
   2 SIZE       four small tables and a list; the tables take `wide` because a
                six-column table squeezed into 40em is the commonest mistake here.
   3 OWN LAYOUT plain `.flow` prose with bare tables (framework.css already gives
                one `max-content` under a `max-width: 100%` ceiling, which is right
                from 288px to 3440).
   4 REGIONS    five: what was measured, the four counts, the method.
   5 PREVIEW    one line on the parent. */

/* Every number below was read off a live browser, never typed by hand: 133 pages
   loaded once each and measured at four viewport widths. */
const WIDTHS = [
	["400", 131, 1, 28],
	["1280", 133, 2, 42],
	["1920", 133, 7, 67],
	["3440", 133, 7, 90],
];

const INSETS = [
	[0, 1, "/framework/ai2/"],
	[15, 2, "/framework/ai/, /layouts/shell/"],
	[20, 1, "/imagine/"],
	[30, 1, "/framework/ext/Panel/"],
	[42, 105, "every ordinary page beside the sidebar"],
	[51, 16, "every ordinary page with no sidebar"],
	[62, 3, "/, /blog/, /framework/ - the region's own default"],
	[269, 1, "/resume/"],
	[387, 1, "/framework/styles/sections/"],
	[401, 2, "/web/nav/, /web/layout/"],
];

const PAYERS = [
	[73, "a grid TRACK on the page itself", "core/Page/Page.css, the shell's two gutter columns"],
	[52, "div.doc-well", "ext/Doc/Doc.css - the module title band, with its own copy of the gutter clamp"],
	[3, "div.default", "core/Page/Page.css:85 - the region default's padding: 3em clamp(0px, 6%, 5em)"],
	[1, "div.v3-head", "ai/v/3/v3.css - the AI board, which zeroes the page gutter first"],
	[1, "div.page-column-head", "core/Page/Page.css - the columns host's --page-column-pad-x"],
	[1, "div.std-shell-rail", "layouts/shell/shell.css"],
	[1, "div.resume-head", "resume/resume.css"],
	[1, "nothing at all", "/framework/ai2/ - the ink is on the edge"],
];

const TAKE = [
	"styles.css:85  .page.topic",
	"core/Page/Page.css:1053  .page.full",
	"core/Page/Page.css:259  .page.columns",
	"core/Section/Section.css:84  .page-section .page",
	"ext/Doc/Doc.css:1  .page.doc-page",
	"ext/Panel/playground/playground.css:7  .page.layout-full.panel-playground-page",
	"ai/v/2/v2.css:129  .page:has(> .page-catalog .v2)",
	"ai/v/3/v3.css:691  .page:has(> .page-catalog .v3)",
	"ai/v/3/v3.css:706  .page:has(> .v3)",
	"blog/blog.css:146  .page.blog-part",
	"imagine/blogx/blogx.css:25  .page.blogx",
	"imagine/blogx/blogx.css:428  .page.blogx-part",
	"imagine/scenes/scenes.css:204  .page.scene-note",
	"imagine/shells/Shell.css:21  .page.shell",
	"layouts/labs/blogx/blogx.css:25  .page.blogx",
	"layouts/labs/blogx/blogx.css:428  .page.blogx-part",
	"layouts/labs/shells/Shell.css:21  .page.shell",
	"layouts/shell/shell.css:56  .page.std-shell",
];

const BACK = [
	"core/Page/Page.css:1102  .page > :is(.page-previews, .page-walls)",
	"core/Page/Page.css:1109  .page > .bleed:is(.grid, .flex)",
	"blog/blog.css:34  .page.blog-post",
	"ext/demo/shell.css:3  .demo-shell",
	"ext/demo/stage.css:20  .page.standard > .demo-stage.bleed",
	"ext/layout/layout.css:5  .page.standard > .layout.bleed",
	"layouts/shell/shell.css:352  .std-shell .std-shell-changed > summary",
	"notes/notes.css:84  .page:has(> .notes-shot)",
];

export default new Page({
	meta: import.meta,
	title: "The counts",
	icon: "functions",
	description: "133 pages at four widths: the violations, the ten insets, the eight payers and the 38 rules.",

	preview(nav){
		return this.preview_card(nav, () => p.c("muted", "Every number behind the analysis, and how it was measured."));
	},

	content(){
		p(b("133 pages listed, 133 probed, 133 measured."), " Every top-level page of the site and one level below it, loaded once each and measured at 400, 1280, 1920 and 3440. Two of the 133 have no measurable ink at 400 (the columns row is one column wide there), which is why that row reads 131.");

		h2("1. Text at the edge");
		p("A page counts as a violation when its nearest visible text is closer to the content region's inline-start edge than one rung - `--gap-25`, the smallest step the size standard has, which is 3.5px at 400 and 10.8px at 3440. ", b("It gets worse as the screen gets wider"), ", which is the opposite of what anyone expects.");
		table.c("wide", () => {
			thead(() => tr(() => { th("window"); th("pages measured"); th("violations"); th("median gap"); }));
			tbody(() => WIDTHS.forEach(([w, n, v, m]) => tr(() => { td(w); td(String(n)); td(String(v)); td(m + "px"); })));
		});
		p("Six pages violate at at least one width. Five of them - `/framework/styles/`, `/core/`, `/versus/`, `/faq/`, `/start/` - are the same bug: `ext/toc` replaces the page's whole grid template above 82em and the gutter tracks go with it. The sixth, `/framework/ai2/`, is a `.page.full` that zeroes its own gutter on purpose.");

		h2("2. Double");
		p("Four of 133 pages have more than one box paying an inset to their first heading, and it is always the same shape - ", b("a page nested inside a page, each paying its own gutter"), ":");
		ul(() => {
			li("/web/nav/ and /web/layout/ - an intro page's 34px track plus the host page's 51px");
			li("/framework/styles/sections/ - 30px plus 42px");
			li("/resume/ - four payers: a head, a card, a track and the page's own padding");
		});
		p("One page sits past twice its own gutter: `/resume/`, at 225px against a 36px gutter.");

		h2("3. Ten insets, eight payers");
		p("How far the first heading sits from the region's edge at one single width (1280), and which box actually provides it:");
		table.c("wide", () => {
			thead(() => tr(() => { th("inset"); th("pages"); th("which"); }));
			tbody(() => INSETS.forEach(([px, n, who]) => tr(() => { td(px + "px"); td(String(n)); td(who); })));
		});
		table.c("wide", () => {
			thead(() => tr(() => { th("pages"); th("the box that pays"); th("where the rule lives"); }));
			tbody(() => PAYERS.forEach(([n, box, where]) => tr(() => { td(String(n)); td(() => code(box)); td(where); })));
		});

		h2("4. The rules");
		p(b("38 rules in 25 live stylesheets set a page-level inset."), " One gives the gutter, 18 take it away, 8 hand it back by name, and 11 set an inset of their own. Sheets under `ai/<date>/` (frozen study artefacts) and `core/new/` (the sandbox) are not counted.");
		p(b("The one that gives it: "), "`core/Page/Page.css`, the `.page` shell.");
		p(b("The 18 that take it away"), " - each sets `--gutter-x: 0px` or `padding: 0` on a page box:");
		ul(() => TAKE.forEach(line => li(() => code(line))));
		p(b("The 8 that hand it back"), " - each writes `padding-inline: var(--gutter-x)` onto something that bled out of the page and did not want to:");
		ul(() => BACK.forEach(line => li(() => code(line))));

		h2("How it was measured");
		p("A headless browser loaded each page once and resized it four times. The resize was checked against a fresh load at the same width on five pages and agreed on nine of the ten pairs.");
		ul(() => {
			li(() => { b("The edge is the innermost region, not the page."); p.c("muted", "That box's inline-start edge is the rail's edge on a page with a sidebar and the window's edge on one without, so one number covers every shell. Keying off the page instead measured the topic shell, sidebar included, and read a false 0px on /blog/ and /framework/."); });
			li(() => { b("Ink inside a box that really scrolls sideways is skipped."); p.c("muted", "A code block's text touches its own edge; that is the block's business, not the page's. Measuring against the scroller's box instead reported /framework/styles/system/ as 1px when every paragraph on it sits at 28."); });
			li(() => { b("A custom property has no length."); p.c("muted", "getComputedStyle hands back the token text - clamp(2em, 4%, 5em) - so the gutter is read off the page's own resolved grid template instead, whose first px number IS the track. Resolving the token on a scratch element answered 51px where the track was 42, because the percentage re-resolved against a different box - the same trap the bleed opt-out hits."); });
			li(() => { b("Rules were counted from the source, not the browser."); p.c("muted", "A selector naming a page box (.page, .pages, a region .default) with a declaration touching the inline padding, the gutter token or the page padding. Two of the 40 matches are commented-out rules the parser could not tell from live ones, which is why the live count is 38."); });
		});
		p(a("Back to the analysis").href("../"));
	},
});
