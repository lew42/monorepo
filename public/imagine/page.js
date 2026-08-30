import { Page, View, md } from "/app.js";

View.stylesheet(import.meta, "imagine.css");

/* Container: the app's page region — a columns host stretches to fill it. Size: this
   page is a `small` 14em rail and nothing else; every section opens to its right on
   its own word. Own layout: core's column row, one call. Regions: one per column,
   core's. Preview: the default card.

   THE ROOT IS THE EXPERIENCE. There is no prose page here to read before you arrive:
   the rail is on screen at the first paint, `Start` is already open beside it (the
   `default` column — doc/method/default_column.md), and every deeper thing in the
   place — a person, a lane, a room three realms down — is another column in THIS row.
   One host, one crumb strip, one horizontal scroller, whatever url you land on cold.

   ⚠ `children` is an ARRAY so it can mix. A string declares a real directory and core
     loads its `page.js`; a POJO is written here. `start` is the only page in /imagine/
     that has no directory, because it has nothing of its own to say — it is this rail,
     drawn as cards. */

export default new Page({
	meta: import.meta,
	title: "Imagine",
	description: "A place made of column pages — a team to run, a world to walk, and three trees of variations.",
	icon: "auto_awesome",

	width: "small",

	/* One level: the rail and Start's card wall both draw MY children and stop there —
	   a section's own columns arrive when you open it. Without this the place cost 92
	   page.js modules to show 15 (measured 2026-08-30). doc/declaring.md. */
	depth: 1,

	initialize(){ this.columns(); },

	children: [
		{
			title: "Start",
			icon: "grid_view",
			width: "large",

			// The one word that makes the place open instead of arriving empty.
			classes: "default",

			content(){
				md("**Pick a way in.** A card below, or the rail beside it — same urls, same row. Nothing here opens a new screen.");

				// My siblings, drawn by themselves. `previews()` takes a subset because
				// this page is the index and an index does not list itself.
				this.parent.previews(new Map([...this.parent.children].filter(([name]) => name !== this.name)))
					.style("--column", "15em");

				md("Everything you change is remembered by **url** — the team's board and your run in the world both survive a reload, keyed on the page's own address ([how](/imagine/readme/)).");
			},
		},

		"team", "game", "gallery", "scenes", "vary", "screens", "shells", "feeds", "mag", "blogx", "decks", "youtube", "cms", "research", "stream",
	],
});
