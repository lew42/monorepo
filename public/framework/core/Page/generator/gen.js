/**
 * An integer → a page tree, as text. The same idea as `styles/layouts/space/`, one
 * level up: there a line is a BOX, here **a line is a PAGE**.
 *
 *     <block> [width]        indentation is nesting
 *
 *     wall large
 *       list
 *         prose
 *       tabs
 *     vtabs
 *
 * **Five block words, and every one of them is a BEHAVIOUR** — where a child appears
 * when you pick it. Three width words say how wide a column is. `gen(7)` is the same
 * tree forever, in any browser, so a permutation is a link (`#7`) rather than a directory.
 *
 *     columns   wall, list, prose   a child opens a NEW column, to the right
 *     in place  tabs, vtabs         a child swaps INTO this column; the row never grows
 *
 * A word that only changed how the child LINKS looked — `grid` (a denser wall), `flush`
 * (a wall with no gap), `crumbs` (a strip), `rail` (a narrower vtabs) — is not a word any
 * more. Each is four lines of `new Page()` in `readme.md`, which is where a shape with no
 * behaviour belongs.
 *
 * ⚠ AN ADDRESS IS ONLY STABLE AGAINST A FIXED MODEL. Change a weight below and seed 7
 *   becomes a different tree. `MODEL` is that promise, said out loud: it goes up whenever
 *   the vocabulary or a weight moves, and every seed redraws when it does. Keep a tree you
 *   like as its TEXT, the way space does.
 */
import { weights } from "./rules.js";

/* v1 (2026-08-26) nine words; v2 (2026-08-27) five, all behaviour; v3 (2026-08-29) `small`
   reweighted to `full`'s rarity, `""` is now the clear majority. doc/decisions.md. */
export const MODEL = 3;

/* mulberry32 — thirty-two bits of state, so a seed is an int32 and the sequence is
 * identical everywhere. COPIED from `styles/layouts/space/draw.js`, not imported: that
 * module opens `import { ROLES, PARTS_ALL } from "./model.js"`, so importing it would
 * drag space's whole box vocabulary into core. Ten lines is cheaper than the coupling. */
export function rng(seed){
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
export const BLOCKS = "tabs vtabs list wall prose".split(" ");

/* `hug` and `fill` are core's, landing beside this task: `.page-column-<word>` same as the
   first three. Neither is in the WEIGHT table below — a control can reach them, the roller
   never draws them on its own, so `#seed` stays reproducible against a vocabulary the CSS
   may not have caught up to yet (doc/decisions.md). */
export const WIDTHS = "small large full hug fill".split(" ");

/* The two words whose children land INSIDE this column instead of beside it. `tree.js`
 * reads this to place a child and to size it; `rules.js` reads it to keep two navs off
 * one edge. One list, so the three can never disagree. */
export const INPLACE = "tabs vtabs".split(" ");

/* `prose` is the LEAF word and never appears here: a page with children presents them,
 * a page without them is prose. Weights are taste, not measurement — a wall and a list
 * are the two shapes most real trees are made of. */
const BRANCH = { wall: 4, list: 4, tabs: 3, vtabs: 2 };

/* ⚠ `full` collapses its ancestors (doc/columns.md), so it is the rare word — one roll in
 *   twelve. `small` is a fixed 14em, a track narrow enough to be a deliberate pick rather
 *   than a coin flip, so it is reweighted to `full`'s rarity (v3, was 1 in 4). `""` is the
 *   default width and has to be in the table, or every page would claim one — it is now
 *   the clear majority, two in three, which is the owner's ask said plainly: most pages sit
 *   on the default track, small is used on purpose. */
const WIDTH = { "": 8, small: 1, large: 2, full: 1 };

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

		/* ⚠ Drawn, then DISCARDED under an in-place parent — never skipped. A width word
		   is a track in the ROW, and a tab's content is in a panel: it has no track to be
		   wide in. But `pick()` must run either way or one node's word would shift the
		   whole sequence after it, and a seed is only an address if the draw order is fixed. */
		const drawn = pick(WIDTH);
		const width = INPLACE.includes(up) ? "" : drawn;

		out.push("  ".repeat(at) + (width ? block + " " + width : block));

		// A FRESH count per child, so one branch runs deep and its neighbour is flat.
		for (let i = 0; i < kids; i++) node(at + 1, left - 1, 0, block);
	}
}

export default gen;
