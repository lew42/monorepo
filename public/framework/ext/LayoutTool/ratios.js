/* The geometry the rules ask for, derived once per model. Pure arithmetic on
 * probe output — nothing here reads the DOM or decides anything. */

const pad_box = n => ({ x: n.x + n.bor[3], y: n.y + n.bor[0], w: n.cw, h: n.chh });
const loose = n => n.position === "absolute" || n.position === "fixed";
export const scrolls = ov => ov === "auto" || ov === "scroll";

/* ⚠ Does this element have a box worth measuring against? A non-replaced `inline`
 * reports clientWidth 0 and `display: contents` has no box at all — both make
 * every child read as escaping a zero-width parent. Highlighted code inside a
 * `<pre>` and one `display: contents` wrapper produced hundreds of those.
 * `inline-block` and `inline-flex` DO have real boxes and stay in. */
export const boxed = n => n.display !== "inline" && n.display !== "contents";

/* A child outside its parent's padding box. `hidden` means the parent clips it
 * with no scrollbar — the content is simply unreachable, which is the difference
 * between an ugly layout and a broken one.
 *
 * ⚠ The two axes are not symmetric. Sideways spill is worth reporting whether
 * the parent clips or not; DOWNWARD spill is normal (parents grow) and only
 * matters when the parent hides it — and even then a parent carrying max-height
 * is cropping on purpose (a preview thumb, a line-clamp), so every card on the
 * site would otherwise read as broken. */
export function spill(m){
	const out = [];

	for (const n of m.nodes){
		if (n.parent < 0 || loose(n)) continue;

		const p = m.nodes[n.parent];
		if (!boxed(p)) continue;

		const box = pad_box(p);
		const x = Math.max(n.x + n.w - (box.x + box.w), box.x - n.x);
		const y = n.y + n.h - (box.y + box.h);

		const clip_x = !scrolls(p.ovx) && x > 2;
		const clip_y = !clip_x && !scrolls(p.ovy) && y > 2 && !p.maxh
			&& (p.ovy === "hidden" || p.ovy === "clip");
		if (!clip_x && !clip_y) continue;

		const over = Math.round(clip_x ? x : y);
		const against = clip_x ? box.w : box.h;
		const cut = clip_x ? p.ovx : p.ovy;

		out.push({
			child: n, parent: p, over, axis: clip_x ? "x" : "y",
			ratio: against > 0 ? over / against : 1,
			hidden: cut === "hidden" || cut === "clip",
		});
	}

	return out;
}

/* Is anything between this node and the root a horizontal scroller?
 *
 * ⚠ A carousel's off-screen slides are MEANT to be off screen. `false-positives`
 * already states the principle — a scroller's content is meant to exceed its box
 * — and `doc-overflow` was the one rule not applying it, so every waiting slide
 * reported as content past the viewport. */
export function under_scroller(m, n){
	for (let at = n; at && at.parent >= 0; at = m.nodes[at.parent]){
		const p = m.nodes[at.parent];
		if (scrolls(p.ovx)) return true;
	}
	return false;
}

export function each_child(m){
	const kids = m.nodes.map(() => []);
	m.nodes.forEach(n => { if (n.parent >= 0) kids[n.parent].push(n); });
	return m.nodes.map((node, i) => ({ node, kids: kids[i] })).filter(e => e.kids.length);
}

/* Vertical gaps in a stack — and only a stack. If any two children share a row
 * the container is a grid or a row, where "the gap between consecutive children"
 * is not a thing rhythm can be read from. */
export function gaps(kids){
	const col = kids.filter(k => !loose(k) && k.h > 0).sort((a, b) => a.y - b.y);
	if (col.length < 3) return [];

	const out = [];
	for (let i = 1; i < col.length; i++){
		const prev = col[i - 1], now = col[i];
		if (now.y < prev.y + prev.h - 2) return [];
		out.push(Math.round(now.y - (prev.y + prev.h)));
	}

	return out;
}

/* How close the nearest text gets to each edge of a box that draws one — the
 * literal measurement behind "text butting against a border".
 *
 * Bottom-up in one reverse pass: nodes are pushed in preorder, so a child always
 * has a higher index than its parent, and the union of every text box below a
 * node is exactly its closest approach on all four sides. */
/* ⚠ A text block contributes its CONTENT box, never its border box. Using the
 * border box makes every padded element sit 0px from its own frame — the rule
 * then reports `div.wash.pad` (a 1em pad) as text butting the edge.
 *
 * ⚠ Bounds are clamped to a clipping ancestor before they propagate. Without it
 * a scrolled region hands its parent the extent of everything it hides, and
 * `.app` reports its nearest text 4915px outside itself. */
export function text_bounds(m){
	const box = new Array(m.nodes.length).fill(null);

	for (let i = m.nodes.length - 1; i >= 0; i--){
		const n = m.nodes[i];

		if (n.text && n.text.chars > 12 && boxed(n)){
			const c = content_box(n);
			box[i] = union(box[i], {
				x0: c.x, y0: c.y, x1: c.x + c.w, y1: c.y + c.h,
				x0fs: n.fs, y0fs: n.fs, x1fs: n.fs, y1fs: n.fs,
			});
		}

		if (n.parent < 0 || !box[i]) continue;
		box[n.parent] = union(box[n.parent], clips(n) ? clamp(box[i], pad_box(n)) : box[i]);
	}

	return box;
}

const clips = n => n.ovx !== "visible" || n.ovy !== "visible";

const content_box = n => ({
	x: n.x + n.bor[3] + n.pad[3], y: n.y + n.bor[0] + n.pad[0],
	w: Math.max(0, n.cw - n.pad[1] - n.pad[3]), h: Math.max(0, n.chh - n.pad[0] - n.pad[2]),
});

function clamp(t, box){
	return {
		...t,
		x0: Math.max(t.x0, box.x), y0: Math.max(t.y0, box.y),
		x1: Math.min(t.x1, box.x + box.w), y1: Math.min(t.y1, box.y + box.h),
	};
}

/* ⚠ Each edge carries the font size of the text that REACHED it, not the largest
 * in the subtree. Sharing one `max(fs)` measures a 14px caption's gap against a
 * 45px heading and reports every card with a title in it as cramped. */
function union(a, b){
	if (!a) return b;
	if (!b) return a;

	const near = (k, win) => (win(b[k], a[k]) === b[k] ? b : a);
	const x0 = near("x0", Math.min), y0 = near("y0", Math.min);
	const x1 = near("x1", Math.max), y1 = near("y1", Math.max);

	return {
		x0: x0.x0, x0fs: x0.x0fs, y0: y0.y0, y0fs: y0.y0fs,
		x1: x1.x1, x1fs: x1.x1fs, y1: y1.y1, y1fs: y1.y1fs,
	};
}

export const padding_box = pad_box;

/* ⚠ A negative margin is a request to overlap — stacked avatars, a pulled-up
 * card. Reporting those as collisions makes the rule cry wolf on the deliberate
 * case, which is the only case that repeats. */
export function overlap(m){
	const out = [];

	for (const { kids } of each_child(m)){
		const solid = kids.filter(k => !loose(k) && k.position !== "sticky"
			&& k.w > 4 && k.h > 4 && !k.display.startsWith("inline")
			&& !k.mar.some(v => v < 0));

		for (let i = 0; i < solid.length; i++)
			for (let j = i + 1; j < solid.length; j++){
				const a = solid[i], b = solid[j];
				const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
				const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
				if (w <= 3 || h <= 3) continue;
				const area = w * h;
				const share = area / Math.min(a.w * a.h, b.w * b.h);
				if (share < 0.08) continue;
				out.push([a, b, area, share]);
			}
	}

	return out;
}
