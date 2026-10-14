import { div, button } from "/app.js";

/**
 * The same tree, drawn three ways — none of it coordinates. Every connector line here
 * is a CSS border on a flex/grid wrapper, never a pixel this file computed: the browser
 * lays the boxes out, and a hairline border sits wherever that layout put the edge.
 * `trees.css` carries the actual lines; this file only nests the boxes.
 *
 * `folded` is a `Set` of node labels whose children are hidden — shared by whichever
 * drawing calls these, and often by more than one drawing at once (`page.js`), because a
 * label already IS the node's identity (`gen.js`'s alternating suffix makes every label
 * on a tree unique) — there is no second id to keep in sync with it.
 *
 * `on_toggle(node)` fires on a click; the caller owns what a fold means (redraw, scroll,
 * dispatch an event for `demo.steps()`) — same shape `ux/Tree`'s `move`/`act` take, kept
 * for the same reason: these functions draw, they never decide.
 */

// ── THE NODE ────────────────────────────────────────────────────────────────
// One button, reused by all three drawings — a node looks the same everywhere; only
// where its CHILDREN land differs per drawing. `data-label` is how a caller finds this
// exact box again after a redraw, to `scrollIntoView` it.
function node_box(node, folded, on_toggle){
	const has_kids = node.children.length > 0;
	const open = !folded.has(node.label);

	return button.c("std-trees-node" + (has_kids ? " std-trees-node-branch" : ""))
		.attr("type", "button")
		.attr("data-label", node.label)
		.attr("aria-expanded", has_kids ? String(open) : undefined)
		.text(node.label)
		.click(() => on_toggle(node));
}

// ── FAMILY TREE — top-down ───────────────────────────────────────────────────
// Each generation is a centred flex row (`justify-content: center`); a parent's own row
// sits centred above it. `trees.css`'s connector is the classic pure-CSS org-chart
// trick: a `::before`/`::after` pair on each item draws its own L-shaped stub up to a
// shared horizontal line, so the line is never a box this file measured.
function family_item(node, folded, on_toggle){
	const open = !folded.has(node.label);
	const has_kids = node.children.length > 0;

	return div.c("std-trees-family-item", () => {
		node_box(node, folded, on_toggle);
		if (has_kids && open)
			div.c("std-trees-family-kids", () => node.children.forEach(child => family_item(child, folded, on_toggle)));
	});
}

export function family_tree(root, folded, on_toggle){
	return div.c("std-trees-family", () => family_item(root, folded, on_toggle));
}

// ── FLOW CHART — left to right ───────────────────────────────────────────────
// Each node is a 2-column grid, `align-items: center`: column one is the node, column
// two its children, stacked in a flex column — so a parent centres itself against the
// full height of everything under it, recursively. That is also exactly the "first
// column is empty" problem the mobile framing (page.js, trees.css) exists to fix.
//
// `mirror` flips a branch for `brainstorm()` below: mirrored, the children column is
// built BEFORE the node instead of after — pure DOM order, no `transform`, no `rtl` —
// and `trees.css` moves the connector's border from the wrapper's left edge to its right
// to match.
function flow_item(node, folded, on_toggle, mirror){
	const open = !folded.has(node.label);
	const has_kids = node.children.length > 0;

	return div.c("std-trees-flow-item", () => {
		const box = () => node_box(node, folded, on_toggle);
		const kids = () => {
			if (!has_kids || !open) return;
			div.c("std-trees-flow-kids" + (mirror ? " std-trees-flow-mirror" : ""),
				() => node.children.forEach(child => flow_item(child, folded, on_toggle, mirror)));
		};

		mirror ? (kids(), box()) : (box(), kids());
	});
}

export function flow_chart(root, folded, on_toggle){
	return div.c("std-trees-flow", () => flow_item(root, folded, on_toggle, false));
}

// ── BRAINSTORM — root in the middle, two mirrored flow charts either side ──────
// The root's own children split in half; the first half grows LEFT as a mirrored flow
// chart, the rest grow RIGHT as an ordinary one. Nothing here is a flow chart rotated by
// math — it is two real flow charts, one of them built back-to-front, sat either side of
// one more node.
export function brainstorm(root, folded, on_toggle){
	const open = !folded.has(root.label);
	const mid = Math.ceil(root.children.length / 2);
	const left = open ? root.children.slice(0, mid) : [];
	const right = open ? root.children.slice(mid) : [];

	return div.c("std-trees-brainstorm", () => {
		if (left.length)
			div.c("std-trees-flow-kids std-trees-flow-mirror", () => left.forEach(child => flow_item(child, folded, on_toggle, true)));

		node_box(root, folded, on_toggle).ac("std-trees-brainstorm-root");

		if (right.length)
			div.c("std-trees-flow-kids", () => right.forEach(child => flow_item(child, folded, on_toggle, false)));
	});
}
