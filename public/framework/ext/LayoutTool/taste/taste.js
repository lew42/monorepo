import { probe } from "../probe.js";
import { RANGES, TOTAL, credit } from "./ranges.js";
import { read } from "./read.js";

/* The front door of the third tier. `analyze()` says what is wrong with a layout;
 * `rate()` says how good it is — and unlike a score built from findings, it can tell
 * two clean layouts apart, which is the whole reason a generator can search.
 *
 *     import { rate } from "/framework/ext/LayoutTool/taste/taste.js";
 *     rate(document.querySelector(".page.active-page"));   // → { score, grade, bands }
 *
 * Design record: readme.md. The numbers: ranges.js, and knowledge/ideal-ranges.md.
 */

export function rate(target, opts = {}){
	const model = target?.nodes ? target : probe(target, opts);
	const values = read(model);

	const bands = RANGES.map(range => {
		const value = values[range.id];
		const got = credit(value, range);

		return { ...range, value, credit: got, weight: range.weight };
	});

	/* ⚠ A range with nothing to measure is DROPPED, not scored zero. A layout with
	   no prose has no measure, and marking that as a failure would rank every
	   dashboard below every article. The divisor moves with it. */
	const live = bands.filter(b => b.credit != null);
	const weight = live.reduce((sum, b) => sum + b.weight, 0);
	const score = weight ? Math.round(live.reduce((sum, b) => sum + b.credit * b.weight, 0) / weight * 100) : 0;

	return {
		score, grade: grade(score),
		bands, values,
		read: live.length, of: RANGES.length,
		covered: Math.round(weight / TOTAL * 100),
		weakest: [...live].sort((a, b) => a.credit - b.credit || b.weight - a.weight).slice(0, 3),
		frame: model.frame, space: values.space,
	};
}

// The same ladder `score.js` uses, so one number means one thing across the tool.
export const grade = n => (n >= 90 ? "A" : n >= 80 ? "B" : n >= 70 ? "C" : n >= 60 ? "D" : "F");

export { RANGES, credit, read };
export default rate;
