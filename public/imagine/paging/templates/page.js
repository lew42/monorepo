import { div, h2, p, md } from "/app.js";
import { Paging } from "../paging.js";
import { card } from "./templates.js";
import { FAMILIES } from "./families.js";

/* Container: the app's middle. Size: prose at the measure; the wall is a `grid auto`
   with a real `--column: 21em`, so 3440 gets four tracks and 400 gets one. Own
   layout: one sentence, then one wall. Regions: one — the eleven family pages are
   siblings in the app's middle. Preview: core's card, in the rail's Templates
   section.

   ⚠ NO STAGE HERE. This page's job is to let you pick a shape by LOOKING at it; the
     eleven cards are eleven live miniatures, and the hover toolbar lives on the
     family page you open. */

export default new Paging({
	meta: import.meta,
	title: "Templates",
	description: "Eleven whole-page shapes the rest of this site already ships, each drawn by its own real code.",
	icon: "dashboard_customize",

	index: true,
	depth: 1,

	children: "magazine blog screens shells decks columns layouts sections ui ux navigation theming",

	content(){
		this.lede("Every picture below is the real thing running. Click one to open it with the colour and type controls over it.");

		div.c("templates-wall grid auto gap wide", () => FAMILIES.forEach(family => card(family)))
			.style("--column", "21em");

		h2("Colour and typography, over one template");

		md("[The theming wall](/imagine/paging/templates/theming/) puts fifteen at once — five surfaces x three type scales, over the same blog section — with the declaration that does each one named beside it.");

		md("These eleven are shapes the SITE already has. The [library](/imagine/paging/library/) is the other half: twelve shapes this realm builds out of its own five words, which you can configure and save.");
	},
});
