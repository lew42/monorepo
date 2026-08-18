import { boxed, children, inside, padding_box, region, text_bounds, text_chars, width_used } from "../ratios.js";

/* The eleven quantities of `ranges.js`, derived from one probe model. Arithmetic
 * only — no DOM, no judgement, exactly like `ratios.js`.
 *
 * ⚠ EVERY LENGTH IS READ AT ITS OWN SCALE. The five shots on the layout-space ruler
 *   are a whole 3440 page rendered at 19%, so a 400px column measures 76px and any
 *   raw pixel threshold reads every one of them as a sliver. Ratios survive a zoom;
 *   `space` and `own()` are what the two absolute measurements use instead. */

export function read(m){
	const kids = children(m);
	const own = n => n.w / (n.escale || 1);
	const space = m.frame.w / (m.nodes[0]?.escale || 1);

	/* ⚠ SIX OF THESE BANDS ASK ABOUT THE PAGE'S CONTENT AND FIVE ABOUT THE LAYOUT AS
	 *   DELIVERED, and every one of the six was reading the app shell. Handed `.app`,
	 *   `/framework/` — the best-looking page in the corpus — scored its worst, 49:
	 *   `repetition` 0.96 (a nav rail IS a group of identically-classed siblings —
	 *   correct design charged as a wall), plus `slivers`, `depth` and `lanes`, whose
	 *   own `why` lines already named the chrome and compensated for it instead.
	 *   `region()` answers where a reader's content lives; the content bands read
	 *   there, and the five geometry bands keep the whole root because chrome's
	 *   padding and gaps are exactly what the tool exists to measure.
	 *   ⚠ SCOPE WAS NOT THE WHOLE STORY, and the two bands this comment used to blame
	 *   on chrome were never chrome at all: `measure` read 26 characters from the
	 *   page's own card captions and `contrast` 8.38 from a 125.7px clock in a demo.
	 *   A stated cause is a hypothesis — the numbers are the finding.
	 * ⚠ `width-used` STAYS ON THE ROOT: whether the rail leaves a gutter is precisely
	 *   what the prime objective asks. */
	const box = region(m);
	const content = inside(m, box);
	const floor = box?.depth ?? 0;

	/* ⚠ 80, not 120: `styles/layouts/web.js`'s shared blurb is 117 characters, and a
	     120 floor made `measure` unreadable on the whole rail it was written for.
	   ⚠ AND IT CARRIES `rules.js`'s EXEMPTIONS, all three of them. This band is that
	     rule read as a quantity, and it shipped with the rule's arithmetic and one of
	     its three guards — which is the same mistake `frame-gap` made, one file over.
	     Code is authored, not wrapped. A cell is a column. And text inside a box that
	     draws an edge is that COMPONENT's text — a card blurb, a chip, a stat tile —
	     which the rule's own comment has called "18–24 legitimately" since it was
	     written. Unguarded, `/framework/` read 26.1 characters because fourteen 188px
	     card captions supplied 70 of its 137 prose lines, and one 125px `td` was the
	     whole reading of `styles/elements/misc/` at 13.7. */
	const prose = content.filter(n => n.text && n.text.chars > 80
		&& !in_code(m, n) && !in_cell(m, n) && !in_frame(m, n));

	/* ⚠ THE SAMPLE IS COUNTED IN LINES, because a line is the unit being measured.
	   Gated on BLOCKS this band declined on 55 of 169 pages — three one-line captions
	   passed and one eight-line paragraph did not. */
	const lines = lines_of(prose);

	// ⚠ EVERY text node in the region. A 20-character floor filters for prose, and a
	//   dashboard of numbers has none — five ranges then read null.
	const texts = content.filter(n => n.text);
	const solid = texts.filter(n => n.text.chars > 20);

	// ⚠ A framed box must HOLD TEXT before its inset means anything: a decorative
	//   swatch is a painted box with no padding by design.
	const chars = text_chars(m);
	const bounds = text_bounds(m);
	/* ⚠ THIS BAND IS `cramped` AS A QUANTITY, so it must carry `cramped`'s GUARDS —
	   and it shipped with none of them, which cost four separate false readings in one
	   afternoon. A full-bleed SHELL's edge is the window, and text against it is the
	   design (`gutter` excludes the shell for the same reason). A box that CLIPS is
	   answering a different question, which `clipped` owns. Cells are row rhythm.
	   Text outside its box is overflow. Every one of those had to be learned here
	   after `rules.js` had already learned it — copy the guards, not just the maths. */
	const shell = n => n.w >= m.frame.w - 2;
	const still = n => n.ovx === "visible" && n.ovy === "visible";

	const framed = m.nodes.filter(n => n.framed && boxed(n) && own(n) > 120
		&& chars[n.i] > 8 && !in_cell(m, n) && !shell(n) && still(n));

	const every_gap = [];

	const stacks = m.nodes.map((n, i) => {
		const g = spread(kids[i]);
		if (g.length < 2 || n.w < 40) return null;
		every_gap.push(...g);
		return median(g) / n.w;
	}).filter(v => v != null);

	return {
		measure: enough(lines, 3, median),
		"frame-gap": enough(framed, 3, () => tightest(framed.map(n => reach(n, bounds[n.i])).filter(v => v != null))),
		"pad-share": enough(framed.filter(n => own(n) > 200), 3, list => weighted(list, inset, own)),
		"gap-share": enough(stacks, 2, () => median(stacks)),
		scale: enough(every_gap, 6, on_scale),
		lanes: lanes(content),
		repetition: enough(texts, 6, () => repetition(m, kids, texts)),

		// The one that stays on real content: a 40px `span` inside a card is not a
		// sliver, it is a word.
		slivers: enough(solid, 6, list => share(list, n => own(n) < 160)),

		// ⚠ Relative to the CONTENT region, not the root, or four levels of app shell
		//   are counted as the page's nesting — which is what this band's own `why`
		//   means by "measured from `.app`, this site's pages read 8 and 13–15".
		depth: enough(texts, 6, () => median(texts.filter(n => !kids[n.i].length).map(n => n.depth - floor))),

		// ⚠ ONE implementation, shared with `score.metrics()`. Two hand-written answers
		//   to "how much of the width does the content use" disagreed by 200 points.
		"width-used": width_used(m),
		contrast: enough(texts, 4, () => contrast(texts)),
		space,
	};
}

/* ⚠ TOO SMALL A SAMPLE IS NOTHING TO MEASURE, not a bad score. `taste.js` already
 *   drops a band that reads `null` and moves the divisor with it — the principle was
 *   right and nothing enforced it by SIZE, so a page with two paragraphs got a real,
 *   harsh `measure` credit computed off two paragraphs.
 *
 *   Found by ranking the site: six `styles/layouts/*` demo pages scored 0% on
 *   `measure` and `width-used` while `analyze()` called them fine. They are galleries
 *   of miniatures, and `probe.IGNORE` skips a demo stage by policy — so almost
 *   everything on them is invisible to this tier by design, and what was left was a
 *   caption. `covered` says that honestly; a score of 35 did not. */
const enough = (list, least, read) => (list.length >= least ? read(list) : null);

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

/* Alignment counted from the positive side: how much of the page sits on a lane at
 * all. `polish.js`'s `alignment` reports the near-misses, which cannot say whether
 * the page is 90% aligned or 20%.
 * ⚠ Over the CONTENT region. Measured on a whole `.app` this read exactly 1.00 on all
 *   eighteen pages of the vision corpus — the nav and page chrome anchor most boxes
 *   whatever the content does, which the band's `why` already suspected. */
function lanes(nodes){
	const blocks = nodes.filter(n => boxed(n) && n.w > 80 && n.h > 8);
	if (blocks.length < 8) return null;

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

/* ⚠ A COMPONENT IS CLASSED; A RUN OF BARE PARAGRAPHS IS PROSE. `label()` returns the
 *   tag alone when an element carries no class and no id, so twenty sibling `<p>` in a
 *   markdown block shared one `sel` and every word of an article counted as repetition
 *   — which is how this band came to read a median of 0.81 across the site against an
 *   `ok` ceiling of 0.85 and a band derived from a measured median of 0.23. The
 *   band's own wording has said "IDENTICALLY-CLASSED siblings" since it was written;
 *   the implementation was counting identically-TAGGED ones. */
const component = sel => sel.includes(".") || sel.includes("#");

function repetition(m, kids, texts){
	const from = new Array(m.nodes.length).fill(Infinity);

	kids.forEach(row => {
		const by = new Map();
		row.forEach(k => component(k.sel) && by.set(k.sel, [...(by.get(k.sel) ?? []), k]));
		by.forEach(group => group.length >= 3 && group.forEach(k => { from[k.i] = 0; }));
	});

	// Preorder, so one forward pass carries each group's reach down to its text.
	m.nodes.forEach(n => {
		if (n.parent >= 0) from[n.i] = Math.min(from[n.i], from[n.parent] + 1);
	});

	return share(texts, n => from[n.i] <= REACH);
}

/* THE LARGEST HEADING over the median text size — a type scale's top and its middle.
 *
 * ⚠ NOT `max(fs)`, and the difference is one decorative glyph. A 125.7px clock inside
 *   an unmarked Panel demo over a 15px median read 8.38 on `/framework/`, and a
 *   component's oversized numeral read 18.20 at 3440 — arithmetically right, and a
 *   description of a demo rather than of the page's hierarchy. On 165 of 169 pages the
 *   largest text already IS a heading, so naming them changes only the four rows where
 *   it was not. ⚠ A character-count floor was tried first and is wrong in a way worth
 *   recording: a page TITLE is short — `h1.page-title` runs 4–9 characters — so any
 *   threshold that excludes an 8-character clock excludes most of the site's h1s too,
 *   and the median fell from 3.42 to 2.36.
 * ⚠ NO HEADING IS A DECLINE, not a zero. `polish.js`'s `hierarchy` is the rule that
 *   reports a page with no h1; a band with no hierarchy to measure has nothing to say. */
const HEADING = new Set(["h1", "h2", "h3", "h4", "h5", "h6"]);

function contrast(texts){
	const mid = median(texts.map(n => n.fs).filter(v => v > 0));
	const tops = texts.filter(n => HEADING.has(n.tag)).map(n => n.fs).filter(v => v > 0);

	return mid > 0 && tops.length ? Math.max(...tops) / mid : null;
}

/* How much of the page's spacing comes from the FOUR SIZES IT USES MOST — 4px buckets,
 * because 12 and 13 are one decision made once.
 *
 * ⚠ THIS WAS A COUNT, AND A COUNT OF THIS SHAPE MEASURES THE SAMPLE. "How many sizes
 *   cover four fifths of the gaps" rises with how many gaps there are to look at: drawn
 *   from one page's OWN gaps, it read 7.6 → 11.0 → 13.8 → 15.2 → 17.0 as the sample
 *   went 25 → 50 → 200 → 400 → 888 on `ext/Panel/`, and roughly doubled on every page
 *   tried. Across the corpus it ranked pages 0.55 with their gap count. A page holding
 *   nineteen component demos therefore scored zero for being large. The share is the
 *   same question asked so that it converges — the same page reads 0.74 → 0.66 → 0.61 →
 *   0.60 → 0.58 over that sweep, flat by n=100.
 * ⚠ FOUR, from the band it replaces: `2–4 is a scale someone chose`. And the ideal floor
 *   is the old definition's own `four fifths`. */
const SIZES = 4;

function on_scale(list){
	const counts = new Map();
	list.filter(g => g > 0).forEach(g => {
		const key = Math.round(g / 4);
		counts.set(key, (counts.get(key) ?? 0) + 1);
	});

	const used = [...counts.values()].sort((a, b) => b - a);
	const total = used.reduce((sum, n) => sum + n, 0);

	return total ? used.slice(0, SIZES).reduce((sum, n) => sum + n, 0) / total : null;
}

const share = (list, is) => (list.length ? list.filter(is).length / list.length : null);

const CODE = new Set(["pre", "code", "kbd", "samp"]);

/* ⚠ A TABLE CELL'S INSET IS ROW RHYTHM, NOT A CRAMPED CARD. `rules.js`'s `cramped`
 *   has exempted cells since it was written — `framework.css`'s
 *   `th, td { padding: 0.25em 0.75em }` is every table on the site, and counting it
 *   produced 175 identical findings on one page. This band inherited the measurement
 *   and not the exemption, so a page whose only tight box was an ordinary table read
 *   at half credit while `cramped` fired zero times on it. The two must agree about
 *   what a defect is. */
const TABLE = new Set(["table", "thead", "tbody", "tfoot", "tr", "td", "th"]);

const within = (m, n, tags) => {
	for (let at = n; at; at = at.parent >= 0 ? m.nodes[at.parent] : null)
		if (tags.has(at.tag)) return true;
	return false;
};

const in_code = (m, n) => within(m, n, CODE);
const in_cell = (m, n) => within(m, n, TABLE);

/* Text whose own box draws an edge, or whose parent's does. ⚠ SELF OR PARENT, never an
 * unbounded walk: `.app` paints, so every word on the site is inside a frame eventually. */
const in_frame = (m, n) => n.framed || (n.parent >= 0 && m.nodes[n.parent].framed);

/* Every line the page's prose contributes, so the median over them is the length of a
 * TYPICAL LINE rather than of a typical block.
 *
 * ⚠ A plain median over blocks treated a two-line caption and a forty-line article as
 *   one vote each. Against a hand count of 322 paragraphs this band was out by 40
 *   characters and more. The question is "how long is a line of this page", and a line
 *   is the unit — which is also why the sample gate counts lines. */
function lines_of(prose){
	const out = [];

	for (const n of prose)
		for (let i = 0; i < Math.min(n.text.lines, 60); i++) out.push(n.text.per_line);

	return out;
}

/* How close the nearest TEXT gets to this box's edge, over the font size that reached
 * it — `rules.js`'s `cramped`, read as a quantity instead of an alarm.
 *
 * ⚠ Not the box's own declared padding, which was the first version: a toned wrapper
 *   with no inset of its own, holding a padded card, measured 0.00 and read as text
 *   butting a frame when nothing was near it. The generator draws that shape
 *   constantly, so half its rolls scored zero on a band about a defect they did not
 *   have. Bounds, never declarations. */
function reach(n, box){
	if (!box) return null;

	const p = padding_box(n);
	const gaps = [
		[box.x0 - p.x, box.x0fs], [p.x + p.w - box.x1, box.x1fs],
		[box.y0 - p.y, box.y0fs], [p.y + p.h - box.y1, box.y1fs],
	].filter(([, fs]) => fs > 0);

	if (!gaps.length) return null;

	const near = Math.min(...gaps.map(([gap, fs]) => gap / fs));

	/* ⚠ TEXT OUTSIDE A BOX IS NOT A NARROW INSET, it is overflow — and `escape`,
	 *   `clipped` and `unreachable` already own it. Unguarded, a shell holding an
	 *   absolutely-positioned or overflowing descendant reported a frame gap of
	 *   **−235**, which then became the page's 10th percentile and took a healthy
	 *   page to zero credit on a defect it did not have. A band should decline to
	 *   answer a question that is not its own.
	 * ⚠ AND A FRAME GAP CANNOT BE NEGATIVE. Between −1 and 0 the guard let a rounding
	 *   through as a measurement, and the band's site-wide minimum was **−0.01** — a
	 *   tenth of a pixel of subpixel drift, printed as a padding. Text at or past the
	 *   edge is a gap of zero. (No credit moves: both read zero against a 0.1 floor.) */
	return near < -1 ? null : Math.max(0, near);
}

/* THE TIGHT END, not the average: the tenth percentile of the frame gaps on the page.
 *
 * ⚠ Averaged — even weighted — this band SATURATED: over 120 layouts it separated the
 *   best rolls from the worst by 0.01, because a page's mean inset is fine while one
 *   box is touching. The two bands were also saying the same thing twice, since
 *   `pad-share` already measures the typical inset against what a box that size should
 *   have. So this one asks the question the tool was built for — how close does the
 *   TIGHTEST framed box get — and the two stop being redundant.
 * ⚠ Tenth percentile rather than the minimum, because one decorative outlier should
 *   not be the whole reading. */
function tightest(list){
	const sorted = list.filter(Number.isFinite).sort((a, b) => a - b);
	if (!sorted.length) return null;

	return sorted[Math.floor((sorted.length - 1) * 0.1)];
}

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
