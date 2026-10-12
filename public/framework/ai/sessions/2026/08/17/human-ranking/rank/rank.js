/* Binary insertion from pairwise verdicts, and nothing else — no DOM, no fetch.
   The whole ranking is `{ verdicts, swaps }` replayed through here, so a resume
   is a replay and an undo is a pop. */

const mid_of = probe => (probe.lo + probe.hi) >> 1;

/**
 * build(hashes, verdicts, revisions) — the order so far, and the duel that
 * decides the next place. Both lists hold the same record, `{ better, worse }`:
 * a verdict is consumed by the insertion, a revision is a pair re-judged
 * afterwards and applied by promoting `better` above `worse`. A revision that
 * agrees with the order already is inert, which is why re-judging is safe.
 *
 * ⚠ `broke` is the index of the first verdict whose pair does not match the duel
 * the replay expected. Replaying past it would sort by the wrong comparisons and
 * look perfectly normal, so it stops and says which line.
 */
export function build(hashes, verdicts = [], revisions = []){
	const order = [], queue = hashes.slice();
	let probe = null, used = 0, broke = null;

	const place = () => {
		while (true){
			if (probe && probe.lo === probe.hi){ order.splice(probe.lo, 0, probe.hash); probe = null; }
			if (!probe && queue.length) probe = { hash: queue.shift(), lo: 0, hi: order.length };
			else return;
		}
	};

	place();

	while (probe && used < verdicts.length){
		const { better, worse } = verdicts[used];
		const against = order[mid_of(probe)];

		if (better === probe.hash && worse === against) probe.hi = mid_of(probe);
		else if (worse === probe.hash && better === against) probe.lo = mid_of(probe) + 1;
		else { broke = used; break; }

		used++;
		place();
	}

	// Read before the revisions mutate `order` — one only ever lands once the
	// build is done, but a duel pointing at a moved row would be a silent bug.
	const duel = probe && { contender: probe.hash, incumbent: order[mid_of(probe)], flip: used % 2 === 1 };

	revisions.forEach(({ better, worse }) => {
		const b = order.indexOf(better), w = order.indexOf(worse);
		if (b > -1 && w > -1 && b > w) order.splice(w, 0, ...order.splice(b, 1));
	});

	return { order, duel, used, broke, at_most: at_most(order.length, probe, queue.length),
		done: !duel && !queue.length && !broke };
}

/** Comparisons still to come, worst case: a consistent judge finishes sooner. */
function at_most(placed, probe, queued){
	let total = probe ? Math.ceil(Math.log2(probe.hi - probe.lo + 1)) : 0;
	for (let size = placed + (probe ? 1 : 0); queued--; size++) total += Math.ceil(Math.log2(size + 1));
	return total;
}

/** What a full ranking of n costs, worst case — the number quoted up front. */
export function comparisons(n){ return at_most(0, null, n); }
