import { probe } from "../probe.js";
import { grade } from "../score.js";
import { RANGES, TOTAL, credit } from "./ranges.js";
import { read } from "./read.js";

/* The front door of the third tier. `analyze()` says what is wrong with a layout;
 * `rate()` says how good it is — and unlike a score built from findings, it can tell
 * two clean layouts apart, which is the whole reason a generator can search.
 *
 *     import { rate } from "/framework/ext/DesignTool/taste/taste.js";
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

	/* ⚠ NOTHING READ IS NOT A ZERO. With no band readable the score used to fall out
	 *   as 0 and grade F — indistinguishable from a layout that was measured and found
	 *   terrible. A demo stage with `covered: 0` is not the worst page on the site, it
	 *   is a page this tier has nothing to say about, and `null` is the only honest
	 *   answer. Callers that rank must skip a `null` score rather than sort it last. */
	const score = weight ? Math.round(live.reduce((sum, b) => sum + b.credit * b.weight, 0) / weight * 100) : null;

	/* ⚠ A PAGE MADE OF PICTURES CANNOT BE RATED, and the score alone will not say so.
	   `probe.IGNORE` skips demo stages by policy, so on a page whose whole subject is a
	   stage this tier measures the caption around it — six `styles/layouts/*` pages
	   rated F while `analyze()` called them fine. `mostly_picture` is the caveat: more
	   was skipped than was read, so read `covered` and the grade with that in mind. */
	const ignored = model.ignored ?? 0;   // the skipped SHARE of the root's area

	return {
		score, grade: score == null ? "—" : grade(score),
		bands, values,
		read: live.length, of: RANGES.length,
		covered: Math.round(weight / TOTAL * 100),
		ignored, mostly_picture: ignored >= 0.5,
		weakest: [...live].sort((a, b) => a.credit - b.credit || b.weight - a.weight).slice(0, 3),
		frame: model.frame, space: values.space,
	};
}

// ⚠ IMPORTED from `score.js`, not restated. This was a hand-copied ternary of the
//   same five thresholds — two numbers that have to be changed together and no way
//   to find that out except by grading something twice and comparing.
export { grade };
export { RANGES, credit, read };
export default rate;
