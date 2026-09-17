/* ── THE RAIL ──────────────────────────────────────────────────────────────────

   The app's left edge: sections of nav grids, and nothing else. It never moves and
   it never changes — clicking a tile swaps the middle, and that is the only thing
   that happens. Every page in the realm is reachable from here in one click, which
   is the owner's own bar for the realm ("every single page should be accessible
   within a few clicks of the main paging page").

   Section one is THE HANDFUL — the six building blocks the whole realm is organized
   around (`blocks.js`). Everything after it is a preset, an example or an editor.

   ⚠ Imports one thing, and it is data. A tile is `{ url, title, icon }`; nothing
     here loads a page, so the rail costs no modules at all.                      */

import { BLOCKS } from "./blocks.js";
import { PRESETS } from "./presets.js";

const preset_tile = preset => ({
	url: "/imagine/paging/library/" + preset.id + "/",
	title: preset.title,
	icon: preset.icon,
});

/* ⚠ NO SECTION NOTES. Every section used to carry a sentence saying what it was
     about to show; the tiles say it better, and the seven sentences pushed the last
     three sections below the fold at 3440 (paging-audit-2). */
export const RAIL = [
	{
		title: "The six blocks",
		items: BLOCKS.map(block => ({ url: block.url, title: block.title, icon: block.icon })),
	},
	{
		title: "Library",
		items: PRESETS.map(preset_tile),
	},
	{
		title: "Cross",
		items: [
			{ url: "/imagine/paging/cross/", title: "Two at once", icon: "compare_arrows" },
			{ url: "/imagine/paging/templates/theming/", title: "Colour x type", icon: "palette" },
		],
	},
	{
		title: "Mechanisms",
		items: [
			{ url: "/imagine/paging/mechanisms/swap/", title: "Swap", icon: "swap_horiz" },
			{ url: "/imagine/paging/mechanisms/launch/", title: "Launch", icon: "chevron_right" },
			{ url: "/imagine/paging/mechanisms/expand/", title: "Expand", icon: "expand_more" },
			{ url: "/imagine/paging/mechanisms/takeover/", title: "Takeover", icon: "open_in_full" },
		],
	},
	{
		title: "Templates",
		items: [
			{ url: "/imagine/paging/templates/", title: "All eleven", icon: "dashboard_customize" },
			{ url: "/imagine/paging/templates/magazine/", title: "Magazine", icon: "auto_stories" },
			{ url: "/imagine/paging/templates/blog/", title: "Blog", icon: "rss_feed" },
			{ url: "/imagine/paging/templates/shells/", title: "Shells", icon: "dashboard" },
		],
	},
	/* ⚠ THESE FOUR USED TO SAY `toolbars/` AND THEY SAY `arrangement/` NOW. The four
	     `/imagine/paging/toolbars/<side>/` pages drew the same stage as four of
	     arrangement's seven values, under a second set of names — so the realm had two
	     words for one thing and the tiles read as four more pages than there were.
	     The page is deleted (its urls still answer, saying where they went) and the
	     tiles point at the value each one always was, with that value's own title.
	     2026-09-06; doc/decisions.md. */
	{
		title: "Bars and panels",
		items: [
			{ url: "/imagine/paging/arrangement/bar-top/", title: "Toolbar top", icon: "vertical_align_top" },
			{ url: "/imagine/paging/arrangement/rail-left/", title: "Panel left", icon: "format_align_left" },
			{ url: "/imagine/paging/arrangement/rail-right/", title: "Panel right", icon: "format_align_right" },
			{ url: "/imagine/paging/arrangement/bar-bottom/", title: "Footer", icon: "vertical_align_bottom" },
		],
	},
	{
		/* ⚠ ONE EDITOR SINCE 2026-09-13, and the numbering went with the second one.
		     "1 Make a page / 2 Build it out" answered the question every newcomer asked
		     of two editors with no order between them (paging-audit-2) — there is no
		     order to give any more, so the numbers are noise.

		   ⚠ AND BUILD IS NOT A TILE ANY MORE. It sat directly under Make reading
		     "Build — now in Make": a live link, one row below the thing that replaced
		     it, whose own label said it was the old one — so a newcomer who had finally
		     found the editor was handed a choice between two of them
		     (self-evident-critique-2, the way in). `/imagine/paging/build/` still
		     answers and still says where it went, which is all a saved link needs. The
		     rule at the top of this file — every page in the realm is one click from
		     here — is about places to GO, and a page that exists only to redirect is
		     not one. */
		title: "The editor (it saves)",
		items: [
			{ url: "/imagine/paging/make/", title: "Make a page", icon: "add_circle_outline" },
		],
	},
	{
		title: "Next door",
		items: [
			{ url: "/imagine/layouts/", title: "Layouts", icon: "grid_view" },
			{ url: "/imagine/shells/", title: "Shells", icon: "dashboard" },
			{ url: "/imagine/sections/", title: "Sections", icon: "view_agenda" },
			{ url: "/imagine/paging/doc/", title: "Docs", icon: "menu_book" },
			{ url: "/imagine/paging/readme/", title: "Readme", icon: "description" },
		],
	},
];

export default RAIL;
