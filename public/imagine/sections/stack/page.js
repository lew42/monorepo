import { Page, div, span, p } from "/app.js";
import { SectionsBand, SectionsStack, heading, link } from "../sections.js";
import { PRESETS, preset_url } from "../../paging/presets.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  a column in /imagine/'s columns host; content lands in column prose.
   2 SIZE       `fill` — the leftover of the row, so twelve repeating sections have a
                wide screen to repeat across.
   3 OWN LAYOUT one `.sections-stack` of thirteen sections: one lead, twelve entries.
   4 REGIONS    one.
   5 PREVIEW    core's card on the sections hub.

   TWELVE REAL PAGES, NOT TWELVE MOCK-UPS. The list is `/imagine/paging/presets.js` —
   imported, never copied, and that file imports nothing, so it costs no stylesheet.
   Each entry links to the real preset page.

   UNIFORM AND PROGRESSIVELY DIFFERENT, which is the owner's own phrase: every section
   is the same three columns in the same order, and one word moves down the list — the
   frame's colour walks the five surfaces, and every third section is a card instead of
   flush. So the list reads as one list, and no two entries look identical. */

const SKIN_WALK = ["tint", "plain", "prim", "card", "dark"];

// The seven words a preset is made of. Not a vocabulary of its own: this prints
// `preset.config`, the object the paging realm actually draws from.
const words_of = config => div.c("sections-reads", () => {
	Object.entries(config).forEach(([word, value]) => span.c("sections-px", word + " " + value));
});

export default new Page({
	meta: import.meta,
	title: "A stack of templates",
	description: "Twelve page shapes as repeating sections.",
	icon: "view_day",
	width: "fill",

	content(){
		new SectionsStack({ classes: "bleed", space: "gap", bands(){
			const stack = this;

			// ── the lead: what this is, and the one control above a stack ──
			new SectionsBand({
				cols: 3, dist: "rail-main-aside", frame: "flush", chrome: "tint", face: "card", stick: "on",

				head: () => {
					span.c("sections-tile-name", "Twelve page shapes, one section each");
					link("/imagine/paging/library/", "the pages themselves");
				},

				side: () => {
					p.c("sections-text", "A list of related things reads best as one section repeated: the same three columns, in the same order, every time. Your eye learns the shape once, and after that it only has to read what changed.");
					p.c("sections-text", "Press a word on the right to change how much room there is between them. With no gap the twelve read as one continuous page; with the gap ramp they read as twelve separate things.");
				},

				main: () => {
					heading("Each one below");
					p.c("sections-text", "On the left, the shape's name and the one line that says what it is. In the middle, the seven words it is made of. On the right, the way in.");
					p.c("sections-note", "The frame's colour walks the five surfaces down the list and every third section is a card, so the repetition never becomes a drone.");
				},

				aside: band => { stack.chips(); band.controls(); },
			});

			PRESETS.forEach((preset, i) => new SectionsBand({
				cols: 3, dist: "rail-main-aside",
				frame: i % 3 === 2 ? "card" : "flush",
				chrome: SKIN_WALK[i % SKIN_WALK.length],
				face: "card", stick: "off",

				side: () => {
					heading(preset.title);
					p.c("sections-text", preset.one_line);
				},

				main: () => { words_of(preset.config); },

				aside: () => {
					p.c("sections-note", "Section " + (i + 1) + " of " + PRESETS.length + ".");
					link(preset_url(preset), "open this page");
				},
			}));

		} });
	},
});
