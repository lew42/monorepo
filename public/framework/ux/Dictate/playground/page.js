import { Page, md, a } from "/app.js";
import { pg } from "./Playground.js";

// The one shared instance (`Playground.js`) — every `widget()` call, here or embedded
// on the plain Dictate page, reads and writes the SAME state, so switching between them
// (or between tabs inside one) never loses a word. `globalThis.$dictate_pg` is the seam
// a headless test presses the Sample button through.
globalThis.$dictate_pg = pg;

export default new Page({
	meta: import.meta,
	title: "Playground",
	description: "Press 🎤 and watch a whisper session become raw text, then a fast-assistant diff, then a clean live version.",
	icon: "science",

	// **Full-bleed** (requirements.md deliverable 4 — "on desktop, we have a lot of
	// space... we probably want to use like a full bleed tab for the playground"). `full`
	// is the one page-shape word for "a gallery or board, no measure" (`core/Page/doc/
	// css.md`'s own table); `pad` puts the normal side padding back so text still keeps
	// its distance from the viewport edge — `full` alone zeroes it.
	classes: "full pad",

	children: ["walkthrough"],

	content(){
		a.c("page-link").href("/framework/ux/Dictate/playground/walkthrough/").text("New here? Next / Next through it, one screen at a time →");
		md("Press 🎤, or ▶ Sample for a scripted fake session — no mic needed.");
		pg.widget();
		md("Want a different LOOK on top of this same mic — mobile prompt cards, a compact toolbar line? See [Variants](/framework/ux/Dictate/variants/).");
		md.details(import.meta, "readme.md", "Readme");
	},
});
