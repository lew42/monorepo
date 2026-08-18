import { Page, demo, Sidebar, div, span } from "/app.js";
import { site } from "../web.js";

export default new Page(demo.layout({
	meta: import.meta,
	title: "Sidebar",
	description: "A fixed panel beside fluid content — two utility classes, no rule.",
	icon: "view_sidebar",
	group: "Apps",

	twin: true,
	parts: "footer",

	note: "**A real `Sidebar`, not a shape.** `new Sidebar({ pages }).ac(\"basis\").style(\"--basis\", \"var(--sidebar)\")` is the same View this site's own `/framework/` rail uses, so the token and the active-row highlight can never disagree with the real nav. `flex gap wrap` re-flows the pair at its own width: side by side at 1440 and 1000, stacked at 390, where the panel keeps its fixed basis on whichever line it wraps to.",

	layout(){

		/* `full`, because a navigation panel that stops short of the region's edge is a
		   list, not a rail. NO `fill`, and that was measured: a wrapping flex row sizes
		   its line to its CONTENT, so `fill`'s clip would cut the bottom of the article
		   with nothing to scroll it. The page grows and the region scrolls. */
		return div.c("page full flex v", () => {

			/* `wrap` plus a `22em` basis on the article, and no breakpoint: 19em + 22em
			   fits at 1440 and at 1000, and runs out at 390, where the panel drops above
			   the reading. The Sidebar's own query turns it into a top bar at 52em, so the
			   stacked result is a bar over an article. */
			div.c("flex gap wrap flex-1").style("minHeight", "0").append(() => {

				/* ⚠ The header REPLACES Sidebar's `brand()`, which is the element carrying
				   the panel's inset — a bare span sits flush against the edge. */
				new Sidebar({
					pages: this.parent.rail(),
					header: () => div.c("brand", () => span.c("h4", "LAYOUTS")),
					footer: null,
				}).ac("basis").style("--basis", "var(--sidebar)");

				div.c("flow pad", () => site.sections(3))
					.style({ flex: "1 1 22em", minWidth: "0" });
			});

			if (this.shows("footer")) site.footer();
		});
	},
}));
