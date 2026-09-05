import { div, h2, p, span, a, icon, md } from "/app.js";
import { Paging } from "../paging.js";
import { DEFAULT } from "../blocks.js";

/* Container: the app's middle. Size: prose at the measure, the stage on `wide` —
   a left or right bar beside real content needs the leftover. Own layout: a
   sentence, one live page, a nav grid of four. Regions: one. Preview: core's card,
   in the rail's Toolbars section.

   ⚠ FOUR URLS, NO DIRECTORIES. `toolbars/top/`, `/left/`, `/right/` and `/bottom/`
     were four `page.js` files saying one word each; `route()` is core's own seam for
     a child that is not a directory, so the four urls survived the 2026-09-05
     rebuild and the four files did not. The owner's own complaint about these pages
     — 981px-wide buttons with 50px of padding and a hundred pixels of content — is
     answered by the stage, which lays its bar out at the width it is given.       */

const SIDES = {
	top:    { title: "Top",    icon: "vertical_align_top",    arrangement: "bar-top",    says: "A bar of controls above the content. It stays put; the content scrolls under it." },
	bottom: { title: "Bottom", icon: "vertical_align_bottom", arrangement: "bar-bottom", says: "The same bar underneath — a footer, or a phone's tab bar." },
	left:   { title: "Left",   icon: "format_align_left",     arrangement: "rail-left",  says: "A column of links before the content, sharing its top edge. This is what the app around you does." },
	right:  { title: "Right",  icon: "format_align_right",    arrangement: "rail-right", says: "The column after the content — a contents list, or a properties panel." },
};

class Bar extends Paging {

	content(){
		this.lede(this.line);

		this.stage({ ...DEFAULT, content: "article", room: "wide", arrangement: this.arrangement, surface: "card", background: "tint", navigation: "none" });

		h2("The other three");

		div.c("paging-cards", () => Object.entries(SIDES).forEach(([name, side]) => {
			if (name === this.side) return;

			a.c("paging-card").href("/imagine/paging/toolbars/" + name + "/").append(() => {
				span.c("paging-card-head", () => { icon(side.icon); span(side.title); });
				span.c("paging-card-say", side.says);
			});
		}));

		md("A bar is one value of [arrangement](/imagine/paging/arrangement/), which has seven. The numbered layouts they compile to live next door in [/imagine/layouts/](/imagine/layouts/).");
	}
}

export default new Paging({
	meta: import.meta,
	title: "Toolbars",
	description: "The same bar on four edges — top, bottom, left and right.",
	icon: "web_asset",

	index: true,
	depth: 0,

	content(){
		this.lede("Change the **arrangement** dropdown and the page's own bar moves. The content never changes.");

		this.stage({ ...DEFAULT, content: "article", room: "wide", arrangement: "bar-top", surface: "card", background: "tint", navigation: "none" });

		h2("The four, each at its own url");

		div.c("paging-cards", () => Object.entries(SIDES).forEach(([name, side]) =>
			a.c("paging-card").href(this.url + name + "/").append(() => {
				span.c("paging-card-head", () => { icon(side.icon); span(side.title); });
				span.c("paging-card-say", side.says);
			})));
	},

	// ⚠ `route()` sees UNDECLARED names only, so it can never shadow a real child.
	route(name){
		const side = SIDES[name];
		if (!side) return;

		return new Bar({
			title: side.title + " toolbar",
			label: side.title,
			icon: side.icon,
			description: side.says,
			side: name,
			arrangement: side.arrangement,
			line: side.says + " Change the **arrangement** dropdown to move it somewhere else.",
		});
	},
});
