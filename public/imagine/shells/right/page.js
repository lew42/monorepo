import { Shell } from "../Shell.js";

/* Container: the app region, full viewport. Size: everything left over, then a
   13em rail. Own layout: the one grid, `main` + `right`. Regions: two. Preview:
   default card. Same document as every other outer permutation. */

export default new Shell({
	meta: import.meta,
	title: "Right rail",
	description: "The same nav on the far edge — and it stops reading as the way through.",
	icon: "view_array",
	group: "Outer chrome",

	right(){ return this.rail("right"); },

	finding: "identical markup, different meaning — a rail on the trailing edge reads as ABOUT the content (tools, filters, context), so navigation put there is found last. Keep the right rail for the inspector.",
});
