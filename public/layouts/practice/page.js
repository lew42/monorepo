import { Page, div, a, span, p, img, md } from "/app.js";
import Practice from "./Practice.js";

/* ── /layouts/practice/ — three layouts you can open ──────────────────────────
   LAYOUT, the five questions. Container: a page in `app.$pages` under
   `/layouts/`, so the ordinary page grid — `main` is the reading track, `wide`
   is every pixel left of the gutters. Size: three picture cards side by side,
   which is two columns more than `main` can hold, so the wall claims `wide`
   (3260px at 3440) and the sentences stay in `main`. Own layout: three fixed
   tracks above 58rem and one below — three is the COUNT, so writing `3` is
   honest and a hole is impossible. Regions: two — the sentences, and the wall.
   Preview: the card `/layouts/` draws from `description`.

   WHAT THIS PAGE IS FOR. Three whole-page layouts, shown at 1920, each one click
   from here. Nothing else lives on this page: the reasoning, the measurements
   and the small forms are all on the layout's own page, behind its fold.       */

export default new Page({
	meta: import.meta,
	title: "Practice",
	icon: "design_services",
	description: "Three big layouts that span 3440 and hold at 400 — a workbench, a reader and a catalog, each with every decision one click down.",

	children: "workbench reader catalog doc",

	content(){
		md("**Three whole pages, built to be judged.** Each holds at 3440 and at 400, filled with this site's own content. Open one — the layout IS the page, and every decision is in the fold at the bottom.");

		/* Three across, or one — never two, because three cards in two columns is
		   a hole. The switch is an `auto-fit` clamp in practice.css, which also
		   records the two ways this went silently wrong first. */
		div.c("std-practice-index wide", () => {
			Practice.LAYOUTS.forEach(entry => {
				a.c("std-practice-card").href(entry.url).append(() => {
					img.c("std-practice-card-shot")
						.attr("src", Practice.shot(entry.id, 1920))
						.attr("alt", entry.name + " at 1920 pixels wide")
						.attr("loading", "lazy");

					div.c("std-practice-card-say", () => {
						span.c("std-practice-card-name", entry.name);
						p.c("std-practice-card-line", entry.card);
						span.c("std-practice-card-id", entry.layout);
					});
				});
			});
		});

		md("**Two of the three are the same id.** The Workbench and the Reader are both [`3-holy-grail`](/layouts/3-holy-grail/) — a narrow column, a wide one, a narrow one — because an id names how the room is divided and nothing else. A workbench and an article page really are one layout wearing different content, which is the whole reason [the namespace works that way](/layouts/doc/naming/).");

		md("**None of these is a sixth approved layout.** Each is an instance of a shape that [the approved five](/layouts/doc/studies/approved/) already closed: the Workbench and the Reader are shape 2, the Catalog is shape 1, and all three put shape 4 inside. What was settled, what was measured and what was left is in [`doc/decisions`](/layouts/practice/doc/decisions/).");
	},
});
