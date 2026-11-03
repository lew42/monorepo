import View, { div, span, small, a, button, label, input } from "/framework/core/View/View.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";
import SessionOutlineView from "./SessionOutlineView.js";
import SessionPopover from "./SessionPopover.js";
import AICost from "../AITask/AICost.js";

View.stylesheet(import.meta, "SessionTasksGrid.css");

/** SessionTasksGrid — the session page's Tasks tab: every task of the session on the one ext/DataGrid, newest first, with Filters ▾ for
 *  state, day and kind (the Timeline's own popover) and a Nested chip that swaps to the SessionWork view (Approve and the nesting).
 *  It draws the tasks SessionWork already loaded (`work.tree`), never fetching; `work.on_paint` calls `refresh()` when they change.
 *  Options: `work` (the loaded SessionWork), `sid` (this session's id), `nested` (the SessionWork's element, hidden while the grid shows).
 *  Readme: ai/AISession/readme.md. */
export default class SessionTasksGrid extends View {
	static GROUPS = [["state", "State"], ["day", "Day"], ["kind", "Kind"]];

	get classes(){ return "stg flow"; }

	/** Task records carry no kind field (ai/index.json: id, home, dir, url, title, state, bucket, started, landed_at, last, day, agent, session, module, line, waiting_on), so it is derived: a task with tasks under it is a project, one an agent session ran is an agent task, the rest are plain tasks. */
	static kind_of(n){ return n.kids.length ? "project" : n.session ? "agent task" : "task"; }

	/** The nodes SessionWork draws (everything under a lone wrapping folder), as flat rows. */
	static rows_of(work, sid){
		const root = work.tree?.root; if (!root) return [];
		let top = root; while (top.kids.length === 1 && top.kids[0].kids.length) top = top.kids[0];   // the same skip as SessionWork.paint
		return top.kids.flatMap(k => k.all()).map(n => {
			const t = Date.parse(n.started ?? "") || Date.parse(n.ended ?? "") || 0, d = t ? new Date(t) : null;
			return { id: n.url ?? n.rel, node: n, title: n.title || n.rel, state: n.state ?? "unknown", started: t ? new Date(t).toISOString() : null,
				day: d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : "no date",
				kind: SessionTasksGrid.kind_of(n), owner: n.session && n.session !== sid ? n.session : null, cost: n.usd ?? null, url: n.url };
		}).sort((x, y) => (Date.parse(y.started) || 0) - (Date.parse(x.started) || 0));
	}

	render(){
		this.off = {};   // group -> Set of switched-off values; empty = nothing filtered
		this.all = [];
		this.head = div.c("stg-head flex wrap gap-50 v-center", () => {
			this.$filters = button.c("sessions-hbtn", "Filters ▾").attr("type", "button").attr("title", "Show only some states, days or kinds");
			SessionPopover.open(this.$filters, () => this.menu(), "stl-pop");
			this.$nested = button.c("sessions-chip", "Nested").attr("type", "button").attr("title", "The nested view, with Approve").on("click", () => this.nest(!this.is_nested));
			this.$count = small.c("muted stg-count", "Reading the tasks…");
		});
		this.grid = new DataGrid({
			columns: [
				{ key: "state", label: "State", width: "4rem", format: (v, r) => () => SessionOutlineView.state_icon(r.state) },
				{ key: "title", label: "Task", width: "1fr", min: "12rem", format: (v, r) => () => a.c("stg-title", v).href(r.url ?? "#") },
				{ key: "day", label: "Day", width: "8rem", min: "6.5rem" },
				{ key: "kind", label: "Kind", width: "8rem", min: "6rem" },
				{ key: "owner", label: "Session", width: "11rem", format: (v, r) => () => r.owner ? a.c("stg-owner", r.node.snap?.title ?? r.node.agent ?? r.owner.slice(0, 8)).href(AICost.session_url(r.owner)) : span.c("muted", "this session") },
				{ key: "cost", label: "Cost", type: "number", width: "6rem", format: v => v == null ? "" : "$" + v.toFixed(2) },
			],
			rows: [], filters: false, row_height: null, page_size: 100, prefs_id: "session-tasks",
			natural_dir: key => ["cost"].includes(key) ? "desc" : "asc",
		});
		this.grid.$bar.el.style.display = "none";   // the head row above counts the tasks; one table, no Rail toggle (a class loses to the .flex utility)
		this.work.on_paint(() => this.refresh());
		this.work.loaded.then(() => this.refresh());
		this.nest(false);
	}

	/** The checkbox menu: one block per group, only the values that exist, each with its count. */
	menu(){ this.$menu = div.c("stl-menu"); this.fill_menu(); }   // the popover draws its content once, before any rows exist: refresh() refills it

	fill_menu(){
		this.$menu?.empty(() => {
			for (const [g, text] of SessionTasksGrid.GROUPS){
				small.c("muted", text);
				const values = [...new Set(this.all.map(r => r[g]))].sort(g === "day" ? (x, y) => y.localeCompare(x) : undefined);
				if (!values.length) small.c("muted", "none yet");
				for (const v of values) label.c("stl-filter", () => {
					const box = input().attr("type", "checkbox");
					box.el.checked = !this.off[g]?.has(v);
					box.on("change", () => { const s = (this.off[g] ??= new Set()); box.el.checked ? s.delete(v) : s.add(v); this.draw(); });
					span(v);
					small.c("muted stl-n", String(this.all.filter(r => r[g] === v).length));
				});
			}
		});
	}

	nest(on){
		this.is_nested = on;
		this.$nested.el.classList.toggle("sessions-chip-on", on);
		this.grid.el.hidden = on; this.$filters.el.hidden = on; this.$count.el.hidden = on;
		if (this.nested) this.nested.hidden = !on;
	}

	refresh(){ this.all = SessionTasksGrid.rows_of(this.work, this.sid); this.fill_menu(); this.draw(); }

	shown(){ return this.all.filter(r => SessionTasksGrid.GROUPS.every(([g]) => !this.off[g]?.has(r[g]))); }

	draw(){
		const rows = this.shown();
		this.grid.set_rows(rows);
		this.el.dataset.total = this.all.length; this.el.dataset.rows = rows.length;
		this.$count.el.textContent = !this.work.tree ? "No task records for this session." : rows.length === this.all.length ? `${rows.length} task${rows.length === 1 ? "" : "s"}` : `${rows.length} of ${this.all.length} tasks`;
	}
}
