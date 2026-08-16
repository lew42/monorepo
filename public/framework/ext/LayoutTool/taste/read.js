import { boxed, text_chars } from "../ratios.js";

/* The eleven quantities of `ranges.js`, derived from one probe model. Arithmetic
 * only — no DOM, no judgement, exactly like `ratios.js`.
 *
 * ⚠ EVERY LENGTH IS READ AT ITS OWN SCALE. The five shots on the layout-space ruler
 *   are a whole 3440 page rendered at 19%, so a 400px column measures 76px and any
 *   raw pixel threshold reads every one of them as a sliver. Ratios survive a zoom;
 *   `space` and `own()` are what the two absolute measurements use instead. */

export function read(m){
	const kids = children(m);
	const leaf = i => !kids[i].length;
	const own = n => n.w / (n.escale || 1);
	const space = m.frame.w / (m.nodes[0]?.escale || 1);

	// ⚠ 80, not 120: `styles/layouts/web.js`'s shared blurb is 117 characters, and a
	//   120 floor made `measure` unreadable on the whole rail it was written for.
	const prose = m.nodes.filter(n => n.text && n.text.chars > 80);

	// ⚠ EVERY text node. A 20-character floor filters for prose, and a nav rail
	//   beside a wall of numbers has none — five ranges then read null.
	const texts = m.nodes.filter(n => n.text);
	const solid = texts.filter(n => n.text.chars > 20);

	// ⚠ A framed box must HOLD TEXT before its inset means anything: a decorative
	//   swatch is a painted box with no padding by design.
	const chars = text_chars(m);
	const framed = m.nodes.filter(n => n.framed && boxed(n) && own(n) > 120 && chars[n.i] > 8);

	// ⚠ Content, not text — a gallery of image tiles reported spending 11% of a 3440
	//   screen while filling it.
	const content = m.nodes.filter(n => !kids[n.i].length && boxed(n) && n.w > 4 && n.h > 4);
	const every_gap = [];

	const stacks = m.nodes.map((n, i) => {
		const g = spread(kids[i]);
		if (g.length < 2 || n.w < 40) return null;
		every_gap.push(...g);
		return median(g) / n.w;
	}).filter(v => v != null);

	return {
		measure: median(prose.map(n => n.text.per_line)),
		"frame-gap": weighted(framed.filter(n => n.fs > 0), n => n.pad[3] / n.fs, own),
		"pad-share": weighted(framed.filter(n => own(n) > 200), inset, own),
		"gap-share": median(stacks),
		scale: distinct(every_gap),
		lanes: lanes(m),
		repetition: repetition(m, kids, texts),

		// The one that stays on real content: a 40px `span` inside a card is not a
		// sliver, it is a word.
		slivers: solid.length ? share(solid, n => own(n) < 160) : null,

		depth: median(texts.filter(n => leaf(n.i)).map(n => n.depth)),
		"width-used": rows(content, m.frame.w || 1),
		contrast: contrast(texts),
		space,
	};
}

/* Every gap between siblings, on BOTH axes — a grid has two of them.
 * ⚠ NOT `ratios.gaps()`, which answers a stack only and bails the moment two children
 *   share a row: most 3+-child boxes here are grids, so the median page read zero. */
function spread(kids){
	const solid = kids.filter(k => k.w > 1 && k.h > 1
		&& k.position !== "absolute" && k.position !== "fixed");
	if (solid.length < 3) return [];

	const rows = new Map();
	solid.forEach(k => {
		const key = Math.round(k.y / 8);
		rows.set(key, [...(rows.get(key) ?? []), k]);
	});

	const out = [];

	rows.forEach(row => [...row].sort((a, b) => a.x - b.x)
		.forEach((k, i, all) => i && out.push(Math.round(k.x - (all[i - 1].x + all[i - 1].w)))));

	[...rows.values()]
		.map(row => [Math.min(...row.map(k => k.y)), Math.max(...row.map(k => k.y + k.h))])
		.sort((a, b) => a[0] - b[0])
		.forEach(([top], i, all) => i && out.push(Math.round(top - all[i - 1][1])));

	return out.filter(g => g >= 0 && g < 400);
}

/* A box's inset over what a box that size SHOULD have — `polish.js`'s own
 * `min(3.5%, 3.5em)`, proportional until a box gets wide and then flat.
 * ⚠ A raw share of the width put this range and `frame-gap` in direct conflict on a
 *   wide band; both were right about different boxes. readme.md, "The second wave". */
function inset(n){
	const want = Math.min(0.035 * n.w, 3.5 * (n.fs || 16));
	return want > 0 ? n.pad[3] / want : null;
}

function children(m){
	const kids = m.nodes.map(() => []);
	m.nodes.forEach(n => { if (n.parent >= 0) kids[n.parent].push(n); });
	return kids;
}

/* Alignment counted from the positive side: how much of the page sits on a lane at
 * all. `polish.js`'s `alignment` reports the near-misses, which cannot say whether
 * the page is 90% aligned or 20%. */
function lanes(m){
	const blocks = m.nodes.filter(n => boxed(n) && n.w > 80 && n.h > 8);
	const by = new Map();

	blocks.forEach(n => {
		const key = Math.round(n.x / 2);
		by.set(key, (by.get(key) ?? 0) + 1);
	});

	return share(blocks, n => by.get(Math.round(n.x / 2)) >= 3);
}

/* A group of three or more siblings drawn the same way, and the text just inside one.
 * ⚠ TWO LEVELS, and that bound is the whole rule: unbounded, three top-level bands
 *   sharing a class mark every word under them and every layout measures 1.00. */
const REACH = 2;

function repetition(m, kids, texts){
	const from = new Array(m.nodes.length).fill(Infinity);

	kids.forEach(row => {
		const by = new Map();
		row.forEach(k => by.set(k.sel, [...(by.get(k.sel) ?? []), k]));
		by.forEach(group => group.length >= 3 && group.forEach(k => { from[k.i] = 0; }));
	});

	// Preorder, so one forward pass carries each group's reach down to its text.
	m.nodes.forEach(n => {
		if (n.parent >= 0) from[n.i] = Math.min(from[n.i], from[n.parent] + 1);
	});

	return share(texts, n => from[n.i] <= REACH);
}

function contrast(texts){
	const sizes = texts.map(n => n.fs).filter(v => v > 0);
	const mid = median(sizes);

	return mid > 0 ? Math.max(...sizes) / mid : null;
}

/* How much of the width the TYPICAL ROW uses — banded by y, then the median.
 *
 * ⚠ Not one span from the leftmost box to the rightmost, which is what this was and
 *   what `dead-space` still does. One full-bleed topbar pins that span to the whole
 *   screen however narrow the body under it is, so a page pinned to a 20em column at
 *   3440 measured as spending the entire screen — caught by `corpus.js`'s "pinned the
 *   body narrow", which the band could not see at all. A median over rows can. */
function rows(content, width){
	if (!content.length) return 0;

	const band = new Map();
	content.forEach(n => {
		const key = Math.round(n.y / 24);
		const at = band.get(key) ?? [Infinity, -Infinity];
		band.set(key, [Math.min(at[0], n.x), Math.max(at[1], n.x + n.w)]);
	});

	return median([...band.values()].map(([a, b]) => (b - a) / width)) ?? 0;
}

/* The gap sizes the page RUNS ON — the smallest set covering four fifths of them,
 * rounded to 4px because 12 and 13 are one decision made once.
 * ⚠ Not the count of DISTINCT values: every real page has a long tail of one-off gaps
 *   on top of the three or four it is built from, and this tier's own page read 25. */
function distinct(list){
	const counts = new Map();
	list.filter(g => g > 0).forEach(g => {
		const key = Math.round(g / 4);
		counts.set(key, (counts.get(key) ?? 0) + 1);
	});

	const total = [...counts.values()].reduce((sum, n) => sum + n, 0);
	if (!total) return 0;

	let seen = 0, used = 0;
	for (const n of [...counts.values()].sort((a, b) => b - a)){
		used++;
		if ((seen += n) >= total * 0.8) break;
	}

	return used;
}

const share = (list, is) => (list.length ? list.filter(is).length / list.length : null);

/* Padding, averaged with each box weighted by its own width.
 * ⚠ A plain median hid the thing these two bands exist for: a page carries a dozen
 *   correctly-padded components and two or three layout tracks, so stripping every
 *   track's inset moved the median by NOTHING — caught by `corpus.js`'s "took the
 *   padding out". A 3440-wide band with no inset is a bigger mistake than a 200px
 *   chip with none, and weighting by width is the cheapest way to say so. */
function weighted(list, value, by){
	let sum = 0, mass = 0;

	for (const n of list){
		const v = value(n), w = by(n);
		if (Number.isFinite(v) && w > 0){ sum += v * w; mass += w; }
	}

	return mass ? sum / mass : null;
}

function median(list){
	const sorted = list.filter(Number.isFinite).sort((a, b) => a - b);
	if (!sorted.length) return null;

	const mid = sorted.length >> 1;
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export default read;
