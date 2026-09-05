/* ── THE HANDFUL ───────────────────────────────────────────────────────────────

   This realm is ONE configurable page. Six building blocks make it, and there is
   nothing else in here. One of them is the box; the other five are the words you
   can say about the box.

       1  STAGE         the box a click changes the inside of. It never moves.
       2  NAVIGATION    what a click on a child does, and how children are drawn.
       3  CONTENT       what is in the box.
       4  ROOM          how much of the screen the box gets.
       5  ARRANGEMENT   where the page's other parts sit around the box.
       6  SKIN          the colours and the type size.

   Every page in the realm is one of these six, or a PRESET — a set of five words
   that earned a url. Nothing else gets a directory. (2026-09-05: the realm was 16
   trees and 50 directories saying these six things; the audit that found that is
   `/framework/ai/2026-09-05/paging-audit-1b/`.)

   ⚠ THIS FILE IMPORTS NOTHING, on purpose. A page, a rail tile, a toolbar chip, a
     dropdown, a url and a doc all read the same lists, so they cannot disagree —
     the same rule `/imagine/layouts/system.js` follows.                          */

/* ── 2 · NAVIGATION ────────────────────────────────────────────────────────────
   One control, six answers. `kids` is how the children are DRAWN; `mech` is what a
   click on one DOES. The pair is the ruling `build/words.js` already made, and this
   is the one surviving copy of it — the realm used to write navigation out three
   times in three vocabularies.

   `stable` is decision 5 of 2026-09-05: STABLE navigation never moves what you were
   already looking at; DYNAMIC navigation does. The paging app itself runs on stable
   navigation, and the dynamic ones are demonstrated inside it. */
export const NAVIGATION = [
	{ id: "none",       title: "None",       icon: "remove",       stable: true,
	  means: "Nothing under this page, so nothing is drawn." },
	{ id: "tabs",       title: "Top tabs",   icon: "tab",          stable: true,
	  means: "A strip of tabs over one panel. Click a tab and only the panel changes — the strip does not move." },
	{ id: "rail",       title: "Left rail",  icon: "view_sidebar", stable: true,
	  means: "The same list, stacked down the left. The rail stays put and the middle swaps. This is what the app around you is doing." },
	{ id: "rail-right", title: "Right rail", icon: "view_sidebar", stable: true,
	  means: "The list on the other side, so your eye keeps its home edge on the left." },
	{ id: "columns",    title: "Columns",    icon: "view_column",  stable: false,
	  means: "Each child is a row you click, and it opens as a new column to the right. Everything already on screen shifts left to make room." },
	{ id: "takeover",   title: "Takeover",   icon: "open_in_full", stable: false,
	  means: "The child fills the whole screen and everything behind it collapses into the trail at the top." },
];

export const nav_of = id => NAVIGATION.find(nav => nav.id === id) ?? NAVIGATION[0];

/* ── 3 · CONTENT — what is in the box ─────────────────────────────────────────
   Eight kinds, and every one of them is REAL: the renderer is a module this site
   already ships (`content.js` says which). Content is not a size — the old `xs`–`xl`
   axis was one canned sample at five heights, which the owner read as a content
   switcher because that is what it was. */
export const CONTENT = [
	{ id: "article",   title: "Article",     icon: "article",        means: "A heading and prose at the reading measure." },
	{ id: "cards",     title: "Card wall",   icon: "grid_view",      means: "A wall of cards that reflows to fit its box." },
	{ id: "dashboard", title: "Dashboard",   icon: "bar_chart",     means: "A row of numbers over a table." },
	{ id: "settings",  title: "Settings",    icon: "tune",           means: "Labelled form fields in one column." },
	{ id: "magazine",  title: "Magazine",    icon: "auto_stories",   means: "A real magazine cover — /imagine/mag/'s own code." },
	{ id: "blog",      title: "Blog",        icon: "rss_feed",       means: "A real blog lead and card wall, from the blog's own manifest." },
	{ id: "sections",  title: "Sections",    icon: "view_agenda",    means: "Full-width bands stacked down the page — a hero, then stats." },
	{ id: "docs",      title: "Docs",        icon: "menu_book",      means: "Prose with a code block in it." },
];

/* ── 4 · ROOM — how much of the screen the box gets ───────────────────────────
   One width word. These are core's own column words said in plain English, and the
   translation table lives beside the renderer so there is one copy of it. */
export const ROOM = [
	{ id: "narrow",  title: "Narrow",  icon: "width_normal", means: "One reading column, about 40em, and nothing wider. An article." },
	{ id: "reading", title: "Reading",  icon: "width_wide",  means: "The reading column, and anything that asks may grow past it — the site's default." },
	{ id: "wide",    title: "Wide",     icon: "width_full",  means: "Every pixel the middle has, minus its gutters. A wall, a dashboard, a table." },
	{ id: "full",    title: "Full",     icon: "open_in_full", means: "The whole screen, rail and all. A takeover — there is a way back at the top." },
];

/* ── 5 · ARRANGEMENT — where the other parts sit ──────────────────────────────
   `/imagine/layouts/` is the realm that OWNS arrangement (17 numbered layouts). This
   is the short list of the ones a PAGE wears — chrome around one content box — and
   each entry names the layout number it is, so the two vocabularies stay one. */
export const ARRANGEMENT = [
	{ id: "plain",      title: "Plain",       icon: "crop_square",   layout: "1.stack",
	  means: "The content, and nothing around it. Layout [1.stack](/imagine/layouts/1/stack/)." },
	{ id: "bar-top",    title: "Toolbar top", icon: "web_asset",       layout: "1.stack",
	  means: "A bar of controls above the content. The bar stays; the content scrolls. Layout [1.stack](/imagine/layouts/1/stack/)." },
	{ id: "bar-bottom", title: "Footer",      icon: "vertical_align_bottom", layout: "1.stack",
	  means: "The same bar under the content — a footer, or a phone's tab bar. Layout [1.stack](/imagine/layouts/1/stack/)." },
	{ id: "rail-left",  title: "Left rail",   icon: "view_sidebar",  layout: "2.main-aside",
	  means: "A column of links before the content, sharing its top edge. Layout [2.main-aside](/imagine/layouts/2/main-aside/)." },
	{ id: "rail-right", title: "Right rail",  icon: "view_sidebar",  layout: "2.main-aside",
	  means: "The column after the content — a contents list, or a properties panel. Layout [2.main-aside](/imagine/layouts/2/main-aside/)." },
	{ id: "main-aside", title: "Main + aside", icon: "view_quilt",   layout: "2.main-aside",
	  means: "Two tracks of content: the main story, and a narrower one beside it. Layout [2.main-aside](/imagine/layouts/2/main-aside/)." },
	{ id: "wall",       title: "Wall",        icon: "grid_view",     layout: "4.wall",
	  means: "No chrome at all — the content spreads into as many tracks as fit. Layout [4.wall](/imagine/layouts/4/wall/)." },
];

/* ── 6 · SKIN — the colours and the type size ─────────────────────────────────
   THREE knobs, and two of them are colours, because the owner asked for exactly
   that: "card gives the content a bg, whereas the other colors change the whole
   column. i think we want the ability to switch either one to any color." So the
   CONTENT's surface and the PAGE's background are two independent controls reading
   one list of five words. */
export const SURFACES = [
	{ id: "plain", title: "Plain", means: "no fill of its own — whatever is underneath shows through" },
	{ id: "card",  title: "Card",  means: "white, with a hairline and a soft shadow: the surface that says 'this is one thing'" },
	{ id: "tint",  title: "Tint",  means: "one subtle step off whatever is under it" },
	{ id: "prim",  title: "Prim",  means: "a tenth of the accent colour mixed in — an island you are meant to notice" },
	{ id: "dark",  title: "Dark",  means: "an always-dark island; every colour inside it flips" },
];

export const TYPE = [
	{ id: "compact", title: "Compact", means: "0.9x the base step, tighter lines — a dense index, a rail, a table" },
	{ id: "regular", title: "Regular", means: "the site's own step — every page you have read so far" },
	{ id: "display", title: "Display", means: "1.15x the base step with a steeper heading ramp — a cover, a slide, a hero" },
];

/* ── THE SIX BLOCKS, as the realm's own map ───────────────────────────────────
   `url` is where the block's page lives; `axis` is the config key its control
   writes (the stage has none — it IS the box). The rail's first section is this
   list, in this order, and so is the hub's first screen.

   ⚠ `navigation/` is built by another task (nav-stability, 2026-09-05). It is
     declared here and linked from the rail; if that page ever goes missing this is
     the one line to change. */
export const BLOCKS = [
	{ id: "stage", title: "Stage", icon: "crop_square", url: "/imagine/paging/stage/", axis: null,
	  one_line: "The box a click changes the inside of. It never moves." },
	{ id: "navigation", title: "Navigation", icon: "alt_route", url: "/imagine/paging/navigation/", axis: "navigation",
	  one_line: "What a click on a child does, and how the children are drawn." },
	{ id: "content", title: "Content", icon: "article", url: "/imagine/paging/content/", axis: "content",
	  one_line: "What is in the box." },
	{ id: "room", title: "Room", icon: "width_wide", url: "/imagine/paging/room/", axis: "room",
	  one_line: "How much of the screen the box gets." },
	{ id: "arrangement", title: "Arrangement", icon: "view_quilt", url: "/imagine/paging/arrangement/", axis: "arrangement",
	  one_line: "Where the page's other parts sit around the box." },
	{ id: "skin", title: "Skin", icon: "palette", url: "/imagine/paging/skin/", axis: "surface",
	  one_line: "The colours and the type size." },
];

/* ── A CONFIGURATION ──────────────────────────────────────────────────────────
   Seven keys, five blocks. This object IS a page in this realm: the presets are
   these objects, the toolbar edits one, the drawer prints it as JSON, and "make
   this a page" hands it to Make's backend. There is nothing else to know. */
export const DEFAULT = {
	navigation: "tabs",
	content: "article",
	room: "reading",
	arrangement: "plain",
	surface: "card",        // the CONTENT's own fill
	background: "plain",    // the PAGE behind it — independent, on purpose
	type: "regular",
};

/* The five controls the hover toolbar shows, in the order they matter. `values` is
   the list; `label` is what the reader is choosing. One table, so the toolbar, the
   drawer form and the JSON can never offer different words. */
export const CONTROLS = [
	{ axis: "navigation",  label: "navigation",  values: NAVIGATION },
	{ axis: "arrangement", label: "arrangement", values: ARRANGEMENT },
	{ axis: "content",     label: "content",     values: CONTENT },
	{ axis: "room",        label: "room",        values: ROOM },
	{ axis: "surface",     label: "content colour", values: SURFACES },
	{ axis: "background",  label: "page colour",    values: SURFACES },
	{ axis: "type",        label: "type size",      values: TYPE },
];

export const values_for = axis => CONTROLS.find(control => control.axis === axis)?.values ?? [];

export const means_of = (axis, id) => values_for(axis).find(value => value.id === id)?.means ?? "";

export const title_of = (axis, id) => values_for(axis).find(value => value.id === id)?.title ?? id;

export const clean = config => ({ ...DEFAULT, ...config });
