/**
 * An integer → a page tree, as text. The same idea as `styles/layouts/space/`, one
 * level up: there a line is a BOX, here **a line is a PAGE**.
 *
 *     <block> [width]        indentation is nesting
 *
 *     wall large
 *       list small
 *         prose
 *       grid
 *     tabs
 *
 * Nine block words say how a page presents its children; three width words say how
 * wide its column is. `gen(7)` is the same tree forever, in any browser — so a
 * permutation is a link (`#7`) rather than a directory.
 *
 * ⚠ AN ADDRESS IS ONLY STABLE AGAINST A FIXED MODEL. Change a weight below and seed 7
 *   becomes a different tree. Keep a tree you like as its TEXT, the way space does.
 */
import { weights } from "./rules.js";

/* mulberry32 — thirty-two bits of state, so a seed is an int32 and the sequence is
 * identical everywhere. COPIED from `styles/layouts/space/draw.js`, not imported: that
 * module opens `import { ROLES, PARTS_ALL } from "./model.js"`, so importing it would
 * drag space's whole box vocabulary into core. Ten lines is cheaper than the coupling. */
function rng(seed){
	let a = seed >>> 0;

	return () => {
		a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

/* The vocabulary, and the only place it exists — `tree.js` renders whatever word it is
 * handed, `generator.css` gives each one its picture. */
export const BLOCKS = "tabs vtabs rail wall grid flush list prose crumbs".split(" ");
export const WIDTHS = "small large full".split(" ");

/* `prose` is the LEAF word and never appears here: a page with children presents them,
 * a page without them is prose. Weights are taste, not measurement — a wall and a list
 * are the two shapes most real trees are made of. */
const BRANCH = { wall: 4, list: 4, tabs: 3, grid: 3, vtabs: 2, rail: 2, crumbs: 1, flush: 1 };

/* ⚠ `full` collapses its ancestors (design.md §2), so it is the rare word — one roll in
 *   twelve. `""` is the default width and has to be in the table, or every page would
 *   claim one. */
const WIDTH = { "": 6, small: 3, large: 2, full: 1 };

const CAP = 40;   // lines; a runaway tree is a browser tab, not a demo

/**
 * `opts.chaos` — 0 (the default) draws under the pairing rules, 1 ignores them and draws
 * the flat table above, which is what this generator did before `rules.js` existed. It is
 * the escape hatch and the archaeology, not a setting: the page never sets it.
 */
export function gen(seed, opts = {}){
	const depth = opts.depth ?? 3;
	const chaos = opts.chaos ?? 0;
	const next = rng(seed);
	const out = [];

	const count = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));

	const pick = table => {
		const keys = Object.keys(table);
		let at = next() * keys.reduce((sum, k) => sum + table[k], 0);

		for (const k of keys) if ((at -= table[k]) <= 0) return k;
		return keys.at(-1);
	};

	// The first root always branches, so there is always something to navigate INTO.
	for (let i = 0, n = count(2, 4); i < n; i++) node(0, depth, i === 0 ? 2 : 0);

	return out.join("\n");

	// `up` is the parent's block word — the whole input to the pairing rules. A root has
	// none, so a root draws from the flat table however the rules are set.
	function node(at, left, min, up){
		if (out.length >= CAP) return;

		const kids = left > 0 ? count(min, 3) : 0;
		const block = kids ? pick(weights(BRANCH, up, chaos)) : "prose";
		const width = pick(WIDTH);

		out.push("  ".repeat(at) + (width ? block + " " + width : block));

		// A FRESH count per child, so one branch runs deep and its neighbour is flat.
		for (let i = 0; i < kids; i++) node(at + 1, left - 1, 0, block);
	}
}

export default gen;
