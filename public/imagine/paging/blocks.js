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

   ⚠ THE FIVE WORD LISTS ARE CORE'S NOW, AND THIS FILE RE-EXPORTS THEM.
     `core/Page/words.js` holds navigation, width (which this realm calls ROOM),
     arrangement, the five surfaces and the three type steps — one copy for the whole
     site, so `grep -rn "SURFACES\s*=" public/` finds exactly one definition. Every
     importer here keeps working unchanged: `stage.js`, `toolbar.js`, `build/words.js`,
     `templates/theming/`, `/imagine/sections/sections.js` and `/imagine/layouts/`
     all read the same objects they always did. (2026-09-06, slice 3 of
     `ai/2026-09-06/graduate-plan/`.)

   ⚠ WHAT STAYS HERE IS THE LAB'S OWN CONTROL SURFACE: `CONTENT` (eight canned
     samples, demo fixtures), `BLOCKS` (the six building blocks as pages), `CONTROLS`
     (the seven dropdowns), `DEFAULT` (a configuration) and the readers below. Those
     describe this realm, not a page.                                             */

/* ── 2 · NAVIGATION · 4 · ROOM · 5 · ARRANGEMENT · 6 · SKIN ────────────────────
   Five lists, one copy, in `core/Page/words.js` — with the reasons for each value
   written beside it there. Re-exported under the names this realm has always used:
   `ROOM` is core's `WIDTH` and `TYPE` is core's `TYPE_SIZE`. */
/* ⚠ IMPORTED **AND** RE-EXPORTED, both lines. `export … from …` is a pass-through:
     it publishes the names without binding them in this module's own scope, so
     `CONTROLS` below — which lists `NAVIGATION` and friends — would have thrown
     `NAVIGATION is not defined` on the first import of this file, with every page in
     the realm blank. */
import { NAVIGATION, ROOM, ARRANGEMENT, SURFACES, TYPE, STABLE, DYNAMIC, nav_of, arrangement_of, layout_url }
	from "/framework/core/Page/words.js";

export { NAVIGATION, ROOM, ARRANGEMENT, SURFACES, TYPE, STABLE, DYNAMIC, nav_of, arrangement_of, layout_url };

/* ── 3 · CONTENT — what is in the box ─────────────────────────────────────────
   Eight kinds, and every one of them is REAL: the renderer is a module this site
   already ships (`content.js` says which). Content is not a size — the old `xs`–`xl`
   axis was one canned sample at five heights, which the owner read as a content
   switcher because that is what it was.

   ⚠ AND A NINTH ANSWER THAT IS NOT IN THIS LIST: A URL. `content` takes the address
     of a page or of a `.md` file, exactly the way `nest` does — `is_url()` below is
     the whole test, and `stage.js` reads the file and draws it. Until 2026-09-05 this
     was the last CLOSED list in the realm: all ~100,000 configurations held one of
     eight things, which is what kept the owner's own word *infinite potential* off
     full marks in five audits running. The dropdown keeps the eight and gains a
     field. */
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

/* ── THE BUILDER'S BLOCK GRID ──────────────────────────────────────────────────
   `build/draw.js` lays a built page's blocks out in one of FOUR grids, and
   `build.css` names them `build-arrange-1-stack`, `-2-main-aside`, `-3-thirds`,
   `-4-wall`. This is that translation and nothing else: an arrangement word already
   names the `core/Layout` it compiles to, and these four are the grids this realm's
   own stylesheet has rules for. Not a word list — a map from core's catalogue onto
   four class names in one CSS file. */
const GRID = {
	"stack": "1.stack",
	"rail-and-content": "2.main-aside",
	"main-aside": "2.main-aside",
	"thirds": "3.thirds",
	"wall": "4.wall",
};

export const layout_of = id => GRID[arrangement_of(id)?.layout] ?? "1.stack";


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
	  one_line: "What is in the box — one of eight kinds, or the address of any page or file." },
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

export const label_of = axis => CONTROLS.find(control => control.axis === axis)?.label ?? axis;

/* ── A VALUE A WORD WILL ACCEPT ───────────────────────────────────────────────
   Every word takes one of its own listed values. `content` takes one more thing: a
   URL, which is any value starting with `/` — a page's address, or a `.md` file's.
   One test, read by the address (`url.js`), the bar (`toolbar.js`) and the renderer
   (`stage.js`), so the three cannot disagree about what is allowed. */
/* ⚠ AN ADDRESS ON THIS SITE STARTS WITH `/`. `https://…` is a legal thing to type and
     an illegal thing to draw: this site is static, and a page here cannot read a file
     off somebody else's server unless that server says it may. So an off-site address
     is a RECOGNISED value that is REFUSED out loud — the box says so, the field under
     the dropdown says so, and the address bar keeps what you typed. It used to be
     none of the three: the value was dropped, the dropdown fell back to Card wall, and
     the url still said `?content=https://…` (paging-audit-6, item 4). */
export const is_off_site = value => typeof value === "string" && /^https?:\/\//i.test(value);

export const is_url = value => typeof value === "string" && (value.startsWith("/") || is_off_site(value));

export const takes = (axis, value) =>
	values_for(axis).some(word => word.id === value) || (axis === "content" && is_url(value));

export const means_of = (axis, id) => values_for(axis).find(value => value.id === id)?.means
	?? (is_url(id) ? "The page or file at `" + id + "`, fetched and drawn right here." : "");

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
/* ⚠ AND `nest` RIDES HERE TOO. A page can hold a whole other page inside its box, the
     drawer hands you `…?nest=dashboard` for it — and until 2026-09-05 both exports
     printed the seven words and dropped it, so the one thing the owner asked for by
     name ("put any one of these page types inside any other") was the one thing you
     could not save (paging-audit-6b, break 2). It is a STRING here — a preset id or a
     page's address, the same value `?nest=` takes — and `stage.js` turns it back into
     a page. */
export const EXTRAS = ["blocks", "default", "nest"];

const only = (object, keys) => Object.fromEntries(keys.map(key => [key, object[key]]).filter(([, value]) => value != null));

export const config_of = node => clean(only(node?.mode ?? {}, Object.keys(DEFAULT)));

export const mode_for = node => ({ ...config_of(node), ...only(node?.mode ?? {}, EXTRAS) });
