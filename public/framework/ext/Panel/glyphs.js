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

// Arrows inward for hug, outward for fill — the picture is the thing it does.
export const MODE = { hug: "close_fullscreen", fill: "open_in_full" };

export const DIR = { row: "vertical_split", col: "horizontal_split" };

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
