/* The polish tier: looks off but not broken — nearly-aligned edges, misscaled padding, missing structure.
 * Everything caps at MEDIUM. History and rules: doc/polish-notes.md. */

import { each_child, boxed, children, text_bounds } from "./ratios.js";

const HEADINGS = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };
const LIST = new Set(["ul", "ol", "dl", "menu"]);
const rule = (id, cat, title, scan) => ({ id, cat, title, scan });
const issue = (n, sev, value, detail, fix) =>
	({ sel: n.sel, node: n.i, path: n.path, sev, value, detail, fix });

export const polish = [

	/* ⚠ Both bounds matter: font-size (readability) and width (composition).
	 * Width floor 3.5% capped at 3.5em binds on wide boxes. See doc/polish-notes.md. */
	rule("pad-scale", "proportion", "Padding doesn't scale with the box", m => {
		const bounds = text_bounds(m);

		// ⚠ Cards only (320–85vw); full-width sections use the gutter rule.
		const card = n => n.w >= 320 && n.w <= m.viewport.w * 0.85;

		return m.nodes.filter(n => n.framed && boxed(n) && card(n) && bounds[n.i]).flatMap(n => {
			const side = Math.min(n.pad[1], n.pad[3]);
			const want = Math.min(n.w * 0.035, n.fs * 3.5);
			if (side >= want - 0.5) return [];

			const ratio = side / n.w;
			const short = want / Math.max(side, 1);
			const sev = short >= 3 ? "med" : "low";

			return [issue(n, sev, ratio,
				`${side}px of side padding on a ${Math.round(n.w)}px box — ${pct(ratio)} of its width, `
				+ `where ${Math.round(want)}px (${pct(want / n.w)}) would be proportionate`,
				{ sel: n.sel, decl: "padding: clamp(0.75em, 3.5%, 3.5em)" })];
		});
	}),

	// Only near misses (3–12px); bigger gaps are intentional columns.
	rule("alignment", "alignment", "Edges nearly line up, but don't", m => {
		const found = [];

		for (const axis of ["x", "right"]){
			// ⚠ Block-level only; inline elements don't define layout lanes.
			const edges = m.nodes
				.filter(n => n.w > 60 && n.h > 8 && n.position === "static"
					&& !n.display.startsWith("inline") && n.display !== "contents")
				.map(n => ({ n, at: axis === "x" ? n.x : n.x + n.w }));

			const lanes = cluster(edges.map(e => e.at), 1);

			// ⚠ Browsers land fractional edges everywhere; 3px is visible, need 4+ for a lane.
			for (const { n, at } of edges){
				const lane = lanes.find(l => Math.abs(l.at - at) <= 12 && l.count >= 4);
				const off = lane ? Math.abs(lane.at - at) : 0;
				if (!lane || off < 3) continue;

				found.push(issue(n, off > 8 ? "med" : "low", off,
					`its ${axis === "x" ? "left" : "right"} edge sits ${off.toFixed(1)}px off a line `
					+ `${lane.count} other elements share`,
					{ sel: n.sel, decl: axis === "x" ? "margin-inline-start: 0" : "margin-inline-end: 0" }));
			}
		}

		return found;
	}),

	// Only pairs directly below; sibling-matching avoids false positives. doc/polish-notes.md.
	rule("heading-offset", "alignment", "A heading doesn't line up with its own text", m => {
		const kids = children(m);
		const found = [];

		// Include heading-over-heading; hierarchy is about relative, not absolute.
		for (const head of m.nodes){
			if (!level(head) || !head.text || head.display.startsWith("inline")) continue;

			const sibs = head.parent >= 0 ? kids[head.parent] : [];
			const at = starts(kids, sibs[sibs.indexOf(head) + 1]);
			if (!at) continue;

			if (at.y < head.y + head.h - 2) continue;                // side by side, not above/below
			if (at.y - (head.y + head.h) > head.h * 3) continue;     // too far apart to read as a pair

			const off = Math.abs(at.x - head.x);
			if (off < 2) continue;

			found.push(issue(at, off > 12 ? "med" : "low", off,
				`starts ${Math.round(off)}px ${at.x > head.x ? "right" : "left"} of the `
				+ `"${head.sel}" above it — a heading and its text are one column`,
				{ sel: at.sel, decl: "padding-inline: 0; margin-inline: 0" }));
		}

		return found;
	}),

	// Ragged rows may be intentional (align-items: start) — a judgement call, not an error.
	rule("ragged-row", "alignment", "A row of cards ends at different heights", m =>
		each_child(m).flatMap(({ node, kids }) => {
			const row = kids.filter(k => k.framed && k.h > 24 && k.position === "static");
			if (row.length < 3) return [];

			const top = Math.min(...row.map(k => k.y));
			if (row.some(k => Math.abs(k.y - top) > 4)) return [];   // not one row

			const heights = row.map(k => k.h);
			const tall = Math.max(...heights), short = Math.min(...heights);
			if (tall - short < 24) return [];

			const ratio = tall / short;
			if (ratio < 1.35) return [];

			return [issue(node, ratio >= 2 ? "med" : "low", ratio,
				`${row.length} cards in one row run ${Math.round(short)}–${Math.round(tall)}px tall `
				+ `(${ratio.toFixed(1)}×) — the row reads ragged along the bottom`,
				{ sel: node.sel, decl: "align-items: stretch" })];
		})),

	// Multiple h1s are distracting; also check for skipped levels.
	rule("hierarchy", "hierarchy", "Heading levels don't form an outline", m => {
		const heads = m.nodes.filter(n => level(n) && n.text).sort((a, b) => a.y - b.y || a.x - b.x);
		if (heads.length < 2) return [];

		const found = [];
		const ones = heads.filter(h => level(h) === 1);

		if (ones.length > 1)
			found.push(issue(ones[1], "med", ones.length,
				`${ones.length} level-1 headings on one page — a page has one top`,
				{ sel: ones[1].sel, decl: "font-size: var(--h2)  /* demote to h2 */" }));

		for (let i = 1; i < heads.length; i++){
			const prev = heads[i - 1], now = heads[i];
			const gap = now.y - (prev.y + prev.h);

			// Two headings stacked with nothing in between, at the same level.
			if (level(now) === level(prev) && gap >= 0 && gap < prev.h * 1.2)
				found.push(issue(now, "low", 0,
					`sits directly under another level-${level(now)} heading with no content between them`,
					{ sel: now.sel, decl: "/* demote one, or put the section's text between */" }));

			if (level(now) - level(prev) > 1)
				found.push(issue(now, "low", level(now) - level(prev),
					`jumps from h${level(prev)} to h${level(now)} — a level was skipped`,
					{ sel: now.sel, decl: `font-size: var(--h${level(prev) + 1})` }));
		}

		return found;
	}),

	// Nested padding only legitimate if paint changes (background, border). doc/polish-notes.md.
	rule("double-pad", "proportion", "Padding nested inside padding, with nothing to show for it", m =>
		m.nodes.filter(n => n.parent >= 0 && boxed(n)).flatMap(n => {
			const p = m.nodes[n.parent];
			if (!boxed(p)) return [];

			const inner = Math.min(n.pad[1], n.pad[3]);
			const outer = Math.min(p.pad[1], p.pad[3]);
			if (inner < 6 || outer < 6) return [];

			// ⚠ Child fills parent iff width ≥ cw − both pads (was: one pad — unsatisfiable).
			if (n.w < p.cw - p.pad[1] - p.pad[3] - 4) return [];
			if (n.bg !== p.bg || n.framed !== p.framed) return [];

			const total = inner + outer;
			return [issue(n, total > 64 ? "med" : "low", total,
				`${outer}px on ${p.sel} plus ${inner}px here — ${total}px of inset, and the two boxes `
				+ `paint identically, so nothing marks the second one`,
				{ sel: n.sel, decl: "padding: 0" })];
		})),

	// ⚠ Short pages aren't defects; only boxes that RESERVE unused height count.
	rule("whitespace", "proportion", "A large empty area below the content", m =>
		each_child(m).flatMap(({ node, kids }) => {
			if (node.i === 0 || node.h < 320 || !boxed(node)) return [];
			if (node.h >= m.viewport.h - 40) return [];

			const solid = kids.filter(k => k.h > 4 && k.position === "static");
			if (!solid.length) return [];

			const bottom = Math.max(...solid.map(k => k.y + k.h));
			const slack = (node.y + node.h) - bottom - node.pad[2];
			const share = slack / node.h;

			if (slack < 160 || share < 0.25) return [];

			return [issue(node, share > 0.5 ? "med" : "low", share,
				`${Math.round(slack)}px below the last child — ${pct(share)} of a ${Math.round(node.h)}px box `
				+ `is empty`,
				{ sel: node.sel, decl: "min-height: auto" })];
		})),

	// Flat pages are legitimate, but structure with nothing marking it is hard to read.
	rule("invisible", "hierarchy", "Structure with nothing to see it by", m => {
		const groups = each_child(m).filter(({ kids }) => kids.length >= 3
			&& kids.filter(k => k.h > 24 && boxed(k)).length >= 3);

		if (groups.length < 3) return [];

		const painted = m.nodes.filter(n => n.framed && n.w > 80 && n.h > 40).length;
		if (painted >= 2) return [];

		return [issue(m.nodes[0], "low", groups.length,
			`${groups.length} groups of three or more blocks, and ${painted} of them draw a surface — `
			+ `the grouping is carried by whitespace alone`,
			{ sel: m.nodes[0].sel, decl: "/* a `surface` or `wash` on the groups that are one thing */" })];
	}),
];

const level = n => HEADINGS[n.tag] ?? HEADINGS[[...n.sel.matchAll(/\.(h[1-6])\b/g)].at(0)?.[1]];

	/* Leftmost visible start under a heading (text, frame, list, or nothing below).
	 * ⚠ LEFTMOST not first-in-order; display:contents has no box. doc/polish-notes.md. */
function starts(kids, n){
	const seen = [];

	walk(n);

	return seen.sort((a, b) => a.x - b.x)[0] ?? null;

	function walk(at){
		if (!at || !boxed(at) || at.w <= 4 || at.h <= 4
			|| at.position === "absolute" || at.position === "fixed") return;

		if (at.text || at.framed || LIST.has(at.tag) || !kids[at.i].length) return void seen.push(at);

		kids[at.i].forEach(walk);
	}
}

	// Merges values within tolerance; single-element lanes are ignored.
function cluster(values, tol){
	const sorted = [...values].sort((a, b) => a - b);
	const lanes = [];

	for (const v of sorted){
		const last = lanes.at(-1);
		if (last && v - last.at <= tol){ last.count++; continue; }
		lanes.push({ at: v, count: 1 });
	}

	return lanes;
}

const pct = r => `${(r * 100).toFixed(1)}%`;
