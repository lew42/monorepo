import { Page, View, div, span, md } from "/app.js";

/* Ported from Codrops' "Grid Item Hover Effect" (MIT) — see grid-hover.css for the
   licence note and what changed; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "grid-hover.css");

/* Container: a column of /imagine/'s row (the hub already calls columns()). Size: `fill`
   — a leaf under codrops/ (large), so it claims the row's leftover instead of sharing
   evenly with its parent (measured: 538px of dead space at 1920 on `large`, ~0 on `fill`).
   Own layout: prose, then a
   `.grid.auto` wall (the framework's grid word, `--column` set here) instead of the
   original's fixed `grid-template-columns: 300px`. Regions: one. Preview: default card —
   the parent's own still covers this page from outside. */

const VENUES = [
	["01", "#techno", "Pulse Club", "Venue", 210],
	["02", "#house", "Stellar Lounge", "Venue", 280],
	["03", "#dubstep", "Bass Arena", "Venue", 20],
	["04", "#ambient", "Halo Room", "Venue", 160],
	["05", "#disco", "Mirror Ball", "Venue", 320],
	["06", "#drum-n-bass", "The Foundry", "Venue", 40],
];

export default new Page({
	meta: import.meta,
	title: "Grid item hover effect",
	description: "Hover a card: the image zooms and four clipped corners fade in with its info.",
	icon: "grid_view",
	width: "fill",   // a leaf under codrops/ (large) under imagine/'s rail — `fill` claims
	                 // the row's leftover instead of sharing evenly with its `large` parent
	                 // (`layout` skill, the 3+-levels-deep rule; measured on this page: the
	                 // grid's first card sat 538px of dead space from the right edge at
	                 // 1920 on `large`, 0px on `fill`).

	content(){
		md("**Codrops' grid item hover effect, rebuilt.** Hover any card below (or tab to its link and press nothing — this one is mouse-only, noted at the end): the background zooms in and four corner panels — number, tags, name, category — fade up over it.");

		div.c("grid auto gap codrops-grid", () => {
			VENUES.forEach(([num, tag, name, cat, hue]) => {
				div.c("codrops-card").style("--codrops-card-bg", `linear-gradient(155deg, hsl(${hue} 70% 45%), hsl(${(hue + 40) % 360} 70% 30%))`).append(() => {
					div.c("codrops-card-img");
					div.c("codrops-card-box codrops-card-box--a", () => span.c("codrops-card-num", num));
					div.c("codrops-card-box codrops-card-box--b", () => span.c("codrops-card-tags", tag));
					div.c("codrops-card-box codrops-card-box--c", () => span.c("codrops-card-name", name));
					div.c("codrops-card-box codrops-card-box--d", () => span.c("codrops-card-cat", cat));
				});
			});
		}).style("--column", "13em");

		md("**What carried over:** the card shape (four clip-cornered info panels over a zooming image) and its CSS — clip-path, `backdrop-filter`, transform. **What didn't:** the grid track (`.grid.auto` + `--column` here, not a fixed `300px` column), and the direction-aware hover — the original tracks the pointer with GSAP to animate the image's transform-origin per corner (three JS classes, `card1`/`card2`/`card3`); this page uses one plain `:hover` transition instead, so the images are placeholder gradients rather than photos and the effect is the same on every edge of the card. `prefers-reduced-motion` keeps the fade, drops the zoom and slide.");
	},
});
