import { Page, md, demo, code, files, h2, div, p, a, span, icon, toc } from "/app.js";
import sample from "./sample.js";

/* Five real child pages, each ONE of the arrangements this page describes, so the
 * links below go somewhere that actually is what it claims. They are declared as
 * names — the cheap half of `children` — and loaded up front only because the
 * preview wall below wants their real titles and icons.
 *
 * `route()` adds a sixth that has no directory at all, which is the point of the
 * "dynamic" section: the url exists, it is linkable, and nothing on disk says so. */
export default new Page({
	meta: import.meta,
	title: "Page layouts",
	description: "What a page can be: measured, wide, dashboard, full — and how sub-pages sit inside each.",
	icon: "dashboard",

	children: "measured breakout dashboard full",


	initialize(){ this.load_all_children(); },

	/* A url with no file behind it. `Page.child()` walks the DECLARED names first,
	 * so a dynamic name can never shadow a page.js, and this runs only when nothing
	 * matched — which is why it costs no failed import. */
	route(name){
		if (!/^\d+$/.test(name)) return;

		return {
			title: "Item " + name,
			classes: "paper",
			content(){
				md(`This page is \`/framework/core/Page/layouts/${name}/\`. **There is no directory.** The parent claimed the segment because it matched \`/^\\d+$/\`, and built this page on the spot.`);
				md("Try any other number in the url. Try a word, and you get a 404 — the guard is the whole of the routing table.");
				a.c("page-link", "← back").href("/framework/core/Page/layouts/");
			},
		};
	},

	content(){

		toc();

		md("A page is a `div.page` in a region. **Everything else is a class it opted into** — there is no layout tier, no template to extend, and no arrangement object. This page is the catalogue.");

		h2("The measure is two tokens");

		code.css(`--measure     /* the reading column: 60em, or none */
--page-pad    /* the inset: 3em 4em, or 0 */`);

		md("Set them on a **region** and every page in it inherits; set them on a **page** and that page wins, because a value declared on an element always beats one it inherited. That is the whole opt-out mechanism — no specificity ladder, no `@layer` fight.");

		code.js(`div.c("pages papers")        // every page in this region gets the sheet
classes: "paper"             // just this one`);

		h2("The four arrangements");

		md("Each of these is a real page — click through and the url is the proof.");

		this.previews();

		md(`| | \`--measure\` | \`--page-pad\` | reach for it when |
|---|---|---|---|
| **Measured** | \`60em\` | \`3em 4em\` | prose. The default, and right for most docs |
| **Breakout** | \`60em\` for prose | grid tracks | prose that occasionally needs a wide demo or two columns |
| **Dashboard** | \`none\` | \`2em\` | a wall of cards, a gallery, an index |
| **Full** | \`none\` | \`0\` | the thing IS the page — a layout, a canvas, a map |`);

		h2("Breaking out of the measure");

		md("The hard case: a page of prose that wants **one** wide thing in the middle of it. Negative margins are the reflex and they are a trap — `margin-inline: -8em` is identical until the window is narrower than the measure, and then it is horizontal overflow on every page that used it.");

		md("`classes: \"breakouts\"` makes the page a **five-track grid** instead. Prose lands in the middle track; a child marked `.wide` or `.bleed` takes more. The outer tracks are `1fr` and `minmax(0, …)`, so they collapse to nothing before the measure gives up a pixel — it cannot overflow.");

		code.js(`classes: "breakouts",
content(){
    md("Ordinary prose sits in the measure.");
    demo(chart).ac("wide");             // wider
    div.c("bleed", () => banner());     // edge to edge
}`);

		md("[See it live](/framework/core/Page/layouts/breakout/) — the prose column stays readable while a demo and a banner escape it.");

		h2("Previews that arrange themselves");

		md("`this.previews()` draws a card per child. It works before those children exist, so it only ever uses what the parent already knows — the name, and the url that name must have. Add `load_all_children()` and the cards draw with real titles and icons.");

		demo(sample.wall, "An `auto-fill` wall. The count changes with the width and no media query was written.");

		md("A card can ask for a share of that wall, which is the dashboard arrangement with no second component:");

		code.js(`.page-preview.wide   // grid-column: span 2
.page-preview.tall   // grid-row: span 2
.page-preview.big    // both`);

		demo(sample.dashboard, "Same `grid gap auto`, three cards asking for more room. At one column the spans clamp themselves — a `.wide` card degrades to an ordinary one, with no query.");

		h2("Urls with no file behind them");

		md("`route(name)` is how a page owns urls it could not list in advance. It runs **after** the declared children and before the 404, so a dynamic name costs no doomed import and structurally cannot shadow a `page.js`.");

		code.js(`route(name){
    if (!/^\\d+$/.test(name)) return;
    return { title: "Item " + name, content(){ … } };
}`);

		md("This page does exactly that. [Try /42/](/framework/core/Page/layouts/42/), or [/1999/](/framework/core/Page/layouts/1999/) — neither exists on disk. A word gives you a 404, because the guard *is* the routing table.");

		md("The eight layout demos use the same seam for their full-size views: `route(name){ return name === \"full\" && full(this, layout); }` — eight directories deleted, eight urls kept.");

		h2("What a page is, on disk");

		files(import.meta, "page.js measured/page.js breakout/page.js dashboard/page.js full/page.js sample.js");

		md("Nothing crawls the filesystem, so **`children` is the registration.** A folder nobody declared is a 404, and a name that is declared but not yet visited has not been imported.");

		md("Next: [Page flow](/framework/core/Page/flow/) — the vertical rhythm inside whichever of these you pick.");
	}
});
