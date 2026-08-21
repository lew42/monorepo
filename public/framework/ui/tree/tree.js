import { ul, li, div, span, a } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* Indent is nesting, not a depth counter: every `.ui-tree-children` list adds ONE
 * `--ui-tree-indent` of its own padding, so a row N levels deep sits N paddings
 * from the root — the browser sums them. `t.update()` throws the DOM away and
 * rebuilds, so there is never a stale depth value to keep in sync — doc/decisions.md. */
css(`@layer theme {
	.ui-tree, .ui-tree-children { list-style: none; margin: 0; padding: 0; }
	.ui-tree-children { padding-inline-start: var(--ui-tree-indent, 1.25em); }
	.ui-tree-item > .ui-tree-children { display: none; }
	.ui-tree-item.ui-tree-open > .ui-tree-children { display: block; }

	.ui-tree-row {
		display: flex; align-items: center; gap: 0.35em;
		padding: 0.2em 0.4em; border-radius: var(--radius);
		color: inherit; text-decoration: none; cursor: pointer;
	}
	.ui-tree-row:hover { background: var(--wash); }
	.ui-tree-selected { background: var(--wash); font-weight: 600; }

	.ui-tree-toggle {
		flex: 0 0 auto; width: 1em; text-align: center; font-size: 0.7em;
		background: none; border: none; padding: 0; color: var(--subtle);
		transform: rotate(0deg); transition: transform 0.1s;
	}
	.ui-tree-item.ui-tree-open > .ui-tree-row .ui-tree-toggle { transform: rotate(90deg); }

	.ui-tree-icon { flex: 0 0 auto; width: 1.2em; text-align: center; }
	.ui-tree-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
}`);

/**
 * tree(nodes, { indent, onSelect }) — icon + text rows, indented once per nesting
 * level; a sidebar for layers, navigation, anything with children.
 *
 *   nodes: [{ icon?: "▣" | HTMLElement, text, href?, open?: true, children?: [...] }]
 *   t.update(nodes)   re-render from fresh data — the caller still owns it
 *   t.select(node)    mark a row selected without firing onSelect
 *
 * A leaf with `href` is a link; a leaf without one is a selectable row. A branch
 * (has `children`) gets a collapse toggle, open initially iff `open: true`, and is
 * itself selectable too — a Figma frame is still a layer. Every row reserves the
 * icon slot AND the toggle slot even when empty, so a mix of branches, icon-less
 * leaves and icon'd leaves keeps one text column — doc/decisions.md.
 */
export const tree = component((nodes, opts = {}) => {
	const rows = new Map();      // node -> row View, rebuilt on every render
	let selected_row = null;

	const $root = ul.c("ui-tree").style("--ui-tree-indent", opts.indent ?? "1.25em");

	const select_row = (node, fire) => {
		selected_row?.rc("ui-tree-selected");
		selected_row = rows.get(node) ?? null;
		selected_row?.ac("ui-tree-selected");
		if (fire) opts.onSelect?.(node);
	};

	// Captor-driven: `li.c(cls, cb)` runs `cb` with itself as captor, so anything
	// built inside auto-nests — no explicit parent handles anywhere in here.
	const row_list = list => list.forEach(node => {
		const kids = node.children?.length > 0;

		li.c("ui-tree-item" + (kids && node.open ? " ui-tree-open" : ""), $item => {
			const row_tag = !kids && node.href ? a : div;

			const $row = row_tag.c("ui-tree-row", () => {
				if (kids)
					span.c("ui-tree-toggle", "▸").attr("aria-label", "toggle")
						.click(e => { e.stopPropagation(); $item.tc("ui-tree-open"); });
				else
					span.c("ui-tree-toggle");

				span.c("ui-tree-icon", $icon => { if (node.icon != null) $icon.append(node.icon); });
				span.c("ui-tree-text", node.text);
			}).click(() => select_row(node, true));

			if (!kids && node.href) $row.href(node.href);
			rows.set(node, $row);

			if (kids) ul.c("ui-tree-children", () => row_list(node.children));
		});
	});

	const render = list => { rows.clear(); selected_row = null; $root.empty(() => row_list(list)); };

	render(nodes);

	$root.update = render;
	$root.select = node => select_row(node, false);

	return $root;
});

export default tree;
