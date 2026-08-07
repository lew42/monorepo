import { Page, md, demo, code, h2, div, p, a, span, icon, toc } from "/app.js";

/* This page IS its subject: `classes: "grid"`, so the wide and bleed blocks
 * below actually escape the measure you are reading in. It replaces the whole
 * core/Page/layouts/ tree — measured, breakout, dashboard and full were four
 * pages each demonstrating one word, and the words now fit on one. */

// the same hand-rolled preview markup Page.cards() emits — a demo wall needs no
// real child pages behind it
const card = (label, name, cls) =>
	a.c("page-preview").ac(cls).href("#").append(() => {
		if (name) icon(name);
		span.c("page-preview-title", label);
	});

const wall = () => {
	div.c("grid gap auto", () => {
		card("Big — spans two by two", "dashboard", "big");
		card("Wide", "view_week", "wide");
		card("Ordinary", "description");
		card("Tall", "view_day", "tall");
		card("Ordinary", "description");
		card("Ordinary", "description");
	}).style("--column", "13em");
};

export default new Page({
	meta: import.meta,
	title: "Fit",
	description: "How a page holds a layout: the default sheet, and the three words that change it.",
	icon: "crop_free",
	classes: "grid",

	content(){

		toc();

		md("A page is a `div.page` in a region, and **saying nothing gives you the reading column** — every region hands its pages a 60em measure and an inset by default. Everything else is one word. This page is the whole vocabulary.");

		md(`| | \`--measure\` | inset | reach for it when |
|---|---|---|---|
| **default** | \`60em\` | \`3em clamp(0px, 6%, 5em)\` | prose. Most pages, including this one's neighbours |
| **\`grid\`** | \`60em\` for prose | grid tracks | prose that occasionally needs a wide demo or a banner |
| **\`pad\`** | none | \`2em\` | a wall of cards, a gallery, an index |
| **\`full\`** | none | none | the thing IS the page — a layout, a canvas, a map |`);

		h2("The measure is two tokens");

		code.css(`--measure     /* the reading column: 60em, or none */
--page-pad    /* the inset: 3em clamp(0px, 6%, 5em), or 0 */`);

		md("The three words are nothing but stances on these two tokens — and a value declared on an element always beats one it inherited, at any specificity, in any layer. Set them on a **region** and every page in it follows; set them on a **page** and that page wins. That is the whole opt-out mechanism: no specificity ladder, no `@layer` fight. A site that wants a bare region un-sheets it the same way:");

		code.js(`classes: "pad"                              // this page leaves the measure
this.$pages = div.c("pages").style("--measure", "none")   // a whole region does`);

		h2("Why a measure at all");

		md("Somewhere between 60 and 80 characters a line stops being comfortable to read — the eye loses its place on the return sweep. `60em` lands in that band for body copy, and is still wide enough that a code block does not wrap. Resize this window: the column stops growing and the page does not.");

		md("There is no background here either. A `.page` is a **hole onto the shell** — the site decides what colour that is, and the framework decides only how wide the reading is. That split is why the same page can be white on this site and paper-textured on another with no component edited.");

		h2("Grid: breaking out of the measure");

		md("The hard case: a page of prose that wants **one** wide thing in the middle of it. Negative margins are the reflex and they are a trap — `margin-inline: -8em` is identical until the window is narrower than the measure, and then it is horizontal overflow on every page that used it.");

		md("`classes: \"grid\"` makes the page a **five-track grid** instead. Prose lands in the middle track; a child marked `.wide` or `.bleed` takes more. The outer tracks are `1fr` and `minmax(0, …)`, so they collapse to nothing before the measure gives up a pixel — it cannot overflow.");

		code.js(`classes: "grid",
content(){
    md("Ordinary prose sits in the measure.");
    demo(chart).ac("wide");             // wider
    div.c("bleed", () => banner());     // edge to edge
}`);

		md("This page is `classes: \"grid\"`, so the two blocks below are the live proof — **`.wide`** takes the measure plus the two `--breakout` tracks beside it:");

		demo(wall, "This box is `.ac(\"wide\")`. It starts left of the paragraph above it and ends right of it — and the wall inside is `grid gap auto`, three cards asking for a share with `.wide`, `.tall` and `.big`. At one column the spans clamp themselves.").ac("wide");

		md("…and **`.bleed`** takes everything, edge to edge, including the page's own inset:");

		div.c("bleed pad", () => {
			p.c("h3", "Edge to edge");
			p("A banner, a hero, a full-width image. The outer tracks collapsed to zero to make room, which is why this cannot overflow the way a negative margin would.");
		}).style({ background: "var(--wash)", borderBlock: "1px solid var(--line)" });

		md("And prose resumes in the measure, with nothing to reset — a breakout is a *column assignment*, not a state.");

		h2("Pad: the wall");

		code.js(`classes: "pad"   // --measure: none, padding: 2em`);

		md("An index, a gallery, a wall of anything. **No measure**, because nothing here is prose — the reading-column argument does not apply to a grid of cards, and holding one to 60em just wastes the screen. The [Layouts](/framework/styles/layouts/) and [Components](/framework/styles/components/) indexes are this word.");

		h2("Full, and the overlay");

		code.js(`classes: "full"   // --measure: none, --page-pad: 0`);

		md("Edge to edge **inside the region** — the layout supplies its own padding, or wants none. And when the region itself is too small a stage, a layout takes the whole window at its own url through `route()`:");

		code.js(`route(name){ return name === "full" && full(this, layout); }`);

		md("That is the seam every [layout page](/framework/styles/layouts/) uses for its full-size view — a url, not a class toggle, so a reload lands back on what you were looking at. See `layouts/full.js`.");

		md("Next: [Layouts](/framework/styles/layouts/) — what to put inside whichever of these you pick, and [Page flow](/framework/core/Page/flow/) — the vertical rhythm within it.");
	}
});
