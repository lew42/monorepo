/* The second tier: not BROKEN, but OFF.
 *
 * `rules.js` reports geometry that fails — text unreachable, boxes overlapping,
 * content off screen. Nothing there fires on a page that merely looks wrong.
 * These do: edges that nearly line up, a card whose padding does not scale with
 * it, two headings shouting at each other, a page with no visible structure.
 *
 * ⚠ Everything here caps at MEDIUM. A near-miss alignment is worth a designer's
 * minute; it is not worth outranking content that cannot be reached. */

import { each_child, boxed, children, text_bounds } from "./ratios.js";

const HEADINGS = { h1: 1, h2: 2, h3: 3, h4: 4, h5: 5, h6: 6 };
const LIST = new Set(["ul", "ol", "dl", "menu"]);
const rule = (id, cat, title, scan) => ({ id, cat, title, scan });
const issue = (n, sev, value, detail, fix) =>
	({ sel: n.sel, node: n.i, path: n.path, sev, value, detail, fix });

export const polish = [

	/* The owner's card: 20px of padding on a 1000px box "looks off", and it does —
	 * while passing a font-size test, because 20px is a perfectly good gap for
	 * 16px text. Both floors are real and they measure different things:
	 *
	 *   font-size  → can the text BREATHE next to the edge  (legibility)
	 *   width      → is the frame PROPORTIONATE to what it holds  (composition)
	 *
	 * A box needs to clear both. The width floor is 3.5% capped at 3.5em, so it
	 * binds on wide boxes and disappears on chips, where the font floor governs. */
	rule("pad-scale", "proportion", "Padding doesn't scale with the box", m => {
		const bounds = text_bounds(m);

		/* ⚠ Cards, not bands. 3.5% is a proportion for a bounded box; a full-width
		 * section's inset is the page gutter's job, and `gutter` already owns it.
		 * Without this the rule flagged every framed container on every page. */
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

	/* Near misses only. Two edges 40px apart are two columns; two edges 5px apart
	 * are one column and a mistake — and the eye reads the second as a wobble
	 * long before it can say why. Exact matches are the design working. */
	rule("alignment", "alignment", "Edges nearly line up, but don't", m => {
		const found = [];

		for (const axis of ["x", "right"]){
			/* ⚠ Block-level only. `boxed()` lets `inline-block` through, and an
			 * icon's left bearing or a chip in a sentence then reads as a column
			 * edge a few pixels off — six of those on one page, all noise. Only
			 * boxes that participate in the block layout define a lane. */
			const edges = m.nodes
				.filter(n => n.w > 60 && n.h > 8 && n.position === "static"
					&& !n.display.startsWith("inline") && n.display !== "contents")
				.map(n => ({ n, at: axis === "x" ? n.x : n.x + n.w }));

			const lanes = cluster(edges.map(e => e.at), 1);

			/* ⚠ A sub-pixel difference is not a misalignment. At 1.5px and a
			 * three-element lane this fired 987 times across 120 pages — browsers
			 * land fractional edges everywhere. 3px is a gap the eye can see, and
			 * four elements make a lane worth aligning to. */
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

	/* "the extra 2em makes the Title and Paragraph misalign. Why doesn't this
	 * layout tool detect this?" — because `alignment` only looks at NEAR misses,
	 * 3–12px, on the theory that a bigger gap is a deliberate second column. A
	 * heading and the text under it are never two columns: they are one reading
	 * column, and any step between them is a mistake at any size.
	 *
	 * ⚠ "ITS OWN TEXT" IS THE NEXT BLOCK SIBLING, and the first version took whatever
	 *   text node came next in a GLOBAL y-sort — a different element entirely on any
	 *   page with structure, and wrong in both directions. On `/framework/`, whose
	 *   alignment is fine, it fired on the first CARD TITLE under a section `h2` (42px:
	 *   the card's own padding, inside a frame the reader can see) and on an `li` under
	 *   an `h2` (17px: a list's marker indent) — while on `/web/layout/flow/` an `h1`
	 *   sitting 194px left of the content it heads fired nothing, because the offset
	 *   cleared a 96px "deliberate indent" escape that only ever existed to survive the
	 *   wrong pairing. Sibling pairing plus `starts()` makes the wide window genuinely
	 *   safe, so the escape is gone. Evidence: `ai/2026-08-17/tier-calibration/`. */
	rule("heading-offset", "alignment", "A heading doesn't line up with its own text", m => {
		const kids = children(m);
		const found = [];

		/* ⚠ A heading following a heading counts. The reported case was a page TITLE
		 * against the `h2` inside a padded wrapper — skipping heading-over-heading as
		 * "hierarchy's problem" made the rule miss the exact misalignment it was
		 * written for. */
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

	/* Three cards in a row at three different heights read as ragged, even though
	 * every one of them is doing what it was told.
	 *
	 * ⚠ This is deliberately LOW. `Page.css` sets `align-items: start` on the
	 * preview wall on purpose — "a cell is as tall as what it shows, and
	 * stretching hands the short ones their dead space straight back". So a
	 * ragged row is a judgement call, and the tool says so rather than ruling. */
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

	/* "we don't want 2 h1's next to each other, it's distracting" — and the
	 * document-outline version of the same complaint is a level skipped. */
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

	/* Padding inside padding. Legitimate exactly when the inner box CHANGES
	 * SOMETHING you can see — a callout with its own background, a bordered
	 * panel. When the two boxes paint the same, the second inset buys nothing and
	 * the content just sits further in than anyone intended.
	 *
	 * ⚠ The test is "does the paint change", not "is there a background": two
	 * nested boxes both painted `--surface` are as invisible as two transparent
	 * ones. */
	rule("double-pad", "proportion", "Padding nested inside padding, with nothing to show for it", m =>
		m.nodes.filter(n => n.parent >= 0 && boxed(n)).flatMap(n => {
			const p = m.nodes[n.parent];
			if (!boxed(p)) return [];

			const inner = Math.min(n.pad[1], n.pad[3]);
			const outer = Math.min(p.pad[1], p.pad[3]);
			if (inner < 6 || outer < 6) return [];

			/* Only when the child actually fills its parent — a card in a padded
			 * grid is two boxes, not one box padded twice.
			 *
			 * ⚠ The parent's CONTENT width. Measured against `cw − outer` the test
			 * read "child ≥ parent minus one inset" while a filling child is parent
			 * minus TWO, so it demanded `outer ≤ 4` and the rule above demands
			 * `outer ≥ 6`. Unsatisfiable — 0 findings in 854 site runs. */
			if (n.w < p.cw - p.pad[1] - p.pad[3] - 4) return [];
			if (n.bg !== p.bg || n.framed !== p.framed) return [];

			const total = inner + outer;
			return [issue(n, total > 64 ? "med" : "low", total,
				`${outer}px on ${p.sel} plus ${inner}px here — ${total}px of inset, and the two boxes `
				+ `paint identically, so nothing marks the second one`,
				{ sel: n.sel, decl: "padding: 0" })];
		})),

	/* "if there are large unused areas, more than necessary, we could flag these"
	 * — and this is the one the vision model caught that no rule could: "the
	 * content ends roughly halfway down the visible area." */
	/* ⚠ A short page on a tall screen is not a defect — you cannot fill a screen
	 * with nothing, and `.page` carries `min-height: 100%` by design. Only boxes
	 * that RESERVE height they don't use count: the root and anything sized by
	 * the viewport are excluded, or every page in the corpus reads as wasteful. */
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

	/* "transparent layouts can be powerful, but often it seems we're missing the
	 * bg that would provide visual hierarchy."
	 *
	 * ⚠ An observation, not an error — a flat page is a legitimate style. It
	 * fires only when the page has real STRUCTURE (many sibling groups) and
	 * nothing at all to see it by, which is the case where a reader has to infer
	 * the grouping from whitespace alone. */
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

/* Where the block under a heading STARTS DRAWING: the leftmost of the boxes inside it
 * that a reader can see. Descend past boxes that paint nothing and hold no text of
 * their own — a `.bleed` wrapper starts LEFT of the heading and its content starts
 * right — and stop at any box that has text, draws a frame, is a list, or has nothing
 * left below it. A frame explains the inset inside it and a list's indent is its own
 * convention; neither is a misalignment.
 *
 * ⚠ LEFTMOST, NOT FIRST IN DOCUMENT ORDER, and it is the difference between six false
 *   positives and none. `probe.IGNORE` empties a demo stage's subtree by policy, so a
 *   559px stage sitting exactly on the heading's lane offered nothing to land on and
 *   the descent slid sideways to the next branch — the right-aligned `button.demo-btn`
 *   control row — reporting six pages as 158–325px misaligned. Document order also has
 *   no claim to being where content begins: a justified row's first child is wherever
 *   the justification put it. The minimum is the only edge that means "the content
 *   starts here", and it can only ever be more forgiving than the first.
 * ⚠ A `display: contents` sibling has no box, and the rule declines rather than guess. */
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

/* One pass over sorted values, merging anything within `tol`. Returns each lane
 * with how many elements sit on it — a lane of one is not a lane. */
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
