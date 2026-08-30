import { Screen, area } from "../screen.js";

const here = new URL(".", import.meta.url).pathname;

/* AN UNEVEN SPLIT. Every other experiment here divides the row evenly, because every
   `fill` column asks for the same 100% basis. A BASIS is a share: three columns asking
   for 61.8%, 38.2% and 20% are shrunk in proportion to what they asked for, so those
   numbers ARE the ratio, at every width, with no grow weights and no arithmetic.

   Hop two is the golden section exactly. Hop three does not reset it — the third
   column joins the pair, so the shares normalise to about 3.1 : 1.9 : 1. Ratios here
   compose; they are not re-declared per state, and that is the honest trade. */

export default new Screen({
	meta: import.meta,
	title: "Uneven",
	description: "A basis pair is the ratio, exactly.",
	icon: "straighten",
	classes: "screens-major",
	shapes: ["1", "1.618 1", "3.1 1.9 1"],

	content(){
		area("Whole", "One column asking for 61.8% of a row it is alone in still gets all of it. Click to let a second one in.", here + "golden/");
	},

	children: [
		new Screen({
			title: "Golden",
			width: "fill",
			classes: "screens-minor",
			content(){ area("38.2", "The golden section, from two numbers in a stylesheet. Add a third?", this.url + "thirds/"); },

			children: [
				new Screen({
					title: "Thirds",
					width: "fill",
					classes: "screens-least",
					content(){ area("20", "Three shares now — about 3.1 : 1.9 : 1. Start over?", here); },
				}),
			],
		}),
	],
});
