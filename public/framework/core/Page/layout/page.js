import { Page, md, h2, div, a, span, icon } from "/app.js";
import Concepts from "../../../ux/Content/Concepts/Concepts.js";

/* Layout — the layout SYSTEM's index (the owner, 2026-09-29: "it's not really a class,
   it's not really a script ... it's essentially a system ... we should start with the
   navigation, the parent structures, and then the internal structures").

   Designed FROM readme.md (the text version): the same three levels of concepts, then
   the index of layout types, then the links one click down. Nothing here is a new
   mechanism — every tile points at the real thing.

   1 CONTAINER  a top tab of core/Page (an ext/Doc), so the tab panel's own track.
   2 SIZE       `width: "wide"` — three concept columns and a wall of ten types need the
                room; a reading column would leave 3440 two-thirds empty.
   3 OWN LAYOUT the three levels as three columns (Concepts' own `sections` wall), a
                wall of type cards (`.grid.auto`), a row of plain link tiles.
   4 REGIONS    none — one flow.
   5 PREVIEW    core's default card off `description`.

   Earlier versions stay reachable as children: v2 (module-experts' hub, the page
   this replaced) and v1 (the first hub). */

// A concept with its one-line meaning under the name — Concepts' own tile is only an
// icon and a name. Same classes as core/Page/navigation's concept tiles (`.card`,
// `flex v gap-35`, `.muted`), so the sibling pages look alike. No new CSS class.
function concept_tile(it){
	return a.c("card flex v gap-35").attr("href", it.href)
		.style({ textDecoration: "none", color: "var(--ink)" })
		.append(() => {
			div.c("flex gap-35", () => {
				if (it.icon) icon(it.icon);
				span(it.name).style({ fontWeight: "700" });
			}).style({ alignItems: "center" });
			if (it.line) span.c("muted", it.line);
		});
}

class LayoutConcepts extends Concepts {
	tiles(items = []){
		return div.c("flex v gap-50", () => items.forEach(it => this.tile(it)));
	}

	tile(it){ return concept_tile({ ...it, href: this.href(it) }); }
}

const LEVELS = [
	{ title: "1. Around the page — navigation and the parent", items: [
		{ name: "Navigation", icon: "route", href: "/framework/core/Page/navigation/", line: "Persistent vs switching. Start every layout here." },
		{ name: "Column pages", icon: "view_column", href: "/framework/core/Page/overview/columns/", line: "Each open page is a column beside its parent." },
		{ name: "Previews on the parent", icon: "preview", href: "/framework/core/Page/doc/previews/", line: "How a child looks on its parent's page." },
		{ name: "Nested or full", icon: "fullscreen", href: "/framework/core/Page/doc/layout/", line: "A child draws inside its parent, or takes the screen." },
	] },
	{ title: "2. The page's own room", items: [
		{ name: "The page grid", icon: "space_dashboard", href: "/framework/styles/md/doc/layout-system/", line: "Three tracks: main, wide, bleed." },
		{ name: "The approved five", icon: "verified", href: "/layouts/doc/studies/approved/", line: "The closed set a new page picks from." },
		{ name: "Width words", icon: "settings_ethernet", href: "/framework/core/Page/overview/width/", line: "How wide a column is, in six words." },
		{ name: "Floating page", icon: "flip_to_front", href: "/framework/core/Page/layout/floating/", line: "An inner sidebar beside a page that scrolls alone." },
	] },
	{ title: "3. Inside the page", items: [
		{ name: "Sections", icon: "view_day", href: "/framework/styles/sections/", line: "Content bands inside one page: hero, pricing, faq." },
		{ name: "Cards and padding", icon: "padding", href: "/framework/ai/2026-09-19/card-word/", line: "A region gets .pad, a framed box gets .card." },
		{ name: "Spacing and gap", icon: "space_bar", href: "/framework/styles/system/", line: "One clamp knob, four gap rungs, --flow between blocks." },
		{ name: "Named arrangements", icon: "view_quilt", href: "/framework/core/Layout/", line: "30 ways to arrange things in a box." },
	] },
];

// The index of layout types — same icon as the concept above wherever it is the same idea.
const TYPES = [
	{ name: "core/Layout", icon: "view_quilt", href: "/framework/core/Layout/", line: "Named arrangements: the live component, 30 of them." },
	{ name: "/layouts/", icon: "auto_stories", href: "/layouts/", line: "The encyclopedia: every way a page divides its room." },
	{ name: "Approved five", icon: "verified", href: "/layouts/doc/studies/approved/", line: "The closed set, and the pages the owner approved." },
	{ name: "Browse", icon: "grid_view", href: "/layouts/browse/", line: "Every layout on the site, with Approve / Improve." },
	{ name: "Explorer", icon: "account_tree", href: "/layouts/explorer/", line: "The same layouts as one tree, in three columns." },
	{ name: "Columns", icon: "view_column", href: "/framework/core/Page/overview/columns/", line: "page.columns(): Miller-column pages." },
	{ name: "Width words", icon: "settings_ethernet", href: "/framework/core/Page/doc/columns/", line: "A column's own width inside a columns() row." },
	{ name: "styles/layouts", icon: "web", href: "/framework/styles/layouts/", line: "Whole-page layouts as class strings." },
	{ name: "Labs", icon: "science", href: "/layouts/labs/", line: "Six shape experiments: shells, screens, decks…" },
	{ name: "DesignTool", icon: "straighten", href: "/framework/ext/DesignTool/", line: "Measures a layout: what is broken, how good." },
];

const DEEPER = [
	{ name: "How to decide", icon: "checklist", href: "/framework/core/Page/layout/md/doc/decide/" },
	{ name: "Research: the rules", icon: "science", href: "/framework/core/Page/layout/md/doc/research/" },
	{ name: "Look-alike names", icon: "compare_arrows", href: "/framework/core/Page/layout/md/doc/names/" },
	{ name: "All prior work", icon: "inventory_2", href: "/framework/core/Page/layout/md/doc/prior-work/" },
	{ name: "Text version (readme)", icon: "description", href: "/framework/core/Page/layout/md/readme/" },
	{ name: "v2 — the hub before this", icon: "history", href: "/framework/core/Page/layout/v2/" },
	{ name: "v1 — the first hub", icon: "history", href: "/framework/core/Page/layout/v1/" },
];

export default new Page({
	meta: import.meta,
	title: "Layout",
	description: "The layout system: navigation, the page's room, and inside the page.",
	icon: "dashboard_customize",
	width: "wide",

	children: "floating v2 v1",

	content(){
		md("**Layout is a system, not a class.** Read it top down, the order a page is built in: where the page sits among other pages, how it divides its own room, then how the things inside it are laid out.");

		new LayoutConcepts({ page: this, sections: LEVELS }).ac("wide");

		h2("Every kind of layout");
		div.c("wide grid auto gap", () => TYPES.forEach(concept_tile))
			.style("--column", "16rem");

		h2("One click down");
		new Concepts({ page: this, items: DEEPER }).ac("wide");
	},
});
