import { typesWall } from "./types/types.js";
import { Page, p, b, md, div, a, img, details, summary, h2, span } from "/app.js";

/* ── layout ────────────────────────────────────────────────────────────────
   1 CONTAINER  a page in the AI tree, page grid.
   2 SIZE       prose at --measure; the map, shots and tables get `.wide`.
   3 OWN LAYOUT one screen: title, the drawn map, the column-width answer.
                Tables and the full map sit below or in closed <details>.
   4 REGIONS    none.  5 PREVIEW default card.
   The words live in map.md, types.md, overlaps.md, columns.md beside this
   file: later rounds edit those, this page only draws them. */

const here = f => new URL(f, import.meta.url).href;
const file = f => md.file(import.meta, f, { h1: false });

// [name, main path, overlap count]
const BOXES = [
	["Layout", "core/Layout · /layouts/ · styles/layouts", 5],
	["Navigation", "core/Sidebar · ext/tabs · ui/crumbs", 6],
	["Routing", "core/Router · Search/Omnibox", 2],
	["Columns", "Page.columns() · ext/grip", 4],
	["Content modules", "core/Section · ext/Panel · ext/catalog", 5],
	["Toolbars / menus", "ux/Menu · ux/Popover · ext/Dropdown", 5],
	["Chat", "ext/Chat", 1],
	["Sidebars", "core/Sidebar · layouts/shell/Shell.js", 1],
];

const box = (name, path, n, extra = {}) => div(() => {
	div(name).style({ fontWeight: "700", fontSize: "1.05em" });
	div(path).style({ fontSize: "0.8em", opacity: 0.75, marginTop: "0.25em" });
	if (n) div(n + (n === 1 ? " overlap" : " overlaps")).style({ position: "absolute", top: "-0.6em", right: "-0.4em", background: "#d33", color: "#fff", fontSize: "0.75em", fontWeight: "700", borderRadius: "1em", padding: "0.1em 0.6em" });
}).style({ position: "relative", border: "1px solid currentColor", borderRadius: "0.6em", padding: "0.8em 1em", background: "color-mix(in srgb, currentColor 5%, transparent)", ...extra });

export default new Page({
	meta: import.meta,
	title: "Paging audit",
	description: "How pages are made, shown and reached: the map, the seven page types, the overlaps, and what is not saved.",
	icon: "fact_check",
	children: "types",

	content(){
		p(b("Paging audit."), " A read-only look at how a page on this site is built, laid out, reached and resized. The centre is the Page class; the red badges count where two modules do the same job.");

		// the drawn map: Page in the middle, eight boxes round it
		const order = [0, 1, 2, 3, "page", 4, 5, 6, 7];
		div(() => {
			for (const i of order){
				if (i === "page") box("Page class", "core/Page/Page.class.js · Frame · Log · Markdown", 6, { gridColumn: 2, gridRow: 2, background: "color-mix(in srgb, #38f 18%, transparent)", borderWidth: "2px", alignSelf: "center" });
				else box(...BOXES[i]);
			}
		}).ac("wide").style({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1.6em 1.4em", padding: "1em 0.5em", maxWidth: "62em" });

		details(() => {
			summary(b("The full map, every row"));
			file("map.md");
		}).ac("wide");

		h2("Do dragged column widths stay? No.");
		p(b("Nothing is saved."), " Drag a column wider, reload, and it snaps back to 224px. Left: first load. Middle: after dragging. Right: after reload.");
		div(() => {
			for (const [f, t] of [["cols-before.png", "first load"], ["cols-dragged.png", "dragged"], ["cols-after.png", "after reload"]])
				div(() => { img().attr("src", here(f)).attr("alt", "Columns page, " + t).style({ width: "100%", borderRadius: "0.4em", border: "1px solid #8886" }); div(t).style({ fontSize: "0.85em", opacity: 0.75 }); });
		}).ac("wide").style({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1em", maxWidth: "62em" });
		md("**First item for round 2:** remember a dragged width per page. Store pixels in `localStorage` under `lew42:cols:<page url>`, write once when the drag ends, read it when the column is built, and make the seam's double-click delete it. [Full spec and test](columns.md).");
		details(() => { summary(b("Full findings and fix spec")); file("columns.md"); }).ac("wide");

		h2("The seven kinds of page");
		div(() => file("types.md")).ac("wide");

		h2("Overlaps, ranked");
		p(b("Nothing was merged."), " Best value for least risk first.");
		div(() => file("overlaps.md")).ac("wide");

		h2("Next topics");
		md([
			"- **The card and preview wall family:** `Page.preview_card`, `ext/catalog`, the 75-kind card catalog.",
			"- **AI boards:** four boards, one job.",
			"- **Popup and menu family:** Menu, Popover, Dropdown, ui/menu.",
			"- **Readmes:** which are stale or missing.",
			"- **ui templates vs ux classes:** the ones that graduated.",
			"- **styles vs Layout tokens:** `--pad` and friends, together with a CSS audit.",
		].join("\n"));

		h2("Round 2: content, and what we built but do not use");
		p("Any page can hold any kind of content. Reach for an existing module before writing markup.");
		div(() => file("content.md")).ac("wide");

		h2("Round 3: the page-type library");
		p("Pick a type; it opens a wall of its variants, each its own page. Data: ", a("types.json").attr("href", here("types.json")), ". ", a("The wall on its own page").attr("href", "types/"), ".");
		typesWall({ url: here("types/") });

		h2("Round 4: page-specific CSS");
		div(() => {
			for (const [n, t] of [["123", "of 1,221 pages carry their own CSS"], ["25,814", "lines of that CSS"], ["~55", "could drop it today"]])
				div(() => { div(n).style({ fontSize: "2.4em", fontWeight: "800", lineHeight: 1.1 }); div(t).style({ opacity: 0.75 }); });
		}).ac("wide").style({ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "1em", maxWidth: "62em" });
		div(() => {
			const max = 7504;
			for (const [a2, n] of [["ai2 (the card app)", 7504], ["imagine", 4577], ["framework/ai", 3756], ["framework/core", 2972], ["layouts", 2623], ["framework/styles", 2155], ["framework/ext", 493], ["notes", 296]])
				div(() => {
					div(a2).style({ width: "11em", fontSize: "0.85em" });
					div().style({ height: "0.9em", borderRadius: "0.3em", background: "#38f", width: (n / max * 60) + "%" });
					div(n.toLocaleString() + " lines").style({ fontSize: "0.8em", opacity: 0.75 });
				}).style({ display: "flex", alignItems: "center", gap: "0.8em" });
		}).ac("wide").style({ display: "grid", gap: "0.4em", maxWidth: "62em", margin: "1em 0" });
		md("**First five migrations** (a word replaces the lines, then the CSS is deleted): [faq](/framework/faq/) · [styles/layers/site](/framework/styles/layers/site/) · [core/Page/old](/framework/core/Page/old/) · [ui/kbd](/framework/ui/kbd/) · [core/new/1/site/sitemap](/framework/core/new/1/site/sitemap/). [Full findings](page-css.md).");

		h2("Rounds");
		md("- **Round 1, 2026-09-25:** map, page types, ranked overlaps, column-width test.\n- **Round 2 2026-09-25: content** kinds that exist, modules used nowhere.\n- **Round 3 2026-09-25: page-type library** types.json, most-used first.\n- **Round 4 2026-09-25: page-specific CSS** 123 pages, ~55 can drop it.\n- **Round 5 2026-09-25: variants** each type is a page, each variant a child page ([/types/](types/)); layouts.json ids and imagine/vary labs reused.");
		h2("Next round");
		md([
			"1. **Save column widths per page** ([columns.md](columns.md) spec).",
			"2. **A 'Page types' tab on [/framework/core/Page/](/framework/core/Page/):** a wall of live small previews from types.json, click opens full size, each type a template with no page CSS. Built together with task-mastermind-page-system, not by us alone.",
			"3. **The five CSS migrations** listed in Round 4.",
		].join("\n"));
	},
});
