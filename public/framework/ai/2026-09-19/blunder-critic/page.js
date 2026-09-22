import { Page, md, div, p, img, b, code } from "/app.js";

/* ── layout, answered before the first factory call ───────────────────────────
   1 CONTAINER  a task page in `/framework/ai/2026-09-19/`'s board — the ordinary
                page grid: `main` for the intro paragraph, `wide` for the wall.
   2 SIZE       each finding card carries a screenshot plus three short blocks of
                text; one column at 400, the wall stays one column throughout —
                a card is read top to bottom, never scanned side to side.
   3 OWN LAYOUT a flow of cards, worst first. Each card is its own box
                (`surface pad flex v gap`) because these six are a LIST of
                separate claims, not one continuous argument.
   4 REGIONS    none — one wall, then one closing line for the 39 clean pages.
   5 PREVIEW    the task board's own default card; nothing here is linked from
                elsewhere, by design (read-only critic, not a shipped page).

   ⚠ ONE SCREEN gets the count and the worst headline; the other five cards are
     one scroll down, not a click down — a reader should see the shape of the
     whole wall (six ranked claims) without hunting for a "show more". */

const shot = name => new URL(`shots/${name}.jpg`, import.meta.url).pathname;

const FINDINGS = [
	{
		rank: 1, count: 3,
		sentence: "Three of the links the mastermind's own log points to are completely dead — a blank page and a 404, not a styling problem.",
		measurement: "Every load fires the same three failed requests (doc/page.js, doc/page.json, doc.md, all 404) and the router prints “nothing matches” — reproduced at both 1280 and 400 on all three URLs.",
		pages: ["/imagine/paging/make/doc/decisions/", "/imagine/platform/workflows/doc/decisions/", "/layouts/labs/trees/doc/decisions/"],
		file: "e.g. imagine/paging/make/doc/decisions.md exists with no imagine/paging/make/doc/page.js to route it",
		fix: "Add a 6-line doc/page.js per module declaring “decisions” as a child that renders md.file(import.meta, \"decisions.md\") — the exact idiom already used, with its own trap already documented, at core/Layout/doc/page.js:1-14.",
		shot: "finding-1-dead-page",
	},
	{
		rank: 2, count: 1,
		sentence: "The Panel module's own demo opens its inspector drawer on load, and the drawer covers part of the page's own tab bar — “Files” reads as “FILE”.",
		measurement: "The drawer sits at x:976–1280 (304px, position: fixed, z-index: 40); the “Files” tab's own box runs to x:999, so its last ~23px — the trailing “s” — sits under the drawer.",
		pages: ["/framework/ext/Panel/"],
		file: "ext/Panel/page.js:30 — if (matchMedia(\"(min-width: 26rem)\").matches) dock(); (mechanism: ext/drawer/drawer.css:23, position: fixed; z-index: 40;)",
		fix: "The comment right above line 30 already documents fixing this exact class of bug for narrow phones (2026-08-30) — the same guard never considered ~1280px and up. Drop the eager dock() on cold load, or skip it whenever the drawer's open width would reach under the tab bar.",
		shot: "finding-2-panel-drawer",
	},
	{
		rank: 3, count: 2,
		sentence: "A tab strip longer than its box has no scrollbar and no fade, so a scrolled-to tab can land flush against the module title with zero gap, sliced mid-word.",
		measurement: "/framework/ux/ at 1280: 12 tabs = 1029px of content in a 948px slot (81px/9% overflow) — the last tab, “Docs”, sits entirely past x:1280 with nothing to say it exists. On /framework/ux/Dictate/ the strip auto-scrolls to its maximum and the “Overview” tab's own box ends up clipped flush against the title's right edge (0px gap) — it reads “UX” immediately followed by “view”. The same mechanism clips a bare “m” at the right edge of AITask's 11-note Docs strip at 400px.",
		pages: ["/framework/ux/", "/framework/ux/Dictate/", "/framework/ext/AITask/doc/asks/", "/framework/ext/AITask/doc/decisions-tab/", "/framework/ext/AITask/doc/ranking/"],
		file: "ext/tabs/tabs.css — .tab-bar { overflow: auto; scrollbar-width: none; } (~line 46); padding-inline-start (~line 51) pads only the FIRST tab's position, not whatever scrolls into that slot.",
		fix: "Restore a left-edge fade/mask on .tab-bar (removed 2026-08-18 per doc/overflow.md), or give it scroll-padding-inline-start equal to the gutter so a scrolled tab never sits flush against the title.",
		shot: "finding-3-ux-tab-collision",
		shot2: "finding-3b-aitask-tab-overflow",
	},
	{
		rank: 4, count: 8,
		sentence: "Eight “this moved” / “nothing here yet” stub pages fill a full-height column and leave about 90% of it blank.",
		measurement: "On /imagine/cms/d1/ and /imagine/design/color/ at 1280, the open column measures 602×860px but the real text ends by y:118–123 from the column's own top — 777–782px (90–91%) of the column is blank below two sentences.",
		pages: ["/imagine/cms/d1/", "/imagine/design/color/", "/imagine/design/color/sections/", "/imagine/design/lists/", "/imagine/design/navigation/", "/imagine/design/spacing/nesting/", "/imagine/design/type/anchors/", "/imagine/platform/local/room/"],
		file: "every stub is a plain new Page({ content(){ md(\"...\") } }), e.g. imagine/design/color/page.js:8; the column that stretches it full height is core/Page/Page.css's .page.columns .page-column-body rules (~375-404) under the row's default flex stretch.",
		fix: "Give the stub's content() a centered flex v gap wrapper (justify-content: center) so the message sits in the middle of the column instead of pinned to the top of a void — a few lines per stub, no change to the columns system.",
		shot: "finding-4-empty-stub-column",
	},
	{
		rank: 5, count: 1,
		sentence: "At 3440, the /imagine/ realm leaves more than half the screen a flat gray void, crossed by faint divider lines that go nowhere.",
		measurement: "Viewport 3440px; the one open column's right edge sits at x:1584, leaving 1856px (54%) of blank gray to the right — crossed by hairline vertical rules that read as empty column slots.",
		pages: ["/imagine/"],
		file: "core/Page/Page.css ~375-394 (.page.columns .page-column-body — “when nothing is left the row scrolls sideways instead of squeezing what is open,” deliberate for an open row, but nothing opens a second column by default on this realm's root).",
		fix: "Not a columns-system change: either the realm's own root opens one more level by default on very wide screens, or the row's own track stops short of the viewport edge instead of stretching an almost-empty container across it.",
		shot: "finding-5-imagine-3440-blank",
	},
	{
		rank: 6, count: 3,
		sentence: "The site's own sidebar tree and a module's local “Docs” rail show the exact same list of notes twice, side by side.",
		measurement: "On /framework/core/Page/doc/columns/ (and /doc/data/, /doc/data-children/) at 1280: the global tree (x:0–240) and the module's own vertical rail (x:282–454) both list the same 13 names — 13 of 13 match. Together the two lists spend 454px, 35% of a 1280px page, on one list shown twice.",
		pages: ["/framework/core/Page/doc/columns/", "/framework/core/Page/doc/data/", "/framework/core/Page/doc/data-children/"],
		file: "the global tree: core/Sidebar/Sidebar.js (site-sidebar-tree, landed 2026-09-18); the local duplicate: ext/Doc/Doc.js:106-114, docs_section().",
		fix: "Cap the sidebar tree's auto-expand so it stops at a module's own boundary rather than walking down into its individual note pages — that list is what the module's own local rail is already for.",
		shot: "finding-6-duplicate-nav",
	},
];

const CLEAN_COUNT = 39;

export default new Page({
	meta: import.meta,
	title: "Blunder critic",
	description: "Six ranked, measured visual blunders across forty-five pages built in the last two days — a stranger's look, read-only.",
	icon: "visibility",

	content(){

		p("Screenshotted ", b("60 pages"), " at 1280×900 and 400×800 (plus 3440×1300 for the ten most-visited) on a private server, looked at every one of the ", b("130 shots"), ", and measured what looked wrong instead of guessing. ", b("Pages shot: 60. Pages listed below: 60"), " (21 with a finding, 39 clean) — those two numbers agree.");

		p.c("muted", "Full data: ", code("findings.json"), " beside this page. The site sidebar was repaired earlier today and is not re-flagged here.");

		div.c("flow", () => FINDINGS.forEach(f => this.finding_card(f))).ac("wide");

		md("## Clean");

		p("No finding on the other ", b(String(CLEAN_COUNT)), " pages crawled — including the homepage, /framework/, /layouts/, every practice and browse page, the Ask and Sidebar docs, and the design-system pages.");
	},

	finding_card(f){
		return div.c("surface pad flex v gap", () => {
			div.c("h4 muted", "Finding " + f.rank + (f.count > 1 ? " · " + f.count + " pages" : ""));

			div.c("flex gap wrap", () => {
				img().attr("src", shot(f.shot)).attr("alt", f.sentence)
					.style({ maxWidth: "26em", width: "100%", height: "auto", border: "1px solid var(--line)", borderRadius: "var(--radius)" });
				if (f.shot2) img().attr("src", shot(f.shot2)).attr("alt", f.sentence)
					.style({ maxWidth: "26em", width: "100%", height: "auto", border: "1px solid var(--line)", borderRadius: "var(--radius)" });
			});

			p(b(f.sentence));
			p.c("muted", f.measurement);
			p(code(f.file));
			p(f.fix);
			p.c("muted", "On: " + f.pages.join(", "));
		});
	},
});
