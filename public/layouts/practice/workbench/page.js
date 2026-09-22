import { Page, div, a, span, p, h2, h3, button, icon } from "/app.js";
import Practice from "../Practice.js";
import MODULES from "./modules.js";
import { mount } from "/framework/ext/Ask/chat.js";

/* ── /layouts/practice/workbench/ — a rail, a wall, a panel ───────────────────
   LAYOUT, the five questions, answered before the first factory call.

   1. CONTAINER. A page in `app.$pages` under `/layouts/`, so the ordinary page
      grid. Three columns of content can never live in `main` (52em), so the
      whole layout claims `wide` — 3260px at 3440, 1178px at 1280, and its left
      edge is the page's own gutter, which is the axis everything else lines up
      on.
   2. SIZE. 329 · 1178 · 1751 · 3260. Three regions above 80rem of layout, two
      between 80rem and 48rem, one below.
   3. OWN LAYOUT. One grid: `15rem` rail, `minmax(0, 1fr)` wall, `clamp(17rem,
      22%, 26rem)` panel. Every track has a floor and a ceiling — no bare `1fr`.
      Inside the middle track, a wall of 24 tiles whose COLUMN COUNT IS WRITTEN
      OUT — 2, 3, 4, 6, 8, all of them divisors of 24. `auto-fill` cannot be told
      which counts are allowed and landed on 5 and on 7 over hundreds of pixels of
      real screen widths, each of them a short last row (practice.css says where).
      The panel sits inside a stretched side track so it can stick; the fold is a
      row of this same grid, so it stands on the wall's own left edge.
   4. REGIONS. Three, plus the fold. The rail, the wall (with its own head), the
      panel.
   5. PREVIEW. The 1920 shot on `/layouts/practice/`.

   THE LAYOUT IT IS AN INSTANCE OF: `3-holy-grail` — a wide column with a narrow
   one on each side, the middle being the subject and the two beside it about it.
   THE APPROVED SHAPE: 2 (Docs three-region), with 4 (Tile wall) inside.

   ⚠ THE RAIL MUST NOT MOVE. That is the whole demonstration. Picking a tile
     writes into the panel and touches nothing else, and the panel's track is a
     `clamp`, so its width does not depend on what is in it. No column opens
     beside anything: this is the page grid, not a columns host.                */

export default new Page({
	meta: import.meta,
	title: "Workbench",
	icon: "dashboard",
	description: "A rail, a wall of 24 tiles and a panel that answers — three regions at 3440, two at 1280, one at 400, and a nav that never moves.",

	content(){
		const entry = Practice.find("Workbench");
		mount({ app: this.app, url: this.url });

		/* `$panel` is assigned AFTER the wall is built, and every tile's handler
		   reads it at CLICK time, not at build time. Reading a variable inside the
		   very statement that assigns it is the trap that silently hands a click
		   handler `undefined` (code skill §7). */
		let $panel, $chosen;

		const choose = (mod, $tile) => {
			$chosen?.rc("std-practice-tile-on");
			$chosen = $tile.ac("std-practice-tile-on");
			$panel?.empty(() => { detail(mod); });
		};

		div.c("std-practice std-practice-wb wide", () => {
			div.c("std-practice-wb-grid", () => {

				Practice.rail("Framework");

				div.c("std-practice-wb-main", () => {
					Practice.head(entry);

					div.c("std-practice-wall", () => {
						MODULES.forEach((mod, i) => {
							const $tile = button.c("std-practice-tile").append(() => {
								span.c("std-practice-tile-icon", () => { icon(mod.icon); });
								span.c("std-practice-tile-name", mod.name);
								span.c("std-practice-tile-say", mod.say);
							});
							$tile.on("click", () => choose(mod, $tile));
							if (i === 0) $chosen = $tile.ac("std-practice-tile-on");
						});
					});
				});

				/* THE SIDE TRACK AND THE PANEL ARE TWO BOXES, on purpose. The grid
				   is `align-items: start`, so a grid item is exactly as tall as its
				   content — and `position: sticky` on a box that is its own height
				   has nowhere to travel and never fires. Measured before this: a
				   330px panel beside a 2,270px wall at 1440, with the rest of that
				   column empty. The track stretches and paints nothing (so there is
				   nothing to see); the panel paints and sticks inside it. */
				div.c("std-practice-side", () => {
					$panel = div.c("std-practice-detail", () => { detail(MODULES[0]); });
				});

				/* THE FOLD IS A ROW OF THE GRID, not a box bolted under it — outside
				   it, its left edge was the page's gutter while everything it is
				   about stood 295px to the right. */
				Practice.fold(entry, ANSWERS, POLISH);
			});
		});
	},
});

/* ── THE PANEL'S CONTENT ── the module you picked, in four real pieces: what it
   is called, where it lives, the sentence its own `page.js` uses to describe
   itself, and the headline of its own `readme.md`. Then the way out.
   ⚠ It is the ONLY box on this page with a background of its own, so it is the
     only box with padding of its own — the owner's rule, and the reason the rail
     and the wall carry none. */
function detail(mod){
	div.c("std-practice-detail-head", () => {
		span.c("std-practice-detail-icon", () => { icon(mod.icon); });
		h2.c("std-practice-detail-name", mod.name);
		span.c("std-practice-detail-path", "framework/ext/" + mod.name + "/");
	});

	p.c("std-practice-detail-say", mod.say);

	h3.c("std-practice-detail-label", "From its readme");
	p.c("std-practice-detail-about", mod.about);

	a.c("std-practice-detail-go").href("/framework/ext/" + mod.name + "/").append(() => {
		span("Open the module");
		icon("arrow_forward");
	});
}

/* THE NINE ANSWERS. One line each — the owner's own list, and the rule is that
   an answer you cannot write is a decision you have not made yet. */
const ANSWERS = [
	["Layout", "One grid on the `wide` track: a 15rem rail, a wall that takes what is left, and a panel clamped between 17rem and 26rem. Below 80rem the panel drops under the wall, capped at the measure so it is never a painted box wider than its own words; below 48rem everything stacks, the rail becomes a strip across the top and the wall becomes a two-column picker of names."],
	["Navigation", "The rail is the only navigation, and it is the same eight links in the same order and the same place at every width above 48rem. Picking a tile does not touch it. Nothing opens beside it, because this is the page grid and not a columns host."],
	["Structure", "Page → one grid → three regions: the rail, the main column (its head and its wall), the panel. The wall is a region INSIDE the middle column, never a fourth column beside it."],
	["Visual hierarchy", "The wall is loudest — the largest area, and the only place with names at full size. The panel is second, because it is the only box that paints its own background. The rail is quietest: grey labels on the page's own floor, no box at all."],
	["Iceberg UX", "A tile says a name and one line. Everything else about that module is in the panel, one click away; everything else about this layout is in this fold. Nothing is deleted, nothing is on the surface that does not have to be."],
	["Color", "Two grounds and one accent. Text is `--ink` on the page's `--surface`; the panel is `--fill-a04`, one rung up, and the selected tile is `--fill-a08` with a 3px `--prim` edge. The accent is a MARK and a fill, never a word: `--prim` as ink measures 2.25:1, under every threshold there is. The measured ratios are in this task's log."],
	["Focus", "The first tile, top left of the wall, level with the rail's current link — and it is already selected, so the panel is never empty and the eye never lands on a grey rectangle."],
	["Interaction", "Click or tab to a tile; the panel fills in place. That is all there is. Nothing slides, nothing opens, nothing above or left of the panel moves — which is the one thing this page exists to show."],
	["Purpose and outcome", "A reader leaves knowing every addon in `framework/ext/` by name and what one of them is for, and having watched a three-region layout change its content without moving its navigation."],
];

const POLISH = "Eight checks at four widths said 8 of 8 — and a critic then swept every 80px from 400 to 3440 and measured six widths in full, including the two a four-width sweep skips. What it found and what was done is in [the critic's log](/framework/ai/2026-09-17/practice-critic/).";
