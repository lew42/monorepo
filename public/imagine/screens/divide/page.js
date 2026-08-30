import { Screen, area } from "../screen.js";

// Resolve against import.meta, never the document — the SPA fallback makes the
// document url the route, and every hop below is written as a path from here.
const here = new URL(".", import.meta.url).pathname;

/* PROGRESSIVE DIVISION, the horizontal axis. Each hop is a real url and a real column,
   so the screen splits by OPENING one — nothing re-renders, nothing animates, and the
   screens already open just take a smaller share. `fill` is the whole of it. */

export default new Screen({
	meta: import.meta,
	title: "Divide",
	description: "Each hop opens a column; the rest share the row.",
	icon: "view_column",
	shapes: ["1", "1 1", "1 1 1", "1 1 1 1"],

	content(){
		area("One", "The whole screen — the crumb strip above is the only chrome. Click anywhere to split it.", here + "two/");
	},

	/* Written here rather than as four directories: the permutation IS the chain, and a
	   chain you can read in one file is the point of the experiment. Core gives each one
	   its url when it is adopted, so /divide/two/three/four/ cold-loads exactly the same. */
	children: [
		new Screen({
			title: "Two",
			width: "fill",
			content(){ area("Two", "Halves. The screen you came from is still here, at half the width.", this.url + "three/"); },

			children: [
				new Screen({
					title: "Three",
					width: "fill",
					content(){ area("Three", "Thirds, from three identical fill columns. One more?", this.url + "four/"); },

					children: [
						new Screen({
							title: "Four",
							width: "fill",
							content(){ area("Four", "Quarters — and past this the row scrolls instead of shrinking. Start over?", here); },
						}),
					],
				}),
			],
		}),
	],
});
