import { div, md, h2 } from "/app.js";
import { Paging } from "../../paging.js";
import { PagingNavStack } from "../lab.js";

/* ── layout ────────────────────────────────────────────────────────────────────
   1 CONTAINER  the paging realm's middle. Prose in `main` (40em); the demo boxes
                claim `wide`.
   2 SIZE       `wide` is ~1000px at 1280 and ~2950px at 3440.
   3 OWN LAYOUT prose, two demo boxes, the rule.
   4 REGIONS    one — core's.
   5 PREVIEW    core's default card.                                              */

export default new Paging({
	meta: import.meta,
	title: "Reserved height",
	description: "A box that keeps its height whatever you put in it.",
	icon: "crop_free",

	takeaway: "**Press the three panel names in both boxes and watch the dashed line underneath each one.** In the first box the line moves every time, because the box resizes itself to fit the panel. In the second box it never moves.",

	content(){
		this.lede();

		div.c("grid auto gap paging-nav-pair wide", () => {
			this.box("A box that fits its content", "The panel you are not reading is not there at all, so the box is whatever the panel needs. Switch panels and the box resizes — and everything on the page below it moves by the difference.", false);

			this.box("A box with a reserved height", "Every panel is always in the box, stacked in one place, and the ones you are not reading are invisible rather than absent. So the box is always as tall as the TALLEST panel, and switching cannot change it.", true);
		});

		h2("The rule");

		md("Two lines of CSS, and no measuring, no JavaScript and no magic number — the browser works out the tallest panel because all of them are still there:\n\n```css\n.paging-nav-reserve { display: grid; }\n.paging-nav-reserve > * { grid-area: 1 / 1; }\n.paging-nav-hidden { visibility: hidden; }\n```\n\n`visibility: hidden` and not `display: none`, and that is the whole trick: a `display: none` panel is not measured, so the box would go back to fitting whichever panel is showing.");

		md("**What it costs.** Every panel is built and laid out even when you cannot see it, so this is for a handful of panels of similar weight — a form, a summary, a set of settings — not for forty of them or for anything expensive to build. The other answer for those is a height you choose ([the swap stage](/imagine/paging/mechanisms/swap/) uses a fixed one), and its cost is that a panel taller than the number you chose scrolls.");

		md("Measured, switching Overview to Pricing: the dashed line moved **252px at 1280 and 301px at 3440** in the first box, and **0px at both** in the second. On the real site, a swap into a box that fits its content moves it **259px**. [How every number was taken](/imagine/paging/navigation/doc/measurements/).");
	},

	box(name, says, reserved){
		return div.c("paging-nav-demo").ac(reserved && "paging-nav-reserved").append(() => {
			div.c("paging-nav-demo-name", name);
			div.c("paging-nav-demo-body", () => {
				md(says);
				new PagingNavStack({ reserved });
			});
		});
	},
});
