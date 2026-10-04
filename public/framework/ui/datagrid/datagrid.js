import { div, span, is } from "../../core/View/View.js";
import { component, css } from "../parts.js";

/* ui/datagrid — the markup-only half of a data grid: a CSS-grid box, one
 * `--col-<key>` custom property per column (set right here, inline, so it
 * draws correctly with no JavaScript running after this call returns), a
 * header row and a body. No listeners, no class, no state — resize, sort,
 * filter and windowing are `ext/DataGrid`'s job, built ON TOP of this markup
 * (the owner's own UI/UX split, CLAUDE.md: "if it needs JS, it's UX").
 *
 *   import { datagrid } from "/app.js";
 *   datagrid(
 *     [{ key: "name", label: "Name" }, { key: "age", label: "Age", width: 80 }],
 *     [{ name: "Ada", age: 30 }, { name: "Grace", age: 44 }],
 *   );
 *
 * A column is `{ key, label, width, min, format }` — `width`/`min` are a
 * plain number (read as px) or any CSS length string ("10rem"); `format(value,
 * row)`, when given, turns the raw value into the cell's content — a string,
 * or a function that renders with the cell `<div>` as its captor, the same
 * convention `ui.table`'s cell functions already use.
 *
 * `datagrid_head`/`datagrid_body` are exported too, separately, because
 * `ext/DataGrid` needs to re-render just the body (a sort, a scroll) or
 * change just one CSS variable (a resize) without rebuilding the header or
 * walking every row again — see that module for the behaviour this markup
 * supports but does not itself run.
 */

css(`@layer theme {
	/* \`--datagrid-height\`: the default cap on a plain markup-only grid, so a
	   long one (ext/DataGrid's real use) scrolls INSIDE its own box instead of
	   stretching the page — override with \`.style("--datagrid-height", "...")\`
	   or \`"none"\` to let it grow with its content instead. */
	.datagrid { display: grid; column-gap: var(--gap-50); overflow: auto; position: relative; max-height: var(--datagrid-height, 28rem); }
	.datagrid-head, .datagrid-body, .datagrid-row { display: contents; }

	.datagrid-cell {
		display: flex; align-items: center; min-width: 0;
		/* Inline padding too, not just block -- without it the text sits flush
		   against the column's left edge (caught by merge.mjs's smoke test:
		   "text touching its box", 0px from left). column-gap on .datagrid
		   already spaces cells from EACH OTHER; this is each cell's own edge. */
		padding: var(--gap-50);
		border-block-end: 1px solid var(--line);
	}

	/* Sticky so a tall, internally-scrolling grid (ext/DataGrid's windowing)
	   keeps its header in view — the box that scrolls is \`.datagrid\` itself. */
	.datagrid-head-cell {
		position: sticky; inset-block-start: 0; z-index: 1;
		background: var(--surface);
		font-weight: 600; border-block-end-width: 2px;
	}

	/* The resize handle — the owner's measured bug was ext/grip's "near zone":
	   a document-wide pointermove listener computing distance-to-edge every
	   frame just to decide whether to light up. This is one plain :hover rule
	   instead — the browser does that work for free, instantly, with no JS at
	   all needed for the handle to appear. */
	.datagrid-grip {
		position: absolute; inset-block: 0;
		inset-inline-end: calc(var(--gap-50) / -2 - 3px);
		width: calc(var(--gap-50) + 6px);
		cursor: col-resize; touch-action: none; z-index: 2;
	}
	.datagrid-grip::after {
		content: ""; position: absolute; inset-block: 0; inset-inline-start: 50%;
		width: 2px; transform: translateX(-50%);
		background: var(--prim); opacity: 0; transition: opacity 0.1s;
	}
	.datagrid-grip:hover::after, .datagrid-grip:focus-visible::after { opacity: 0.6; }

	.datagrid-label { display: inline-flex; align-items: center; gap: var(--gap-35); }
	.datagrid-sortable .datagrid-label { cursor: pointer; }
	.datagrid-sortable .datagrid-label:hover { text-decoration: underline; }
}`);

/** A column's `width`/`min` is a plain number (read as px) or any CSS length
 * string — exported because `ext/DataGrid` needs the same conversion when it
 * sets each column's starting `--col-<key>` value. */
export function to_len(v, fallback){
	v = v ?? fallback;
	return typeof v === "number" ? v + "px" : v;
}

/** One `minmax(min, var(--col-key, width))` track per column, in order — the
 * one real grid line `ext/DataGrid` writes once at mount; after that, resizing
 * a column only ever touches its own `--col-<key>` custom property. */
export function grid_template(columns){
	return columns.map(c => `minmax(${to_len(c.min, 60)}, var(--col-${c.key}, ${to_len(c.width, 140)}))`).join(" ");
}

function cell_content(value, row, column){
	const out = column.format ? column.format(value, row) : value;
	if (out == null || out === "") return;
	if (is.fn(out)) out();
	else span(String(out));
}

/** The header row — one cell per column, a resize grip between each pair.
 * `data-key` on every head cell is the seam `ext/DataGrid` reads with
 * `e.target.closest()` for its one delegated listener (resize AND sort both
 * come through this same row). */
export function datagrid_head(columns){
	return div.c("datagrid-head datagrid-row", () => {
		columns.forEach((c, i) => {
			div.c("datagrid-cell datagrid-head-cell").attr("data-key", c.key).append(() => {
				span.c("datagrid-label", c.label);
				if (i < columns.length - 1) div.c("datagrid-grip");
			});
		});
	});
}

/** The body — one row per item in `rows`, `display: contents` so its cells
 * become direct children of the `.datagrid` grid itself (the same trick
 * `ai/sessions`' own grid, and `core/Page`'s `columns()`, already use). Called
 * on its own by `ext/DataGrid` every time the visible slice changes (a sort,
 * a scroll) — the header is never rebuilt just because the body redrew. */
export function datagrid_body(columns, rows){
	return div.c("datagrid-body", () => {
		rows.forEach(row => {
			div.c("datagrid-row", () => {
				columns.forEach(c => {
					div.c("datagrid-cell").attr("data-key", c.key).append(() => cell_content(row[c.key], row, c));
				});
			});
		});
	});
}

/** The whole thing, head and body together, for a plain static table — the
 * shape `ext/DataGrid` builds behaviour on top of. */
export const datagrid = component((columns, rows) => div.c("datagrid", $grid => {
	$grid.style("gridTemplateColumns", grid_template(columns));
	columns.forEach(c => $grid.style("--col-" + c.key, to_len(c.width, 140)));
	datagrid_head(columns);
	datagrid_body(columns, rows);
}));

export default datagrid;
