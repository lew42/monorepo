/**
 * A seed → a labelled tree: `a`, `a1`, `a1a`, `a1b` … exactly the shape the owner asked
 * for out loud. **Not** `core/Page/generator/gen.js` — that one draws PAGE TREES (its
 * words are `tabs vtabs list wall prose`, never a label), so this is the "else write a
 * 20-line seeded one" the brief asked for if the reused generator didn't fit. It kept
 * one thing from that module: `rng()`, the same ten-line mulberry32, copied rather than
 * imported for the same reason that file gives — importing would drag a page-tree
 * generator into a lab that has nothing to do with pages.
 *
 * The label rule: a child's suffix is a NUMBER one level, a LETTER the next, forever —
 * `a` → `a1 a2 …` (numbers) → `a1a a1b …` (letters) → `a1a1 a1a2 …` (numbers) again. That
 * alternation is what makes `a1a1a` readable as "1st child, 1st child, 1st child" without
 * a legend.
 */

// mulberry32 — thirty-two bits of state, so a seed is an int32 and the sequence is
// identical everywhere. Copied from core/Page/generator/gen.js, not imported (see above).
export function rng(seed){
	let a = seed >>> 0;

	return () => {
		a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

// A runaway tree (depth 5 × breadth 4 is 1,364 nodes if nothing stopped it) is a browser
// tab, not a demo — the same call `core/Page/generator/gen.js` makes with its own CAP.
export const CAP = 40;

/**
 * `gen(seed, depth, breadth)` — `depth` (2–5) is how many GENERATIONS exist below the
 * root (depth 2 is the brief's own example: `a`, `a1`, `a1a`). `breadth` (1–4) is the
 * MOST children any one node draws; each node draws its own count from 1..breadth, so
 * the tree is uneven the way a real family tree is, not a perfect grid.
 *
 * Returns `{ label, children }`, recursively — `label` doubles as the node's identity
 * (fold state, `scrollIntoView` targeting): the alternating suffix rule already makes
 * every label on the tree unique, so there is no second id to keep in sync with it.
 */
export function gen(seed, depth = 3, breadth = 3){
	const next = rng(seed);
	let count = 1;                          // the root itself

	const branch = (label, level) => {
		const children = [];
		if (level >= depth || count >= CAP) return { label, children };

		const n = 1 + Math.floor(next() * breadth);
		const numbered = (level + 1) % 2 === 1;   // the CHILD's level decides its suffix kind

		for (let i = 0; i < n && count < CAP; i++){
			count++;
			children.push(branch(label + (numbered ? String(i + 1) : LETTERS[i % 26]), level + 1));
		}

		return { label, children };
	};

	return branch("a", 0);
}

export default gen;
