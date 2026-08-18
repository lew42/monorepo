/* What the browser knows about a layout, read once into plain data.
 * No judgment here — rules.js does that, and it never touches the DOM.
 *
 * ⚠ Every browser read goes through the ROOT'S OWN window, never the bare
 * global. That one habit is what lets the same probe measure an iframe from
 * outside it: `innerWidth` off the wrong window reports the parent's viewport
 * and silently invalidates every responsive metric. */

const SKIP = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE", "BR", "HR", "OPTION", "OPTGROUP"]);
const INTERACTIVE = new Set(["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA", "SUMMARY"]);
const HTML = "http://www.w3.org/1999/xhtml";

/* ⚠ A demo stage is a PICTURE OF ANOTHER LAYOUT at its own simulated viewport
 * and its own zoom — measuring it as part of the host page compares two
 * different viewports. Left in, the layouts pages reported 460–500 high
 * findings each and `illegible` fired 7173 times, all of it 3px text inside
 * 0.25× miniatures that have a zoom control right above them.
 *
 * To audit a demo, point the tool at the demo's own render at its own width. */
export const IGNORE = "[data-layout-ignore], .demo-screen, .demo-sims, .page-preview-thumb";

export function probe(root, { depth = 20, max = 4000, ignore = IGNORE } = {}){
	const doc = root.ownerDocument;
	const win = doc.defaultView;
	const nodes = [];
	const els = [];
	const base = root.getBoundingClientRect();

	/* How much of the page this walk was TOLD to skip, as AREA. The ignore policy is
	 * what keeps a demo stage from being measured as part of its host page, and its
	 * cost is that a page whose whole subject is a stage looks nearly empty — six
	 * `styles/layouts/*` pages rate F on a tier that never saw what they are about.
	 * A caveat, not a fix; the reader needs to know the tool was blindfolded.
	 *
	 * ⚠ Area, never a count. `closest()` matches the OUTERMOST ignored box and the walk
	 *   stops there, so one skip can hide a subtree of five hundred nodes — counted,
	 *   every one of those pages reported `ignored: 1`, which says nothing. Nested
	 *   skips cannot double-count for the same reason. */
	let skipped = 0;

	walk(root, -1, 0);
	scale_down(nodes);
	read_text(nodes, els, doc);

	return {
		url: win.location.pathname,
		at: new Date().toISOString(),
		root: label(root),

		// ⚠ Node paths are relative to THIS root, so anything resolving them
		// later needs to find the same root first. Without this the mirror
		// resolved a page-relative path against `.app` and cloned the sidebar.
		root_path: path(root, doc.documentElement),
		viewport: { w: win.innerWidth, h: win.innerHeight },
		frame: { w: round(base.width), h: round(base.height) },
		doc: { w: doc.documentElement.scrollWidth, h: doc.documentElement.scrollHeight },
		/* ⚠ Against the root's SCROLL box, not its rect. Stages stack down a page while
		 * the rect is only what is visible, so the share came out at 207% on the first
		 * page it was tried on. Still approximate — two skipped boxes may overlap — so
		 * it is a caveat flag and never a measurement. */
		ignored: round(area(root) > 0 ? Math.min(1, skipped / area(root)) : 0, 3),
		nodes,
	};

	function walk(el, parent, d){
		// ⚠ A child dropped by the caps is recorded on its container, or read_text()
		// below hands that container a text block it never measured.
		if (nodes.length >= max || d > depth){
			if (parent >= 0) nodes[parent].cut = true;
			return;
		}
		if (SKIP.has(el.tagName) || el.namespaceURI !== HTML) return;
		if (ignore && el.closest(ignore)){
			const r = el.getBoundingClientRect();
			return void (skipped += r.width * r.height);
		}

		const cs = win.getComputedStyle(el);
		if (cs.display === "none" || cs.visibility === "hidden") return;

		const i = nodes.push(measure(el, cs, parent, d, win)) - 1;
		nodes[i].i = i;
		nodes[i].path = path(el, root);
		els[i] = el;

		for (const kid of el.children) walk(kid, i, d + 1);
	}
}

function measure(el, cs, parent, depth, win){
	const r = el.getBoundingClientRect();
	const px = v => Math.round(parseFloat(v) || 0);
	const interactive = INTERACTIVE.has(el.tagName);

	return {
		sel: label(el), tag: el.tagName.toLowerCase(), parent, depth,
		x: round(r.left), y: round(r.top), w: round(r.width), h: round(r.height),
		cw: el.clientWidth, chh: el.clientHeight, sw: el.scrollWidth, sh: el.scrollHeight,
		fs: round(parseFloat(cs.fontSize)), lh: line_height(cs),
		pad: [px(cs.paddingTop), px(cs.paddingRight), px(cs.paddingBottom), px(cs.paddingLeft)],
		mar: [px(cs.marginTop), px(cs.marginRight), px(cs.marginBottom), px(cs.marginLeft)],
		bor: [px(cs.borderTopWidth), px(cs.borderRightWidth), px(cs.borderBottomWidth), px(cs.borderLeftWidth)],
		display: cs.display, position: cs.position,
		ovx: cs.overflowX, ovy: cs.overflowY,
		maxh: cs.maxHeight !== "none", clamp: clamped(cs),
		bg: cs.backgroundColor, framed: framed(cs), scale: scale(cs),
		interactive, stretched: interactive && stretched(el, win),
		cut: false, text: null,
	};
}

/* Does a pseudo-element enlarge this control's hit area? `.page-preview-link`
 * is 105×13 with an `::after` stretched over the whole card, so its rect
 * understates the target by an order of magnitude — and a naive tap-target rule
 * reports every card on the site.
 *
 * ⚠ The pseudo is invisible to `getBoundingClientRect`, which is why this asks
 * the style system directly. */
function stretched(el, win){
	return ["::after", "::before"].some(part => {
		const cs = win.getComputedStyle(el, part);
		return cs.content !== "none" && cs.position === "absolute";
	});
}

/* Scale ACCUMULATES down the tree; a computed style does not.
 *
 * ⚠ `getComputedStyle(el).zoom` reports the element's own zoom, so a control
 * inside a 0.25× demo stage reads as scale 1 while its rect is a quarter size.
 * Every button in every miniature on the layouts pages then reported as a 6px
 * tap target — 3231 of them. Nodes are pushed in preorder, so one forward pass
 * multiplies each by its parent's effective scale. */
function scale_down(nodes){
	for (const n of nodes)
		n.escale = n.parent >= 0 ? round(nodes[n.parent].escale * n.scale, 4) : n.scale;
}

/* `n.text` exists on TEXT BLOCKS only — an element whose every child is inline,
 * so the range below spans one run of prose at one font size.
 *
 * ⚠ Measuring per direct text NODE instead counts each fragment around an inline
 * `<a>` or `<code>` as its own line: a 780px paragraph then reports 23 characters
 * per line and every prose page on the site reads as a broken column. Lines are
 * distinct rect TOPS over the whole element — the only count that survives inline
 * children.
 *
 * ⚠ And never a container the walk CUT. Its block children are absent, so nothing
 * marks it blocky and it takes a block aggregated from every descendant's
 * `textContent` — whose bounds are its own box, a 0px gap from a box to itself.
 * That manufactured `gutter: high` on three panel pages sitting 60px+ from every
 * edge. */
function read_text(nodes, els, doc){
	const blocky = new Set();
	for (const n of nodes)
		if (n.parent >= 0 && !n.display.startsWith("inline")) blocky.add(n.parent);

	const range = doc.createRange();

	nodes.forEach((n, i) => {
		if (blocky.has(i) || n.cut) return;

		const chars = els[i].textContent.trim().length;
		if (chars < 4) return;

		range.selectNodeContents(els[i]);
		const rects = [...range.getClientRects()].filter(r => r.width > 1 && r.height > 0);
		if (!rects.length) return;

		const lines = count_lines(rects, n.lh);
		const width = round(Math.max(...rects.map(r => r.width)));

		/* ⚠ `chars / lines` is NOT characters per line. It averages in a short
		 * last line, and worse, it only moves when the line COUNT moves — a
		 * paragraph reported an identical 112.3 at 1207px and at 941px, because
		 * both happen to wrap to three lines. The number sat still while the box
		 * shrank by a quarter, which is exactly what a live readout must not do.
		 *
		 * Total inked width ÷ characters is the font's real average advance, and
		 * it does not depend on wrapping. Line width ÷ that is continuous. */
		const ink = rects.reduce((sum, r) => sum + r.width, 0);
		const advance = ink / chars;

		n.text = {
			chars, lines, width,
			per_line: round(advance > 0 ? width / advance : chars / lines),
		};
	});
}

/* ⚠ Distinct rect TOPS is not a line count. An inline `<code>` or `<sup>` sits on
 * the same visual line at its own top, so a paragraph with five inline spans
 * reports five extra lines — which is exactly how a 650px paragraph came out at
 * "23 characters per line". Rects are clustered by vertical CENTRE instead, with
 * a tolerance of just over half a line. */
function count_lines(rects, lh){
	const tol = Math.max(4, lh * 0.55);
	const centres = rects.map(r => r.top + r.height / 2).sort((a, b) => a - b);

	let lines = 1;
	let band = centres[0];

	for (const c of centres)
		if (c - band > tol){ lines++; band = c; }

	return lines;
}

// `normal` computes to a number in every engine we target, but a keyword would
// slip through as NaN and poison every ratio downstream.
function line_height(cs){
	const n = parseFloat(cs.lineHeight);
	return round(Number.isFinite(n) ? n : parseFloat(cs.fontSize) * 1.2);
}

/* ⚠ A line clamp is a crop with no `max-height` to show for it. `.page-preview-desc`
 * clamps to two lines and every inline `<code>` on line three reported as content
 * cut off — 12 of the site's 79 `clipped:high` findings. */
function clamped(cs){
	const n = cs.webkitLineClamp ?? cs.lineClamp;
	return !!n && n !== "none";
}

// Does this box draw an edge the text could butt against?
function framed(cs){
	const bg = cs.backgroundColor;
	const painted = !!bg && bg !== "transparent" && !/^rgba\(0, 0, 0, 0\)$/.test(bg);
	const bordered = ["Top", "Right", "Bottom", "Left"]
		.some(s => parseFloat(cs[`border${s}Width`]) > 0 && cs[`border${s}Style`] !== "none");
	return painted || bordered;
}

function scale(cs){
	const zoom = parseFloat(cs.zoom) || 1;
	const m = cs.transform?.startsWith("matrix") ? parseFloat(cs.transform.slice(7)) : 1;
	return round(zoom * (Number.isFinite(m) ? m : 1), 3);
}

function label(el){
	if (el.id) return `${el.tagName.toLowerCase()}#${el.id}`;
	const cls = [...el.classList].slice(0, 3).join(".");
	return el.tagName.toLowerCase() + (cls ? `.${cls}` : "");
}

/* A real address, not an index.
 *
 * ⚠ An index into the walk is NOT stable across page loads. A page whose
 * content arrives asynchronously (a Doc tab, a fetched markdown file) walks
 * in a different order on the next visit, and every issue then points at the
 * wrong element — which is exactly how the before/after mirror came back with
 * "p is no longer at that position". `:nth-child()` is exact and survives it. */
function path(el, root){
	const parts = [];

	for (let at = el; at && at !== root && at.parentElement; at = at.parentElement){
		const i = [...at.parentElement.children].indexOf(at) + 1;
		parts.unshift(`${at.tagName.toLowerCase()}:nth-child(${i})`);
	}

	return parts.join(" > ");
}

const round = (n, places = 1) => Math.round(n * 10 ** places) / 10 ** places;

const area = el => el.scrollWidth * el.scrollHeight;
