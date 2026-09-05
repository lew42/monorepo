import { Page, View, div, md } from "/app.js";

/* Ported from Codrops' "Make Way Grid Effect" (MIT) — see make-way.css for the licence
   note; the table on /imagine/codrops/ has the summary row. */
View.stylesheet(import.meta, "make-way.css");

/* Container: a column of /imagine/'s row. Size: `fill` (a leaf, 3 levels deep under
   codrops/large — `fill` claims the row's leftover; see grid-hover/page.js's comment for
   the measurement). Own layout: prose, then a `.grid.auto` wall of tiles (the framework's
   own grid word — this one IS a flowing wall of uniform cells, unlike grid-zoom's fixed
   composition) with one hover listener per tile. Regions: one. Preview: default card. */

const N = 24;
const TILES = Array.from({ length: N }, (_, i) => ({ hue: Math.round((360 / N) * i) }));

// The original's own formulas (utils.js: map / getDistance / getTranslationDistance),
// renamed but numerically unchanged. `offsetLeft/offsetTop/offsetWidth/offsetHeight` on
// purpose, not `getBoundingClientRect()` — those are the element's STATIC layout box,
// untouched by the `transform` this same code is about to apply, so hovering a second
// tile mid-transition still measures every tile's true grid position, not a
// transform-tainted one.
const map_range = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

const center_of = (el) => ({ x: el.offsetLeft + el.offsetWidth / 2, y: el.offsetTop + el.offsetHeight / 2 });

const distance_between = (a, b) => {
	const ca = center_of(a), cb = center_of(b);
	return Math.hypot(ca.x - cb.x, ca.y - cb.y);
};

const push_away_from = (el, from_el, spread, max_distance) => {
	const c1 = center_of(el), c2 = center_of(from_el);
	const d = distance_between(el, from_el);
	const s = Math.max(map_range(d, 0, max_distance, spread, 0), 0);
	const angle = Math.atan2(Math.abs(c2.y - c1.y), Math.abs(c2.x - c1.x));
	const x = Math.abs(Math.cos(angle) * s);
	const y = Math.abs(Math.sin(angle) * s);
	return { x: c1.x < c2.x ? -x : x, y: c1.y < c2.y ? -y : y };
};

export default new Page({
	meta: import.meta,
	title: "Make way",
	description: "Hover a tile: it grows, and every other tile leans away to make room.",
	icon: "blur_on",
	width: "fill",   // a leaf under codrops/ (large) — `fill` claims the row's leftover;
	                 // see grid-hover/page.js's comment for the measurement.

	content(){
		md("**Codrops' Make Way Grid Effect, rebuilt.** Hover any tile below: it grows, and every other tile leans away from it — the closer a tile, the further it moves — so the grid makes way for the one you're pointing at. Move off, and every tile settles back to its own cell. This is a **hover-driven layout change**: the layout itself, not just one tile's own style, reacts to the pointer.");

		let tile_els = [];

		// A padded stage, not a bare grid — the hovered tile scales from its own CENTER
		// (`transform-origin` is the CSS default), so a top-row or edge tile grows both
		// UP/LEFT and DOWN/RIGHT; without room on every side it grew into the prose above
		// it (found via ui-test's own screenshot, fixed here rather than by clipping the
		// effect itself).
		div.c("codrops-way-stage", () => {
			div.c("grid auto gap", () => {
				TILES.forEach(tile => {
					const $tile = div.c("codrops-way-tile")
						.style("--codrops-way-bg", `linear-gradient(155deg, hsl(${tile.hue} 65% 45%), hsl(${(tile.hue + 30) % 360} 65% 30%))`);
					$tile.on("mouseenter", () => this.make_way($tile.el, tile_els));
					$tile.on("mouseleave", () => this.settle(tile_els));
					tile_els.push($tile.el);
				});
			}).style("--column", "5em");
		});

		md("**What carried over:** the maths, unchanged — `map`, `getDistance` and `getTranslationDistance` from the original's `utils.js`, which turn \"how far is every OTHER tile from the one I'm on\" into a push vector, stronger the closer the tile. **What didn't:** the trigger — the original fires on **click** (and un-expands on a second click); this port fires on **hover** (`mouseenter`/`mouseleave`), which is what this round asked for, and reads better for a grid this size besides. GSAP's timeline (skew, staggered z-index, `elastic.out`/`power4` eases per grid) is dropped for one CSS `transition: transform`; the random per-tile rotation the original's louder variants add is dropped too, for the plainest version of the effect. `prefers-reduced-motion` drops the transition — tiles jump straight to their pushed positions instead of easing into them.");
	},

	make_way(hovered_el, tile_els){
		const size = hovered_el.offsetWidth || 1;
		const spread = size * 1.3;
		const max_distance = size * 6;

		tile_els.forEach(el => {
			if (el === hovered_el){
				el.style.setProperty("--way-s", 2.2);
				el.style.setProperty("--way-x", "0px");
				el.style.setProperty("--way-y", "0px");
				el.classList.add("is-hovered");
				return;
			}
			const { x, y } = push_away_from(el, hovered_el, spread, max_distance);
			el.style.setProperty("--way-x", `${x.toFixed(1)}px`);
			el.style.setProperty("--way-y", `${y.toFixed(1)}px`);
			el.classList.remove("is-hovered");
		});
	},

	settle(tile_els){
		tile_els.forEach(el => {
			el.style.setProperty("--way-s", 1);
			el.style.setProperty("--way-x", "0px");
			el.style.setProperty("--way-y", "0px");
			el.classList.remove("is-hovered");
		});
	},
});
