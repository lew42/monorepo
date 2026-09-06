/* ── THE SIX PAGE WORDS, AS LISTS A READER CAN SEE ────────────────────────────

   `Page.class.js` knows the six words as strings — it stamps `page-nav-rail` and
   never asks what `rail` means. THIS file is the other half: for each word, the
   values it takes, spelled out in plain English, so a dropdown, a card, a doc
   table and a url can all draw the same vocabulary and none of them can disagree.

       navigation   what a click on a child does, and how children are drawn
       width        how much of the region the page takes   (`room` is the old name)
       arrangement  where the page's other parts sit around the box
       surfaces     the five colours — read TWICE, for `surface` and `background`
       type size    the type scale

   `content` has no list: what is in the box is the page's own `content()`, or the
   address of any page or file. That is the one word with no closed set, and that is
   the point of it.

   ⚠ THIS FILE IMPORTS NOTHING AND TOUCHES NO DOM, on purpose. It is data. It is
     also THE ONE COPY on the site: `/imagine/paging/blocks.js` re-exports these five
     lists rather than keeping its own, `/imagine/sections/` and `/imagine/layouts/`
     read them from here, and `grep -rn "SURFACES\s*=" public/` finds exactly one
     definition — this one. Before 2026-09-06 there were three, and two of them had
     already drifted (`/imagine/layouts/system.js` wrote the same five words out by
     hand with different sentences).

   ⚠ EACH ENTRY IS `{ id, title, means }` plus whatever its own control needs — an
     `icon`, the two navigation flags, the arrangement's layout. `id` is the value a
     page and a url say; `title` is what a reader is choosing; `means` is one plain
     sentence. Those three names are the lab's, kept on purpose: renaming them to
     `key` / `label` would have rewritten nine files that draw these lists.        */

/* ── NAVIGATION ────────────────────────────────────────────────────────────────
   ONE WORD, SEVEN ANSWERS, and each settles two questions at once: how the children
   are DRAWN, and what a click on one DOES.

   `stable` — does this move what I was already looking at? A stable word never does.
   `swaps`  — does a click change what is INSIDE the box? Three words do, and for
              those the box reserves its height so a click cannot resize it
              (`.page-nav-reserve`, Page.css).
   ⚠ Core's frame reserves for `rail` and `rail-right` only, NOT for `tabs`, because
     `ext/tabs` brings its own panel and fills the same regions Map — the reason is
     written at the spot, `Frame.js` `SWAPS`. */
export const NAVIGATION = [
	{ id: "none",       title: "None",       icon: "remove",       stable: true,
	  means: "Nothing under this page, so nothing is drawn." },
	{ id: "tabs",       title: "Top tabs",   icon: "tab",          stable: true,  swaps: true,
	  means: "A strip of tabs over one panel. Click a tab and only the panel changes — the strip does not move." },
	{ id: "rail",       title: "Left rail",  icon: "view_sidebar", stable: true,  swaps: true,
	  means: "The same list, stacked down the left. The rail stays put and the middle swaps. This is what the app around you is doing." },
	{ id: "rail-right", title: "Right rail", icon: "view_sidebar", stable: true,  swaps: true,
	  means: "The list on the other side, so your eye keeps its home edge on the left." },
	{ id: "expand",     title: "Expand",     icon: "expand_more",  stable: false,
	  means: "Each child is a row you open in place. The row grows downward, everything below it moves down, and the address never changes — so an opened row cannot be linked to." },
	{ id: "columns",    title: "Columns",    icon: "view_column",  stable: false,
	  means: "Each child is a row you click, and it opens as a new column to the right. Everything already on screen shifts left to make room." },
	{ id: "takeover",   title: "Takeover",   icon: "open_in_full", stable: false,
	  means: "The child fills the whole screen and everything behind it collapses into the trail at the top." },
];

/* THE TWO WORDS FOR THE SPLIT ABOVE, spelled once — three files used to re-type the
   stable list as a hand-written array. Everything reads the flag. */
export const STABLE = "stable", DYNAMIC = "dynamic";

export const nav_of = id => NAVIGATION.find(nav => nav.id === id) ?? NAVIGATION[0];

/* ── WIDTH — how much of the region the box gets ───────────────────────────────
   The PAGE GRID half of the width word. `reading` is the default and writes nothing;
   `full` is `.page.solo`, which core already had.
   ⚠ These four are NOT the column words. Inside a columns row the same key takes
     `small hug large fill full` — a different host, a different set. doc/columns.md.
   ⚠ `room:` is the older key for this word and is still read (`Page.words()` does
     `this.width ??= this.room`), so every `page.json` the paging lab has written
     keeps working. */
export const WIDTH = [
	{ id: "narrow",  title: "Narrow",  icon: "width_normal", means: "One reading column, about 40em, and nothing wider. An article." },
	{ id: "reading", title: "Reading", icon: "width_wide",   means: "The reading column, and anything that asks may grow past it — the site's default." },
	{ id: "wide",    title: "Wide",    icon: "width_full",   means: "Every pixel the middle has, minus its gutters. A wall, a dashboard, a table." },
	{ id: "full",    title: "Full",    icon: "open_in_full", means: "The whole screen, rail and all. A takeover — there is a way back at the top." },
];

/* ── ARRANGEMENT — where the other parts sit ───────────────────────────────────
   The short list of shapes a PAGE wears — chrome around one content box — and each
   one names the `core/Layout` it compiles to, so the word and the catalogue of
   thirty proven arrangements are one system rather than two vocabularies.

   ⚠ NOT "LEFT RAIL" AND "RIGHT RAIL". Navigation already has those two words, for a
     different thing: a navigation RAIL lists THIS PAGE'S CHILDREN; an arrangement
     PANEL is anything else beside the content — a contents list, a properties panel,
     a filter. Two controls offering the same two words for two different jobs was
     the single most confusing thing in the vocabulary (paging-audit-2). */
export const ARRANGEMENT = [
	{ id: "plain",      title: "Plain",        icon: "crop_square",           layout: "stack",
	  means: "The content, and nothing around it. Inside the box the blocks are one column." },
	{ id: "bar-top",    title: "Toolbar top",  icon: "web_asset",             layout: "stack",
	  means: "A bar of controls above the content. The bar stays; the content scrolls." },
	{ id: "bar-bottom", title: "Footer",       icon: "vertical_align_bottom", layout: "stack",
	  means: "The same bar under the content — a footer, or a phone's tab bar." },
	{ id: "rail-left",  title: "Panel left",   icon: "view_sidebar",          layout: "rail-and-content",
	  means: "A panel before the content, sharing its top edge — a filter, a properties panel. Not the page's children: that is Navigation." },
	{ id: "rail-right", title: "Panel right",  icon: "view_sidebar",          layout: "rail-and-content",
	  means: "The same panel after the content — a contents list, or the properties of what you are reading." },
	{ id: "main-aside", title: "Main + aside", icon: "view_quilt",            layout: "main-aside",
	  means: "Two tracks of content: the main story, and a narrower one beside it." },
	{ id: "wall",       title: "Wall",         icon: "grid_view",             layout: "wall",
	  means: "No chrome at all — the content spreads into as many tracks as fit." },
];

export const arrangement_of = id => ARRANGEMENT.find(entry => entry.id === id) ?? ARRANGEMENT[0];

/* WHERE A LAYOUT LIVES. One catalogue, `/framework/core/Layout/` — thirty
   arrangements, each proven at seven widths — so an arrangement word is a link to
   the shape it makes rather than a number a reader has to look up.
   ⚠ It used to point at `/imagine/layouts/N/<id>/`, a realm's numbered grid. The
     realm is still there; the proven catalogue is core's. */
export const layout_url = id => "/framework/core/Layout/" + id + "/";

// The layout an arrangement word compiles to, as a url. Undefined for a word with
// no layout, so a control can ask without a second lookup.
export const layout_of_arrangement = id => {
	const layout = arrangement_of(id)?.layout;
	return layout && layout_url(layout);
};

/* ── THE FIVE SURFACES — one list, read TWICE ──────────────────────────────────
   The CONTENT's own fill (`surface:`) and the PAGE behind it (`background:`) are two
   independent controls over one list of five words, because the owner asked for
   exactly that: "card gives the content a bg, whereas the other colors change the
   whole column. i think we want the ability to switch either one to any color."

   Every value is an existing theme token — `.page-surface-*` / `.page-bg-*` in
   `Page.css` are where each one is painted, and nothing new was invented.
   ⚠ `plain` means ONE thing: no fill of its own. The grey a demo frame shows behind
     a `plain` box is the region's grey, not the word's.
   ⚠ THE THEME'S BAND VOCABULARY IS THE SAME LIST UNDER TWO OLDER NAMES —
     `styles/sections/tone.js` `TONES` says `surface wash prim dark`, where `surface`
     is this `card` and `wash` is this `tint`. `Page.words()` reads both aliases on
     the way in, so a page may say either. */
export const SURFACES = [
	{ id: "plain", title: "Plain", means: "no fill of its own — whatever is underneath shows through" },
	{ id: "card",  title: "Card",  means: "white, with a hairline and a soft shadow: the surface that says 'this is one thing'" },
	{ id: "tint",  title: "Tint",  means: "one subtle step off whatever is under it" },
	{ id: "prim",  title: "Prim",  means: "a tenth of the accent colour mixed in — an island you are meant to notice" },
	{ id: "dark",  title: "Dark",  means: "an always-dark island; every colour inside it flips" },
];

/* ── TYPE SIZE — the type scale ────────────────────────────────────────────────
   ⚠ THE PAGE'S KEY IS `type_size`, NEVER `type`. `type` is already a page METHOD
     (`core/Page/generator/page.js`), and a field of that name would read the
     function back and stamp a CSS class made out of a function body. Inside a
     `mode` object the key is `type`: there it is data, and it shadows nothing. */
export const TYPE_SIZE = [
	{ id: "compact", title: "Compact", means: "0.9x the base step, tighter lines — a dense index, a rail, a table" },
	{ id: "regular", title: "Regular", means: "the site's own step — every page you have read so far" },
	{ id: "display", title: "Display", means: "1.15x the base step with a steeper heading ramp — a cover, a slide, a hero" },
];

/* ── THE OLDER NAMES ───────────────────────────────────────────────────────────
   `room` for `width` and `type` for `type_size` are what the paging lab called these
   two words, and what its saved pages and its urls still say. Aliased here rather
   than renamed anywhere: an alias costs one line and a rename costs nine files. */
export { WIDTH as ROOM, TYPE_SIZE as TYPE };

// Just the ids of a list — the shape a `.rc(...)` class-clearing call wants.
export const ids = list => list.map(entry => entry.id);
