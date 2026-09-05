import { md } from "/app.js";
import { Paging } from "../paging.js";

/* Container: a column in /imagine/'s row. Size: `large` (28–64em) — enough width for
   a left/right toolbar to sit beside real content without the demo lying about the
   room a reader actually has. Own layout: prose, then the stage (toolbar, box, two
   rows). Regions: one, core's — `index: true` from `Paging.column()`, since `items()`
   already draws the two children below. Preview: core's card.

   THE READER SWITCHES THIS PAGE'S OWN TOOLBAR, LIVE — eight placements × five surfaces,
   no navigation, which is the owner's ask verbatim ("top toolbars, left toolbars, right
   toolbars, bottom toolbars, both in the card, and outside the card"). `toolbars/<side>/`
   below are the four stops worth a url: each lands `inside` a card, still switchable. */

export default new Paging({
	meta: import.meta,
	title: "Toolbars",
	description: "Where the mode toolbar sits — top, left, right or bottom, inside the card or outside it — across all five surfaces.",
	icon: "web_asset",
	width: "large",
	axes: "toolbar style",

	takeaway: "**A page's own toolbar can sit in eight places — top, left, right or bottom, and inside the card or outside it.** Press a chip and THIS page's toolbar moves; nothing navigates, so you can compare all eight without leaving.",
	children: "top left right bottom",

	content(){
		this.lede();

		md("**Eight placements, one seam.** `top left right bottom` × `inside` (a flex child of the box — on `card` that is literally inside the white padded shadowed frame) or `outside` (a sibling of the box, on the stage). Same call the other three axes already make: `page.pick(\"toolbar\", \"left-outside\")` — [code](" + this.url + "code/).");

		this.paging();

		md("**On `card`** the difference reads at a glance: `outside` sits on the ambient floor above/beside the white box, `inside` shares its padding and shadow. On `plain` `tint` `prim` `dark` there is no separate frame, so the two only differ in flow order — still real, just quieter.");

		md("Four of the eight are worth a url of their own, each landing `inside` a card and still switchable: " + ["top", "left", "right", "bottom"].map(w => "[" + w + "](" + this.url + w + "/)").join(" · ") + ".");
	},
});
