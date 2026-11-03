import { span, icon } from "/framework/core/View/View.js";

export default class PanelGlyphs {
	// history and reasons: doc/glyphs-notes.md

	// The codes ARE their two axes, so the 3×3 is generated rather than listed.
	static ALIGN = ["t", "c", "b"].flatMap(y => ["l", "c", "r"].map(x => y + x));

	static PLACE = { t: "start", c: "center", b: "end", l: "start", r: "end" };

	static place = ($body, code = "cc") =>
		$body.style({ "--panel-y": PanelGlyphs.PLACE[code[0]] ?? "center", "--panel-x": PanelGlyphs.PLACE[code[1]] ?? "center" });

	// An arrow pointing the way it means, and a dot for the centre.
	static COMPASS = {
		tl: "north_west", tc: "north", tr: "north_east",
		cl: "west", cc: "fiber_manual_record", cr: "east",
		bl: "south_west", bc: "south", br: "south_east",
	};

	static seat = code => () => span.c("panel-seat")
		.style({ "--panel-seat-y": PanelGlyphs.PLACE[code[0]], "--panel-seat-x": PanelGlyphs.PLACE[code[1]] });

	static SEATS = Object.fromEntries(PanelGlyphs.ALIGN.map(code => [code, PanelGlyphs.seat(code)]));

	// Arrows inward for hug, outward for fill — the picture is the thing it does.
	static MODE = { hug: "close_fullscreen", fill: "open_in_full" };

	static SHAPE = { fill: "fit_screen", document: "article" };

	static LENGTHS = ["8em", "16em", "24em"];
	static SIZES = ["fill", "hug", ...PanelGlyphs.LENGTHS];

	static extent = (item, axis) => item.get(axis) === "fixed" ? item.get(axis + "_at") : item.get(axis);

	static DIR = { row: "vertical_split", col: "horizontal_split" };

	static POSITION = { static: "crop_free", absolute: "picture_in_picture" };

	static DISPLAY = { block: "view_agenda", flex: "view_column", grid: "grid_on" };

	static TONE = { surface: "--surface", wash: "--wash", prim: "--prime", dark: "--ink" };
	static TONES = Object.keys(PanelGlyphs.TONE);

	static swatch = tone => () => span.c("panel-swatch").style("--panel-swatch", `var(${PanelGlyphs.TONE[tone]})`);

	static SWATCHES = Object.fromEntries(PanelGlyphs.TONES.map(tone => [tone, PanelGlyphs.swatch(tone)]));

	static glyph = (entry, name) => {
		const pic = typeof entry === "object" ? entry?.icon : entry;

		return typeof pic === "function" ? pic
			: () => { if (pic) icon(pic); else span(name); };
	};

	// ⚠ `minmax(0, 1fr)`, never `1fr`: a `1fr` track's minimum is `auto`, so one long word
	// pushes the whole grid past its panel — the grid guide's own trap (ai/sessions/2026/08/18/panel-grid/).
	static TRACKS = {
		auto: "repeat(auto-fit, minmax(8em, 1fr))",
		1: "repeat(1, minmax(0, 1fr))", 2: "repeat(2, minmax(0, 1fr))",
		3: "repeat(3, minmax(0, 1fr))", 4: "repeat(4, minmax(0, 1fr))",
	};

	static WORDS = {
		mode:    { names: ["fill", "document"], pics: PanelGlyphs.SHAPE, cols: 2, root: true },
		tone:    { names: PanelGlyphs.TONES, pics: PanelGlyphs.SWATCHES, cols: 4 },
		display: { names: Object.keys(PanelGlyphs.DISPLAY), pics: PanelGlyphs.DISPLAY, cols: 3, drop: true },
		pad:     { names: ["0", "0.5em", "1em", "2em"], cols: 4, var: "--panel-pad", knob: true },

		// Flex. `dir` is the same word a SPLIT wears for its axis — a panel is one or the
		// other and never both, so one key says "which way things run" in both readings.
		dir:     { names: ["row", "col"], pics: PanelGlyphs.DIR, cols: 2, modes: ["flex"],
		           var: "--panel-dir", css: { row: "row", col: "column" } },
		gap:     { names: ["0", "0.5em", "1em", "2em"], cols: 4,
		           modes: ["flex", "grid"], var: "--panel-gap", knob: true },

		wrap:    { names: ["nowrap", "wrap"], toggle: true, pic: "wrap_text", modes: ["flex"],
		           var: "--panel-wrap" },

		justify: { names: ["start", "center", "end", "between", "around"], cols: 5,
		           modes: ["flex"], var: "--panel-justify",
		           css: { start: "flex-start", center: "center", end: "flex-end", between: "space-between", around: "space-around" } },
		items:   { names: ["stretch", "start", "center", "end"], cols: 4,
		           modes: ["flex"], var: "--panel-items",
		           css: { stretch: "stretch", start: "flex-start", center: "center", end: "flex-end" } },

		cols:    { names: ["auto", "1", "2", "3", "4"], cols: 5,
		           modes: ["grid"], var: "--panel-tracks", css: PanelGlyphs.TRACKS },

		dense:   { names: ["off", "on"], toggle: true, pic: "apps", modes: ["grid"],
		           var: "--panel-flow", css: { off: "row", on: "row dense" } },

		align:    { names: PanelGlyphs.ALIGN, pics: PanelGlyphs.COMPASS, cols: 3 },
		position: { names: Object.keys(PanelGlyphs.POSITION), pics: PanelGlyphs.POSITION, cols: 2 },
	};

	static SPAN_CSS = { 1: "auto", 2: "span 2", 3: "span 3" };

	static ITEM_WORDS = {
		grow:     { names: ["0", "1", "2", "3"], cols: 4, modes: ["flex"], var: "--item-grow", default: "0" },
		basis:    { names: ["auto", "8em", "16em", "24em"], cols: 4, modes: ["flex"], var: "--item-basis", default: "auto" },
		order:    { names: ["-1", "0", "1"], cols: 3, modes: ["flex"], var: "--item-order", default: "0" },
		span:     { names: ["1", "2", "3"], cols: 3, modes: ["grid"], var: "--item-span", css: PanelGlyphs.SPAN_CSS, default: "1" },
		row_span: { names: ["1", "2", "3"], cols: 3, modes: ["grid"], var: "--item-row-span", css: PanelGlyphs.SPAN_CSS, default: "1" },
		self:     { names: ["auto", "start", "center", "end", "stretch"], cols: 5, modes: ["flex", "grid"], var: "--item-self", default: "auto" },
	};

	// The item words live under the CURRENT display mode only — a flex leaf never offers `span`.
	static live_item_words = mode => Object.entries(PanelGlyphs.ITEM_WORDS).filter(([, word]) => word.modes.includes(mode));

	static item_vars = patch => Object.fromEntries(Object.entries(PanelGlyphs.ITEM_WORDS)
		.filter(([key]) => patch[key] !== undefined)
		.map(([key, word]) => [word.var, word.css?.[patch[key]] ?? patch[key]]));

	static live_words = item => Object.entries(PanelGlyphs.WORDS)
		.filter(([, word]) => (!word.root || !item.parent)
			&& (!word.modes || word.modes.includes(item.get("display"))));

	static word_vars = item => Object.fromEntries(Object.entries(PanelGlyphs.WORDS)
		.filter(([, word]) => word.var)
		.map(([key, word]) => [word.var, word.css?.[item.get(key)] ?? item.get(key)]));

}
