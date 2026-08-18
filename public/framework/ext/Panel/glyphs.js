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
