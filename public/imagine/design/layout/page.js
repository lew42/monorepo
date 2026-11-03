import { Page, div, h2, h3, p, a, img, figure, figcaption, span, md } from "/app.js";

const here = new URL(".", import.meta.url).pathname;
const LIB = "/framework/ext/DesignTool/library/";

// The three page-level SHELLS the site is actually built from — everything else
// (tile wall, reading column, gallery…) is a CONTENT pattern that lives inside one
// of these, not a shell of its own. Counts are of the 20-page × 3-width sample in
// this task's layout-survey.json.
const SHELLS = [
	{
		file: "tax-rail-content.jpg", name: "Rail and content", count: "13 / 20",
		def: "A fixed sidebar (site nav or a topic's own) beside one scrolling content column. The near-universal page shell.",
		urls: [["/framework/", "/framework/"], ["/framework/core/Page/", "core/Page"], ["/michael/", "michael"], ["/blog/", "blog"]],
		see: `Library: [Rail and content](${LIB}rail-and-content/).`,
	},
	{
		file: "tax-reading-column.jpg", name: "Docs (three-region)", count: "every blog post",
		def: "Rail and content plus a third region — a per-page table of contents (`ext/toc`) pinned right. The library's own answer to \"a rail beside an article wastes a mega monitor.\"",
		urls: [["/blog/systems/layout-generators/", "a blog post"]],
		see: "Every post gets this for free from `blog/Post.js` — it is not a per-post decision.",
	},
	{
		file: "tax-columns-row.jpg", name: "Columns row (Finder)", count: "5 / 20",
		def: "core/Page's `columns()` — full-height panes opening rightward, each on its own width word (`small`/`hug`/default/`large`/`fill`/`full`), each scrolling itself.",
		urls: [["/imagine/", "/imagine/"], ["/framework/core/Page/overview/columns/uses/workbench/", "workbench (3–4 cols)"]],
		see: "[doc/columns.md](/framework/core/Page/doc/columns/) — the width-word table and the \"empty room\" problem below.",
	},
	{
		file: "tax-solo.jpg", name: "Solo / bespoke", count: "1 / 20",
		def: "No sidebar, no shell — its own render(). The one page that opts all the way out.",
		urls: [["/resume/", "/resume/"]],
		see: null,
	},
];

const CONTENT_PATTERNS = [
	{ file: "tax-tile-wall.jpg", name: "Card / tile wall", note: "the single most repeated CONTENT pattern — home's section cards, the AI day dashboard, every doc index (this library page included).", see: `${LIB}tile-wall/` },
	{ file: "tax-dashboard-row.jpg", name: "Dashboard row, Media gallery, List-and-detail, Wide table, Section band…", note: "documented in the library, but in this sample every one of them exists ONLY inside a small boxed mockup on a styles/layouts/* doc page — never as a real page's own shape.", see: `${LIB}` },
];

const FAILURES = [
	{ file: "fail-imagine-root-3440.jpg", url: "/imagine/", w: "3440",
		what: "content spans 33% of the screen — 2052px of dead gutter on the right (`dead-space`, med). Score drops B→C from 1280." },
	{ file: "fail-imagine-gallery-3440.jpg", url: "/imagine/gallery/", w: "3440",
		what: "13% used at BOTH 1280 and 3440 — a nested column stuck at its default width word, 51.6% whitespace below its own content. Grade F at every width measured." },
	{ file: "fail-imagine-design-3440.jpg", url: "/imagine/design/", w: "3440",
		what: "this page's own parent — the identical 13% / F, same cause. Two different URLs, same nested-column shape, same failure." },
	{ file: "fail-michael-3440.jpg", url: "/michael/", w: "3440",
		what: "26% used — 2536px dead gutter. Rail-and-content hits its prose ceiling and nothing claims the rest. Score B (1280) → C (3440)." },
	{ file: "fail-michael-layout-3440.jpg", url: "/michael/layout/", w: "3440",
		what: "41% used, same shell, same ceiling — 2018px dead gutter, score B→C." },
];

// width_used (`ext/DesignTool`'s content-span ÷ viewport), 1280 vs 3440, from the
// 9 of 20 sampled pages the tool could score — worst offender at 3440 first.
const SPREAD = [
	["/imagine/gallery/", "29.7%", "13.2%", "F → F"],
	["/imagine/design/", "29.7%", "13.2%", "F → F"],
	["/michael/", "45.5%", "19.3%", "B → C"],
	["/resume/", "61.8%", "27.5%", "A → B  (bounded on purpose — a solo read)"],
	["/michael/layout/", "79.4%", "32.9%", "B → C"],
	["/imagine/", "88.5%", "39.3%", "B → C"],
	["/blog/", "83.0%", "86.8%", "C → B"],
	["/", "81.8%", "91.1%", "B → B"],
	["/blog/systems/layout-generators/", "90.3%", "92.6%", "B → B"],
];

const shot = (file, alt) => img().attr("src", here + "shots/" + file).attr("alt", alt || "")
	.style({ width: "100%", border: "1px solid var(--line)", borderRadius: "0.3em" });

const shell_card = s => figure.c("flex v gap").style({ margin: 0, gap: "0.5em" }).append(() => {
	shot(s.file, s.name);
	figcaption(() => {
		span(s.name).style({ fontWeight: "700" });
		span.c("muted", ` — ${s.count}`);
	});
	p(s.def);
	div.c("flex gap wrap", () => s.urls.forEach(([u, label]) => a(label).href(u)));
	if (s.see) p.c("muted", s.see);
});

const fail_card = f => figure.c("flex v gap").style({ margin: 0, gap: "0.4em" }).append(() => {
	shot(f.file, f.url + " at " + f.w);
	figcaption(() => {
		a(f.url).href(f.url).style({ fontWeight: "700" });
		span.c("muted", ` at ${f.w} — `);
		span(f.what);
	});
});

const nowrap = { whiteSpace: "nowrap", flex: "0 0 auto", fontVariantNumeric: "tabular-nums" };
const spread_row = ([url, w1280, w3440, grades]) => div.c("flex gap wrap").style({ alignItems: "baseline", padding: "0.5em 0.6em", borderBlockEnd: "1px solid var(--line)" }).append(() => {
	a(url).href(url).style({ flex: "1 1 12em" });
	span(`1280: ${w1280}`).style(nowrap).ac("muted");
	span(`3440: ${w3440}`).style({ ...nowrap, fontWeight: "700", color: "var(--ink)" });
	span(grades).style(nowrap).ac("muted");
});

// This page is itself a plain column under /imagine/'s columns host (nested
// `columns()` is inert — doc/columns.md), so its own prose sits in
// `.page-column-prose` with no page grid at all: `wide` is meaningless here,
// only `bleed` reaches the column's real edge. Every grid below is bled;
// every paragraph is capped, or a `width: "full"` column hands it a 1200px+
// line — exactly the `measure` failure this page's own probe caught in draft.
const prose = text => div.c("measure start flow").append(() => md(text));

/**
 * The layout study (2026-09-01) — categorizes the site's page-layout patterns and
 * finds where they fail, especially at 3440. Extends `ext/DesignTool/library`'s
 * eleven arrangements rather than inventing a parallel vocabulary: the finding is
 * that the library documents CONTENT patterns, but only three of them are ever a
 * real page's own SHAPE — see `SHELLS` vs `CONTENT_PATTERNS` below. Raw survey (20
 * pages × 390/1280/3440, 60 rows) is `layout-survey.json` beside this task's log.
 */
export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "Every page-layout shape the site actually uses, which three are real page shells, and where 3440 is wasted.",
	icon: "dashboard",
	width: "full",

	children: "approved",

	// A real screenshot instead of the default icon+description card, on the design/
	// index only (2026-09-05 ux-rethink).
	preview(nav){
		return this.preview_card(nav, () => img.c("design-shot").attr("src", here + "shots/tax-rail-content.jpg").attr("alt", nav.label));
	},

	content(){
		prose("**Three shells, not eleven patterns.** `ext/DesignTool/library/` documents eleven live arrangements — but surveyed across 20 real pages at 390/1280/3440, only three of them are ever a whole page's own shape. The rest (tile wall aside) are CONTENT that lives inside one of the three, or exist only as a boxed mockup on a doc page. That is the proper/simple categorization: **shape** (how many regions, how they scroll) is a small, closed set; **content** (what fills a region) is the open, extensible part.");

		h2("The three shells");
		/* Not `bleed` (2026-09-01): these are framed cards, and bleed is for paint —
		   the prose pad is the inset that keeps them off the edge. */
		div.c("gap").style({ display: "grid", gap: "1.2em", gridTemplateColumns: "repeat(auto-fill, minmax(min(20em, 100%), 28em))" }).append(() => SHELLS.map(shell_card));

		h2("Content patterns, not shells");
		prose("Live inside the shells above — never a page's whole shape in this sample.");
		div.c("gap").style({ display: "grid", gap: "1em", gridTemplateColumns: "repeat(auto-fill, minmax(min(20em, 100%), 26em))" }).append(() => CONTENT_PATTERNS.map(s => figure.c("flex v gap").style({ margin: 0, gap: "0.5em" }).append(() => {
			shot(s.file, s.name);
			figcaption(() => span(s.name).style({ fontWeight: "700" }));
			p.c("muted", s.note);
		})));

		h2("Where it fails");
		prose("Every shot below is the LIVE page, at the width shown — click through. Two distinct failure modes, both dead-space, not overlap or clipping: a **columns-host default column** that never grows (`/imagine/*`), and a **rail-and-content ceiling** with nothing added beside it (`/michael/*`). No page in this sample overflowed, clipped, or scrolled sideways at 390, 1280 or 3440 — the site's failures here are all *waste*, not breakage.");
		div.c("gap").style({ display: "grid", gap: "1.2em", gridTemplateColumns: "repeat(auto-fill, minmax(min(22em, 100%), 30em))" }).append(() => FAILURES.map(fail_card));

		h2("The 3440 question");
		prose("width_used — content span ÷ viewport (`ext/DesignTool`'s own metric) — for the 9 of 20 sampled pages it could score; the other 11 are framework doc/demo pages the tool skips as \"mostly picture\" (a known tool gap, not a layout failure — doc/learned.md). Worst 3440 number first.");
		div.c("flow").style({ maxWidth: "42em" }).append(() => SPREAD.slice().sort((a, b) => parseFloat(a[2]) - parseFloat(b[2])).forEach(spread_row));
		prose("Read the last three rows against the first six: a page that ALREADY has a rail, an article and something else (home, blog index, a blog post's TOC) holds or gains width_used from 1280→3440. Every page that is just a rail plus one capped column loses 40–60 points of it. The metric can't be gamed by widening prose — [widescreen.md](/framework/ext/DesignTool/knowledge/widescreen/) already says a wider column trades this exact medium finding for a `measure` high.");

		prose("**For the system proposal.** Three failures repeat across every bad number above, and a layout system that doesn't fail has to close all three: (1) a **columns-host column has no way to say \"grow with the row\"** — `default`/`large`/`fill` are all fixed or capped, so `/imagine/gallery/` is 13% of a 3440 screen whether the window is 1280 or 5120 wide; (2) **rail-and-content has a ceiling and no second act** — `/michael/` and its children stop at one prose measure and simply leave the rest grey, with no declared way to add the third region that `blog/Post.js` already proves works; (3) **there is no page that measures its own width_used and reacts** — every fix here is still a human noticing a screenshot, not a rule a page can opt into the way `columns` or `bleed` already are.");
	},
});
