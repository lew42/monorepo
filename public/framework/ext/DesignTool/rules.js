// Design system and thresholds: doc/rules-notes.md
// ⚠ Severity is a curve, not a line: three thresholds per rule, magnitude picks one.

import {
	boxed, each_child, gaps, overlap, padding_box, region, scrolls, spill,
	text_bounds, text_chars, under_scroller,
} from "./ratios.js";

const CODE = new Set(["pre", "code", "kbd", "samp"]);
const CELL = new Set(["td", "th"]);
const TABLE = new Set(["table", "thead", "tbody", "tfoot", "tr"]);
const rule = (id, cat, title, scan) => ({ id, cat, title, scan });
const issue = (n, sev, value, detail, fix) =>
	({ sel: n.sel, node: n.i, path: n.path, sev, value, detail, fix });

// ROOT's client box less inline padding; doc/rules-notes.md
function content_width(m){
	const root = m.nodes[0];
	return root ? root.cw - root.pad[1] - root.pad[3] : m.viewport.w;
}

const over = (v, low, med, high) => (v >= high ? "high" : v >= med ? "med" : v >= low ? "low" : null);
const under = (v, low, med, high) => (v <= high ? "high" : v <= med ? "med" : v <= low ? "low" : null);

export const rules = [

	// More hidden than shown, and no scrollbar: doc/rules-notes.md
	rule("unreachable", "overflow", "Content clipped away with no way to scroll to it", m =>
		spill(m).filter(gone).map(s => issue(s.child, "high", s.ratio,
			`${s.over}px of ${s.parent.sel} is past its own ${side(s)} (${pct(s.ratio)}) and `
			+ `overflow is ${s.axis === "x" ? s.parent.ovx : s.parent.ovy} — there is no scrollbar to reach it`,
			{ sel: s.parent.sel, decl: s.axis === "x" ? "overflow-x: auto" : "overflow-y: auto" }))),

	rule("clipped", "overflow", "Content cut off with no way to reach it", m =>
		spill(m).filter(s => s.hidden && !gone(s)).flatMap(s => {
			const sev = over(s.ratio, 0.02, 0.08, 0.25) ?? (s.over > 24 ? "med" : "low");
			return [issue(s.child, sev, s.ratio,
				`${s.over}px past ${s.parent.sel} (${pct(s.ratio)} of its ${side(s)}), which is overflow:hidden`,
				{ sel: s.parent.sel, decl: s.axis === "x" ? "overflow-x: auto" : "overflow-y: auto" })];
		})),

	rule("escape", "overflow", "Content spills outside its box", m =>
		spill(m).filter(s => !s.hidden).flatMap(s => {
			const sev = over(s.ratio, 0.02, 0.10, 0.25);
			return sev ? [issue(s.child, sev, s.ratio,
				`${s.over}px outside ${s.parent.sel} (${pct(s.ratio)} of its ${side(s)})`,
				{ sel: s.child.sel, decl: "min-width: 0" })] : [];
		})),

	// ⚠ Not gated on DOCUMENT scrolling; in app shells scroll lives on a region
	rule("doc-overflow", "responsive", "Content extends past the viewport", m => {
		const past = n => n && n.x + n.w > m.viewport.w + 2;

		return m.nodes
			.filter(n => n.position !== "fixed" && past(n) && !past(m.nodes[n.parent])
				&& !under_scroller(m, n))
			.flatMap(n => {
			const ratio = (n.x + n.w - m.viewport.w) / m.viewport.w;
			return [issue(n, over(ratio, 0.005, 0.05, 0.2) ?? "low", ratio,
				`extends ${Math.round(n.x + n.w - m.viewport.w)}px past the ${m.viewport.w}px viewport`,
				{ sel: n.sel, decl: "max-width: 100%; min-width: 0" })];
		});
	}),

	// Measured from text bounds, not box padding: doc/rules-notes.md
	rule("cramped", "spacing", "Text butts against its own frame", m => {
		const bounds = text_bounds(m);
		const still = n => n.ovx === "visible" && n.ovy === "visible";
		const shell = n => n.w >= m.viewport.w - 2;

		// ⚠ Table insets belong to CELL not TR; cells only high tier to avoid 4px row rhythm
		return m.nodes
			.filter(n => n.framed && n.w > 24 && boxed(n) && still(n) && !shell(n) && bounds[n.i]
				&& !TABLE.has(n.tag))
			.flatMap(n => {
				const [gap, fs] = nearest(padding_box(n), bounds[n.i]);
				const ratio = gap / fs;
				const sev = under(ratio, 0.35, 0.2, 0.08);

				if (CELL.has(n.tag) && sev !== "high") return [];

				return sev && gap >= -2 ? [issue(n, sev, ratio,
					`nearest text sits ${Math.round(gap)}px from the frame — ${ratio.toFixed(2)}× its `
					+ `${fs}px size, ${pct(Math.max(0, gap) / n.w)} of the box width`,
					{ sel: n.sel, decl: "padding: 0.6em 0.9em" })] : [];
			});
	}),

	// Scroll containers only; measured against content_width not viewport: doc/rules-notes.md
	rule("gutter", "spacing", "Text flush against the edge of its region", m => {
		const bounds = text_bounds(m);

		// ⚠ Not the shell (.app spans viewport) ⚠ Not the ROOT (reports own boundary as gutter)
		// ⚠ AGAINST ROOT'S CONTENT WIDTH not WINDOW; dev-rail padding causes false top findings
		const shell = content_width(m) - 2;
		const regions = m.nodes.filter(n =>
			(scrolls(n.ovx) || scrolls(n.ovy)) && n.w < shell);

		return regions.filter(n => n.w > 120 && bounds[n.i]).flatMap(n => {
			const [gap, fs] = nearest(padding_box(n), bounds[n.i]);
			const ratio = gap / fs;
			const sev = under(ratio, 0.25, 0.12, 0.04);

			return sev && gap >= -2 ? [issue(n, sev, ratio,
				`text reaches within ${Math.round(gap)}px of ${n.sel}'s edge — ${ratio.toFixed(2)}× its `
				+ `${fs}px size. A region needs a gutter`,
				{ sel: n.sel, decl: "--page-pad: 2.5em clamp(1.5em, 3%, 3.5em)" })] : [];
		});
	}),

	// ⚠ Code exempt + contents; one line counts (3440 fits 300-char single line)
	rule("measure", "typography", "Line length outside the readable band", m =>
		m.nodes.filter(n => n.text && !in_code(m, n)).flatMap(n => {
			const ch = n.text.per_line;
			const wide = over(ch, 85, 100, 130);

			if (wide) return [issue(n, wide, ch,
				`~${ch} characters per line (readable is 45–85)`,
				{ sel: n.sel, decl: "max-width: 52em" })];

			// Laddering: two words a line; cells run 18–24 legitimately; doc/rules-notes.md
			if (n.text.lines < 5 || in_cell(m, n)) return [];
			const thin = under(ch, 20, 15, 11);

			return thin ? [issue(n, thin, ch,
				`~${ch} characters per line over ${n.text.lines} lines — text laddering down a column ${n.w}px wide`,
				{ sel: n.sel, decl: "min-width: 12em" })] : [];
		})),

	// 10px label ok; 10px paragraph is problem: low tier needs real text. doc/rules-notes.md
	rule("illegible", "typography", "Rendered too small to read", m =>
		m.nodes.filter(n => n.text && n.text.chars > 8).flatMap(n => {
			const px = n.fs * n.escale;
			const sev = under(px, n.text.chars > 40 ? 10.5 : 9, 9, 7);

			return sev ? [issue(n, sev, px,
				`${n.fs}px text at ${n.escale}× renders ${px.toFixed(1)}px on screen`,
				{ sel: n.sel, decl: "font-size: 0.875rem" })] : [];
		})),

	rule("line-height", "typography", "Lines too tight or too loose", m =>
		m.nodes.filter(n => n.text && n.text.lines >= 2 && n.fs > 0).flatMap(n => {
			const r = n.lh / n.fs;
			const sev = under(r, 1.25, 1.15, 1.0) ?? over(r, 2.2, 2.8, 3.5);

			return sev ? [issue(n, sev, r,
				`line-height is ${r.toFixed(2)}× the font size (comfortable is 1.4–1.7)`,
				{ sel: n.sel, decl: "line-height: 1.5" })] : [];
		})),

	rule("collision", "overflow", "Siblings overlap", m =>
		overlap(m).map(([a, b, area, share]) =>
			issue(a, over(share, 0.08, 0.25, 0.5) ?? "low", share,
				`overlaps ${b.sel} across ${pct(share)} of the smaller box (${Math.round(area)}px²)`,
				{ sel: a.sel, decl: "position: static" }))),

	// ⚠ Uses text BOUNDS not node text; ⚠ boxed()/display:contents read as 0
	rule("zero-size", "overflow", "Collapsed to nothing", m => {
		const bounds = text_bounds(m);

		return m.nodes.filter(n => bounds[n.i] && n.parent >= 0 && boxed(n) && (n.w < 1 || n.h < 1))
			.map(n => issue(n, "high", 0,
				`a ${n.w}×${n.h} box still holding text — its content occupies no space`,
				{ sel: n.sel, decl: "min-height: 1em" }));
	}),

	// ⚠ WCAG 2.5.8 exemptions: links in sentences, controls with stretched ::after
	// ⚠ Identical selector at identical size = one declaration, counts them
	rule("hit-size", "spacing", "Too small to tap", m =>
		distinct(m.nodes.filter(n => n.interactive && n.w > 0 && n.h > 0
			&& n.display !== "inline" && !n.stretched).flatMap(n => {
			const w = n.w / n.escale, h = n.h / n.escale;
			const sev = under(Math.min(w, h), 24, 18, 12);

			return sev ? [{ ...issue(n, sev, Math.min(w, h),
				`${Math.round(w)}×${Math.round(h)} at its own scale — under the 24px minimum target`,
				{ sel: n.sel, decl: "min-height: 24px; min-width: 24px" }),
				key: `${n.sel}|${Math.round(w)}×${Math.round(h)}` }] : [];
		}))),

	// "72px under a card icon" bug: margin resolving against font-size; doc/rules-notes.md
	rule("rhythm", "rhythm", "One gap breaks the stack's rhythm", m =>
		each_child(m).flatMap(({ node, kids }) => {
			if (kids.length < 3) return [];
			const g = gaps(kids);
			if (g.length < 2) return [];

			const sorted = [...g].sort((a, b) => a - b);
			const med = sorted[sorted.length >> 1];
			const max = sorted.at(-1);
			if (med <= 0 || max - med < 16) return [];

			const sev = over(max / med, 3, 5, 9);

			return sev ? [issue(node, sev, max / med,
				`gaps run ${sorted[0]}–${max}px around a ${med}px median — ${(max / med).toFixed(1)}× the norm`,
				{ sel: node.sel, decl: "gap: 1em" })] : [];
		})),

	rule("dead-space", "space", "Widescreen space left as gutter", m => {
		if (m.viewport.w < 1500) return [];
		const text = m.nodes.filter(n => n.text && n.text.chars > 20 && n.w > 0);
		if (text.length < 4) return [];

		const left = Math.min(...text.map(n => n.x));
		const right = Math.max(...text.map(n => n.x + n.w));
		const used = (right - left) / m.viewport.w;
		const sev = under(used, 0.55, 0.42, 0.3);

		return sev ? [issue(m.nodes[0], sev === "high" ? "med" : sev, used,
			`content spans ${pct(used)} of a ${m.viewport.w}px viewport — `
			+ `${Math.round(m.viewport.w - right)}px of dead space on the right`,
			{ sel: m.nodes[0].sel, decl: "--column: 40em  /* on a .grid.auto */" })] : [];
	}),

	// Dead urls vs live pages: thinnest threshold in module; doc/rules-notes.md
	rule("empty", "content", "Nothing here to lay out", m => {
		const box = region(m);
		if (!box || box.h < 320) return [];

		const chars = text_chars(m)[box.i];
		const sev = under(chars, 128, 96, 64);

		return sev ? [issue(box, sev, chars,
			`${chars} characters of text in a ${Math.round(box.w)}×${Math.round(box.h)} region — `
			+ `a dead url, or content that never arrived`,
			{ sel: box.sel, decl: "/* nothing to fix here: check the url resolves */" })] : [];
	}),
];

// More hidden than shown
const gone = s => s.hidden && s.ratio >= 1 && s.over >= 200;

// One finding per distinct key with count; doc/rules-notes.md
function distinct(list){
	const by = new Map();
	for (const i of list) by.set(i.key, [...(by.get(i.key) ?? []), i]);

	return [...by.values()].map(([{ key, ...first }, ...rest]) => rest.length
		? { ...first, count: rest.length + 1, detail: `${first.detail} — ${rest.length + 1} of them` }
		: first);
}

// Closest approach on any edge with font size of text; doc/rules-notes.md
function nearest(box, t){
	const edges = [
		[t.x0 - box.x, t.x0fs], [box.x + box.w - t.x1, t.x1fs],
		[t.y0 - box.y, t.y0fs], [box.y + box.h - t.y1, t.y1fs],
	];
	return edges.reduce((a, b) => (a[0] / a[1] <= b[0] / b[1] ? a : b));
}

function within(m, n, tags){
	for (let at = n; at; at = at.parent >= 0 ? m.nodes[at.parent] : null)
		if (tags.has(at.tag)) return true;
	return false;
}

const in_code = (m, n) => within(m, n, CODE);
const in_cell = (m, n) => within(m, n, CELL);

const pct = r => `${Math.round(r * 100)}%`;
const side = s => (s.axis === "x" ? "width" : "height");
