import { Page, View, div, span, h3, p, button, md } from "/app.js";

/* Ported from Codrops' "Unreveal Effects" (MIT) — the circle variant (src/js/index2.js) —
   see circle-reveal.css for the licence note; the table on /imagine/codrops/ has the
   summary row. */
View.stylesheet(import.meta, "circle-reveal.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large under imagine/'s rail — `fill` claims the row's leftover; see
   grid-hover/page.js's comment for the measurement). Own layout: prose, then the stage (a
   fixed-height box holding a 2x2 grid and one absolutely-stacked detail panel). Regions:
   one. Preview: default card. */

const TILES = [
	{ num: "01", name: "Olalla", bg: "linear-gradient(155deg, hsl(210 70% 40%), hsl(250 70% 25%))", desc: "You could be my unintended choice to live my life extended." },
	{ num: "02", name: "El Búho", bg: "linear-gradient(155deg, hsl(20 70% 45%), hsl(0 70% 30%))", desc: "You could be the one who listens to my deepest inquisitions." },
	{ num: "03", name: "Nocturne", bg: "linear-gradient(155deg, hsl(280 70% 40%), hsl(320 70% 25%))", desc: "I'll be there as soon as I can, mending pieces of the life I had before." },
	{ num: "04", name: "Outsider", bg: "linear-gradient(155deg, hsl(150 60% 35%), hsl(190 60% 22%))", desc: "First there was the one who challenged all my dreams and all my balance." },
];

export default new Page({
	meta: import.meta,
	title: "Circle reveal",
	description: "Click a tile: a circle wipes out from your click and covers the stage with its detail.",
	icon: "vignette",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' Unreveal Effects, rebuilt.** Click any tile below: a circle grows out from exactly where you clicked and covers the whole stage with that tile's detail. Click **Back to grid** and the circle collapses back to that same point. The stage itself never moves, resizes or scrolls, and the url never changes — this is this realm's own [`swap`](/imagine/paging/mechanisms/swap/) mechanism, drawn as a **fifth swap visual**: a circular wipe instead of a tab strip, a sliding card, a cross-fade or a flip.");

		let $title, $desc;
		let stage_el;

		div.c("codrops-reveal-stage", ($stage) => {
			stage_el = $stage.el;

			div.c("codrops-reveal-grid", () => {
				TILES.forEach(tile => {
					div.c("codrops-reveal-tile", () => {
						span.c("codrops-reveal-tile-num", tile.num);
						span.c("codrops-reveal-tile-name", tile.name);
					})
						.style("--codrops-reveal-bg", tile.bg)
						.click(event => {
							const rect = stage_el.getBoundingClientRect();
							stage_el.style.setProperty("--rx", `${event.clientX - rect.left}px`);
							stage_el.style.setProperty("--ry", `${event.clientY - rect.top}px`);
							stage_el.style.setProperty("--codrops-reveal-detail-bg", tile.bg);
							$title.text(tile.name);
							$desc.text(tile.desc);
							stage_el.classList.add("is-open");
						});
				});
			});

			div.c("codrops-reveal-detail", () => {
				$title = h3.c("codrops-reveal-detail-title");
				$desc = p.c("codrops-reveal-detail-desc");
				button.c("codrops-reveal-back", "Back to grid").click(() => stage_el.classList.remove("is-open"));
			});
		});

		md("**What carried over:** the mechanism itself — a `clip-path: circle()` grown from the click point, unchanged — and the two-state shape (a grid, a detail panel stacked on top of it). **What didn't:** GSAP's timeline (the original staggers seven separate properties — image position, four text blocks, a back control — across ~1 second with `expo`/`power2` eases); this port is one CSS `transition: clip-path` and nothing else animates, so the detail's text simply appears rather than sliding and fading in behind the circle. The four tiles are placeholder gradients, not the original's photography. `prefers-reduced-motion` drops the transition — the circle jumps to its end state instead of growing.");
	},
});
