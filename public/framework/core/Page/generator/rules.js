/**
 * WHICH WORDS WORK UNDER WHICH — the pairing rules, as data.
 *
 * The roller used to pick a child's block word from one flat table of weights, so a page
 * of tabs could open a page of tabs and a wall could open a wall. Those are the two looks
 * the ask calls out as broken (alternating tab bands; walls of walls), and no amount of
 * rerolling avoids them. So the parent's word gets a say.
 *
 *     PAIRS[parent][child] — a MULTIPLIER on the child's base weight.
 *
 * Above 1 the pair is encouraged, below 1 discouraged, and an unlisted pair is 1 — so a
 * row only says what it has an opinion about. This is TASTE, not measurement: read it,
 * argue with it, change a number. The page renders the table so you can.
 *
 * ⚠ Four rows, not eight (model v2): the four words that can HAVE children. `prose` is the
 *   leaf and never parents anything, and the words that were only a look — `grid`, `flush`,
 *   `crumbs`, `rail` — are patterns now, not words, so there is nothing to weigh them with.
 */
export const PAIRS = {
	tabs:  { tabs: 0.25, vtabs: 0.8, wall: 2,   list: 1.5 },
	vtabs: { vtabs: 0.25, tabs: 0.8, wall: 2,   list: 1.5 },
	wall:  { wall: 0.3,  list: 2,   tabs: 1.5, vtabs: 1.2 },
	list:  { list: 1.2,  wall: 2,   tabs: 1.5, vtabs: 0.6 },
};

/* One line each, in the same order — why the row reads the way it does. The page draws
   these beside the numbers, because a weight nobody can explain is a weight nobody can hone. */
export const NOTES = {
	tabs:  "A tab opens INTO this column, so tabs inside tabs is a strip inside a panel inside a strip. A tab should hold content — a wall, a list.",
	vtabs: "Same set on its side. A side rail whose tab is another side rail puts two navs on one edge.",
	wall:  "A card opens a NEW column, and what it opens should be the level below: an inbox, or content. A wall of walls is the look the ask names.",
	list:  "An inbox picks, and the pick is wide. Inboxes of inboxes are Miller columns, which is the shape this whole system is; a rail inside the detail is one nav too many.",
};

/**
 * The child weights under `parent`, from the base table.
 *
 * `chaos` is the ESCAPE, not a config system: 0 applies the rules, 1 ignores them — and at
 * 1 the numbers are the base table exactly, so `gen(seed, { chaos: 1 })` draws the trees
 * this generator drew before the rules existed. Between the two it blends, which is what a
 * dial would ride if one is ever wanted.
 *
 * ⚠ Same keys, same order, one `next()` per pick either way: chaos changes WHICH word is
 *   drawn, never how many numbers are drawn. The seed sequence itself is untouched.
 */
export function weights(base, parent, chaos = 0){
	const pairs = PAIRS[parent];
	if (!pairs || chaos >= 1) return base;

	const out = {};
	for (const word in base) out[word] = base[word] * (chaos + (1 - chaos) * (pairs[word] ?? 1));

	return out;
}

export default PAIRS;
