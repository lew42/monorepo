import { Page, View, div, span, button, md } from "/app.js";

/* Ported from Codrops' "Rapid Image Layers Animation" (MIT) — see layer-reveal.css for
   the licence note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "layer-reveal.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large — `fill` claims the row's leftover; see grid-hover/page.js's comment for
   the measurement). Own layout: prose, then the stage — a menu row over a stack of
   layer bars, which wipe open to reveal a fixed mosaic grid (own `grid-template-areas`,
   like grid-zoom's — a designed collage, not a flowing `.grid.auto` wall). Regions: one.
   Preview: default card. */

const N_LAYERS = 6;
const STAGGER_MS = 110;
const OPEN_MS = 550;

const TILES = [
	{ area: "a", hue: 205 }, { area: "b", hue: 15 }, { area: "c", hue: 270 },
	{ area: "d", hue: 140 }, { area: "e", hue: 40 }, { area: "f", hue: 320 },
];

export default new Page({
	meta: import.meta,
	title: "Layer reveal",
	description: "Click Reveal: staggered bars wipe up the stage, opening onto a mosaic.",
	icon: "auto_awesome",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' Rapid Image Layers Animation, rebuilt.** Click **Reveal** below: bars wipe up the stage one after another, then split apart to open onto a mosaic of tiles that spring into place. This is a page-load **intro sequence** — the original plays it once, behind a menu, to introduce a page. It does not fit this realm's own paging words: it never routes (unlike [`launch`](/imagine/paging/mechanisms/launch/), which opens a new column) and it never returns to its start state (unlike [`takeover`](/imagine/paging/mechanisms/takeover/) or [`swap`](/imagine/paging/mechanisms/swap/), both of which collapse or replace something you can get back to) — it is a one-way curtain, so it stays its own thing rather than borrowing a name that half-fits. Click Reveal again to replay it from the start.");

		let stage_el;

		div.c("codrops-reveal2-stage", ($stage) => {
			stage_el = $stage.el;

			div.c("codrops-reveal2-menu", () => {
				span.c("codrops-reveal2-menu-item", "Underground");
				button.c("codrops-reveal2-menu-item codrops-reveal2-current unbutton", "Commotion").click(() => this.play_reveal(stage_el));
				span.c("codrops-reveal2-menu-item", "Interrogation");
			});

			div.c("codrops-reveal2-scene", () => {
				div.c("codrops-reveal2-grid", () => {
					TILES.forEach(tile => {
						div.c(`codrops-reveal2-tile codrops-reveal2-tile--${tile.area}`)
							.style("--codrops-reveal2-bg", `linear-gradient(155deg, hsl(${tile.hue} 65% 42%), hsl(${(tile.hue + 30) % 360} 65% 24%))`);
					});
				});

				div.c("codrops-reveal2-layers", () => {
					for (let i = 0; i < N_LAYERS; i++){
						div.c("codrops-reveal2-layer").style("--i", i).append(() => {
							div.c("codrops-reveal2-layer-img").style("--codrops-reveal2-bg", `linear-gradient(155deg, hsl(${(i * 50) % 360} 55% 35%), hsl(${(i * 50 + 40) % 360} 55% 20%))`);
						});
					}
				});
			});
		});

		md("**What carried over:** the two-stage wipe — bars sliding in staggered from the bottom, then all but the last fading while the last splits open (its bar and its own background sliding to opposite edges) to uncover the mosaic behind it — and the mosaic's own `grid-template-areas` composition. **What didn't:** GSAP's timeline (the original chains ten layers with `Power2`/`Expo` eases and a random per-tile spring distance of 100–500px); this port is CSS transitions with a `transition-delay` staggered by a `--i` custom property, triggered by adding one class, with a fixed (not random) per-tile offset so a screenshot is reproducible. `prefers-reduced-motion` collapses every transition to instant — Reveal jumps straight to the open mosaic.");
	},

	play_reveal(stage_el){
		const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
		stage_el.classList.remove("is-opening", "is-open");
		if (reduced){
			stage_el.classList.add("is-opening", "is-open");
			return;
		}
		// Force a reflow so a second click restarts the transition from the closed state
		// instead of the browser coalescing the remove+add into a no-op.
		void stage_el.offsetWidth;
		requestAnimationFrame(() => stage_el.classList.add("is-opening"));
		clearTimeout(this.reveal_timer);
		this.reveal_timer = setTimeout(() => stage_el.classList.add("is-open"), OPEN_MS + (N_LAYERS - 1) * STAGGER_MS);
	},

	deactivate(){
		clearTimeout(this.reveal_timer);
		return Page.prototype.deactivate.call(this);
	},
});
