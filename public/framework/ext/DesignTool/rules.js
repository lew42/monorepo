/* Every rule reads plain numbers from probe.js and yields issues. No DOM here —
 * which is what lets the same rules run on a live page, an iframe, or a JSON
 * capture taken an hour ago.
 *
 * A threshold is a RATIO wherever one exists: padding against font-size, not
 * against 8px; characters per line, not ems. One number then holds at every
 * viewport and every font scale. Calibration: knowledge/thresholds.md.
 *
 * ⚠ SEVERITY IS A CURVE, NOT A LINE. Every rule states three thresholds and the
 * magnitude picks one. A binary test reported 87 characters a line and 300
 * characters a line identically — and those are not the same bug. */

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

/* The width the ROOT actually gave its children — its client box less its own
 * inline padding. `m.viewport.w` is the window, which is a different number the
 * moment anything pads the shell (the dev rail does, by 272px). Falls back to the
 * window when there is no root to ask. */
function content_width(m){
	const root = m.nodes[0];
	return root ? root.cw - root.pad[1] - root.pad[3] : m.viewport.w;
}

// Bigger is worse / smaller is worse. Both return null below the low threshold,
// which is the rule declining to report.
const over = (v, low, med, high) => (v >= high ? "high" : v >= med ? "med" : v >= low ? "low" : null);
const under = (v, low, med, high) => (v <= high ? "high" : v <= med ? "med" : v <= low ? "low" : null);

export const rules = [

	/* More hidden than shown, and no scrollbar anywhere: the reader cannot get to
	 * it by any means. Its own rule rather than `clipped`'s top band because a
	 * severity tier cannot say this — `/web/nav/drill/` hides 4099px of a 900px
	 * region and scored 82/B as one 12-point `high`. score.js weights it by RULE. */
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

	/* ⚠ Not gated on the DOCUMENT scrolling. In an app shell the scroll lives on
	 * a region, so `documentElement.scrollWidth` never grows and the rule would
	 * never fire — while the content is just as far off screen. */
	rule("doc-overflow", "responsive", "Content extends past the viewport", m => {
		const past = n => n && n.x + n.w > m.viewport.w + 2;

		// Only the OUTERMOST offender in a chain — a wide element's children are
		// all wide too, and reporting each is one bug counted twenty times.
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

	/* The owner's original example, measured rather than inferred: how close does the
	 * nearest text actually get to a box that draws an edge? Reading the box's own
	 * padding would miss the common shape — no padding on the card, a margin on
	 * the paragraph inside — and flag a card that is in fact fine. */
	rule("cramped", "spacing", "Text butts against its own frame", m => {
		const bounds = text_bounds(m);
		const still = n => n.ovx === "visible" && n.ovy === "visible";
		const shell = n => n.w >= m.viewport.w - 2;

		/* ⚠ A table's insets belong to the CELL, so measuring a `<tr>` reports a
		 * padding it cannot hold — and a cell's 4px row rhythm is not a cramped
		 * card, which was 175 identical findings on one page. Cells stay in at the
		 * touching band only, which still catches `padding: 0`. */
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

	/* The one the tool missed on its own audit page, where the h1 sat 0px from the
	 * region's edge. `cramped` could not see it: a page draws no frame, so there
	 * was nothing it considered an edge. A REGION's edge is an edge too. */
	rule("gutter", "spacing", "Text flush against the edge of its region", m => {
		const bounds = text_bounds(m);

		/* Scroll containers only.
		 *
		 * ⚠ Not the shell — a full-bleed `.app` spans the viewport, so its edge
		 * IS the window and the nav sitting against it is the design.
		 * ⚠ And not the analysis ROOT. A caller measuring a bare container gets
		 * its own boundary reported as a missing gutter, which is how a live
		 * panel pointed at one demo box accused it of touching its own edge. A
		 * region is a thing that scrolls; the page's own is `.pages`, which is
		 * still checked and is what caught the audit page's flush h1.
		 *
		 * ⚠ AGAINST THE ROOT'S CONTENT WIDTH, NEVER THE WINDOW — measured against
		 * the window, THE TOOL MANUFACTURED ITS OWN TOP FINDING. `framework.css`
		 * gives `.app` a `padding-inline-end` the width of the dev rail, so with the
		 * rail open `.pages` measures 1648 of a 1920 window, clears "not the shell"
		 * by 270px, and a `high · gutter` appears on the page region: 18 of 24
		 * page×width pairs with the rail as the only variable, the TOP finding on
		 * 12, ringing 79% of the viewport. Opening the tool must not change what the
		 * tool reports. `ai/2026-08-17/tier-calibration/`. */
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

	/* ⚠ Code is exempt, and so is anything INSIDE it. Checking the tag alone let
	 * every highlighted `span.hljs-*` through — a syntax-coloured string reported
	 * as a 129-character line, and the proposed fix was `max-width` on a token.
	 * A code line is authored, not wrapped: short lines are the author's, and
	 * long ones are what the horizontal scrollbar is for.
	 *
	 * ⚠ One line counts. Requiring two missed the worst case there is: at 3440 an
	 * unbounded paragraph fits on a SINGLE 300-character line. */
	rule("measure", "typography", "Line length outside the readable band", m =>
		m.nodes.filter(n => n.text && !in_code(m, n)).flatMap(n => {
			const ch = n.text.per_line;
			const wide = over(ch, 85, 100, 130);

			if (wide) return [issue(n, wide, ch,
				`~${ch} characters per line (readable is 45–85)`,
				{ sel: n.sel, decl: "max-width: 52em" })];

			/* Laddering: two words a line over five lines. A card description, a
			 * table cell and a stat tile all run 18–24 legitimately — and a cell
			 * is the one of the three the rule cannot see is narrow on purpose,
			 * so it authored 173 of 203 high findings site-wide. */
			if (n.text.lines < 5 || in_cell(m, n)) return [];
			const thin = under(ch, 20, 15, 11);

			return thin ? [issue(n, thin, ch,
				`~${ch} characters per line over ${n.text.lines} lines — text laddering down a column ${n.w}px wide`,
				{ sel: n.sel, decl: "min-width: 12em" })] : [];
		})),

	/* ⚠ A 10px label is a label; a 10px paragraph is a problem. Judging by size
	 * alone reported 362 findings across 120 pages — every badge, chip and
	 * eyebrow on the site. The low tier now needs real text behind it. */
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

	/* ⚠ Asks the text BOUNDS, not the node's own text: the common shape is a
	 * collapsed wrapper whose paragraph is a block child, so the wrapper itself
	 * never counts as a text block and the rule saw nothing.
	 *
	 * ⚠ And `boxed()`, or a `display: contents` wrapper — which HAS no box, by
	 * design — reads as one collapsed to nothing. `div.tabs.block` alone was 360
	 * of the site's 371 findings here. */
	rule("zero-size", "overflow", "Collapsed to nothing", m => {
		const bounds = text_bounds(m);

		return m.nodes.filter(n => bounds[n.i] && n.parent >= 0 && boxed(n) && (n.w < 1 || n.h < 1))
			.map(n => issue(n, "high", 0,
				`a ${n.w}×${n.h} box still holding text — its content occupies no space`,
				{ sel: n.sel, decl: "min-height: 1em" }));
	}),

	/* ⚠ Two exemptions, both from WCAG 2.5.8 itself: a link INSIDE a sentence is
	 * sized by the line, not by anyone's choice; and a control whose `::after` is
	 * stretched over its card has a hit area its own rect knows nothing about.
	 * Without them this rule fired 4274 times across 116 pages. */
	/* ⚠ One control, reported once. `input.layout-range` is 60×17 wherever it
	 * appears, and the panel puts eight on a page — 437 findings site-wide for a
	 * single CSS line. Identical selector at an identical size is one declaration,
	 * so the rule counts them and reports the count. */
	rule("hit-size", "spacing", "Too small to tap", m =>
		distinct(m.nodes.filter(n => n.interactive && n.w > 0 && n.h > 0
			&& n.display !== "inline" && !n.stretched).flatMap(n => {
			// At its own scale: a control inside a miniature is a picture of a
			// control, and the design under it may be fine.
			const w = n.w / n.escale, h = n.h / n.escale;
			const sev = under(Math.min(w, h), 24, 18, 12);

			return sev ? [{ ...issue(n, sev, Math.min(w, h),
				`${Math.round(w)}×${Math.round(h)} at its own scale — under the 24px minimum target`,
				{ sel: n.sel, decl: "min-height: 24px; min-width: 24px" }),
				key: `${n.sel}|${Math.round(w)}×${Math.round(h)}` }] : [];
		}))),

	/* A gap far larger than its neighbours is the "72px under a card icon" bug:
	 * `.flow`'s heading margin resolving against a heading's own font-size inside
	 * a UI cluster that wanted a flat `gap`. */
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

	/* Not geometry — the absence of it. A page with nothing on it trips no rule,
	 * so seven dead urls scored 90–94/A against a site median of 66.
	 *
	 * ⚠ The thinnest threshold in the module: dead urls hold 63–64 characters and
	 * the sparsest live page holds 141. knowledge/thresholds.md carries the spread. */
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

// More hidden than shown, and enough of it to matter.
const gone = s => s.hidden && s.ratio >= 1 && s.over >= 200;

/* One finding per distinct `key`, carrying how many boxes share it. A repeated
 * component is one declaration however many times the page draws it. */
function distinct(list){
	const by = new Map();
	for (const i of list) by.set(i.key, [...(by.get(i.key) ?? []), i]);

	return [...by.values()].map(([{ key, ...first }, ...rest]) => rest.length
		? { ...first, count: rest.length + 1, detail: `${first.detail} — ${rest.length + 1} of them` }
		: first);
}

// The closest approach on any of four edges, with the font size of the text that
// reached it — so a 45px heading and a 13px caption are each judged against
// themselves.
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
