import { div } from "/app.js";
import { Screen, area } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* PROGRESSIVE DIVISION, the other axis — and the two axes are not symmetrical.

   The row divides horizontally for free: a hop is a column, the columns already open
   stay, and the arrangement is a width word. The HEIGHT has no row to open into, so
   every band count is a screen that DRAWS that many bands, and each hop replaces the
   one before it (`full`, the default here). Same urls, same crumb strip, but the
   previous state is gone rather than narrower. */

export default new Screen({
	meta: import.meta,
	title: "Stack",
	description: "The height has no row, so each band count is a new screen.",
	icon: "view_agenda",
	shapes: ["v1", "v1 1", "v1 1 1"],

	content(){
		area("One", "One band, which is the same thing as one screen. Click to split the height.", here + "two/");
	},

	children: [
		new Screen({
			title: "Two",
			content(){
				div.c("screens-col", () => {
					area("Top", "This screen redrew: the one before it is gone, not narrower.", this.url + "three/");
					area("Bottom", "Both bands are one page. There is no url for a band.", this.url + "three/");
				});
			},

			children: [
				new Screen({
					title: "Three",
					content(){
						div.c("screens-col", () => {
							area("Top", "Three bands.");
							area("Middle", "A stack is drawn, not opened — which is why it costs a page each time.", here);
							area("Bottom", "Start over?", here);
						});
					},
				}),
			],
		}),
	],
});
