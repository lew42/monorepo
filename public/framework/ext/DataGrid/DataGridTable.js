import { div, span, button, a } from "../../core/View/View.js";
import DataGridDrawer from "./DataGridDrawer.js";

// Past this many fixed-height rows only the ones on screen (plus OVERSCAN) exist.
const WINDOW_AT = 300;
const OVERSCAN = 8;

/* DataGridTable — draws the rows as a table: one header, one row per record.
 * One listener of each kind on the header row (resize, sort), one scroll listener.
 * Why: ext/DataGrid/doc/perf.md. */
export default class DataGridTable extends DataGridDrawer {

	build(){
		const g = this.grid, C = g.constructor;
		const saved = g.saved_widths();

		this.$grid = div.c("datagrid", $g => {
			$g.style("gridTemplateColumns", C.template(g.columns));
			g.columns.forEach(c => $g.style("--col-" + c.key, saved[c.key] ?? C.len(c.width, 140)));
			if (g.row_height != null) $g.style("--datagrid-row-h", g.row_height + "px");
			this.$head = C.head(g.columns);
			this.$body = div.c("datagrid-body");
			this.$more = div.c("datagrid-more", () => {
				button.c("datagrid-more-btn", "Show more").on("click", () => this.more());
			});
		});

		this.build_sort_arrows();
		this.wire_resize();
		this.wire_sort();
		if (g.row_height == null) this.start_paging(this.$body, this.$more, this.$grid.el, r => this.draw_row(r));
		else this.$grid.el.addEventListener("scroll", () => { if (this.windowed) this.draw_window(false); }, { passive: true });
	}

	draw(rows, reset){
		const g = this.grid;
		this.rows = rows;
		this.windowed = g.row_height != null && rows.length > WINDOW_AT;
		this.$grid.tc("datagrid-windowed", this.windowed);
		this.$grid.tc("datagrid-paged", g.row_height == null);
		this.render_sort_arrows();
		if (reset) this.$grid.el.scrollTop = 0;
		if (g.row_height == null) return this.draw_paged(rows, reset);
		this.$more.el.style.display = "none";
		this.draw_window(reset);
	}

	// One row: a whole View from the page's `row(row)`, or a link/div of cells.
	draw_row(row){
		const g = this.grid;
		if (g.row) return g.row(row);
		const href = g.link(row);
		(href ? a : div).c("datagrid-row", $r => {
			if (href) $r.attr("href", href);
			g.cells(row);
		});
	}

	// Two spacer boxes (not `.datagrid-row`, which is display: contents and would collapse) hold the scrollbar.
	draw_window(){
		const g = this.grid, h = g.row_height;
		if (!this.windowed){
			this.$body.empty(() => this.rows.forEach(r => this.draw_row(r)));
			return;
		}
		const start = Math.max(0, Math.floor(this.$grid.el.scrollTop / h) - OVERSCAN);
		const count = Math.ceil((this.$grid.el.clientHeight || 400) / h) + OVERSCAN * 2;
		const end = Math.min(this.rows.length, start + count);
		this.shown = end - start;
		this.$body.empty(() => {
			if (start > 0) div().style({ gridColumn: "1 / -1", blockSize: start * h + "px" });
			this.rows.slice(start, end).forEach(r => this.draw_row(r));
			if (end < this.rows.length) div().style({ gridColumn: "1 / -1", blockSize: (this.rows.length - end) * h + "px" });
		});
	}

	// Resize: one set of delegated listeners on the header. A drag writes one --col-<key> per move,
	// saves the widths to PagePrefs when it ends; a double-click on a grip resets that column.
	wire_resize(){
		const g = this.grid;
		let drag = null;

		this.$head.el.addEventListener("pointerdown", e => {
			const grip = e.target.closest(".datagrid-grip");
			const cell = grip?.closest(".datagrid-head-cell");
			if (!cell?.dataset.key) return;
			e.preventDefault();
			drag = { key: cell.dataset.key, x: e.clientX, w: cell.getBoundingClientRect().width, moved: false };
			grip.setPointerCapture(e.pointerId);
		});

		this.$head.el.addEventListener("pointermove", e => {
			if (!drag) return;
			const col = g.columns.find(c => c.key === drag.key);
			const next = Math.max(col?.min ?? 60, Math.round(drag.w + e.clientX - drag.x));
			drag.moved = true;
			drag.last = next;
			this.$grid.style("--col-" + drag.key, next + "px");
		});

		const end = () => {
			if (drag?.moved) g.save_width(drag.key, drag.last);
			drag = null;
		};
		this.$head.el.addEventListener("pointerup", end);
		this.$head.el.addEventListener("pointercancel", end);

		this.$head.el.addEventListener("dblclick", e => {
			const cell = e.target.closest(".datagrid-grip")?.closest(".datagrid-head-cell");
			const col = g.columns.find(c => c.key === cell?.dataset.key);
			if (!col) return;
			this.$grid.style("--col-" + col.key, g.constructor.len(col.width, 140));
			g.save_width(col.key, null);
		});
	}

	wire_sort(){
		this.$head.el.addEventListener("click", e => {
			if (e.target.closest(".datagrid-grip")) return;
			const key = e.target.closest(".datagrid-head-cell")?.dataset.key;
			if (key) this.grid.cycle_sort(key);
		});
	}

	// Raw DOM: this runs after the capture closed (doc/capturing.md).
	build_sort_arrows(){
		this.$head.el.querySelectorAll(".datagrid-head-cell").forEach(cell => {
			const col = this.grid.columns.find(c => c.key === cell.dataset.key);
			if (!col || col.sort === false) return;
			cell.classList.add("datagrid-sortable");
			const arrow = document.createElement("span");
			arrow.className = "datagrid-sort-arrow";
			cell.querySelector(".datagrid-label")?.appendChild(arrow);
		});
	}

	render_sort_arrows(){
		const g = this.grid;
		this.$head.el.querySelectorAll(".datagrid-head-cell").forEach(cell => {
			const arrow = cell.querySelector(".datagrid-sort-arrow");
			if (arrow) arrow.textContent = cell.dataset.key === g.sort_key ? (g.sort_dir === "desc" ? " ↓" : " ↑") : "";
		});
	}
}
