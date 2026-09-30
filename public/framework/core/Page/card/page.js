import { Page, View, p, div, span, button, icon } from "/app.js";

// The card system's own stylesheet — loaded once, here, because every page
// under this one is reached by walking DOWN through this file first (the
// Router loads a parent's page.js before any child's). ai2/page.js and
// ux/page.js load their own tier's CSS the same way.
View.stylesheet(import.meta, "card.css");

// The four grounds a card can sit on (card.css) — same list `grounds/page.js`
// uses, kept here too so the live sample below needs no import from a child.
const GROUNDS = [
	{ cls: "",          name: "Default" },
	{ cls: "card-gray", name: "Light gray" },
	{ cls: "card-dark", name: "Dark" },
	{ cls: "card-prim", name: "Strong hue" },
];

// One ground, drawn three cards deep, with a header bar and a ⋯ menu on the
// outer card — every class here already exists in `card.css`; nothing new.
// `nesting/page.js` shows the same level-1/2/3 boxing on its own, in full.
function sample(ground){
	div.c(`card card-level-1 ${ground.cls}`.trim(), () => {
		div.c("card-head", () => {
			icon("dashboard");
			span.c("card-head-title", ground.name);
			button.c("card-menu-btn", () => icon("more_vert"));
		});
		div.c("card card-level-2", () => {
			p("Nested one level in.");
			div.c("card card-level-3", () => p("Nested two levels in — three cards deep."));
		});
	});
}

export default new Page({
	meta: import.meta,
	title: "Cards",
	description: "A card is a mini page: its own background, a title or header maybe, clickable or expandable, nested a few levels deep — and when there's a list of them, they're routed, real pages of their own.",
	icon: "dashboard",
	children: "grounds nesting headers mini-pages/page.jsonl scale log",

	content(){
		// Show, don't tell (the owner): the first thing on the page is a LIVE sample,
		// not a description of one — one card per ground, three levels deep, with a
		// header bar and a ⋯ menu. `wide` breaks it out of the narrow prose column so
		// all four sit in a row at 1920.
		div.c("wide grid auto gap", () => GROUNDS.forEach(sample)).style("--column", "16em");

		// Then the six sub-topics, as the site's own page-preview wall — the same
		// `this.previews()` call `core/page.js` uses for its own children — sized up
		// from the 14em default so each card reads at 1920 without crowding.
		this.previews().style({ "--column": "22em", "--gap": "1.5em" });

		// Then the one paragraph, down to two sentences (was three).
		p("A card is not a new widget — it's `.card` and `.surface`, the two classes framework.css already ships. This module is where the rules for using them live: which ground, how deep it nests, which header pattern, and that a list of cards is a list of real, routed pages, not a list of divs.");
	},
});
