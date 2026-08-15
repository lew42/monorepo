/* The front door. `analyze()` is the whole tool — everything else is a way of
 * calling it somewhere else (an iframe, a width sweep, a saved capture).
 *
 * import { analyze } from "/framework/ext/LayoutTool/LayoutTool.js";
 * analyze(document.querySelector(".page.active-page"));   // → report
 */

import { probe } from "./probe.js";
import { rules as broken } from "./rules.js";
import { polish } from "./polish.js";
import { split } from "./defer.js";
import { score, leading, metrics } from "./score.js";

/* Two tiers, one list. `rules.js` is what is BROKEN — geometry that fails.
 * `polish.js` is what is OFF — alignment, proportion, hierarchy. Everything in
 * the second tier caps at medium, so a wobble can never outrank content that
 * cannot be reached. */
export const rules = [...broken, ...polish];

export { probe };

/* `target` is an element, or a probe model captured earlier — the rules never
 * touch the DOM, so a report can be recomputed from a JSON capture with no
 * browser at all. */
export function analyze(target = document.querySelector(".app") ?? document.body, opts = {}){
	const model = target?.nodes ? target : probe(target, opts);
	const all = judge(model);

	// A finding the reader has already waved through costs nothing. Only the
	// polish tier is deferrable; see defer.js.
	const { kept: issues, waived } = split(model.url, all);

	return {
		waived: waived.length,
		url: model.url, at: model.at, root: model.root, root_path: model.root_path,
		viewport: model.viewport, frame: model.frame,
		...score(issues),
		metrics: metrics(model),
		counts: tally(issues),
		leading: leading(issues),
		issues,
	};
}

export function judge(model){
	const out = [];

	for (const r of rules)
		for (const i of r.scan(model))
			out.push({ ...i, rule: r.id, cat: r.cat, title: r.title });

	return roll_up(out, model);
}

/* Eight consecutive paragraphs each running 96 characters is ONE mistake, and it
 * is not in any of the paragraphs — it is the container that never bounded them.
 * Siblings sharing a rule collapse onto their parent, carrying the worst
 * instance's numbers as the exemplar.
 *
 * ⚠ TWO, not three. This started at three on the theory that a pair might be two
 * independent slips — but two paragraphs in one container running 112 characters
 * are not two slips, they are one container. Reported separately they read as
 * twice the problem and point at the wrong element both times. */
const FLOCK = 2;

function roll_up(issues, model){
	const flocks = new Map();

	for (const i of issues){
		const node = model.nodes[i.node];
		if (!node || node.parent < 0) continue;
		const key = `${i.rule}:${node.parent}`;
		flocks.set(key, [...(flocks.get(key) ?? []), i]);
	}

	const rolled = new Set();
	const out = [];

	for (const [key, flock] of flocks){
		if (flock.length < FLOCK) continue;

		const parent = model.nodes[Number(key.split(":")[1])];
		const worst = flock.reduce((a, b) => (RANK[b.sev] > RANK[a.sev] ? b : a));

		flock.forEach(i => rolled.add(i));

		out.push({
			...worst,
			sel: parent.sel, node: parent.i, path: parent.path, children: flock.length,
			detail: `${flock.length} children of ${parent.sel} share this — worst is ${worst.sel}, ${worst.detail}`,
			fix: worst.fix && { sel: parent.sel, decl: parent_fix(worst) },
		});
	}

	return [...issues.filter(i => !rolled.has(i)), ...out];
}

// The child's fix applied to the container. `max-width` on eight paragraphs is
// eight rules to unset later; on their parent it is one.
function parent_fix(worst){
	return worst.rule === "measure" && worst.value > 85
		? "--measure: 52em; max-width: var(--measure)"
		: worst.fix.decl;
}

const RANK = { high: 3, med: 2, low: 1 };

function tally(issues){
	const out = { high: 0, med: 0, low: 0, total: issues.length };
	issues.forEach(i => out[i.sev]++);
	return out;
}

/* The same analysis on another document, at a width this window doesn't have.
 * Same-origin, so the iframe's modules are this module — one implementation,
 * whether the caller is a page, a report, or a headless driver. */
export function frame(url, width, { height = 900, settle = 350, root = ".app" } = {}){
	return new Promise((resolve, reject) => {
		const el = document.createElement("iframe");
		el.setAttribute("data-layout-ignore", "");
		el.style.cssText = `position:fixed;left:-10000px;top:0;border:0;width:${width}px;height:${height}px`;
		el.src = url;

		el.onerror = () => finish(reject, new Error(`could not load ${url}`));

		el.onload = () => setTimeout(() => {
			try {
				const doc = el.contentDocument;
				finish(resolve, { ...analyze(doc.querySelector(root) ?? doc.body), url });
			} catch (e){ finish(reject, e); }
		}, settle);

		document.body.append(el);

		function finish(done, value){ el.remove(); done(value); }
	});
}
