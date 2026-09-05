/* ── THE LIBRARY ───────────────────────────────────────────────────────────────

   Twelve whole pages, already configured. Each one is a real page drawn live by
   `stage.js` from the seven words in its `config` — not a screenshot, not a
   mock-up — and each has a plain name that says what it is before you click it.

   A preset is a SET OF WORDS THAT EARNED A URL. That is the whole rule: it gets a
   directory because someone will want to send the link, and it gets nothing else —
   no module, no stylesheet, no vocabulary of its own. `library/page.js` turns this
   list into twelve real pages with no directories at all.

   ⚠ Imports nothing. The dropdown, the rail, the wall on the hub and the twelve
     pages all read this one list.                                                */

export const PRESETS = [
	{
		id: "blog-post",
		title: "A blog post",
		icon: "rss_feed",
		one_line: "One lead story, then a wall of cards — the shape a blog front has.",
		config: { navigation: "none", content: "blog", room: "wide", arrangement: "plain", surface: "plain", background: "plain", type: "regular" },
	},
	{
		id: "magazine",
		title: "A magazine front",
		icon: "auto_stories",
		one_line: "A cover you click into, set in the display type scale.",
		config: { navigation: "none", content: "magazine", room: "reading", arrangement: "plain", surface: "card", background: "tint", type: "display" },
	},
	{
		id: "docs-tabs",
		title: "A docs page with tabs on top",
		icon: "tab",
		one_line: "Tabs over one panel. Click a tab and only the panel changes.",
		config: { navigation: "tabs", content: "docs", room: "reading", arrangement: "plain", surface: "card", background: "plain", type: "regular" },
	},
	{
		id: "dashboard",
		title: "A dashboard with a left rail",
		icon: "bar_chart",
		one_line: "Numbers and a table, with the pages listed down the left.",
		config: { navigation: "rail", content: "dashboard", room: "wide", arrangement: "bar-top", surface: "card", background: "tint", type: "compact" },
	},
	{
		id: "settings",
		title: "A settings page with a right rail",
		icon: "tune",
		one_line: "The form on the left where you read, the list of pages on the right.",
		config: { navigation: "rail-right", content: "settings", room: "reading", arrangement: "plain", surface: "card", background: "plain", type: "regular" },
	},
	{
		id: "columns",
		title: "A columns page",
		icon: "view_column",
		one_line: "Click a page and it opens as a column to the right — everything shifts.",
		config: { navigation: "columns", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },
	},
	{
		id: "takeover",
		title: "A full-screen takeover",
		icon: "open_in_full",
		one_line: "The stage fills the screen, and a click hands it to one child.",
		config: { navigation: "takeover", content: "article", room: "full", arrangement: "plain", surface: "dark", background: "dark", type: "display" },
	},
	{
		id: "sections",
		title: "A stack of sections",
		icon: "view_agenda",
		one_line: "Full-width bands down the page — a landing page.",
		config: { navigation: "none", content: "sections", room: "wide", arrangement: "plain", surface: "plain", background: "plain", type: "regular" },
	},
	{
		id: "wall",
		title: "A grid wall",
		icon: "grid_view",
		one_line: "No chrome at all: cards spread into as many tracks as fit.",
		config: { navigation: "none", content: "cards", room: "wide", arrangement: "wall", surface: "plain", background: "tint", type: "regular" },
	},
	{
		id: "toolbar-top",
		title: "A page with a toolbar on top",
		icon: "web_asset",
		one_line: "The bar sits above the content and stays where it is.",
		config: { navigation: "tabs", content: "article", room: "reading", arrangement: "bar-top", surface: "card", background: "plain", type: "regular" },
	},
	{
		id: "footer",
		title: "A page with a footer bar",
		icon: "vertical_align_bottom",
		one_line: "The same bar underneath — a footer, or a phone's tab bar.",
		config: { navigation: "tabs", content: "article", room: "reading", arrangement: "bar-bottom", surface: "card", background: "prim", type: "regular" },
	},
	{
		id: "nest",
		title: "A page inside a page",
		icon: "layers",
		one_line: "A whole second page, running inside this one's box.",
		config: { navigation: "tabs", content: "article", room: "wide", arrangement: "plain", surface: "card", background: "tint", type: "regular" },

		/* ⚠ `nest` IS A PRESET ID, not a configuration of its own. `?nest=` can only
		     name one of the twelve (`url.js` `nest_of`), so a nest written out longhand
		     here had no id — which meant this page, whose whole subject is the nest,
		     opened with twelve nest chips and NONE of them lit, no `?nest=` in its
		     address, and no way to take the nested page back out (paging-audit-3b). */
		nest: "dashboard",
	},
];

export const preset_of = id => PRESETS.find(preset => preset.id === id) ?? PRESETS[0];

export const preset_url = preset => "/imagine/paging/library/" + preset.id + "/";

export default PRESETS;
