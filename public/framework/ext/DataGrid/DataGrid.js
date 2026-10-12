import View, { div, span, small, label, input, button, strong, table as table_el, thead, tbody, tr, th, td, is } from "../../core/View/View.js";
import { component } from "../../ui/parts.js";
import PagePrefs from "../../core/Page/Prefs.js";
import DataGridTable from "./DataGridTable.js";
import DataGridRail from "./DataGridRail.js";

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


// A column counts as a "small set" (checkbox-chip filter) when the first rows show at most this many distinct values.
const SMALL_SET_MAX = 12;
const SAMPLE_SIZE = 300;

function num(v){ return typeof v === "number" ? v : -Infinity; }
// A missing or unparseable date sorts first (Date.parse("0") is a real date in V8).
function date_num(v){ const n = Date.parse(v); return Number.isNaN(n) ? -Infinity : n; }
function comparator(col){
	if (col.type === "number") return (a, b) => num(a[col.key]) - num(b[col.key]);
	if (col.type === "date") return (a, b) => date_num(a[col.key]) - date_num(b[col.key]);
	return (a, b) => String(a[col.key] ?? "").localeCompare(String(b[col.key] ?? ""));
}

/* ext/DataGrid — ONE grid for every list of records: resize, sort, filter, fast at thousands of
 * rows, drawn as a table or a rail of cards (the `view` setting). Architecture: doc/architecture.md.
 *
 *   new DataGrid({ columns: [{ key, label, type, width, min, format }], rows, view: "table" })
 *
 * Hooks a page passes instead of subclassing: href(row), cells(row), row(row), card(row),
 * sort_rows(rows, sort), natural_dir(key), filters:false, row_height, page_size. */
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


	static Table = DataGridTable;
	static Rail = DataGridRail;
	static views = { table: DataGridTable, rail: DataGridRail };

	render(){
		this.ac("datagrid-ext");

		this.sort_key = null;
		this.sort_dir = null;      // "asc" | "desc" | null
		this.filter_state = {};    // col.key -> { type, ...state }, built in build_filters()
		this.all_rows = [];        // every row, unfiltered
		this.view_rows = [];       // filtered + sorted, what the drawer draws
		this.watchers = [];
		if (this.row_height === undefined) this.row_height = 36;   // null = rows of any height, paged
		this.page_size ??= 100;
		this.prefs = new PagePrefs({ id: this.prefs_id ?? "datagrid:" + location.pathname });
		this.view = this.pick_view();

		this.$bar = div.c("datagrid-bar flex wrap gap-50 v-center", () => {
			this.$count = small.c("muted datagrid-count");
			this.$toggle = div.c("datagrid-toggle", () => {
				this.$btns = {};
				for (const name of Object.keys(DataGrid.views)){
					this.$btns[name] = button.c("datagrid-toggle-btn", name === "table" ? "Table" : "Rail")
						.on("click", () => this.choose_view(name));
				}
			});
		});
		this.$filters = div.c("datagrid-filters flex wrap gap-50");
		this.$stage = div.c("datagrid-stage");

		this.mount_drawer();
		this.load();
	}

	// ---- the view setting: url > the reader's saved pref > the page's settings.view > "table" ----

	pick_view(){
		const ok = v => v && DataGrid.views[v] ? v : null;
		return ok(new URLSearchParams(location.search).get("view"))
			?? ok(this.prefs.get().view)
			?? ok(this.settings?.view)
			?? "table";
	}

	// Swap the drawer; the rows are already here, nothing is refetched.
	set_view(name){
		if (!DataGrid.views[name]) return this;
		this.view = name;
		this.tc("datagrid-view-rail", name === "rail");
		for (const k in this.$btns) this.$btns[k].tc("on", k === name).attr("aria-pressed", String(k === name));
		this.drawer?.destroy();
		this.mount_drawer();
		this.drawer.draw(this.view_rows, true);
		this.changed();
		return this;
	}

	// The reader's click: also writes the url and the pref.
	choose_view(name){
		this.set_view(name);
		const url = new URL(location.href);
		url.searchParams.set("view", name);
		history.replaceState(history.state, "", url);
		this.prefs.patch({ view: name });
	}

	mount_drawer(){
		this.tc("datagrid-view-rail", this.view === "rail");
		for (const k in this.$btns) this.$btns[k].tc("on", k === this.view).attr("aria-pressed", String(k === this.view));
		this.drawer = new DataGrid.views[this.view](this);
		this.$stage.empty(() => this.drawer.build());
	}

	// ---- column widths: the reader's own, saved when a drag ends ----

	saved_widths(){ return this.prefs.get().widths ?? {}; }

	save_width(key, px){
		const widths = { ...this.saved_widths() };
		if (px == null) delete widths[key]; else widths[key] = px + "px";
		this.prefs.patch({ widths });
		this.changed();
	}

	// ---- rows ----

	// `rows` is read once here: an array, or an async function returning one.
	async load(){
		const source = this.rows;
		this.set_rows(typeof source === "function" ? ((await source()) ?? []) : (source ?? []), true);
	}

	// Replace the rows (a live feed calls this); sort, filters, scroll position and view stay.
	set_rows(rows, first){
		this.all_rows = rows;
		if (first) this.build_filters();
		this.apply(!!first);
		return this;
	}

	// The one recompute path: filter, sort, count, hand the result to the drawer.
	apply(reset_scroll = true){
		let rows = this.all_rows.filter(r => this.row_matches(r));
		if (this.sort_key) rows = this.sort_rows(rows, { key: this.sort_key, dir: this.sort_dir });
		this.view_rows = rows;
		this.$count.text(rows.length === this.all_rows.length
			? `${rows.length} row${rows.length === 1 ? "" : "s"}`
			: `${rows.length} of ${this.all_rows.length} rows`);
		this.drawer.draw(rows, reset_scroll);
		this.changed();
	}

	// ---- hooks (a page passes its own instead of subclassing) ----

	sort_rows(rows, { key, dir }){
		const col = this.columns.find(c => c.key === key);
		if (!col) return rows;
		rows = [...rows].sort(comparator(col));
		return dir === "desc" ? rows.reverse() : rows;
	}

	natural_dir(key){ return "asc"; }

	// Header click: natural direction, then the reverse, then off.
	cycle_sort(key){
		const col = this.columns.find(c => c.key === key);
		if (!col || col.sort === false) return;
		const natural = this.natural_dir(key), reversed = natural === "asc" ? "desc" : "asc";
		if (this.sort_key !== key){ this.sort_key = key; this.sort_dir = natural; }
		else if (this.sort_dir === natural) this.sort_dir = reversed;
		else { this.sort_key = null; this.sort_dir = null; }
		this.apply();
	}

	// Default table row: one cell per column. Called with the row's element capturing.
	cells(row){
		this.columns.forEach(c => {
			div.c("datagrid-cell").attr("data-key", c.key).append(() => DataGrid.cell_content(row[c.key], row, c));
		});
	}

	// Default card: the first column is the title, the rest one muted line of "label value".
	card(row){
		const text = c => {
			const out = c.format ? c.format(row[c.key], row) : row[c.key];
			return is.fn(out) || out == null || out === "" ? "" : String(out);
		};
		const [first, ...rest] = this.columns;
		strong.c("datagrid-card-title", text(first) || "–");
		small.c("muted datagrid-card-line", rest.map(c => ({ c, t: text(c) })).filter(x => x.t).map(x => `${x.c.label} ${x.t}`).join(" · "));
	}

	// Anything that wants to follow the live instance (the demo's debug view).
	watch(fn){ this.watchers.push(fn); fn(this); return this; }
	changed(){ this.watchers.forEach(fn => fn(this)); }

	row_matches(row){
		for (const col of this.columns){
			const f = this.filter_state[col.key];
			if (!f) continue;
			const v = row[col.key];
			// A null value was never a sampled chip, so it has none to be unchecked by: let it through.
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

	// ---- filters: auto-built from column.type; `filters: false` builds none ----

	build_filters(){
		this.filter_state = {};
		if (this.filters === false) return;
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
		this.filter_state[col.key] = { type: "chip", values: new Set(values) };
		div.c("datagrid-filter flex wrap gap-35 v-center", () => {
			small.c("muted", col.label + ":");
			values.forEach(v => {
				label.c("flex gap-35 v-center h4", () => {
					const $box = input().attr("type", "checkbox");
					$box.el.checked = true;
					$box.on("change", () => {
						if ($box.el.checked) this.filter_state[col.key].values.add(v); else this.filter_state[col.key].values.delete(v);
						this.apply();
					});
					span(v);
				});
			});
		});
	}

	build_date_filter(col){
		this.filter_state[col.key] = { type: "date", from: null, to: null };
		div.c("datagrid-filter flex gap-50 v-center", () => {
			small.c("muted", col.label + ":");
			small.c("muted", "from");
			const $from = input().attr("type", "date");
			$from.on("change", () => { this.filter_state[col.key].from = $from.el.value || null; this.apply(); });
			small.c("muted", "to");
			const $to = input().attr("type", "date");
			$to.on("change", () => { this.filter_state[col.key].to = $to.el.value || null; this.apply(); });
		});
	}

	build_number_filter(col){
		this.filter_state[col.key] = { type: "number", min: null, max: null };
		div.c("datagrid-filter flex gap-50 v-center", () => {
			small.c("muted", col.label + ":");
			small.c("muted", "min");
			const $min = input().attr("type", "number");
			$min.on("change", () => { this.filter_state[col.key].min = $min.el.value === "" ? null : Number($min.el.value); this.apply(); });
			small.c("muted", "max");
			const $max = input().attr("type", "number");
			$max.on("change", () => { this.filter_state[col.key].max = $max.el.value === "" ? null : Number($max.el.value); this.apply(); });
		});
	}
}

export { DataGrid };
