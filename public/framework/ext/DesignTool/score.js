/* The weights, the finding census, and the page metrics.
 *
 * ⚠ THERE IS NO AGGREGATE SCORE HERE ANY MORE, and the rules are all still here.
 *   Scored against eighteen hand-rated screenshots the old number came out
 *   ANTI-correlated with how pages look (Pearson −0.393; against DOM node count
 *   Spearman −0.519) because it counted findings and findings scale with content,
 *   so it rewarded emptiness — grade A / 96 to the worst-looking page in the corpus
 *   and its single lowest score to the best. It also never emitted below 70 across a
 *   36-point reality, so it structurally could not call a page bad. The same rules
 *   found the catalog scroll boundary that was hiding content on 18 pages: a rule
 *   that finds real defects is not at fault for a broken average built on top of it.
 *   `taste/` is the tier that ranks QUALITY. This one ranks what is BROKEN, and it
 *   ranks by the census — `worst_first` below. Evidence:
 *   `ai/2026-08-17/vision-baseline/`. */

import { region, text_chars, inside, width_used } from "./ratios.js";

const WEIGHT = { high: 12, med: 5, low: 1.5 };
/* The one ladder. Exported because `taste/` grades on it, and a second hand-synced
   copy of five thresholds is a number that quietly stops agreeing. */
const GRADES = [[90, "A"], [80, "B"], [70, "C"], [60, "D"], [0, "F"]];

export const grade = value => GRADES.find(([floor]) => value >= floor)[1];

/* ⚠ Two findings answer a question severity cannot, so they are weighted by the
 * RULE and the tiers keep meaning the same thing everywhere else.
 *
 * `unreachable` is not a bigger `high`: /web/nav/drill/ hides 4099px of a 900px
 * region with no scrollbar. `empty` is not a layout finding at all — a 404 fires
 * no rule. Both outrank every ordinary finding when `leading()` sorts. */
const RULE_WEIGHT = { unreachable: 75, empty: 30 };

export const weigh = i => RULE_WEIGHT[i.rule] ?? WEIGHT[i.sev];

/* THE RANKING, and it makes no quality claim: the raw census, severest first.
 * ⚠ It shares the old score's bias — an empty page fires nothing and ranks best —
 *   and that is honest here, because this tier is a DEFECT WORKLIST. What it no
 *   longer does is dress that census up as a grade out of 100. */
export const worst_first = (a, b) => b.counts.high - a.counts.high
	|| b.counts.med - a.counts.med || b.counts.low - a.counts.low;

export const census = c => `${c.high} high · ${c.med} med · ${c.low} low`;
export const severity = c => (c.high ? "bad" : c.med ? "warn" : "ok");

// What to read first: what costs most, then the most extreme measurement in it.
export function leading(issues, n = 8){
	return [...issues]
		.sort((a, b) => weigh(b) - weigh(a) || (b.value ?? 0) - (a.value ?? 0))
		.slice(0, n);
}

/* ⚠ THE PROSE METRICS READ THE CONTENT REGION, NOT THE APP SHELL. Handed `.app`,
 * `measure` took its median over 14 sidebar nav labels as well as the prose and
 * reported 26 characters a line on `/framework/`, whose real measure is ~100 —
 * the best-looking page in the corpus, described by its chrome. `region()` has
 * answered where a reader's content lives since it was written, and `text` below
 * was the only thing asking. */
export function metrics(m){
	const box = region(m);
	const prose = inside(m, box);

	const text = prose.filter(n => n.text && n.text.lines >= 2 && n.text.chars > 20);

	/* ⚠ THE FRAME GAP KEEPS THE WHOLE ROOT, and only `measure` is scoped. Chrome's
	   padding is exactly what this tool exists to measure — `taste/`'s `frame-gap` and
	   `pad-share` say the same and keep the root for the same reason. Scoped here for
	   one afternoon, `pad_em` came back null on any page whose content region holds no
	   framed text, and the dev rail rendered a bare `gap —×`. */
	const framed = m.nodes.filter(n => n.framed && n.text && n.text.chars > 12);
	const span = width_used(m);

	return {
		nodes: m.nodes.length,
		depth: Math.max(0, ...m.nodes.map(n => n.depth)),
		// How much there is to lay out — the number that tells a 404 from a page.
		text: box ? text_chars(m)[box.i] : 0,
		measure: median(text.map(n => n.text.per_line)),
		pad_em: median(framed.map(n => Math.min(n.pad[1], n.pad[3]) / n.fs)),
		pad_pct: median(framed.map(n => Math.min(n.pad[1], n.pad[3]) / n.w * 100)),
		width_used: span === null ? null : round(span * 100),
		scrolls_sideways: m.doc.w > m.viewport.w + 2,
	};
}

function median(list){
	const v = list.filter(Number.isFinite).sort((a, b) => a - b);
	return v.length ? round(v[v.length >> 1]) : null;
}

const round = n => Math.round(n * 100) / 100;
