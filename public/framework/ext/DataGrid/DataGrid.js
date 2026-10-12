import View, { div, span, small, label, input, table as table_el, thead, tbody, tr, th, td, is } from "../../core/View/View.js";
import { component } from "../../ui/parts.js";

View.stylesheet(import.meta, "DataGrid.css");

/* ext/DataGrid — ONE reusable grid: resize, sort, filter and "stay fast at
 * thousands of rows", built on top of `ui/datagrid`'s plain markup (import it,
 * never copy it — CLAUDE.md law 6, "one grid, not a second").
 *
 * THE BUG THIS REPLACES (the owner's own measured report, 2026-10-03): the AI
 * Sessions tab's grid mounts `ext/grip` once per column (9 columns, 9 separate
 * resize widgets). Each one adds its OWN "is the pointer near my edge"
 * listener to `document` — 9 document-wide `pointermove` listeners, each
 * running `getBoundingClientRect()` on every pixel the mouse moves anywhere on
 * the page, whether or not you are anywhere near a column edge. That's what
 * measured 108% CPU while the owner just moved their mouse around the page.
 *
 * THE FIX: exactly ONE pointerdown/pointermove/pointerup/pointercancel
 * listener, total, attached to the header row — not one set per column. A
 * drag reads which column via `e.target.closest(".datagrid-grip")` (event
 * delegation) and writes ONE CSS custom property per frame (`wire_resize()`
 * below). The "is a handle visible" question is answered by one plain CSS
 * `:hover` rule in `ui/datagrid/datagrid.js` — no JS "near zone" at all, so
 * there is no delay and nothing to compute on every mouse move anywhere else
 * on the page. Total listeners this class ever adds: 6 of its own —
 * pointerdown/pointermove/pointerup/pointercancel for resize (4), one click
 * for sort, one scroll for windowing — all on the header row or the grid
 * itself, zero on `document`. (Each filter input adds one plain `change`
 * listener too, same as any ordinary form control — not counted above since
 * it's not part of this class's resize/sort/windowing loop; see doc/perf.md.)
 * Against grip's 9 `document`-wide listeners alone (one set per
 * column) plus 45 more mounted on the columns themselves; see perf.mjs /
 * doc/perf.md for the measured numbers.
 *
 *   import DataGrid from "/framework/ext/DataGrid/DataGrid.js";
 *
 *   new DataGrid({
 *     columns: [
 *       { key: "name", label: "Name" },
 *       { key: "age", label: "Age", type: "number", width: 90 },
 *     ],
 *     rows: [{ name: "Ada", age: 30 }, { name: "Grace", age: 44 }],
 *   });
 *
 * `rows` is a plain array, or an async function returning one (a jsonl
 * source — call `fetch` + parse inside it; this class awaits whatever comes
 * back). `columns[].type` is `"text"` (the default), `"number"` or `"date"` —
 * it picks both the sort comparator and the auto-generated filter control
 * (see `build_filters()` below). Append it like any other View:
 * `panel.main.append(new DataGrid({ ... }))`, or it mounts itself wherever it
 * was constructed, same as `Panel2` — there is no separate `.mount()` to
 * remember.
 */

// The plain markup (was ui/datagrid and ui/table; those files now re-export it).
function to_len(v, fallback){
	v = v ?? fallback;
	return typeof v === "number" ? v + "px" : v;
}

function grid_template(columns){
	return columns.map(c => `minmax(${to_len(c.min, 60)}, var(--col-${c.key}, ${to_len(c.width, 140)}))`).join(" ");
}

function cell_content(value, row, column){
	const out = column.format ? column.format(value, row) : value;
	if (out == null || out === "") return;
	if (is.fn(out)) out();
	else span(String(out));
}

function datagrid_head(columns){
	return div.c("datagrid-head datagrid-row", () => {
		columns.forEach((c, i) => {
			div.c("datagrid-cell datagrid-head-cell").attr("data-key", c.key).append(() => {
				span.c("datagrid-label", c.label);
				if (i < columns.length - 1) div.c("datagrid-grip");
			});
		});
	});
}

// `draw_row(row)`, when given, draws one row instead of the default cells.
function datagrid_body(columns, rows, draw_row){
	return div.c("datagrid-body", () => {
		rows.forEach(row => {
			if (draw_row) return draw_row(row);
			div.c("datagrid-row", () => {
				columns.forEach(c => {
					div.c("datagrid-cell").attr("data-key", c.key).append(() => cell_content(row[c.key], row, c));
				});
			});
		});
	});
}

// Past this many rows, only the rows actually on screen (plus a small
// overscan) exist in the DOM — the brief's own "a few hundred" floor.
const WINDOW_AT = 300;

// A fixed row height, in px, while windowing is on — `DataGrid.css` enforces
// this exact number on `.datagrid-cell` so the scroll-position math below and
// what's actually on screen never drift apart. Simplest approach that works
// (the brief's own words): no measuring, no ResizeObserver, one constant.
const ROW_H = 36;
const OVERSCAN = 8;   // extra rows rendered above/below the visible band, so a fast scroll never shows a blank flash

// A column counts as a "small set" (→ checkbox-chip filter) when the first
// few hundred rows show at most this many distinct values. This file's own
// threshold — tune it here if a real dataset needs a different one.
const SMALL_SET_MAX = 12;
const SAMPLE_SIZE = 300;

function comparator(col){
	if (col.type === "number") return (a, b) => num(a[col.key]) - num(b[col.key]);
	if (col.type === "date") return (a, b) => date_num(a[col.key]) - date_num(b[col.key]);
	return (a, b) => String(a[col.key] ?? "").localeCompare(String(b[col.key] ?? ""));
}
function num(v){ return typeof v === "number" ? v : -Infinity; }
// A missing or unparseable date sorts first, rather than landing wherever
// `Date.parse(undefined)` or `NaN` happens to fall (review.mjs caught this —
// `Date.parse("0")` is a real date in 2000 in V8, not "no date").
function date_num(v){ const n = Date.parse(v); return Number.isNaN(n) ? -Infinity : n; }

export default class DataGrid extends View {

	static len = to_len;
	static cell_content = cell_content;
	static template = grid_template;
	static head = datagrid_head;
	static body = datagrid_body;

	// A static grid, markup only, no sort or listeners (what `ui.datagrid` was).
	static plain = component((columns, rows) => div.c("datagrid", $grid => {
		$grid.style("gridTemplateColumns", grid_template(columns));
		columns.forEach(c => $grid.style("--col-" + c.key, to_len(c.width, 140)));
		datagrid_head(columns);
		datagrid_body(columns, rows);
	}));

	// A small native <table> for prose (what `ui.table` was).
	static table = component((head, rows) => table_el.c("ui-table", () => {
		thead(() => tr(() => head.forEach(cell => th(cell))));
		tbody(() => rows.forEach(row => tr(() => row.forEach(cell => td(cell)))));
	}));

	render(){
		this.ac("datagrid-ext");

		this.sort_key = null;
		this.sort_dir = null;     // "asc" | "desc" | null
		this.filters = {};        // col.key -> { type, ...state } — built in build_filters()
		this.all_rows = [];       // every row, unfiltered — set once `rows` resolves
		this.view_rows = [];      // filtered + sorted, recomputed by apply()

		this.$filters = div.c("datagrid-filters flex wrap gap-50");
		this.$count = small.c("muted datagrid-count");

		this.$grid = div.c("datagrid", $g => {
			$g.style("gridTemplateColumns", grid_template(this.columns));
			this.columns.forEach(c => $g.style("--col-" + c.key, to_len(c.width, 140)));
			this.$head = datagrid_head(this.columns);
			this.$body = div.c("datagrid-body");
		});

		this.build_sort_arrows();
		this.wire_resize();
		this.wire_sort();
		this.wire_scroll();
		this.load();
	}

	// `rows` is read here, once — whatever the caller passed (`this.rows`,
	// straight off the constructor options) is never touched again after this,
	// so there is no Panel2-style "this.rows got overwritten" trap.
	async load(){
		const source = this.rows;
		this.all_rows = typeof source === "function" ? ((await source()) ?? []) : (source ?? []);
		this.build_filters();
		this.apply();
	}

	// Recomputes `view_rows` from `all_rows` + the current filters/sort, then
	// redraws — the one function every filter checkbox, date input, number
	// input and sort click all funnel through, same shape `ai/sessions`' own
	// `render_rows()` already uses (law 6: one recompute path, not N).
	apply(){
		let rows = this.all_rows.filter(r => this.row_matches(r));
		if (this.sort_key){
			const col = this.columns.find(c => c.key === this.sort_key);
			if (col){
				rows = [...rows].sort(comparator(col));
				if (this.sort_dir === "desc") rows.reverse();
			}
		}
		this.view_rows = rows;
		this.windowed = rows.length > WINDOW_AT;
		this.$grid.tc("datagrid-windowed", this.windowed);
		this.render_sort_arrows();
		this.$count.text(rows.length === this.all_rows.length
			? `${rows.length} row${rows.length === 1 ? "" : "s"}`
			: `${rows.length} of ${this.all_rows.length} rows`);
		this.render_window(true);
	}

	row_matches(row){
		for (const col of this.columns){
			const f = this.filters[col.key];
			if (!f) continue;
			const v = row[col.key];
			// A null/undefined value was never one of the sampled chips (build_filters
			// drops nulls before counting uniques), so it has no chip to be unchecked
			// by — always let it through rather than hiding it from every filter state.
			if (f.type === "chip" && v != null && !f.values.has(String(v))) return false;
			if (f.type === "date"){
				if (f.from && (!v || Date.parse(v) < Date.parse(f.from))) return false;
				if (f.to && (!v || Date.parse(v) > Date.parse(f.to + "T23:59:59"))) return false;
			}
			if (f.type === "number"){
				if (f.min != null && !(num(v) >= f.min)) return false;
				if (f.max != null && !(num(v) <= f.max)) return false;
			}
		}
		return true;
	}

	// ---- windowing — only the visible slice (plus overscan) is ever in the
	// DOM past WINDOW_AT rows; two spacer boxes (not `.datagrid-row`, so they
	// keep a real height instead of flattening away) hold the scrollbar at the
	// right length and position for the rows that AREN'T rendered. ----

	render_window(reset_scroll){
		if (reset_scroll) this.$grid.el.scrollTop = 0;

		if (!this.windowed){
			this.$body.empty(() => datagrid_body(this.columns, this.view_rows));
			return;
		}

		const scroll_top = this.$grid.el.scrollTop;
		const viewport_h = this.$grid.el.clientHeight || 400;
		const start = Math.max(0, Math.floor(scroll_top / ROW_H) - OVERSCAN);
		const count = Math.ceil(viewport_h / ROW_H) + OVERSCAN * 2;
		const end = Math.min(this.view_rows.length, start + count);
		const top_h = start * ROW_H;
		const bottom_h = (this.view_rows.length - end) * ROW_H;

		// ⚠ `div()` with no class, not `div.c(...)` or `div({...})` — a plain
		// object argument to `div()` is read as named child PROPS
		// (`append_pojo`), not a style map; `.style({...})` is the real setter.
		// No "datagrid-row" class either: that class is `display: contents`
		// (ui/datagrid/datagrid.js), which would flatten this box away and the
		// spacer would hold no height at all.
		this.$body.empty(() => {
			if (top_h > 0) div().style({ gridColumn: "1 / -1", blockSize: top_h + "px" });
			datagrid_body(this.columns, this.view_rows.slice(start, end));
			if (bottom_h > 0) div().style({ gridColumn: "1 / -1", blockSize: bottom_h + "px" });
		});
	}

	wire_scroll(){
		this.$grid.el.addEventListener("scroll", () => {
			if (this.windowed) this.render_window(false);
		}, { passive: true });
	}

	// ---- resize — see the module header comment: ONE listener per event type,
	// delegated, on the header row; a drag writes exactly one `--col-<key>`
	// custom property per pointermove, nothing else. ----

	wire_resize(){
		let drag = null;   // { key, start_x, start_width } while a drag is live

		this.$head.el.addEventListener("pointerdown", e => {
			const grip = e.target.closest(".datagrid-grip");
			if (!grip) return;
			const cell = grip.closest(".datagrid-head-cell");
			const key = cell?.dataset.key;
			if (!key) return;
			e.preventDefault();
			drag = { key, start_x: e.clientX, start_width: cell.getBoundingClientRect().width };
			grip.setPointerCapture(e.pointerId);
		});

		this.$head.el.addEventListener("pointermove", e => {
			if (!drag) return;
			const col = this.columns.find(c => c.key === drag.key);
			const min = col?.min ?? 60;
			const next = Math.max(min, Math.round(drag.start_width + (e.clientX - drag.start_x)));
			this.$grid.style("--col-" + drag.key, next + "px");
		});

		const end_drag = () => { drag = null; };
		this.$head.el.addEventListener("pointerup", end_drag);
		this.$head.el.addEventListener("pointercancel", end_drag);
	}

	// ---- sort — a click anywhere on a header cell's label (not its grip)
	// cycles asc → desc → off; re-renders the body only, never the header. ----

	wire_sort(){
		this.$head.el.addEventListener("click", e => {
			if (e.target.closest(".datagrid-grip")) return;
			const cell = e.target.closest(".datagrid-head-cell");
			const key = cell?.dataset.key;
			const col = this.columns.find(c => c.key === key);
			if (!col || col.sort === false) return;

			if (this.sort_key !== key) { this.sort_key = key; this.sort_dir = "asc"; }
			else if (this.sort_dir === "asc") this.sort_dir = "desc";
			else { this.sort_key = null; this.sort_dir = null; }

			this.apply();
		});
	}

	// ⚠ Raw DOM here, not the `span()` factory — this runs AFTER `$grid`'s own
	// capture callback has already closed, so a captured view would append
	// itself to whatever is capturing OUTSIDE this class (wherever the caller
	// mounted the grid), not into the header cell found by `querySelector`
	// (doc/capturing.md: capturing is synchronous, this call is not).
	build_sort_arrows(){
		this.$head.el.querySelectorAll(".datagrid-head-cell").forEach(cell => {
			const col = this.columns.find(c => c.key === cell.dataset.key);
			if (!col || col.sort === false) return;
			cell.classList.add("datagrid-sortable");
			const arrow = document.createElement("span");
			arrow.className = "datagrid-sort-arrow";
			cell.querySelector(".datagrid-label")?.appendChild(arrow);
		});
	}

	render_sort_arrows(){
		this.$head.el.querySelectorAll(".datagrid-head-cell").forEach(cell => {
			const arrow = cell.querySelector(".datagrid-sort-arrow");
			if (!arrow) return;
			arrow.textContent = cell.dataset.key === this.sort_key ? (this.sort_dir === "desc" ? " ↓" : " ↑") : "";
		});
	}

	// ---- filters — auto-generated from `column.type`, so a new data set gets
	// useful filters with no extra code (the brief's own words). Skips a
	// column entirely when `column.filter === false`, or when a text column's
	// first SAMPLE_SIZE rows show more than SMALL_SET_MAX distinct values —
	// free text (a name, a prompt) gets no filter, which is the honest answer
	// for "what would the chips even be". ----

	build_filters(){
		this.filters = {};
		this.$filters.empty(() => {
			this.columns.forEach(col => {
				if (col.filter === false) return;
				if (col.type === "date") return this.build_date_filter(col);
				if (col.type === "number") return this.build_number_filter(col);

				const sample = this.all_rows.slice(0, SAMPLE_SIZE).map(r => r[col.key]).filter(v => v != null);
				const uniques = [...new Set(sample.map(String))].sort();
				if (uniques.length && uniques.length <= SMALL_SET_MAX) this.build_chip_filter(col, uniques);
			});
		});
	}

	build_chip_filter(col, values){
		this.filters[col.key] = { type: "chip", values: new Set(values) };
		div.c("datagrid-filter flex wrap gap-35 v-center", () => {
			small.c("muted", col.label + ":");
			values.forEach(v => {
				label.c("flex gap-35 v-center h4", () => {
					const $box = input().attr("type", "checkbox");
					$box.el.checked = true;
					$box.on("change", () => {
						if ($box.el.checked) this.filters[col.key].values.add(v); else this.filters[col.key].values.delete(v);
						this.apply();
					});
					span(v);
				});
			});
		});
	}

	build_date_filter(col){
		this.filters[col.key] = { type: "date", from: null, to: null };
		div.c("datagrid-filter flex gap-50 v-center", () => {
			small.c("muted", col.label + ":");
			small.c("muted", "from");
			const $from = input().attr("type", "date");
			$from.on("change", () => { this.filters[col.key].from = $from.el.value || null; this.apply(); });
			small.c("muted", "to");
			const $to = input().attr("type", "date");
			$to.on("change", () => { this.filters[col.key].to = $to.el.value || null; this.apply(); });
		});
	}

	build_number_filter(col){
		this.filters[col.key] = { type: "number", min: null, max: null };
		div.c("datagrid-filter flex gap-50 v-center", () => {
			small.c("muted", col.label + ":");
			small.c("muted", "min");
			const $min = input().attr("type", "number");
			$min.on("change", () => { this.filters[col.key].min = $min.el.value === "" ? null : Number($min.el.value); this.apply(); });
			small.c("muted", "max");
			const $max = input().attr("type", "number");
			$max.on("change", () => { this.filters[col.key].max = $max.el.value === "" ? null : Number($max.el.value); this.apply(); });
		});
	}
}

export { DataGrid };
