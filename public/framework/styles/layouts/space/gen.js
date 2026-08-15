/**
 * seed → a layout, as spec text. An integer is an ADDRESS: the same seed is the
 * same layout forever, in any browser, so a point in the space is a link and the
 * space can be sampled instead of authored.
 *
 * Two families, because a screen and a stack of bands break differently:
 * `rails` is a body row with 0–2 fixed columns beside a fluid one, `bands` is a
 * scrolling column of full-width sections. Design record: readme.md.
 */

const BODIES = ["sections 6", "cards 8", "rows 8", "tiles 12"];
const ROWS = ["flex gap wrap flex-1 scroll", "flex gap flex-1 scroll", "flex gap wrap flex-1 scroll"];

export function gen(seed){
	const next = rng(seed);
	const pick = list => list[Math.floor(next() * list.length)];
	const odds = p => next() < p;
	const em = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1)) + "em";

	const out = ["full fill flex v"];
	const line = (depth, text) => out.push("  ".repeat(depth) + text);

	if (odds(0.85)) line(1, "> " + pick(["topbar", "topbar", "toolbar"]));

	odds(0.35) ? bands() : rails();

	if (odds(0.6)) line(1, "> footer");

	return out.join("\n");

	function rails(){
		const count = Math.floor(next() * 3);
		const banner = odds(0.3);

		line(1, pick(ROWS));

		if (count > 0) line(2, `basis pad --basis:${em(12, 18)} > menu`);

		line(2, "pad flow fluid scroll");
		if (banner) line(3, "> hero");
		line(3, "> " + pick(BODIES));

		if (count > 1) line(2, `basis pad --basis:${em(11, 16)} stick > toc`);
	}

	function bands(){
		line(1, "flex v flex-1 scroll");
		line(2, "> hero");

		for (let i = 0; i < 1 + Math.floor(next() * 3); i++)
			line(2, "pad > " + pick(BODIES));
	}
}

/* mulberry32 — thirty-two bits of state, so a seed is an int32 and the sequence
   is identical everywhere. Not `Math.random`: an address has to be replayable. */
function rng(seed){
	let a = seed >>> 0;

	return () => {
		a = (a + 0x6D2B79F5) | 0;
		let t = Math.imul(a ^ a >>> 15, 1 | a);
		t = (t + Math.imul(t ^ t >>> 7, 61 | t)) ^ t;
		return ((t ^ t >>> 14) >>> 0) / 4294967296;
	};
}

export default gen;
