import { div, h2, md } from "/app.js";
import { Paging } from "../paging.js";
import { card } from "./templates.js";
import { FAMILIES } from "./families.js";

/* ── layout, answered before the first factory call ────────────────────────────
   1 CONTAINER  /imagine/ is a columns host, so this is ONE COLUMN in its row.
                No page grid down here — content sits in `.page-column-prose`,
                `wide` means nothing, only `bleed` reaches the edge.
   2 SIZE       `large` — 28–64em: 421px at 1280, 1152 at 3440. Eleven cards, each
                holding a live miniature, want the growth; the prose above them
                keeps its measure whatever the row does.
   3 OWN LAYOUT prose, then ONE tile wall (approved layout 4): `grid auto gap` with
                a real `--column: 21em`, so 3440 gets four tracks and 400 gets one.
                Each card is a heading, a framed stage, one sentence, a link.
   4 REGIONS    one — core's. The eleven family pages are columns of the SAME row,
                not regions of this page. `index: true`, so core leaves its rail out:
                the wall below already names every child once.
   5 PREVIEW    core's default card, on the paging hub's wall.

   ⚠ NO MODE TOOLBAR HERE, the same reason the paging hub has none: this is the page
     that says what a template IS. The chips live on the eleven family pages, over an
     example that is worth repainting.                                              */

export default new Paging({
	meta: import.meta,
	title: "Templates",
	description: "Eleven whole-page shapes you can start from, each drawn by its own real machinery.",
	icon: "dashboard_customize",
	width: "large",

	index: true,
	depth: 1,
	axes: "",

	takeaway: "**A template is a whole page shape you can start from; pick one, and the page you make wears it.** Everything else in this realm is about ONE box — what a click does to it, what surface it wears. A template is the rung above that: the shape of a whole page, already built and already in use somewhere on this site.",

	children: "magazine blog screens shells decks columns layouts sections ui ux navigation theming",

	content(){
		this.lede();

		md("**Every picture below is the real thing running, not a screenshot.** The magazine cover is `/imagine/mag/`'s own cover code. The blog lead is `Post.hero()` over a real post. The screens split is `screens/screen.js`'s own `area()`. The shell is a real `Shell`, and its rail links to real shells. Click any of them.");

		md("Open a family and you get the same example again, bigger, with **chips over it** — five surfaces and three type scales — so you can see the same template under every colour and every type scale this site has. That is what \"pick a template\" has to mean before it can mean anything else.");

		h2("The eleven families");

		div.c("templates-wall grid auto gap", () => FAMILIES.forEach(family => card(family)))
			.style("--column", "21em");

		h2("Colour and typography, over one template");

		md("The chips on a family page repaint ONE example. [The theming wall](/imagine/paging/templates/theming/) puts all fifteen at once — five surfaces × three type scales, over the same blog section — with the token that does each one named beside it.");

		h2("What Make cannot say yet");

		md("Every family page ends with the one line [Make](/imagine/paging/make/) would need to build a page wearing that template. Today Make's line is `Title: style content mechanism` — three words, and **not one of them is a template**. The exact grammar the four families above would need is written up as a proposal, with what it costs: [doc/templates.md](/imagine/paging/doc/templates.md).");

		md("The rest of the realm: [Paging](/imagine/paging/) · [Mechanisms](/imagine/paging/mechanisms/) · [Styles](/imagine/paging/styles/) · [Make](/imagine/paging/make/) · [the templates readme](/imagine/paging/templates/readme/).");
	},
});
