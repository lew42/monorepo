import { Page, md, h2, div, a, span, icon } from "/app.js";

// A tile: icon + name + a ONE-LINE MEANING under it — "familiar structure" (the
// owner, 2026-09-29). ux/Content's iconCard has no meaning line, so this small
// version is built here rather than stretching a shared component from inside
// this page's own fence. Tile 2 is "the powerful part" and reads bigger (w3);
// the other two are w2 — the same sizing classes iconCard itself uses.
const tile = ({ name, meaning, icon: ic, weight = 2, href }) =>
	a.c(`ux-content-icard w${weight}`, () => {
		icon(ic);
		span(name);
		span.c("muted", meaning).style({ fontSize: "0.8em", fontWeight: "normal" });
	}).href(href);

/* Dynamic pages — the owner's own words, 2026-09-29 (4:20 PM): "each path in and
   of itself is sort of like a page and we can have these kind of like arbitrary
   page, dynamic pages essentially is the name for pages that don't really exist
   ... we can still put data that gets fetched when a dynamic route loads and then
   looks at an index and realizes there's data there to be loaded ... it sort of
   kind of falls back to a templating thing."

   This page names the IDEA. The method it runs on — `route()` — already has its
   own doc page; this one is deliberately separate (`doc/property/route.md`).

   1 CONTAINER  the standard column — a README, not a demo.
   2 SIZE       standard width.
   3 OWN LAYOUT tile wall (one icon, one name, one meaning, each), then one short
                paragraph per idea, in the order that matters: what it IS, then
                the powerful part (data + one template), then where it already runs.
   4 REGIONS    none.
   5 PREVIEW    core's default card off `description` below. */

export default new Page({
	meta: import.meta,
	title: "Dynamic pages",
	description: "A url with no page.js and no folder saved for it, that still opens — because an ancestor page answered the name itself.",
	icon: "dynamic_feed",

	content(){
		md("**A dynamic page is a url nobody saved.** No `page.js`, no folder on disk — and it still opens, because the PARENT page catches the name the moment it's asked for and hands back a real page. Three ideas, in the order that matters:");

		div.c("card ux-content-section", () => div.c("ux-content-icards", () => [
			{ name: "The idea: a path is a page", meaning: "a url nobody saved still opens", icon: "route", weight: 2, href: "/framework/core/Page/dynamic/doc/idea.md" },
			{ name: "Data on disk + a template", meaning: "one folder of data, one template, many pages", icon: "widgets", weight: 3, href: "/framework/core/Page/dynamic/example/" },
			{ name: "Where it is used", meaning: "AI 2 cards and the day pages", icon: "smart_toy", weight: 2, href: "/framework/core/Page/dynamic/doc/uses.md" },
		].map(tile)));

		h2("1. The idea: a path is a page");
		md("A dynamic page opens because `child(name)` asks this page's own [`route()`](/framework/core/Page/doc/property/route.md) before it ever checks the filesystem — the method itself is documented there, not repeated here. Two small hard-coded demos show the idea plainly: [`overview/route/`](/framework/core/Page/overview/route/) (three urls from one object) and [`overview/folders/`](/framework/core/Page/overview/folders/) (a page built the moment you ask for it — the same way AI 2's own day and card pages are). More: [`doc/idea.md`](/framework/core/Page/dynamic/doc/idea.md).");

		h2("2. Data on disk + a template — the powerful part");
		md("`route()`/`child()` don't have to invent a page out of thin air. They can read a real file off disk — an `index.json` naming a few items, one small file per item — and hand each one to a **single template function** that draws every page the same way. A folder full of plain data, no `page.js` anywhere in it, and one function upstream doing the drawing: that is the whole trick. Live, working example, code beside the result, below: [`dynamic/example/`](/framework/core/Page/dynamic/example/).");

		md("A related, even simpler built-in version of the same idea already ships: a child named in `page.jsonl` builds a whole page from log lines alone, no `page.js` and no `route()` either. [`core/Page/jsonl/`](/framework/core/Page/jsonl/) is that page, live.");

		h2("3. Where it is used");
		md("Two real, already-running systems build their pages exactly this way — the file each one reads, and the template that draws it: [`doc/uses.md`](/framework/core/Page/dynamic/doc/uses.md).");

		md("How `route()` itself works, as a method — separate from this idea, and worth its own read: [`doc/property/route.md`](/framework/core/Page/doc/property/route.md).");
	},
});
