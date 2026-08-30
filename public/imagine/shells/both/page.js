import { Shell } from "../Shell.js";
import { div, md } from "/app.js";

/* Container: the app region, full viewport. Size: 13em + everything left + 13em
   — 26em of chrome before a word is read. Own layout: the one grid, all three
   columns. Regions: three. Preview: default card.

   The right rail deliberately does NOT repeat the nav: two rails only work when
   they have two jobs. Mirrored navigation is the failure this page is here for. */

export default new Shell({
	meta: import.meta,
	title: "Both rails",
	description: "Nav left, inspector right — and 26em of chrome before a word is read.",
	icon: "view_week",
	group: "Outer chrome",

	left(){ return this.rail("left"); },
	right(){ return this.rail("right", this.inspector); },

	// A rail with a second job. Mirroring the nav here is what makes two rails
	// read as a mistake — the eye gets no home edge.
	inspector(){
		div.c("shell-inner-title h4", "Inspector");
		div.c("shell-doc flow", () => md(`**Release 4.2**

Draft · 12 files changed

Owner: platform

Last build 6 min ago`));
	},

	finding: "two rails need two jobs. Nav on one side and an inspector on the other reads instantly; the same nav on both sides gives the eye no home edge — and at 1280 the pair costs 26em, leaving the document under half the screen.",
});
