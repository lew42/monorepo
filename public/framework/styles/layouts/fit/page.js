import { Page, md, demo, code, h2, div, p, a, span, icon } from "/app.js";

// the same markup Page.previews() emits — a demo wall needs no real child pages
const card = (label, name, cls) =>
	a.c("page-preview").ac(cls).href("#").append(() => {
		if (name) icon(name);
		span.c("page-preview-title", label);
	});

const wall = () => div.c("grid gap auto", () => {
	card("Big — spans two by two", "dashboard", "big");
	card("Wide", "view_week", "wide");
	card("Ordinary", "description");
	card("Tall", "view_day", "tall");
	card("Ordinary", "description");
	card("Ordinary", "description");
}).style("--column", "13em");

export default new Page({
	meta: import.meta,
	title: "Fit",
	description: "How a page holds a layout: the default sheet, and the four words that change it.",
	icon: "crop_free",

	// this page IS its subject — the wide and bleed blocks below really do escape
	// the measure you are reading in
	classes: "grid",

	content(){

		md("A page is a `div.page` in a region, and **saying nothing gives you the reading column** — every region hands its pages a 60em measure and an inset by default. Everything else is one word.");

		md(`| | \`--measure\` | inset | reach for it when |
|---|---|---|---|
| **default** | \`60em\` | \`3em clamp(0px, 6%, 5em)\` | prose. Most pages, including this one's neighbours |
| **\`grid\`** | \`60em\` for prose | grid tracks | prose that occasionally needs a wide demo or a banner |
| **\`pad\`** | none | \`2em\` | a wall of cards, a gallery, an index |
| **\`full\`** | none | none | the thing IS the page — a layout, a canvas, a map |
| **\`fill\`** | *unchanged* | *unchanged* | something must reach the **bottom** of the region |`);

		h2("The measure is two tokens");

		code.css(`--measure     /* the reading column: 60em, or none */
--page-pad    /* the inset: 3em clamp(0px, 6%, 5em), or 0 */`);

		md("The words are nothing but stances on these two — and a value declared on an element always beats one it inherited, at any specificity, in any layer. Set them on a **region** and every page in it follows; set them on a **page** and that page wins. No specificity ladder, no `@layer` fight:");

		code.js(`classes: "pad"                                             // this page leaves the measure
this.$pages = div.c("pages").style("--measure", "none")     // a whole region does`);

		h2("Why a measure at all");

		md("Somewhere between 60 and 80 characters a line stops being comfortable to read — the eye loses its place on the return sweep. `60em` lands in that band for body copy, and is still wide enough that a code block does not wrap. Resize this window: the column stops growing and the page does not.");

		md("There is no background here either. A `.page` is a **hole onto the shell** — the site decides what colour that is, and the framework decides only how wide the reading is.");

		h2("`grid` — breaking out of the measure");

		md("The hard case: a page of prose that wants **one** wide thing in the middle of it. Negative margins are the reflex and they are a trap — `margin-inline: -8em` is identical until the window is narrower than the measure, and then it is horizontal overflow on every page that used it.");

		md("`classes: \"grid\"` makes the page a **five-track grid** instead. Prose lands in the middle track; a child marked `.wide` or `.bleed` takes more. The outer tracks are `1fr` and `minmax(0, …)`, so they collapse to nothing before the measure gives up a pixel — it cannot overflow.");

		code.js(`classes: "grid",
content(){
    md("Ordinary prose sits in the measure.");
    demo(chart).ac("wide");             // wider
    div.c("bleed", () => banner());     // edge to edge
}`);

		demo(wall, "This box is `.ac(\"wide\")` — it starts left of the paragraph above it and ends right of it. The wall inside is `grid gap auto`, with three cards asking for a share via `.wide`, `.tall` and `.big`.").ac("wide");

		md("…and **`.bleed`** takes everything, edge to edge, including the page's own inset. **That inset is the gutter against the sidebar**, so `bleed` is for the one thing a band is for — touching the window — and never for a wall that merely wants more room:");

		div.c("bleed pad wash", () => {
			p.c("h3", "Edge to edge");
			p("A banner, a hero, a full-width image. The outer tracks collapsed to zero to make room, which is why this cannot overflow the way a negative margin would.");
		}).style("borderBlock", "1px solid var(--line)");

		md("And prose resumes in the measure, with nothing to reset — a breakout is a *column assignment*, not a state.");

		h2("`pad` — the wall");

		code.js(`classes: "pad"   // --measure: none, padding: 2em`);

		md("An index, a gallery, a wall of anything. **No measure**, because nothing here is prose. The [Cards](/framework/styles/layouts/cards/) and [Dashboard](/framework/styles/layouts/dashboard/) pages are this word — both then cap their content with `measure` at `78em`, because a card wall thirteen columns wide is not a wall.");

		md("The [Layouts](/framework/styles/layouts/) index is **`grid`** instead, and the difference is worth knowing: it is a wall *and* prose. `pad` would throw the measure away for the paragraphs too. `grid` keeps the reading column and lets the wall out to `wide` — decided once inside `wall()` (see [Gallery](/framework/styles/gallery/)) rather than typed per page.");

		h2("`full` and `fill`");

		code.js(`classes: "full"        // --measure: none, --page-pad: 0
classes: "full fill"   // …and BE the region's height`);

		md("`full` is edge to edge **inside the region** — the layout supplies its own padding, or wants none. `fill` is the other half: without it a page is as tall as its content, so a `flex-1` band has no slack to take and a footer floats halfway up. It carries `overflow: hidden`, which is why a page that is reliably *taller* than the region ([Masthead](/framework/styles/layouts/masthead/)) must not wear it.");

		md("And when the region itself is too small a stage, a page can hand one layout the whole window at its own url:");

		code.js(`route(name){ return name === "full" && full(this, render); }`);

		md("A url, not a class toggle, so a reload lands back on what you were looking at. [Sections](/framework/styles/sections/) uses it for its fifteen bands; the layout pages no longer need it, because each one *is* its layout at its own plain url. See `layouts/full.js`.");

		md("Next: [Flex](/framework/styles/layouts/flex/) and [Grid](/framework/styles/layouts/grid/) — what to put inside whichever shape you picked.");
	},
});
