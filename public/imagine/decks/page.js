import { Page, md } from "/app.js";

/* Container: /imagine/'s column row, one `fill` column (was `large`, 28–64em — measured
   41% of 3440 used, 1856px dead: paging/critique, decks row, 2026-09-04). `fill` is
   safe here for the same reason it is safe on blogx/page.js: this index is a LEAF —
   every child below defaults to (or sets) `width: "full"` in `Deck.column()`, so no
   third column ever opens beside this one in the row; `fill`'s neighbours-keep-their-
   floor behaviour (doc/columns.md) is exactly the case it exists for. `full` itself
   was not tried: it would collapse /imagine/'s own hub rail, same regression gallery
   reverted on 2026-08-29. Own layout: a line of prose and core's previews wall,
   grouped by the `group` each child declares. Regions: one, core's. Preview: the
   default card.

   This index is an ordinary column ON PURPOSE — it is the last thing you see before a
   screen takes over, so it keeps its head, its × and the crumb strip. Everything it
   links to has none of them.

   ROUND 2 (2026-09-05): the card's picture is now a real screenshot of the slide
   (`Deck.preview()`, decks.css), not the abstract ratio diagram it drew before — see
   doc/decisions.md. That also exposed a real defect the diagram had been hiding: the
   wall is ONE grid whose auto-fill track count is set by the FULL row width, so a
   `group` with fewer cards than tracks leaves the rest of that row blank — measured
   2,667px empty (78% of 3440) behind the one-card "The deck" row. Each group below now
   caps its own `max-width` to its own card count, which removes that band without
   touching core's shared `previews()`/`.page-previews` grid. */

export default new Page({
	meta: import.meta,
	title: "Decks",
	description: "Presentational layouts — cutting a screen, and what belongs in each piece.",
	icon: "slideshow",
	width: "fill",
	index: true,

	children: "half golden aside triptych poster four persist swap pitch",

	content(){
		md("**Nine ways to cut one screen into pieces, the way a slide splits into a picture and a caption.** Each card below is a real page — click one to open it full-screen and see that cut built with real text and shapes in it, not a diagram. [`/imagine/screens/`](/imagine/screens/) is the step before this one: it found the two words a whole screen is built from (`full` replaces it, `fill` shares it). This lab answers the next question — once you have the screen, how do you split it into pieces, and what kind of content belongs in each piece.");

		md("Under the hood, a piece here is a **share of the row**, written as a percent: `61.8%` beside `38.2%` measured 2125 / 1313 at 3440 and 1185 / 733 at 1920 — the golden section at both, with no breakpoint. The cards below are real screenshots of the nine cuts — click one to open it full-screen.");

		// One `this.previews()` call per group, each capped to its OWN card count —
		// see the container comment above. `previews(pages)` takes any Map of my
		// children, so this is core's own method called three times, not a fork of it.
		[...new Set([...this.children.values()].map(page => page?.group).filter(Boolean))].forEach(name => {
			const subset = new Map([...this.children].filter(([, page]) => page?.group === name));
			this.previews(subset).style("--column", "22em").style("max-width", `calc(${subset.size} * 22em + ${subset.size - 1} * var(--gap-default))`);
		});

		md("### The five kinds, and the one property that separates them");

		md(`| kind | how it answers a wider region | belongs in |
|---|---|---|
| **statement** | scales — the type is 13% of its own block | the major share, or the whole screen |
| **stage** | scales — an aspect box has no wrong width | any region of any cut |
| **wall** | adds columns — one token, no breakpoint | any share, and the only kind happy at 687px |
| **notes** | caps at its measure and centres | a minor share, 500–1200px |
| **list** | **does not scale** — a row is its label | a fixed track (\`small\`), never a share |`);

		md("That last row is the whole content-kind map in one line: four of the five kinds take a *share* and get better; a nav list takes a share and gets a chevron chasm. Every cut in this lab is a different answer to where the list goes.");

		// `doc/page.js` gives these two files real, pretty urls (`route()`, not a
		// declared child — same fix as blogx/doc/page.js). A bare `doc/regions.md`
		// href used to 404 in console: `Router` never intercepts a link ending in an
		// extension, so it fell through to a full page load onto raw markdown.
		md("Every verdict, and the widths behind it: [readme](/imagine/decks/readme/) · [the content-kind map](/imagine/decks/doc/regions/) · [decisions](/imagine/decks/doc/decisions/).");
	},
});
