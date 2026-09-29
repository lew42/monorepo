import { Page, p, div } from "/app.js";
import CardsDictate from "./Cards.js";

/* Mobile "prompt cards" — the owner's own words: "it converts that prompt into little
 * cards — that's really what it should be, a prompt item." Press 🎤 once; it keeps
 * listening (mode: "open") and every finished sentence becomes its own card below,
 * instead of one growing line of text. `ext/drawer/rail.js`'s bottom sheet draws the
 * same idea on mobile; this page is the reusable class it could be built from. */
// Shown on load, with no mic, so the card wall is visible without talking first
// (the owner's own rule: "I want to see" — `ai/2026-09-29/mobile-nav/review.md`,
// finding 1). Fed through `sample()`, the same settle path a real dictation uses.
const SAMPLES = [
	"remember to pick up milk on the way home",
	"call the dentist about rescheduling",
	"the meeting moved to three o'clock",
];

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "Each finished sentence becomes its own card — the mobile \"prompt item\" flow.",
	icon: "view_agenda",

	files: "Cards.js",

	content(){
		p("Press 🎤 and talk. The mic stays on; each finished sentence becomes its own card below, in order, instead of one line that keeps growing. This is `CardsDictate` — a `Dictate` subclass that overrides two methods, `build_output()` and `draw_caption()` — see the file below for the whole class, about 15 lines. The three cards below are sample text, shown so the shape is visible before you say anything.");

		div.c("pad card flex v gap", () => { new CardsDictate({}).sample(SAMPLES); }).style("max-width", "32em");

		p.c("muted", "Where this fits: any page that wants a running list of what was said — a voice note taker, a meeting log, the mobile AI rail's own sheet — can use this class directly instead of redrawing the same list by hand.");
	},

	preview(nav){ return this.preview_card(nav, () => div.c("zoom-50 pad", () => { new CardsDictate({}).sample(SAMPLES); })); },
});
