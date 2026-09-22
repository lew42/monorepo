import { Page, md } from "/app.js";

/* Container: a plain top-level page (a real url under /layouts/, not a columns host — the
   parent isn't one). Size: `full`, same word /imagine/design/'s index wears for the same
   reason — the cards below are a wall, not a reading column. Own layout: `index: true` +
   previews() — the cards ARE the nav, so core leaves the plain link-row list out. Regions:
   none. Preview: the default card.

   WHAT THIS PAGE IS FOR. Six labs where an arrangement got tried before it earned an id in
   the book at /layouts/ — an app shell, what a click does to your screen, a horizontal band,
   a blog shell at 3440, a magazine page, a deck cut into regions. They used to live under
   /imagine/ as separate shape experiments; moved here 2026-09-18
   (ai/2026-09-18/imagine-move-3/) so /layouts/ owns both the names AND the labs that found
   them. Every old /imagine/<name>/ address still answers — a one-line stub page points back
   here — because production is static and there is no server-side redirect. */
export default new Page({
	meta: import.meta,
	title: "Labs",
	description: "Seven shape experiments — arrangements played with before they earned a name in the book above.",
	icon: "science",
	width: "full",
	index: true,

	children: "shells screens sections blogx mag decks trees",

	content(){
		md("**Seven labs where an arrangement got tried before it earned an id above.** Each one built and proved one shape: an app shell, what a click does to your screen, a horizontal band, a blog shell at 3440, a magazine page, a deck cut into regions, a spatial tree drawn three ways. Six moved here from `/imagine/` on 2026-09-18 — the old addresses still work, each a one-line pointer back to this page.");
		this.previews().style("--column", "20em");
	},
});
