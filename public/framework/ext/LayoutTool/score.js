/* One number, and how it was arrived at.
 *
 * Penalties are per RULE with diminishing returns — `w × (1 + log2 n)` — because
 * forty cramped cards are one mistake made once, not forty mistakes. A linear
 * sum zeroes the score on any page with a repeated component, which makes the
 * number useless for ranking pages against each other. */

import { region, text_chars } from "./ratios.js";

const WEIGHT = { high: 12, med: 5, low: 1.5 };
const GRADES = [[90, "A"], [80, "B"], [70, "C"], [60, "D"], [0, "F"]];

/* ⚠ Two findings answer a question severity cannot, so they are weighted by the
 * RULE and the tiers keep meaning the same thing everywhere else.
 *
 * `unreachable` is not a bigger `high`: /web/nav/drill/ hides 4099px of a 900px
 * region with no scrollbar and scored 82/B as one 12-point high. 75 lands it at
 * the bottom of F with room left for its other findings to still order the tail.
 * `empty` is not a layout finding at all — a 404 fires no rule and scored 94/A. */
const RULE_WEIGHT = { unreachable: 75, empty: 30 };

export const weigh = i => RULE_WEIGHT[i.rule] ?? WEIGHT[i.sev];

/* ⚠ One rule can cost at most this much. Without the cap, a site-wide habit —
 * 1332 over-wide paragraphs across 95 pages — pinned 78 of 116 pages at exactly
 * zero, and a score that cannot separate the worst page from the median is not
 * a ranking. One bad habit should cost a grade, not the whole scale — which is
 * exactly why the two rule-weighted findings above are not subject to it. */
const CAP = 25;
const RULE_CAP = 90;

/* ⚠ The polish tier is capped TOGETHER, not per rule. Alignment, proportion and
 * hierarchy each fire on nearly every page — 987 near-miss edges across 120
 * pages on the first run — and five capped-at-25 rules still sum to 125, which
 * zeroed the score of all but one page. A layout that is merely unpolished must
 * not score like a layout nobody can read. */
const POLISH = new Set(["proportion", "alignment", "hierarchy"]);
const POLISH_CAP = 15;

export function score(issues){
	const groups = new Map();
	const cats = new Map();

	for (const i of issues){
		const key = `${i.rule}:${i.sev}`;
		groups.set(key, (groups.get(key) ?? 0) + 1);
		cats.set(i.rule, i.cat);
	}

	const per_rule = new Map();
	const cost = [];

	for (const [key, n] of groups){
		const [rule, sev] = key.split(":");
		const p = weigh({ rule, sev }) * (1 + Math.log2(n));
		per_rule.set(rule, (per_rule.get(rule) ?? 0) + p);
		cost.push({ rule, sev, n, penalty: round(p) });
	}

	let penalty = 0;
	let polish = 0;

	for (const [rule, p] of per_rule){
		const capped = Math.min(p, RULE_WEIGHT[rule] ? RULE_CAP : CAP);
		if (POLISH.has(cats.get(rule))) polish += capped;
		else penalty += capped;
	}

	penalty += Math.min(polish, POLISH_CAP);

	const value = Math.max(0, Math.min(100, Math.round(100 - penalty)));

	return {
		score: value,
		grade: GRADES.find(([floor]) => value >= floor)[1],
		penalty: round(penalty),
		cost: cost.sort((a, b) => b.penalty - a.penalty),
	};
}

// What to read first: what costs most, then the most extreme measurement in it.
export function leading(issues, n = 8){
	return [...issues]
		.sort((a, b) => weigh(b) - weigh(a) || (b.value ?? 0) - (a.value ?? 0))
		.slice(0, n);
}

export function metrics(m){
	const text = m.nodes.filter(n => n.text && n.text.lines >= 2 && n.text.chars > 20);
	const framed = m.nodes.filter(n => n.framed && n.text && n.text.chars > 12);
	const wide = m.nodes.filter(n => n.text && n.text.chars > 20 && n.w > 0);
	const box = region(m);

	const span = wide.length
		? (Math.max(...wide.map(n => n.x + n.w)) - Math.min(...wide.map(n => n.x))) / m.viewport.w
		: null;

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
