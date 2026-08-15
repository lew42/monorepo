/* One number, and how it was arrived at.
 *
 * Penalties are per RULE with diminishing returns — `w × (1 + log2 n)` — because
 * forty cramped cards are one mistake made once, not forty mistakes. A linear
 * sum zeroes the score on any page with a repeated component, which makes the
 * number useless for ranking pages against each other. */

const WEIGHT = { high: 12, med: 5, low: 1.5 };
const GRADES = [[90, "A"], [80, "B"], [70, "C"], [60, "D"], [0, "F"]];

/* ⚠ One rule can cost at most this much. Without the cap, a site-wide habit —
 * 1332 over-wide paragraphs across 95 pages — pinned 78 of 116 pages at exactly
 * zero, and a score that cannot separate the worst page from the median is not
 * a ranking. One bad habit should cost a grade, not the whole scale. */
const CAP = 25;

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
		const p = WEIGHT[sev] * (1 + Math.log2(n));
		per_rule.set(rule, (per_rule.get(rule) ?? 0) + p);
		cost.push({ rule, sev, n, penalty: round(p) });
	}

	let penalty = 0;
	let polish = 0;

	for (const [rule, p] of per_rule){
		if (POLISH.has(cats.get(rule))) polish += Math.min(p, CAP);
		else penalty += Math.min(p, CAP);
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

// What to read first: worst severity, then the most extreme measurement in it.
export function leading(issues, n = 8){
	return [...issues]
		.sort((a, b) => WEIGHT[b.sev] - WEIGHT[a.sev] || (b.value ?? 0) - (a.value ?? 0))
		.slice(0, n);
}

export function metrics(m){
	const text = m.nodes.filter(n => n.text && n.text.lines >= 2 && n.text.chars > 20);
	const framed = m.nodes.filter(n => n.framed && n.text && n.text.chars > 12);
	const wide = m.nodes.filter(n => n.text && n.text.chars > 20 && n.w > 0);

	const span = wide.length
		? (Math.max(...wide.map(n => n.x + n.w)) - Math.min(...wide.map(n => n.x))) / m.viewport.w
		: null;

	return {
		nodes: m.nodes.length,
		depth: Math.max(0, ...m.nodes.map(n => n.depth)),
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
