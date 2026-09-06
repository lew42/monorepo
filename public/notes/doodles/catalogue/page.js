import { Page, md, ui } from "/app.js";
import { doodles, notes } from "../doodles.js";

/* Layout: a plain page in the app's main region — one table, then three short
   sections. Nothing sizes itself; the table is the page. */
export default new Page({
	meta: import.meta,
	title: "Catalogue",
	description: "Every doodle: which notebook spread it came from, how often it turns up, and the two that could not be used.",

	content(){
		md("Sixty-seven photographed spreads. A **doodle** here means a mark that is "
			+ "not a letter, a number or punctuation — so braces, circled numbers and "
			+ "underlines are handwriting, and are not in this table.\n\n"
			+ "Every row has an SVG in `doodles.js`: twenty because the mark turns up at "
			+ "least twice, and three — the compass, the camera and the Heli — because "
			+ "they turn up once and are plainly drawings.");

		// The first column is the real drawing, straight out of doodles.js, so the
		// table cannot drift from the library it describes.
		ui.table(["", "Name", "What it is", "Spreads", "Seen"],
			rows.map(([name, spreads, count]) => [
				() => { doodles[name]("2.2em"); },
				name,
				notes[name],
				spreads,
				count,
			]));

		md("## Counts are floors, not totals\n\n"
			+ "Eighteen spreads were read mark by mark; the rest were sampled for "
			+ "anything new. So **every number is at least that many**. The arrow and "
			+ "the tick are on nearly every page and were not counted past sixty.");

		md("## Two that recur and are not here\n\n"
			+ "**pill** — a rounded box drawn around a word (`ENTER`, `TROLL`, "
			+ "`MINDMAP`, `UNLIMITED`), on six spreads. **screen** — a rounded device "
			+ "frame with a home button, on two.\n\n"
			+ "Both were left out for one reason: the shape is inseparable from the "
			+ "handwriting inside it, and nothing photographed for this library may "
			+ "carry the owner's words. There was no crop of either that was only a "
			+ "drawing. If a blank one turns up on a later spread, both are quick to add.");

		md("## How the crops were made\n\n"
			+ "Each `ref/*.png` is the doodle cut out of its photograph at native "
			+ "pixels — no upscaling, no cleanup. The cut is a headless Chromium canvas "
			+ "driven by Playwright, so it needed no new dependency.\n\n"
			+ "⚠ The photographs are stored portrait with an EXIF rotation flag, and "
			+ "the browser's `<img>` ignores that flag while an image viewer obeys it. "
			+ "Coordinates read off the photograph land somewhere else entirely unless "
			+ "the crop is turned upright first — which cost the first four attempts.");
	},
});

/* name, the spreads it appears on, how many times were counted.
   Ordered by how often the mark turns up, so the page reads top-down as
   "these are the notebook's habits". */
const rows = [
	["arrow",     "every spread",                      "60+"],
	["check",     "003–008, 016, 018, 019, 023, 031",  "60+"],
	["scribble",  "014, 016, 018, 019, 021, 031, 043", "40+"],
	["wireframe", "014, 016, 019, 021, 023, 031, 041", "25+"],
	["star",      "007, 008, 009, 010, 014, 015, 023", "16"],
	["hook",      "002, 003, 008, 010, 016, 023, 031", "10"],
	["crossed",   "005, 014, 016, 019",                "9"],
	["pentagram", "014, 015",                          "8"],
	["span",      "001, 002, 015",                     "6"],
	["frame",     "003, 005, 008",                     "5"],
	["zigzag",    "007, 008",                          "4"],
	["fan",       "056",                               "4"],
	["diamonds",  "007, 008",                          "3"],
	["bowtie",    "007, 008",                          "3"],
	["wave",      "005, 008, 016",                     "3"],
	["spike",     "004, 018, 019",                     "3"],
	["cube",      "052",                               "3"],
	["squares",   "008",                               "2"],
	["truss",     "007, 008",                          "2"],
	["note",      "010, 019",                          "2"],
	["compass",   "009",                               "1 — a drawing"],
	["camera",    "004",                               "1 — a drawing"],
	["heli",      "056",                               "1 — a drawing"],
];
