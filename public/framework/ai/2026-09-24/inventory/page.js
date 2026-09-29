import { Page, p, b, md, div, a, img, details, summary } from "/app.js";
import rows from "./rows.js";

/* ── layout ───────────────────────────────────────────────────────────────────
   1 CONTAINER  a task page on the day board — the page grid, prose width.
   2 SIZE       prose at --measure; the map and the tables get `.wide`.
   3 OWN LAYOUT one screen: the answer in two sentences, the map, the ranked plan.
                The clusters, the readmes, the should-use list and all 375 rows
                sit one click down, in closed <details>.
   4 REGIONS    none.  5 PREVIEW default card. */

const here = f => new URL(f, import.meta.url).href;
const cell = s => String(s ?? "").replace(/\|/g, "/").replace(/\n/g, " ");

// Area headings for the full inventory, in the order the rows were written.
const AREAS = {
	"core-page": "framework/core/Page", "core-rest": "framework/core (the rest)",
	"ext-big": "framework/ext — DesignTool + Panel", "ext-rest": "framework/ext (the rest)",
	"ui": "framework/ui", "ux": "framework/ux (+ Content, unmerged)", "styles": "framework/styles",
	"framework-other": "framework — dev, ai boards, start, faq…", "web": "/web/", "layouts": "/layouts/",
	"websites": "/websites/", "notes": "/notes/", "root": "top level — blog, resume, sandboxes, app.js",
	"imagine-paging": "imagine/paging", "imagine-research": "imagine/research", "imagine-cms": "imagine/cms",
	"imagine-generated-importance": "imagine/generated + importance", "imagine-platform": "imagine/platform",
	"imagine-stream-team-youtube": "imagine/stream + team + youtube", "imagine-gallery-game": "imagine/gallery + game",
	"imagine-codrops": "imagine/codrops", "imagine-feeds": "imagine/feeds",
	"imagine-mag-review-scenes": "imagine/mag + review + scenes", "imagine-vary": "imagine/vary",
	"imagine-design": "imagine/design (moved)", "imagine-blogx": "imagine/blogx (moved)",
	"imagine-decks": "imagine/decks (moved)", "imagine-shells": "imagine/shells (moved)",
	"imagine-layouts-sections-screens": "imagine/layouts + sections + screens (moved)",
};

const PLAN = [
	"| # | Do this | Survivor | Risk | Link fallout |",
	"|---|---|---|---|---|",
	"| **1** | **Finish the seven half-done moves.** First repoint the five imports in `imagine/paging/templates/families.js` (lines 30–43) from the old `/imagine/{mag,screens,shells,decks}/` copies to `/layouts/labs/…`. Then delete every file behind the nine-line stubs in `imagine/{blogx,decks,shells,sections,screens,mag,design}`. | `/layouts/labs/*`, `styles/system/studies/`, `web/nav/doc/study/` | **Low** after the repoint. **Breaks the templates page** without it. | No URL breaks: the stubs stay. 5 imports move. |",
	"| **2** | **Delete what is kept “for the record”.** `core/new/` (367 files; its own readme warns that one stray import gives you a second, different `Page` class), `core/Page/old/` (26), `ext/Panel/toolbar.js` + `.css`, the `ext/Omnibox` stub. Git keeps all of it. | `core/`, `core/Page/overview/` | Low | 17 text mentions, 0 imports. `core/Page/old/*` URLs need a line in a moved-map. |",
	"| **3** | **One AI board.** Four boards do one job: `ai/` v1 (`?v1`), `ai/v/2`, `ai/v/3` (the front door since 21 Sept), and `ai2` (its declared replacement, still being built). Delete v2 now. Move the pieces all of them redraw (the ask, decision and task tile, the chat line, the composer, the usage meter) into `ext/AITask` or `ux/Content`, so the next board is a view, not a fork. `ai2` replaces v3 once it covers v3’s views. | `ai2` + shared pieces in `ext/AITask` | **High**: a daily tool, and a worktree is live | `ai/page.js` and `ai/talk/` import v3. |",
	"| **4** | **One layout catalogue.** Page arrangements are described in six places: `core/Layout` (30 named layouts, each proven at 7 widths), `/layouts/` (names, tags, browse, labs), `styles/layouts/` (33 class-string pages), `DesignTool/library`, `imagine/paging/templates` and `web/layout`. There are also two `Layout` classes. Make `core/Layout` the one class and the one list of layouts. Make `/layouts/` the one place a reader browses them. `styles/layouts/` keeps only the words (flex, grid, cols, 400); its 21 whole-page demos become `/layouts/` entries. The others link to entries instead of redrawing them. | `core/Layout` (engine) + `/layouts/` (front door) | **High**: 77 mentions and 4 imports of `styles/layouts` | Needs a moved-map for about 21 URLs. Do it in three steps. |",
	"| **5** | **Three unrelated things are all called “section”.** `core/Section` is a page placed inside a page. `styles/sections` is 15 landing-page bands. `layouts/labs/sections` is one band cut into 2–4 columns. None shares code. Keep `core/Section`. Rename the other two: `styles/bands`, and `layouts/labs/column-bands`. | `core/Section` keeps the word | Medium: class prefixes change | 38 mentions and 6 imports; 7 mentions |",
	"| **6** | **One popup.** Five tools open something near a button: `ext/Dropdown`, `ux/Popover` (`menu()`, `tooltip()`), `ux/Menu`, `ui/menu` and `ui/tooltip`. Keep `ux/Popover`: it uses the browser’s top layer, so nothing can clip it. Rebuild `Dropdown` on top of it (it has one importer). Retire `ux/Menu`, a demo-only module. | `ux/Popover` | Low–medium | 1 import (`Panel/properties.js`), ~40 mentions |",
	"| **7** | **Fold the ui templates that already graduated.** `ui/tree`, `ui/menu`, `ui/pagination` and `ui/tags` each have a `ux` class that wears the same CSS classes. Each ui page becomes the “markup” section of its ux module. | the `ux/` class | Low | ~40 mentions, 0 imports |",
	"| **8** | **Page and navigation demos: one topic, one home.** `imagine/paging/mechanisms` and `paging/navigation` ask the same question (what does a click do?), so merge them. `core/Page/overview/{crumbs,rail}` redraw what `/web/nav/` teaches, so link to it instead. `vary/place` repeats paging’s swap. | `core/Page/overview` (what the class does), `/web/nav` (how to build nav), `paging/navigation` | Low | ~20 mentions |",
	"| **9** | **One research front.** `imagine/research` and `framework/research` both list `ext/Research` programs, and each finds its topics in a different way. Make `framework/research` (LiveReload) a topic on the imagine front. | `imagine/research` | Low | 12 mentions |",
	"| **10** | **Twelve one-file “should use” fixes.** Each is listed below. | — | Low each | Each file on its own |",
	"| **11** | **Rename the look-alike names.** Two `Shell` classes; `ui/panel` vs `ext/Panel`; `ext/Panel/workspace.js` beside `Workspace/` (on Windows they differ only by case); `ui/timeline` vs `ext/Timeline`; `ext/grip` vs `Panel/grip.js`; two `Layout` classes. | — | Low | A few mentions each |",
	"| **12** | **Readmes.** 29 are stale and 46 are missing. Moves 1 and 2 delete about ten of the stale ones. One documentation pass fixes the rest. | — | None | — |",
].join("\n");

export default new Page({
	meta: import.meta,
	title: "Everything we built, and how to rein it in",
	description: "29 Sonnet minions listed 375 things across every area of the site. The duplication is in nine clusters, and the plan below ranks twelve moves by value against risk. Nothing is moved yet.",
	icon: "inventory_2",

	content(){

		p(b("375 things are built across the site. The worst duplication is not in features. It is leftover copies from seven moves that finished halfway, and six separate places that each catalogue page layouts."), " Everything overlapping falls into nine clusters, and the plan below puts them in the order to do them. Nothing has been moved. Moves break links, so you see the plan first.");

		md([
			"- **375 things**: 198 live, 79 demos, 53 labs, and 45 that are dead, moved-stubs or orphaned.",
			"- **The first move is not safe yet.** The 739-file “prune” waiting on you (from the [22 Sept reuse audit](/framework/ai/2026-09-22/reuse-audit/)) would break [paging templates](/imagine/paging/templates/): `families.js` still imports the *old* copies of four moved realms. Repoint those five imports first, then prune.",
			"- **Readmes:** 183 current, 29 stale, 46 missing, and 115 don’t need one.",
		].join("\n"));

		img().attr("src", here("map.svg")).attr("alt", "Map of the site: framework (core, ext, ui, ux, styles, AI boards), /layouts/, /web/, /websites/, /imagine/ realms, the leftover copies of moved realms, /notes/, /blog/ and the sandboxes. Numbered lines join the places that do the same job; the number is the move's rank in the plan.").style({ width: "100%", maxWidth: "68em", borderRadius: "0.6em" }).ac("wide");

		md("## The plan, ranked\n\nThe most value for the least risk comes first. Every move after 2 has more than a dozen callers, so each one is a separate task with its own worktree.").ac("wide");
		md(PLAN).ac("wide");

		details(() => {
			summary(b("The nine duplicate clusters: members, survivor, why"));
			md([
				"1. **Leftover copies.** `imagine/{blogx,decks,shells,sections,screens,mag}` beside `layouts/labs/*`; `imagine/design/*` beside `styles/system/studies/`; `imagine/design/navigation` beside `web/nav/doc/study`; `imagine/design/journey` (3.6 MB of screenshots) beside `DesignTool/journey`. **Survivor: the destination.** It was edited after the move: all 8 files in `sections` differ, and 8 of 13 in `screens`. So the old copy is older, not equal. The 22 Sept audit called these byte-identical, which was too strong.",
				"2. **Kept for the record.** `core/new` (its `Router.js` is ~179 lines off the live one), `core/Page/old` (the 15-tree wall the 29-card overview replaced), `Panel/toolbar.js` (no importer; the rail replaced it), `ext/Omnibox` (a pointer to `core/Search`), `framework/audit` (a 15 Aug snapshot that later audits replaced). **Survivor: the live module.** Git is the record.",
				"3. **AI boards.** v1 plus `ext/AITask`, `ai/v/2`, `ai/v/3`, `ai2`, and DevBar’s sessions tab. The card catalog found the *inbox row* alone redrawn 10+ times, and three separate composers (`AITask/compose.js`, `v/3/compose.js`, `ai2/compose.js`). **Survivor: `ai2`, with the shared pieces moved into `ext/AITask`.** It is the declared replacement and today’s work. The alternative is to keep v3 and fold ai2’s inbox into it.",
				"4. **Layouts.** `core/Layout`, `/layouts/` (+ `layouts/Layout.js`), `styles/layouts`, `DesignTool/library` (+ `library/bad`, `tests`), `imagine/paging/templates` + `library`, `web/layout`, and `imagine/gallery/lists`. **Survivor: `core/Layout` for the data, `/layouts/` for the reader.** This follows your naming verdict (names, not numbers; clicking a tag is the feature) and today’s commit that sends old numbered URLs to `core/Layout`. `DesignTool/library` stays as the tool’s test bench, linking to entries.",
				"5. **“Section”.** `core/Section`, `styles/sections`, `layouts/labs/sections` (+ its old copy). **Survivor: all three ideas, under three names.** They are different things; only the word is shared.",
				"6. **Popups.** `ext/Dropdown`, `ux/Popover`, `ux/Menu`, `ui/menu`, `ui/tooltip`, `ui/dialog`. **Survivor: `ux/Popover`.** The 22 Sept audit left these alone as “different cases”. That is fair for `dialog`, but a dropdown, a menu and a tooltip are all one anchored popup. `ui/menu`’s own readme admits its panel gets clipped.",
				"7. **Graduated templates.** `ui/tree`↔`ux/Tree`, `ui/menu`↔`ux/Menu`, `ui/pagination`↔`ux/Pagination`, `ui/tags`↔`ux/Tags`↔`ux/Filter` chips, `ui/crumbs`↔Wizard’s own crumbs, `ux/Wizard`↔`ux/Course` (two step engines, separate on purpose). **Survivor: the ux class.**",
				"8. **Page and nav demos.** `core/Page/overview` (29 cards), `web/nav` (9 patterns), `paging/mechanisms` + `paging/navigation`, `vary/place`, `codrops` swap ports, and ~23 `/notes/` pages that sketch what these later built. **Survivor: one home per question** (move 8). The notes stay as they are: they are the notebook.",
				"9. **Research and graded logs.** `imagine/research`, `framework/research`, `platform/research`, `imagine/importance` (its own Graph store), `imagine/cms/json` (its readme names `imagine/stream` as the successor). **Survivor: `ext/Research` for claims, `ext/JSONL` + `stream` for page state.**",
				"",
				"The card shapes (75 kinds, 57 twins) are left out here. The [card catalog](/framework/ux/Content/catalog/) and today’s card-consolidation task own them.",
			].join("\n"));
		}).ac("wide");

		details(() => {
			summary(b("Twelve places that should use a framework module and don’t"));
			md([
				"| Where | Hand-rolls | Should use |",
				"|---|---|---|",
				"| `ext/files/files.js:36,72` | a folder tree | `ux/Tree` |",
				"| `ext/drawer/drawer.js:91` | its own localStorage key | `Page.Store` |",
				"| `imagine/cms/edit/page.js:113` | `rpc('write')` by hand | `ext/Saver` FileSaver |",
				"| `core/Search/Search.js:282` | a facet filter | `ux/Filter` |",
				"| `ux/Menu` | click-outside listener | `ux/Popover` (free with `popover=auto`) |",
				"| `ux/Wizard` | its own crumbs | `ui/crumbs` |",
				"| `imagine/feeds/video/page.js:25` | a lazy YouTube embed | `imagine/youtube/youtube.js` Player |",
				"| `websites/tag/` and `layouts/tag/` | the same click-a-tag page | one shared tag page |",
				"| `ext/Panel/grip.js:94` | an rAF throttle copied from `ext/demo/stage.js` | one shared throttle |",
				"| `ext/AITask/decisions.js:72`, `asks.js:265` | decision and ask cards | `ux/Content` Decision / Question (after it merges) |",
				"| `imagine/platform/like.js` | a like button imported by two realms | promote to `ext/` |",
				"| `imagine/team/page.js:126` | a copy of core’s column body | a seam in `core/Page` column() |",
			].join("\n"));
		}).ac("wide");

		details(() => {
			summary(b("The 29 stale readmes"));
			md(rows.filter(r => r.readme === "stale").map(r => "- `" + r.path + "`: " + (r.readme_why || "stale")).join("\n"));
		}).ac("wide");

		details(() => {
			summary(b("All 375 rows, by area"));
			p("One row per thing: what it is for, its status, its readme, and what it overlaps. The raw JSON for each area sits in rows/ beside this page.");
			for (const [key, label] of Object.entries(AREAS)){
				const mine = rows.filter(r => r.group === key);
				if (!mine.length) continue;
				details(() => {
					summary(label + " (" + mine.length + ")");
					md(["| Thing | For | Status | Readme | Overlaps |", "|---|---|---|---|---|",
						...mine.map(r => "| **" + cell(r.thing) + "**<br>`" + cell(r.path) + "` | " + cell(r.purpose) + " | " + r.status + " | " + r.readme + " | " + cell(r.duplicates.join("; ")) + " |")].join("\n"));
				});
			}
		}).ac("wide");

		md("*29 Sonnet minions (medium effort) wrote the rows in about four minutes, for $8.56. Five of their claims were checked against the code; that check is in the task log beside this page. Earlier passes: [reuse audit, 22 Sept](/framework/ai/2026-09-22/reuse-audit/) and [overlap study, 18 Sept](/framework/ai/2026-09-18/overlap-study/).*").ac("muted");
	},
});
