import { span, icon } from "/framework/core/View/View.js";

/* What a panel's words look like. The bar, a seam's menu and the inspector all draw the
   same vocabulary, so the pictures live in one place and the three can never drift.
   Imports View and nothing else, so every surface may read it and none of them circle.
   css: .panel-swatch (toolbar.css). Record: readme.md.

   ⚠ Material Icons is a LIGATURE font: a name it does not carry renders as the whole
   WORD — 432px of `position_top_right`, measured — and sizes every column of the grid it
   lands in. Every name below was measured against the loaded font before it was written. */

// The codes ARE their two axes, so the 3×3 is generated rather than listed.
export const ALIGN = ["t", "c", "b"].flatMap(y => ["l", "c", "r"].map(x => y + x));

/* What half a code means as a CSS keyword — `code[0]` is the block axis, `code[1]` the
   inline one. Two readers: `place()` positions a body's CONTENT with it, and the 3×3
   overlay positions each BUTTON inside its own grid cell with it, which is what makes an
   arrow sit at the edge it names. */
export const PLACE = { t: "start", c: "center", b: "end", l: "start", r: "end" };

// An arrow pointing the way it means, and a dot for the centre.
export const COMPASS = {
	tl: "north_west", tc: "north", tr: "north_east",
	cl: "west", cc: "fiber_manual_record", cr: "east",
	bl: "south_west", bc: "south", br: "south_east",
};

/* Where the PANEL sits in the slot its split hands it — a dot inside a frame, at the place
   it names, drawn rather than lettered (`glyph()`'s function form, the same door a tone's
   swatch comes through). Not COMPASS again: `self` and `align` are two 3×3s one above the
   other in the same rail, and nine identical arrows twice says nothing about which grid is
   which. A frame with the panel in it is the picture of the thing. css: .panel-seat
   (size.css, which owns the rule the control draws). */
const seat = code => () => span.c("panel-seat")
	.style({ "--panel-seat-y": PLACE[code[0]], "--panel-seat-x": PLACE[code[1]] });

export const SEATS = Object.fromEntries(ALIGN.map(code => [code, seat(code)]));

// Arrows inward for hug, outward for fill — the picture is the thing it does.
export const MODE = { hug: "close_fullscreen", fill: "open_in_full" };

/* The ROOT's word about the whole workspace: one SCREEN its panels divide, or a DOCUMENT
   as tall as its sections, which scrolls. A screen to fit and a page of text — deliberately
   not MODE's arrows, which answer a different question one row down ("does this panel fill
   the slot it was handed"). Both names measured against the loaded font. */
export const SHAPE = { fill: "fit_screen", document: "article" };

/* Width and height each read `size.js`'s per-axis engine: fill | hug | fixed, and a fixed
   extent needs a LENGTH too. A short, round list rather than a knob — a `pick()` row is
   the vocabulary's own idiom everywhere else here, and a knob would be a second control
   shape for one field (the owner, 2026-08-16). `fixed` carries no icon of its own: MODE already
   covers fill/hug, and a length reads as its own text through `glyph()`'s existing
   fallback, exactly like ext/editor's region names. */
export const LENGTHS = ["8em", "16em", "24em"];
export const SIZES = ["fill", "hug", ...LENGTHS];

// What a size picker highlights: the extent itself, or the length it's fixed to.
export const extent = (item, axis) => item.get(axis) === "fixed" ? item.get(axis + "_at") : item.get(axis);

export const DIR = { row: "vertical_split", col: "horizontal_split" };

/* Whether a panel is IN the slot its split hands it or floating OVER it. `static` is
   honest about layout: `.panel` is `position: relative` only so its own bar and overlays
   have a root, and `relative` with no insets sits exactly where `static` would. `fixed`
   and `sticky` are measured rejections — doc/file/size.js.md. The two pictures are the
   same frame twice, empty and then with a small panel floating in it. */
export const POSITION = { static: "crop_free", absolute: "picture_in_picture" };

/* How a leaf's body lays its own content out. Stacked bands for flow, columns for flex, a
   lattice for grid — and `grid_on` rather than `grid_view`, which the alignment trigger
   already wears. */
export const DISPLAY = { block: "view_agenda", flex: "view_column", grid: "grid_on" };

/* A tone is a colour, so its picture is the colour — the token being the one the
   templates already tint themselves with, so a swatch cannot show a shade nothing draws. */
export const TONE = { surface: "--surface", wash: "--wash", prim: "--prim", dark: "--ink" };
export const TONES = Object.keys(TONE);

const swatch = tone => () => span.c("panel-swatch").style("--panel-swatch", `var(${TONE[tone]})`);

export const SWATCHES = Object.fromEntries(TONES.map(tone => [tone, swatch(tone)]));

/* One of a vocabulary, as a picture. A picture is an icon name, a drawing (a swatch), or a
   `T` entry carrying one — and a vocabulary that ships none reads as its own word, which
   is what ext/editor's regions do. */
export const glyph = (entry, name) => {
	const pic = typeof entry === "object" ? entry?.icon : entry;

	return typeof pic === "function" ? pic
		: () => { if (pic) icon(pic); else span(name); };
};

/* THE table. Every word a panel wears that is ONE key with a fixed list of choices, in the
   order the rail draws them. ⚠ ONE reader since 2026-08-19: the rail (`properties.js`). The
   bar carries no words at all any more — the sweep took every one of them off it, and with
   them the `bar:` flag this table used to carry. doc/decisions.md.

   · `names` — the choices, in the order they are drawn.
   · `pics`  — a picture per choice; a set shipping none reads as its own words (`glyph()`).
   · `cols`  — how wide that picker's grid is.
   · `toggle`— two names, one of which means OFF: ONE button that lights, never a row of
               two. `names[1]` is the ON state, and `pic` is the button's own picture.
   · `drop`  — a dropdown (`ext/Dropdown`) instead of a row: a trigger saying the value's
               NAME as well as its picture. For the words a row of pictures cannot carry.
   · `knob`  — a free-value slider beside the preset row (`pad`, `gap`).
   · `modes` — the display modes the word is live under; absent means always.
   · `root`  — the ROOT panel only; hidden on everything with a parent.
   · `var` + `css` — how it LANDS: the custom property `paint.js`'s `show()` writes on the
     body, and the value map `display.css` reads (absent = the word IS the CSS value).

   Not here, each for a reason one row cannot express: `template` (a per-document
   vocabulary, plus `random`, which is a verb), `w`/`h` (one pick writes TWO keys), `self`
   (a 3×3 whose buttons go live per axis). Record: doc/words.md. */

// ⚠ `minmax(0, 1fr)`, never `1fr`: a `1fr` track's minimum is `auto`, so one long word
// pushes the whole grid past its panel — the grid guide's own trap (ai/2026-08-18/panel-grid/).
const TRACKS = {
	auto: "repeat(auto-fit, minmax(8em, 1fr))",
	1: "repeat(1, minmax(0, 1fr))", 2: "repeat(2, minmax(0, 1fr))",
	3: "repeat(3, minmax(0, 1fr))", 4: "repeat(4, minmax(0, 1fr))",
};

export const WORDS = {
	/* First, because it is the only word about the WHOLE workspace rather than one panel —
	   and the only `root` one. `document` is also the only word that changes what a SPLIT
	   does: panel.css lets the root's column grow instead of dividing a screen, and
	   `Panel.divide()` gives each new row a height, so a split below APPENDS a section.
	   doc/words.md. */
	mode:    { names: ["fill", "document"], pics: SHAPE, cols: 2, root: true },

	/* ⚠ FOUR across, not 2×2 (the owner, 2026-08-19: "should be 1x4 to utilize space better").
	   A swatch is 1.7em; four of them and their gaps fit a 19rem rail with room to spare, and
	   a row of six or fewer pictures is one LINE — a stack wastes the rail's height for
	   nothing. The one set that keeps a narrow `cols` is `align`, whose 3×3 IS the picture. */
	tone:    { names: TONES, pics: SWATCHES, cols: 4 },

	/* The one word with `drop`, and the reason the flag exists: `display` decides which
	   OTHER words are live, so the rail is unreadable when the word governing it is three
	   unlabelled pictures you have to hover to tell apart (the owner, 2026-08-19). A trigger
	   that says `flex` names the state the rest of the rail is in. */
	display: { names: Object.keys(DISPLAY), pics: DISPLAY, cols: 3, drop: true },

	/* The BODY's own padding (2026-08-19) — always live, no `modes`: unlike `gap`, which
	   only means something once children are laid out, `pad` insets a body's content
	   whatever `display` it draws in. Rail-only, no `bar`, the way `position` already is —
	   a new ligature name is a measured cost this word does not need to pay. `knob` is the
	   free-value companion `properties.js` draws beside the preset row for exactly this
	   word and `gap` (doc/words.md). ⚠ No `Panel.defaults` entry: `PanelDrag`'s centre-drop
	   nest already writes `--panel-pad: 1em` on the fresh container's `.panel-items`
	   (doc/decisions.md), and this word's value is read, not written, until a panel picks
	   one — a stamped default would shadow that inherited inset on every un-chosen body. */
	pad:     { names: ["0", "0.5em", "1em", "2em"], cols: 4, var: "--panel-pad", knob: true },

	// Flex. `dir` is the same word a SPLIT wears for its axis — a panel is one or the
	// other and never both, so one key says "which way things run" in both readings.
	dir:     { names: ["row", "col"], pics: DIR, cols: 2, modes: ["flex"],
	           var: "--panel-dir", css: { row: "row", col: "column" } },
	gap:     { names: ["0", "0.5em", "1em", "2em"], cols: 4,
	           modes: ["flex", "grid"], var: "--panel-gap", knob: true },

	/* ⚠ ONE button, not a `nowrap | wrap` pair (the owner, 2026-08-19: "a single Wrap with
	   active state would suffice"). The two names stay — they are the CSS values `paint.js`
	   writes — and `names[1]` is what the lit button means. */
	wrap:    { names: ["nowrap", "wrap"], toggle: true, pic: "wrap_text", modes: ["flex"],
	           var: "--panel-wrap" },

	justify: { names: ["start", "center", "end", "between", "around"], cols: 5,
	           modes: ["flex"], var: "--panel-justify",
	           css: { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" } },
	items:   { names: ["stretch", "start", "center", "end"], cols: 4,
	           modes: ["flex"], var: "--panel-items",
	           css: { stretch: "stretch", start: "flex-start", center: "center", end: "flex-end" } },

	/* Grid. ⚠ The property is `--panel-tracks`, NOT `--panel-cols` — that name is already
	   the picker grid's own column count (18 readers), and a body writing it would hand
	   its value down to any control surface drawn inside that body. */
	cols:    { names: ["auto", "1", "2", "3", "4"], cols: 5,
	           modes: ["grid"], var: "--panel-tracks", css: TRACKS },

	// Binary, so one button — the same reading `wrap` gets, one row up.
	dense:   { names: ["off", "on"], toggle: true, pic: "apps", modes: ["grid"],
	           var: "--panel-flow", css: { off: "row", on: "row dense" } },

	align:    { names: ALIGN, pics: COMPASS, cols: 3 },
	position: { names: Object.keys(POSITION), pics: POSITION, cols: 2 },
};

/* An ITEM's own words — a leaf's body arranges itself with `WORDS` above; a flex/grid CHILD
   of that body gets its own say with these, one custom property per word, landed straight on
   the child (never the body — `persist.js`'s `items_apply()` is the writer, `properties.js`'s
   `item_words()` the rail). `self` is `place-self`, not `align-self`/`justify-self` split in
   two: flex ignores the inline half of a shorthand it cannot use, so one row covers both
   readings for the one extra property it costs. doc/words.md. */
const SPAN_CSS = { 1: "auto", 2: "span 2", 3: "span 3" };

export const ITEM_WORDS = {
	grow:     { names: ["0", "1", "2", "3"], cols: 4, modes: ["flex"], var: "--item-grow", default: "0" },
	basis:    { names: ["auto", "8em", "16em", "24em"], cols: 4, modes: ["flex"], var: "--item-basis", default: "auto" },
	order:    { names: ["-1", "0", "1"], cols: 3, modes: ["flex"], var: "--item-order", default: "0" },
	span:     { names: ["1", "2", "3"], cols: 3, modes: ["grid"], var: "--item-span", css: SPAN_CSS, default: "1" },
	row_span: { names: ["1", "2", "3"], cols: 3, modes: ["grid"], var: "--item-row-span", css: SPAN_CSS, default: "1" },
	self:     { names: ["auto", "start", "center", "end", "stretch"], cols: 5, modes: ["flex", "grid"], var: "--item-self", default: "auto" },
};

// The item words live under the CURRENT display mode only — a flex leaf never offers `span`.
export const live_item_words = mode => Object.entries(ITEM_WORDS).filter(([, word]) => word.modes.includes(mode));

// One cell's saved picks, as the custom properties `display.css`'s rule block reads —
// `word_vars()`'s shape, one level down: a plain patch object instead of an Item's `get()`.
export const item_vars = patch => Object.fromEntries(Object.entries(ITEM_WORDS)
	.filter(([key]) => patch[key] !== undefined)
	.map(([key, word]) => [word.var, word.css?.[patch[key]] ?? patch[key]]));

/* The words that apply to this panel RIGHT NOW — a flex word under flex, a grid word under
   grid, a `root` word on the root alone, the rest always. Both hosts draw exactly what this
   hands back, in this order. ⚠ A root word is withheld from every panel with a parent and
   from nothing else: `mode: document` describes the box the whole tree lands in, and a
   section wearing it (a split hands its data down) must not act on it. */
export const live_words = item => Object.entries(WORDS)
	.filter(([, word]) => (!word.root || !item.parent)
		&& (!word.modes || word.modes.includes(item.get("display"))));

/* The same words, as CSS. `paint.js`'s `show()` is the single writer of these, exactly as
   it is of the display class — so display.css reads a body's whole arrangement from one
   place, and nothing else in the module writes a layout property on a body by hand. */
export const word_vars = item => Object.fromEntries(Object.entries(WORDS)
	.filter(([, word]) => word.var)
	.map(([key, word]) => [word.var, word.css?.[item.get(key)] ?? item.get(key)]));
