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
 */
export const PAIRS = {
	tabs:   { tabs: 0.2, vtabs: 0.5, wall: 2,   grid: 2,   list: 1.5 },
	vtabs:  { vtabs: 0.2, rail: 0.3, tabs: 0.5, list: 1.5, wall: 1.5 },
	rail:   { rail: 0.2, vtabs: 0.3, wall: 2,   grid: 2,   tabs: 1.5 },
	wall:   { wall: 0.3, grid: 0.5, list: 2,    tabs: 1.5, crumbs: 1.5 },
	grid:   { grid: 0.3, wall: 0.5, flush: 0.5, list: 2,   tabs: 1.5 },
	flush:  { flush: 0.2, grid: 0.3, wall: 0.5, list: 2,   tabs: 1.5 },
	list:   { list: 1.2, wall: 2,   grid: 1.5,  tabs: 1.5, vtabs: 0.5 },
	crumbs: { crumbs: 0.2, wall: 1.5, list: 1.5 },
};

/* One line each, in the same order — why the row reads the way it does. The page draws
   these beside the numbers, because a weight nobody can explain is a weight nobody can hone. */
export const NOTES = {
	tabs:   "Tabs inside tabs is the alternating-band look the ask names. A tab should open content — a wall, a grid, a list.",
	vtabs:  "Side tabs beside a rail is two navs on one edge. Give them content to the right instead.",
	rail:   "A rail picks a section, so the section should be the wide thing: a wall or a grid.",
	wall:   "A card opens a detail, not another wall. Lists and crumbs read as the level below.",
	grid:   "Small cells are already the dense level; going denser reads as noise.",
	flush:  "The one grid with no gap wants quiet inside it — never a second flush grid.",
	list:   "A list is the safest parent there is: it picks, and the pick is wide. Miller columns are lists of lists.",
	crumbs: "Crumbs are a strip, not a level — one is enough anywhere in a branch.",
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
