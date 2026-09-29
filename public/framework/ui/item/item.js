import { div, a, span, button, icon, details, summary, is } from "../../core/View/View.js";
import { css } from "../parts.js";

/**
 * item({ icon, name, href, end, open, children }) — one row: an optional icon, then
 * a name. Put the class `.item` on anything and this is the whole layout system: it
 * fills its row by default. Add `.inline` yourself (`item({ … }).ac("inline")`) to
 * make it hug its own content instead, like a chip sitting inside a line of text.
 *
 *   item({ icon: "description", name: "readme.md", href: "/readme.md" })
 *   item({ icon: "folder", name: "core", open: true, children: [
 *       { icon: "description", name: "View.js", href: "/core/View/View.js" },
 *   ]})
 *   item({ name: "Page", end: "menu" })                    // a right-side ⋯ button
 *   item({ name: "Docs", href: "/framework/", end: "arrow" }) // a right-side →, for a link
 *
 * `children` makes this a TREE NODE: the row becomes a native `<summary>` inside a
 * `<details>` — the summary IS the row (the owner's words), and the browser does the
 * expand/collapse, no script required. `href` is ignored when `children` is set; an
 * item is a link OR a branch, never both, in this first version.
 *
 * `children` is an array of the same `{ icon, name, … }` shape, nested to any depth
 * for a file-tree-style indent, or a function that draws its own content instead —
 * called once, inside the row's children box, for a caller who wants to build that
 * part by hand (its own loop, its own markup).
 *
 * `end` is `"menu"` (a small ⋯ button — wire its `click` yourself, this only draws
 * it), `"arrow"` (a plain → glyph, for a link row), or a function that draws
 * anything else there.
 */
function item({ icon: glyph, name, href, end, open, children } = {}){
	const kids = children != null;

	// The row's own insides — shared between the plain-row and the summary-row case,
	// so a branch and a leaf line up on the same icon and name columns.
	const inside = () => {
		if (kids) span.c("item-caret", "▸");
		if (glyph) icon(glyph).ac("item-icon");
		span.c("item-name", name);
		end_part(end);
	};

	if (kids){
		return details.c("item-node", $node => {
			if (open) $node.attr("open", "");
			summary.c("item", inside);
			div.c("item-children", () => {
				is.fn(children) ? children() : children.forEach(child => item(child));
			});
		});
	}

	const $row = (href ? a : div).c("item", inside);
	if (href) $row.href(href);
	return $row;
}

function end_part(end){
	if (!end) return;
	if (is.fn(end)) return end();

	if (end === "arrow") return icon("arrow_forward").ac("item-end");

	if (end === "menu")
		return button.c("item-end", () => icon("more_vert"))
			.attr("type", "button").attr("aria-label", "more")
			// Only stops THIS click from also toggling a parent <details> or firing a
			// row click the caller wired up — wiring what the menu itself does is theirs.
			.click(e => { e.preventDefault(); e.stopPropagation(); });

	return span.c("item-end", String(end));
}

/* Padding: roughly a control's own (framework.css's `--pad-control`, 0.2em 0.8em —
 * a plain <button> or <input>), TIGHTENED on the sides to 0.3em 0.6em. A `.item` is
 * a row in a list, read many-in-a-column rather than one at a time, and 0.8em of
 * side padding measured wider than the icon+name it was framing at 400px — the
 * button padding is right for a control read alone, not for a dense tree of them. */
css(`@layer theme {
	.item {
		display: flex; align-items: center; gap: 0.5em;
		width: 100%; box-sizing: border-box;
		padding: 0.3em 0.6em; border-radius: var(--radius);
		color: inherit; text-decoration: none;
	}
	.item.inline { display: inline-flex; width: auto; }

	a.item:hover, summary.item:hover { background: var(--wash); }

	/* The UA's own disclosure triangle is one bullet too many now that .item-caret
	   draws the fold inside the row — Firefox and Chrome both drop it under
	   list-style: none (the spec routes a summary's marker through display:
	   list-item / ::marker), Safari still needs the pseudo-element told directly. */
	summary.item { list-style: none; }
	summary.item::-webkit-details-marker { display: none; }

	/* ONE SQUARE FRAME for the fold and the icon, so a leaf (icon, no fold) and a
	   branch (fold, then icon) still land their names on the same column — the same
	   reasoning ui/tree's --ui-tree-frame recorded: line-height: 1 centres the glyph
	   in a box exactly its own em square, not its taller inherited line box. */
	.item-caret, .item-icon {
		flex: 0 0 auto;
		display: grid; place-items: center;
		width: 1.3em; aspect-ratio: 1; line-height: 1;
	}
	.item-caret {
		color: var(--subtle);
		transform: rotate(0deg); transition: transform 0.1s;
	}
	.item-node[open] > .item > .item-caret { transform: rotate(90deg); }

	.item-name { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

	.item-end { flex: 0 0 auto; margin-inline-start: auto; display: flex; align-items: center; }
	button.item-end {
		background: none; border: none; padding: 0.2em; min-height: unset;
		border-radius: var(--radius); color: inherit; cursor: pointer;
	}
	button.item-end:hover { background: var(--wash); }

	/* Real nesting, not a depth counter — every .item-children adds one --item-indent
	   of its own padding, the same reasoning ui/tree and ext/files both already use. */
	.item-children { padding-inline-start: var(--item-indent, 1.25em); }
}`);

export default item;
export { item };
