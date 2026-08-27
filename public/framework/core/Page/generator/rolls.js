import { div, span, a, button, icon, md } from "/app.js";
import { gen, BLOCKS, WIDTHS } from "./gen.js";
import { parse } from "./tree.js";
import { PAIRS, NOTES } from "./rules.js";

/**
 * THE PERMUTATION WALL — twenty-four rolls at once, each a small picture of its tree.
 *
 * One roll on the page tells you what a seed drew; a wall tells you what the RULES draw,
 * which is the question the ask actually opens ("hone the rules about which layouts work
 * well with others"). So the wall and `rules.js` ship together, and the rules are printed
 * under the tiles: the pictures are the evidence, the table is the thing to argue with.
 *
 * A tile is a picture, not a page — no `Page` is built for it, nothing is mounted. The
 * spec is drawn with `gen(seed)` and `parse()`d, and each node becomes a nested box that
 * `generator.css` shapes by its word. Twenty-four live trees would be twenty-four subtrees
 * of real pages; this is twenty-four `div`s deep in nothing.
 */
export const TILES = 24;

/* The base seed and the twenty-three after it. CONTIGUOUS on purpose: the wall is then the
   same seed space the ± stepper walks, one screen at a time, and `#42` means the same
   number everywhere in this module. */
export function seeds(base){ return Array.from({ length: TILES }, (_, i) => base + i); }

/**
 * The wall's page config — a real child of the generator at `/generator/rolls/`, so it is
 * addressable (`…/rolls/#42` = the wall from seed 42) and lays out as one more column.
 *
 * ⚠ `rolls`, not `wall`: a generated page is named after its block word, and `wall` is one
 *   of the nine — two children of one name and only the last survives.
 * ⚠ `grow()` re-adds it on every reroll, because `grow()` replaces `children` wholesale.
 */
export function wall(host){
	return {
		name: "rolls",
		title: "Permutation wall",
		label: "Permutation wall",
		icon: "grid_view",

		// `full` — the ancestors collapse into the crumb strip and the wall gets the
		// whole host. Twenty-four tiles in a 40em column would be a list of stamps.
		width: "full",

		// ⚠ Every url in this module carries the generator's hash; a crumb without it
		//   reloads onto a different tree. `host.hash()` is the one place it is written.
		link(text){ return a.c("page-link", text ?? this.title).href(this.url + host.hash()); },

		column(){
			return div.c("page-gen page-gen-rolls page-column-body", () => {

				div.c("page-column-head", () => {
					span.c("page-column-title", "Permutation wall");
					this.$count = span.c("page-gen-rolls-count");

					div.c("page-gen-rolls-page", () => {
						button(() => icon("chevron_left")).click(() => this.paint(this.base - TILES));
						button(() => icon("chevron_right")).click(() => this.paint(this.base + TILES));
					});

					a.c("page-column-close", () => icon("close")).href(host.url + host.hash());
				});

				this.$tiles = div.c("page-gen-tiles");
				rules();

				this.paint(host.seed);

			// ⚠ The width class is stamped by the `column()` this one REPLACES — core's
			//   own last line. Without it `full` is a field nobody reads, the ancestors
			//   never stand down, and the wall renders in a 40em column (measured 1920:
			//   639px and three tiles a row).
			}).ac(this.width && "page-column-" + this.width);
		},

		/* Paging repaints the tiles IN PLACE — no page is rebuilt and the Router is not
		   involved, because a tile is only a drawing. The url follows so the wall you are
		   looking at is the wall you can send someone.
		   ⚠ Not on the first paint: that one runs during render, and the navigation that
		     is landing here has not written its own url yet. */
		paint(base){
			const first = this.base === undefined;

			this.base = base;
			this.$count.text(`${TILES} rolls from seed ${base}`);
			this.$tiles.empty(() => seeds(base).forEach(seed => tile(seed, host)));

			if (!first) history.replaceState({}, "", this.url + "#" + base);
			return this;
		},
	};
}

/* ONE TILE. The href is real — reload or middle-click lands on that seed's tree — but a
   click is handled here: the generator is already built at another seed, and only
   `open()` regrows it. */
function tile(seed, host){
	return a.c("page-gen-tile").href(host.url + "#" + seed)
		.click(event => { event.preventDefault(); host.open(seed); })
		.append(() => {
			div.c("page-gen-sketch", () => sketch(parse(gen(seed))));
			span.c("page-gen-tile-seed", "#" + seed);
		});
}

/* The picture: one box per page, its children INSIDE it, arranged by its own word — the
   same job `generator.css`'s nine word rules do for a real column, at 3px. A leaf gets two
   text lines instead of a nav, because a `prose` page is what it says. */
export function sketch(list){
	return list.forEach(node => {
		const [word, given] = node.line.split(/\s+/);
		const block = BLOCKS.includes(word) ? word : "prose";
		const width = WIDTHS.includes(given) ? given : "";

		div.c("page-gen-sk page-gen-sk-" + block, () => {
			div.c("page-gen-sk-head");

			if (node.kids.length) div.c("page-gen-sk-nav", () => sketch(node.kids));
			else div.c("page-gen-sk-text", () => { div.c("page-gen-sk-line"); div.c("page-gen-sk-line"); });
		}).ac(width && "page-gen-sk-" + width);
	});
}

/* THE RULES, on the page. Drawn from `rules.js` itself — not restated — so a number that
   changes there changes here, and the owner is reading the table the roll actually used. */
export function rules(){
	return div.c("page-gen-rules", () => {
		div.c("page-gen-rules-note", () => md("**Pairing rules** — a multiplier on the child word's weight, given the parent's. Above 1 the pair is encouraged, below 1 discouraged, unlisted is 1. Taste, not measurement: the numbers live in `rules.js`, and `gen(seed, { chaos: 1 })` ignores them all."));

		for (const parent in PAIRS){
			const pairs = PAIRS[parent];

			div.c("page-gen-rule", () => {
				span.c("page-gen-rule-word", parent);

				div.c("page-gen-rule-pairs", () => Object.keys(pairs)
					.sort((one, two) => pairs[two] - pairs[one])
					.forEach(word => span.c("page-gen-pair", `${word} ×${pairs[word]}`)
						.ac(pairs[word] > 1 ? "page-gen-pair-good" : "page-gen-pair-bad")));

				span.c("page-gen-rule-note", NOTES[parent]);
			});
		}
	});
}

export default wall;
