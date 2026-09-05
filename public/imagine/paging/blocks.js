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

/* THE TWO WORDS FOR THE SPLIT ABOVE, spelled once. `stage.js` re-typed the stable
   words as a hand-written array and `navigation/findings.js` named them a third time
   (paging-audit-4b, fix 5) — three lists, one idea. Everything reads the flag. */
export const STABLE = "stable", DYNAMIC = "dynamic";

export const kind_of = id => (nav_of(id).stable ? STABLE : DYNAMIC);

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

/* ── THE NUMBERED LAYOUTS ──────────────────────────────────────────────────────
   `/imagine/layouts/` is the realm that OWNS arrangement. These four are the ones
   this realm's words compile to, and they are the SAME names that realm uses — so
   `ARRANGEMENT` below and the builder's own control (`build/words.js`) can both
   point at one list instead of writing the numbers out twice. */
export const LAYOUTS = [
	{ id: "1.stack",      title: "1.stack",      url: "/imagine/layouts/1/stack/", words: "one column",
	  means: "One column. Every block under the last, at the reading measure." },
	{ id: "2.main-aside", title: "2.main-aside", url: "/imagine/layouts/2/main-aside/", words: "a main track with a narrower one beside it",
	  means: "The first block is the main track; every other block stacks in an aside beside it." },
	{ id: "3.thirds",     title: "3.thirds",     url: "/imagine/layouts/3/thirds/", words: "three equal tracks",
	  means: "Three equal tracks, blocks dealt across them." },
	{ id: "4.wall",       title: "4.wall",       url: "/imagine/layouts/4/wall/", words: "a wall of tiles",
	  means: "A wall: as many tracks as fit, each block a tile." },
];

/* ⚠ THE NUMBER IS NEVER THE WHOLE SENTENCE. Every arrangement's sentence used to end
     with the bare string "Layout 1.stack." — a numbered name from a realm the reader
     has not met yet, in the first control they touch (paging-audit-3, item 3). It says
     what the number MEANS in plain words now, and the number is the link beside it. */
export const layout_link = id => {
	const layout = LAYOUTS.find(entry => entry.id === id);
	return layout ? " Inside the box the blocks are " + layout.words + " — [layout " + layout.title + "](" + layout.url + ")." : "";
};

// Which numbered layout an arrangement word compiles to. One lookup, so the builder
// and the layouts realm cannot end up naming two different numbers for one word.
export const layout_of = id => ARRANGEMENT.find(entry => entry.id === id)?.layout ?? "1.stack";

/* ── 5 · ARRANGEMENT — where the other parts sit ──────────────────────────────
   The short list of shapes a PAGE wears — chrome around one content box — each
   naming the numbered layout it compiles to, so the two vocabularies stay one.

   ⚠ NOT "LEFT RAIL" AND "RIGHT RAIL". Navigation already has those two words, and
     for a different thing: a navigation rail lists THIS PAGE'S CHILDREN, and an
     arrangement panel is anything else beside the content — a contents list, a
     properties panel, a filter. Two controls offering the same two words for two
     different jobs was the single most confusing thing in the realm's vocabulary
     (paging-audit-2). The arrangement pair is a PANEL; the navigation pair is a RAIL. */
export const ARRANGEMENT = [
	{ id: "plain",      title: "Plain",       icon: "crop_square",   layout: "1.stack",
	  means: "The content, and nothing around it." + layout_link("1.stack") },
	{ id: "bar-top",    title: "Toolbar top", icon: "web_asset",       layout: "1.stack",
	  means: "A bar of controls above the content. The bar stays; the content scrolls." + layout_link("1.stack") },
	{ id: "bar-bottom", title: "Footer",      icon: "vertical_align_bottom", layout: "1.stack",
	  means: "The same bar under the content — a footer, or a phone's tab bar." + layout_link("1.stack") },
	{ id: "rail-left",  title: "Panel left",  icon: "view_sidebar",  layout: "2.main-aside",
	  means: "A panel before the content, sharing its top edge — a filter, a properties panel. Not the page's children: that is Navigation." + layout_link("2.main-aside") },
	{ id: "rail-right", title: "Panel right", icon: "view_sidebar",  layout: "2.main-aside",
	  means: "The same panel after the content — a contents list, or the properties of what you are reading." + layout_link("2.main-aside") },
	{ id: "main-aside", title: "Main + aside", icon: "view_quilt",   layout: "2.main-aside",
	  means: "Two tracks of content: the main story, and a narrower one beside it." + layout_link("2.main-aside") },
	{ id: "wall",       title: "Wall",        icon: "grid_view",     layout: "4.wall",
	  means: "No chrome at all — the content spreads into as many tracks as fit." + layout_link("4.wall") },
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
	// ⚠ The one block with THREE words rather than one — content colour, page colour
	//   and type size — so its page is three nav grids and each word has its own url.
	{ id: "skin", title: "Skin", icon: "palette", url: "/imagine/paging/skin/", axis: "surface",
	  axes: ["surface", "background", "type"],
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

/* ── THE SEVEN CONTROLS, AND THE FOUR NAMES EACH ONE USED TO HAVE ─────────────

   One row per control, and four fields that used to disagree:

       axis    the key inside a page's `mode` — what the file on disk says
       block   which of the six building blocks it belongs to, so the BAR is
               labelled with the same six words the RAIL is
       label   what the reader is choosing, in the reader's words
       key     what the address bar says — THE SAME WORDS AS THE LABEL

   ⚠ THE LABEL AND THE URL KEY ARE ONE WORD NOW. The rail said six blocks, the bar
     said seven labels, and the address said `surface` / `background` / `type` where
     the controls said *content colour* / *page colour* / *type size* — three sets of
     names for one thing, and the newcomer's whole reason for scoring `simple` a 4
     (paging-audit-4). The bar groups the three skin controls under SKIN, and the
     address says `?content-colour=tint`. The old keys are still READ, so every link
     anybody saved keeps working (`url.js`).                                       */
export const CONTROLS = [
	{ axis: "navigation",  block: "navigation",  key: "navigation",      label: "navigation",     values: NAVIGATION },
	{ axis: "content",     block: "content",     key: "content",         label: "content",        values: CONTENT },
	{ axis: "room",        block: "room",        key: "room",            label: "room",           values: ROOM },
	{ axis: "arrangement", block: "arrangement", key: "arrangement",     label: "arrangement",    values: ARRANGEMENT },
	{ axis: "surface",     block: "skin",        key: "content-colour",  label: "content colour", values: SURFACES },
	{ axis: "background",  block: "skin",        key: "page-colour",     label: "page colour",    values: SURFACES },
	{ axis: "type",        block: "skin",        key: "type-size",       label: "type size",      values: TYPE },
];

// The controls one building block owns — one for five of them, three for Skin, none
// for Stage (it is the box the other words act on). The bar is built from this.
export const controls_of = block => CONTROLS.filter(control => control.block === block);

export const values_for = axis => CONTROLS.find(control => control.axis === axis)?.values ?? [];

export const means_of = (axis, id) => values_for(axis).find(value => value.id === id)?.means ?? "";

export const title_of = (axis, id) => values_for(axis).find(value => value.id === id)?.title ?? id;

export const clean = config => ({ ...DEFAULT, ...config });

/* ── READING A SAVED PAGE ─────────────────────────────────────────────────────

   A page you made is a `page.json`, and its configuration lives in one object called
   `mode`. These two functions are the ONLY way anything reads that object, so Make,
   Build and the stage can never disagree about what a saved page says.

       config_of(node)   the seven words, and nothing else — what the stage draws
       mode_for(node)    what gets WRITTEN back: the seven words, plus the two extra
                         fields the builder keeps (below)

   ⚠ A KEY THAT IS NOT ONE OF THE SEVEN IS DROPPED. A `page.json` written before
     2026-09-05 said `style` / `mech` / `kids` / `layout`, and there was a translation
     table here that turned those into the seven. It is gone, and so is the bug it was
     hiding: while two editors wrote two vocabularies into one file, a chip in Build
     changed a key nothing on screen read and the page did not move (paging-audit-3b).
     One vocabulary means the translation has nothing left to translate. An old node
     opens on the defaults, which is a page, and its first edit rewrites it properly.

   ⚠ WHY `blocks` AND `default` RIDE INSIDE `mode`. `FileStore.file()` (make/made.js)
     writes exactly five top-level keys — title, icon, description, `mode`, children —
     and silently drops anything else, so a top-level `blocks` or `default: true` was
     written into memory, drawn on screen, and lost on save. `mode` is the one object
     passed through whole. */
export const EXTRAS = ["blocks", "default"];

const only = (object, keys) => Object.fromEntries(keys.map(key => [key, object[key]]).filter(([, value]) => value != null));

export const config_of = node => clean(only(node?.mode ?? {}, Object.keys(DEFAULT)));

export const mode_for = node => ({ ...config_of(node), ...only(node?.mode ?? {}, EXTRAS) });
