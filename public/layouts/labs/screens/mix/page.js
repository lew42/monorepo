import { div } from "/app.js";
import { Screen, area } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* BOTH AXES AT ONCE. The row opens a column, and that column splits its own height —
   so a screen can be a cover on the left and a two-band stack on the right, and the
   bands are click targets that open a THIRD column. Three areas, two axes, one row.

   The limit is the honest one: a band has no url. The right column is one page whose
   content happens to be two boxes, so the state "top band, expanded" does not exist.
   What a band can do is open a column, which is what these do. */

export default new Screen({
	meta: import.meta,
	title: "Mix",
	description: "A column that splits its own height.",
	icon: "dashboard",
	shapes: ["1", "1 1/2", "1 1/2 1"],

	content(){
		area("Mix", "One screen. Click to open a column that divides its own height.", here + "two/");
	},

	children: [
		new Screen({
			title: "Two",
			width: "fill",

			content(){
				div.c("screens-col", () => {
					area("Top", "A band. It has no url of its own — but it can open one.", this.url + "detail/");
					area("Bottom", "The same band, the same column. Both open the same third screen.", this.url + "detail/");
				});
			},

			children: [
				new Screen({
					title: "Detail",
					width: "fill",
					content(){ area("Detail", "Three areas across two axes, and every one of them is still a column in the same row. Start over?", here); },
				}),
			],
		}),
	],
});
