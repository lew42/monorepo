/* Where does a layout's behaviour actually change?
 *
 * Coarse stride, then bisect only the intervals whose SIGNATURE differs — the
 * same edges a per-pixel sweep finds, for roughly 2% of the loads. Reasoning:
 * knowledge/responsive.md. */

import { frame } from "./LayoutTool.js";

export async function sweep(url, { from = 360, to = 3440, stride = 64, precision = 4, at } = {}){
	const look = at ?? (w => frame(url, w));
	const samples = [];

	for (let w = from; w <= to; w += stride) samples.push(await sample(look, w));
	if (samples.at(-1).width !== to) samples.push(await sample(look, to));

	const edges = [];

	for (let i = 1; i < samples.length; i++){
		const a = samples[i - 1], b = samples[i];
		if (a.key === b.key) continue;
		edges.push(await bisect(look, a, b, precision));
	}

	return { url, from, to, stride, samples, edges, loads: samples.length + edges.length * 6 };
}

/* Discrete facts only.
 *
 * ⚠ A continuous metric does not become discrete by bucketing it. The first
 * version included `width_used` in 5% buckets and reported four edges on a
 * layout with one: content width drifts smoothly, so it crosses a bucket
 * boundary every few hundred pixels and every crossing read as a reflow.
 * A signature must only change when the layout REARRANGES. */
function signature(report){
	const rules = [...new Set(report.issues.map(i => i.rule))].sort().join(",");
	const cut = report.issues.filter(i => i.rule === "clipped" || i.rule === "escape").length;

	return [rules, report.metrics.scrolls_sideways ? "scroll" : "-", cut].join("|");
}

async function sample(look, width){
	const report = await look(width);
	return { width, key: signature(report), score: report.score, report };
}

/* The narrowest window containing the change. Six loads pins a 64px interval to
 * the pixel; `precision` stops it early when that is more than anyone needs. */
async function bisect(look, lo, hi, precision){
	let a = lo, b = hi;

	while (b.width - a.width > precision){
		const mid = await sample(look, Math.floor((a.width + b.width) / 2));
		if (mid.key === a.key) a = mid; else b = mid;
	}

	return { at: b.width, from: a.width, before: a.key, after: b.key, was: a.score, now: b.score };
}

export default sweep;
