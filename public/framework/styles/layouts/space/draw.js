import { ROLES, PARTS_ALL } from "./model.js";

/* THE CHAOS DIAL, and the only place it exists. Every draw the generator makes goes
 * through one of these five, so one number bends the whole model at once instead of
 * being threaded through forty call sites.
 *
 *     chaos 0   strictly the model — weights as written, sizes inside their band
 *     chaos 1   uniform over everything the format can say, which is where the old
 *               generator always was
 *
 * The blend is LINEAR — `p = (1−c)·w + c/n` — and that is deliberate: it is the one
 * curve a reader can predict from the number. At chaos 0.5 an off-model part (a
 * `footer` in a rail) has exactly half a uniform chance, and the model's favourite
 * still has most of its lead. A temperature (`w^(1/T)`) is the textbook answer and
 * reaches uniform only asymptotically, so a dial marked "1" would not be uniform.
 */
export function draws(seed, chaos = 0){
	const c = Math.max(0, Math.min(1, chaos));
	const next = rng(seed);

	/* ⚠ `all` is the FULL vocabulary, not the weighted keys. Blending toward uniform
	   over the weighted keys alone can never reach an off-model option, so chaos
	   would only reshuffle the model's own preferences — it has to be able to put a
	   footer where a footer does not go, or the dial means nothing. */
	function pick(weights, all){
		const keys = all ?? Object.keys(weights);
		const total = keys.reduce((sum, k) => sum + (weights[k] ?? 0), 0);
		let at = next();

		for (const k of keys){
			const w = total > 0 ? (weights[k] ?? 0) / total : 1 / keys.length;
			at -= (1 - c) * w + c / keys.length;
			if (at <= 0) return k;
		}

		return keys.at(-1);
	}

	// A size band, widened around its own middle as chaos rises — four times as wide
	// at 1, so the shapes stay recognisable and the numbers stop being tasteful.
	function band([lo, hi]){
		const mid = (lo + hi) / 2;
		const half = (hi - lo) / 2 * (1 + 3 * c);

		return Math.max(0.1, mid - half + next() * half * 2);
	}

	return {
		pick,
		band,
		role: role => pick(ROLES[role] ?? {}, PARTS_ALL),
		em: range => band(range).toFixed(2).replace(/\.?0+$/, "") + "em",
		count: range => Math.max(1, Math.round(band(range))),
		odds: p => next() < p,

		// A vary-length track list: the model's own order, two to all of it.
		some: list => list.slice(0, Math.max(2, Math.round(band([2, list.length])))),

		/* A depth: the model's weighting, blended toward uniform like everything else,
		   then capped by the dial.
		   ⚠ It reads the TABLE's keys, so `DEPTHS` has to span the dial's whole range —
		     stopping at 5 made the right half of the dial unreachable at any chaos.
		   ⚠ And chaos must not make a roll SHALLOWER. Drawing uniformly over `0..max`
		     instead of over the table did exactly that at max 2, producing flatter,
		     simpler layouts — which this rulebook rewards, so chaos measured as an
		     IMPROVEMENT (mean 61 → 70 over 8 seeds). A dial whose sign flips under
		     measurement is a dial that is measuring the wrong thing. */
		level: (table, max) => Math.min(max, pick(table) | 0),
	};
}

/* mulberry32 — thirty-two bits of state, so a seed is an int32 and the sequence is
 * identical everywhere. Not `Math.random`: an address has to be replayable. */
function rng(seed){
	let a = seed >>> 0;

	return () => {
		a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

export default draws;
