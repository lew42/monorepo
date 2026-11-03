import { Page, View, div, span, h3, p, button, md } from "/app.js";

/* Ported from Codrops' "Grid Zoom" (MIT) — see grid-zoom.css for the licence note; the
   table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "grid-zoom.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large — `fill` claims the row's leftover; see grid-hover/page.js's comment for
   the measurement). Own layout: prose, then the stage — a 4x3 grid of tiles, one FLIP
   transform on the clicked tile, a content panel over the right 54%. Regions: one.
   Preview: default card. */

const TILES = [
	{ num: "01", title: "Masses", desc: "In theory, everybody buys the numerous products of civilization.", hue: 210 },
	{ num: "02", title: "Invisible", desc: "The invisible government tends to be concentrated in the hands of the few.", hue: 20 },
	{ num: "03", title: "Mechanism", desc: "Vast numbers of human beings must cooperate in this manner if they are to live together.", hue: 280 },
	{ num: "04", title: "Opinion", desc: "Public opinion is the result of a group's continual persuasion.", hue: 150 },
	{ num: "05", title: "Groups", desc: "Small groups of persons dominate the thinking of the majority.", hue: 45 },
	{ num: "06", title: "Persuasion", desc: "The conscious manipulation of the habits and opinions of the masses.", hue: 320 },
	{ num: "07", title: "Structure", desc: "Society's structure and habits give it a shape one can propagandize.", hue: 190 },
	{ num: "08", title: "Leaders", desc: "A relatively small number of persons understand the mental processes of the masses.", hue: 10 },
	{ num: "09", title: "Democracy", desc: "In almost every act of our daily lives we are dominated by a small number.", hue: 260 },
	{ num: "10", title: "Control", desc: "Those who manipulate this unseen mechanism constitute an invisible government.", hue: 100 },
	{ num: "11", title: "Society", desc: "Our minds are molded, our tastes formed, our ideas suggested, largely by men we have never heard of.", hue: 340 },
	{ num: "12", title: "Legacy", desc: "This is a logical result of the way our democratic society is organized.", hue: 60 },
];

export default new Page({
	meta: import.meta,
	title: "Grid zoom",
	description: "Click a tile: it scales up to become the detail image beside its text.",
	icon: "zoom_in",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' Grid Zoom, rebuilt.** Click any tile below: it scales up (a real transform computed from its own measured position — the FLIP technique, no library) to become the detail image on the left, while its text fades in on the right. Click **Back to grid** and it shrinks back to exactly the cell it came from.");

		let $title, $num, $desc, stage_el, current_tile = null;

		div.c("codrops-zoom-stage", ($stage) => {
			stage_el = $stage.el;

			div.c("codrops-zoom-grid", () => {
				TILES.forEach(tile => {
					const $tile = div.c("codrops-zoom-tile", tile.num)
						.style("--codrops-zoom-bg", `linear-gradient(155deg, hsl(${tile.hue} 65% 40%), hsl(${(tile.hue + 40) % 360} 65% 25%))`);
					$tile.click(() => this.open_tile($tile.el, tile, stage_el, (t) => {
						current_tile = t;
						$num.text(tile.num);
						$title.text(tile.title);
						$desc.text(tile.desc);
					}));
				});
			});

			div.c("codrops-zoom-content", () => {
				$num = span.c("codrops-zoom-content-num");
				$title = h3.c("codrops-zoom-content-title");
				$desc = p.c("codrops-zoom-content-desc");
				button.c("codrops-zoom-back", "Back to grid").click(() => {
					stage_el.classList.remove("is-open");
					if (current_tile) current_tile.classList.remove("is-hero");
					current_tile = null;
				});
			});
		});

		md("**What carried over:** the FLIP idea itself — measure the tile's own rect, compute the scale/translate that lands it on the target spot, let one CSS `transition: transform` do the rest — same technique the original's GSAP Flip plugin automates. **What didn't:** the original's five extra JS modules (`grid.js`, `contentItem.js`, `imageCell.js`, `textReveal.js`, `textLinesReveal.js`) staggering per-character text reveals and a prev/next thumbnail strip beside the open image; this port is one `click()` handler doing the maths GSAP Flip would have and a plain fade for the text. The grid keeps its own fixed `grid-template-columns` rather than the framework's `.grid.auto` — like circle-reveal before it, this is a bounded geometric composition the transform measures, not a flowing content wall. `prefers-reduced-motion` drops both transitions — the panel and the tile jump to their end state.");
	},

	/* THE FLIP MATH. `tile_el`'s OWN measured rect (First) maps onto the content panel's
	   left edge (Last) via one `translate() scale()` with `transform-origin: 0 0` — the
	   textbook three-line version of what a FLIP library automates. Called from the click
	   handler so DOM reads happen before the class that starts the transition (no
	   after-await DOM capture — CLAUDE.md's own trap). */
	open_tile(tile_el, tile, stage_el, on_open){
		if (stage_el.classList.contains("is-open")) return;

		const stage_rect = stage_el.getBoundingClientRect();
		const start = tile_el.getBoundingClientRect();
		const target = { left: stage_rect.left, top: stage_rect.top, width: stage_rect.width * 0.46, height: stage_rect.height };

		tile_el.style.setProperty("--zoom-dx", `${target.left - start.left}px`);
		tile_el.style.setProperty("--zoom-dy", `${target.top - start.top}px`);
		tile_el.style.setProperty("--zoom-sx", target.width / start.width);
		tile_el.style.setProperty("--zoom-sy", target.height / start.height);

		tile_el.classList.add("is-hero");
		stage_el.classList.add("is-open");
		on_open(tile_el);
	},
});
