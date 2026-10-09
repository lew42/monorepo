import { servex_base } from "/framework/ai/v/3/prompts.js";
import { Page, md, h3, div, a, span, small, p, label, input, button, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { usage_rail } from "/framework/ext/AITask/usage.js";
import { grip } from "/framework/ext/grip/grip.js";
import AISessionRows from "./AISessionRows.js";
import AISessionView from "./AISessionView.js";
import AISessionLive from "./AISessionLive.js";
import AISession from "./AISession.js";
import AISessionDetail from "./AISessionDetail.js";

const sessions_dir = { url: new URL("../sessions/", import.meta.url).href };   // the page's folder: its stylesheet and docs stay beside page.js
View.stylesheet(sessions_dir, "sessions.css");
View.stylesheet("/framework/ext/AITask/ai.css");   // the usage rail's bars

// THE SESSIONS TAB: a grid of every Claude session that has an id (a VS Code tab, a Servex agent, a CLI run).
// `page.js` instantiates it. The data side is AISessionRows, one row is a AISessionView, a clicked row opens a
// AISessionDetail. Docs: readme.md and doc/ beside this file (decisions.md has the history of every choice).
//
// Where the rows come from: Servex's live agent list (first paint from GET /api/agents, then its event stream;
// a 20 s poll is only the fallback), sessions.json (the VS Code/CLI snapshot, written by sessions.mjs), and the
// computed files session-index.json, session-tree.json, spend-tree.json (written by scripts under Server/).
//
// `width: "fill"` + `columns()`: the grid claims the whole row until a row is clicked; then `fill` yields to the
// open child and the detail opens beside the grid, as a master-detail (core/Page doc/columns.md).
//
// Page/Item name clashes found while converting this from an object config: none. The members this class adds
// (content, route, activated, deactivated, render_*, toggle_sort, filter_rows, draw, plus data fields such as
// tree, source, sort, spend, usage) were checked against Item.js and Page.class.js. Item's `root()` is the one
// to avoid, so AISessionDetail calls its parent `home`. Detail: doc/classes.md.
export default class AISessionsPage extends Page {

	static POLL_MS = 20000;
	static PAGE_SIZE = 200;

	constructor(...args){
		super({
			title: "",   // the Panel2 header shows "Sessions"
			description: "Every Claude session with an id — a VS Code tab, a Servex agent, or a CLI run — newest activity first.",
			icon: "history_toggle_off",
			width: "fill",
			classes: "sessions-page",
		}, ...args);
	}

	initialize(){ this.columns(); }

	content(){
		const panel = new Panel2({ title: "Sessions" }).ac("wide");   // `wide`: a plain Page's track is the narrow prose column
		this.$asof = null;
		panel.header.append(() => {
			a.c("sessions-doclink").href(this.url + "doc/").text("Priorities").attr("title", "What the owner asked for, most important first");
			a.c("sessions-doclink").href(this.url + "readme/").text("Readme").attr("title", "What this tab is, and the docs it links to");
			this.$asof = small.c("muted", "loading…");
		});

		this.sort = null;           // null (default order) | { key, dir }, set by clicking a column header
		this.$sort_labels = {};
		this.role_filter = null;    // Set<string> | null (null until the first real data arrives)
		this.trigger_filter = null; // same shape, for the spend tree's trigger tag
		const today = new Date();
		this.date_to = today.toISOString().slice(0, 10);
		this.date_from = new Date(today.getTime() - 30 * 864e5).toISOString().slice(0, 10);
		this.last_rows = [];        // the latest merged rows, UNFILTERED: filters and sort redraw from this
		this.filtered_count = 0;    // the "sessions shown" count

		this.$stats = div.c("sessions-stats");
		panel.main.append(this.$stats);
		this.render_stats();

		this.$flight = div.c("sessions-flight");   // what is running right now, redrawn on every event of the agent stream
		panel.main.append(this.$flight);

		this.$controls = div.c("sessions-controls");
		panel.main.append(this.$controls);

		this.$grid = div.c("sessions-grid", $grid => {
			this.render_head($grid);
			this.$rows = div.c("sessions-rows");
		});
		panel.main.append(this.$grid);
		this.snapshot_rows = [];
	}

	// ---- drawing -------------------------------------------------------------------------------------

	/** Every header is a sort toggle: first click = the natural order, second = reversed, third = back to the default. */
	render_head($grid){
		const { COLUMNS } = AISessionRows;
		div.c("sessions-head", () => {
			COLUMNS.forEach((col, i) => {
				div.c("sessions-cell sessions-head-cell", () => {
					const label = span.c("sessions-sort-label").attr("role", "button").attr("tabindex", "0").attr("title", col.hint ?? "Click to sort; click again to reverse; a third click goes back to the default order");
					label.click(() => this.toggle_sort(col.key));
					label.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); this.toggle_sort(col.key); } });
					this.$sort_labels[col.key] = label;
					// the last column has nothing to its right to resize into
					if (i < COLUMNS.length - 1){
						grip({
							from: "start",   // this cell's own left edge is the column's start
							write(px){
								const clamped = Math.max(col.min, Math.round(px));
								$grid.style("--col-" + col.key, clamped + "px");
								return clamped;
							},
						});
					}
				});
			});
		});
		this.render_sort_labels();
	}

	render_sort_labels(){
		for (const col of AISessionRows.COLUMNS){
			const on = this.sort?.key === col.key;
			this.$sort_labels[col.key]?.text(col.label + (on ? (this.sort.dir === "desc" ? " ↓" : " ↑") : ""));
		}
	}

	toggle_sort(key){
		const nat = AISessionRows.natural_dir(key), rev = nat === "asc" ? "desc" : "asc";
		if (this.sort?.key !== key) this.sort = { key, dir: nat };
		else if (this.sort.dir === nat) this.sort = { key, dir: rev };
		else this.sort = null;
		this.render_sort_labels();
		this.render_rows();
	}

	/** The plan's meters as progress bars with the pace marker (ext/AITask/usage.js), then one line of counts. */
	render_stats(){
		if (!this.$stats) return;
		this.$stats.empty(() => {
			if (this.usage) usage_rail(this.usage);
			small.c("muted sessions-counts", `${this.filtered_count} sessions shown · $${(this.shown_usd ?? 0).toFixed(2)} Claude cost · ${this.date_from} to ${this.date_to}`)
				.attr("title", "Claude cost is the API-equivalent price of the tokens, summed from the session files. It is not a bill.");
			const r = this.reconcile;
			if (r?.account_total_usd != null) small.c("muted sessions-counts", `OpenRouter (real dollars, apart from the Claude cost above): $${r.recorded_verified_usd.toFixed(2)} recorded ($${(r.recorded_key_diff_usd ?? 0).toFixed(2)} of it key-diff, may overlap) · account says $${r.account_total_usd.toFixed(2)} · ${r.gap_total_usd < 0 ? "log is $" + (-r.gap_total_usd).toFixed(2) + " above the account" : "gap $" + r.gap_total_usd.toFixed(2)}`)
				.attr("title", `${r.sessions.unverified} older sessions carry $${r.recorded_unverified_usd.toFixed(2)} of unverified numbers (not counted); ${r.sessions.unrecorded} have no recorded cost. This week: account $${r.account_week_usd?.toFixed(2)}, recorded $${r.week.verified_usd.toFixed(2)}.`);
		});
	}

	/** The strip above the grid: every session in flight, newest activity first, drawn by the same AISessionView as the grid below. */
	render_flight(){
		if (!this.$flight) return;
		const live = this.last_rows.filter(AISessionRows.is_in_flight).sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
		this.$flight.empty(() => {
			h3.c("sessions-flight-head", `In flight now · ${live.length}`).attr("title", "Running or ready to run right now. Updates live from the Servex agent stream.");
			if (!live.length) return void small.c("muted", "Nothing is in flight right now.");
			div.c("sessions-grid sessions-flight-grid", () => div.c("sessions-rows", () => live.forEach(r => this.row_view(r, null))));
		});
	}

	row_view(row, nest){
		return new AISessionView({ row, url: this.url, page_dirs: this.page_dirs, spend: this.spend, session_index: this.session_index, nest });
	}

	/** Builds the filter controls the first time real rows arrive (so the role list is never a guess), then redraws the grid. */
	render_controls(){
		const { trigger_of } = AISessionRows;
		if (this.role_filter === null) this.role_filter = new Set(this.last_rows.map(r => r.role || "(unknown)"));
		if (this.trigger_filter === null) this.trigger_filter = new Set(this.last_rows.map(r => trigger_of(r, this.spend) || "(n/a)"));
		const check = (text, key, title) => label.c("flex gap-35 v-center h4", () => {
			const $box = input().attr("type", "checkbox");
			$box.el.checked = !!this[key];
			$box.on("change", () => { this[key] = $box.el.checked; this.render_rows(); });
			span(text);
		}).attr("title", title);
		this.$controls.empty(() => {
			div.c("sessions-filters flex gap-100 v-center wrap", () => {   // one compact row: closed, attention, in flight, tag, dates
				check("show closed", "show_closed", "Sessions you marked done are hidden by default. They are never deleted.");
				check("needs attention", "attention_only", "Only sessions with an alert in their session.jsonl record.");
				check("in flight", "inflight_only", "Only sessions working right now (a transcript that moved in the last 5 minutes, or a Servex agent that is running).");
				const pick = (name, key, values, title, group = false) => values.length && label.c("flex gap-35 v-center h4", () => {
					span(name);
					const sel = document.createElement("select");   // no select() helper in the framework
					const option = t => { const o = document.createElement("option"); o.value = t; o.textContent = t || "any"; return o; };
					sel.append(option(""));
					if (group){   // module tags grouped by their top folder: core, ext, ux, ui, Server, Servex...
						const tops = new Map();
						for (const t of values) (tops.get(t.split("/")[0]) ?? tops.set(t.split("/")[0], []).get(t.split("/")[0])).push(t);
						for (const [top, items] of tops){ const g = document.createElement("optgroup"); g.label = top; for (const t of items) g.append(option(t)); sel.append(g); }
					} else for (const t of values) sel.append(option(t));
					sel.value = this[key] || "";
					sel.addEventListener("change", () => { this[key] = sel.value; this.render_rows(); });
					div().el.append(sel);
				}).attr("title", title);
				const live = [...AISession.all.values()].map(s => s.ix);
				pick("tag", "tag_filter", [...new Set(Object.values(this.session_index?.meta ?? {}).flatMap(m => m.tags))].sort(), "A tag written into a session's session.jsonl.");
				pick("category", "category_filter", [...new Set(live.map(x => x.category).filter(Boolean))].sort(), "The category of the task that launched the session (the task audit).");
				pick("core", "core_filter", [...new Set(live.flatMap(x => x.core ?? []))].sort(), "A framework module the session edited (the task audit): folder/Name, as in the repo.", true);
				this.records_filter ??= new URLSearchParams(location.search).get("records") || "";   // /sessions/?records=has-card (doc/patterns.md links here)
				pick("records", "records_filter", AISessionsPage.RECORDS, "Which other records the session has: an inbox card, a task folder, a brief, a report, a parent or children.");
				div.c("sessions-daterange flex gap-50 v-center", () => {
					small.c("muted", "from");
					const $from = input().attr("type", "date");
					$from.el.value = this.date_from;
					$from.on("change", () => { this.date_from = $from.el.value; this.render_rows(); });
					small.c("muted", "to");
					const $to = input().attr("type", "date");
					$to.el.value = this.date_to;
					$to.on("change", () => { this.date_to = $to.el.value; this.render_rows(); });
				});
			});
			this.$summary = div.c("sessions-summary flex gap-50 v-center");
			div.c("sessions-chiprow", () => {
				this.$by_role = div.c("sessions-chips");
				this.$by_trigger = div.c("sessions-chips");
			});
			this.$cache_breakdown = div.c("sessions-by-role flow");
		});
	}

	/** `base` = every filter except role and trigger (so the chips can show what each choice would add), `filtered` = base plus those two, `sorted` = filtered in order. */
	filter_rows(){
		const { in_date_range, is_in_flight, trigger_of, sort_rows } = AISessionRows;
		const from = Date.parse(this.date_from + "T00:00:00");
		const to = Date.parse(this.date_to + "T23:59:59.999");
		const meta = this.session_index?.meta ?? {};
		const closed = this.session_index?.closed ?? {};   // closed sessions hide unless "show closed" is ticked (never deleted)
		const id_of = r => r.session_id || r.id;
		const base = this.last_rows.filter(r => (this.show_closed || !closed[id_of(r)]) && in_date_range(r, from, to)
			&& (!this.inflight_only || is_in_flight(r))
			&& (!this.attention_only || meta[id_of(r)]?.alerts)
			&& (!this.tag_filter || meta[id_of(r)]?.tags.includes(this.tag_filter))
			&& (!this.category_filter || AISession.all.get(id_of(r))?.ix.category === this.category_filter)
			&& AISessionsPage.has_records(AISession.all.get(id_of(r))?.ix, this.records_filter)
			&& (!this.core_filter || AISession.all.get(id_of(r))?.ix.core?.includes(this.core_filter)));
		const filtered = base.filter(r => this.role_filter.has(r.role || "(unknown)") && this.trigger_filter.has(trigger_of(r, this.spend) || "(n/a)"));
		return { base, filtered, sorted: sort_rows(filtered, this.sort) };
	}

	/** Recomputes the filtered + sorted rows from `this.last_rows` and redraws the grid, summary and chips. Never a new fetch. */
	/** The `records` filter values: has/no card, task, brief, report. */
	static RECORDS = ["has-card", "no-card", "has-task", "no-task", "has-brief", "has-report", "has-parent", "has-children"];
	static has_records(ix, key){
		if (!key || !ix) return true;
		const L = ix.links ?? {}, [want, kind] = key.split("-"), n = { card: L.card ? 1 : 0, task: L.task ? 1 : 0, brief: L.brief ? 1 : 0, report: L.report ? 1 : 0, parent: L.parent ? 1 : 0, children: L.children?.length }[kind] ?? 0;
		return want === "has" ? n > 0 : n === 0;
	}

	render_rows(){
		if (!this.$controls) return;
		if (!this.$summary) this.render_controls();

		const { PAGE_SIZE } = AISessionsPage, id_of = r => r.session_id || r.id;
		const { base, filtered, sorted: sorted_all } = this.filter_rows();
		const { top: sorted, kids_of } = AISessionRows.nest(sorted_all);   // children nest under their parent, collapsed until opened
		this.open_ids ??= new Set();
		const place = (r, depth, seen) => {
			const kids = (kids_of.get(id_of(r)) ?? []).filter(k => !seen.has(id_of(k))), open = this.open_ids.has(id_of(r));
			this.row_view(r, { depth, kids: kids.length, open, toggle: () => { open ? this.open_ids.delete(id_of(r)) : this.open_ids.add(id_of(r)); this.render_rows(); } });
			if (open) for (const k of kids) place(k, depth + 1, new Set([...seen, id_of(r)]));
		};

		// Paging, not windowing: rows are variable-height, so only the first PAGE_SIZE render and "show more" grows it.
		this.shown ??= PAGE_SIZE;
		const visible = sorted.slice(0, this.shown);
		this.$rows.empty(() => {
			if (!sorted.length) return void p.c("muted").style({ gridColumn: "1 / -1" }).text("No sessions with an id yet.");
			visible.forEach(r => place(r, 0, new Set([id_of(r)])));
			if (sorted.length > visible.length){
				div.c("sessions-show-more").style({ gridColumn: "1 / -1" }).append(() => {
					small.c("muted").text(`Showing ${visible.length} of ${sorted.length} — `);
					a.c("sessions-show-more-link").href("#").text(`show ${Math.min(PAGE_SIZE, sorted.length - visible.length)} more`)
						.on("click", e => { e.preventDefault(); this.shown += PAGE_SIZE; this.render_rows(); });
				});
			}
		});

		// Cost comes from the session files (the index), never from a registry that resets on restart.
		this.shown_usd = filtered.reduce((n, r) => n + AISessionRows.claude_usd_of(r), 0);
		this.filtered_count = filtered.length;
		this.render_stats();
		this.render_flight();

		this.$summary?.empty(() => {
			AISessionView.defect_line(this.session_index);
			a.c("sessions-show-more-link").href("#").text(this.show_cache ? "hide cache breakdown" : "cache breakdown")
				.on("click", e => { e.preventDefault(); this.show_cache = !this.show_cache; this.render_rows(); });
		});

		// Chips list every group present in `base`, so a deselected group stays visible and can be clicked back.
		this.render_chips(this.$by_role, AISessionRows.by_role_totals(base), this.role_filter, g => g.role, g => AISessionRows.role_label(g.role));
		if (this.spend && AISessionRows.by_trigger_totals(base, this.spend).length > 1) this.render_chips(this.$by_trigger, AISessionRows.by_trigger_totals(base, this.spend), this.trigger_filter, g => g.trigger, g => ({ label: g.trigger }));
		this.render_cache_breakdown();
	}

	/** One row of clickable chips. Click one to show only that group; click again to show all. */
	render_chips(host, groups, filter, key_of, label_of){
		host?.empty(() => {
			const all_on = groups.every(g => filter.has(key_of(g)));
			groups.forEach(g => {
				const key = key_of(g), on = filter.has(key) && !all_on;
				const { label: text, title } = label_of(g);
				button.c("sessions-chip" + (on ? " sessions-chip-on" : ""), `${text} · $${g.claude_usd.toFixed(2)} · ${g.count}`).attr("title", title || "")
					.on("click", () => {
						if (on) groups.forEach(x => filter.add(key_of(x)));
						else { filter.clear(); filter.add(key); }
						this.render_rows();
					});
			});
		});
	}

	/** The cache $ breakdown (all-time, from Server/spend-tree.mjs): one click down, not on level 1. */
	render_cache_breakdown(){
		this.$cache_breakdown?.empty(() => {
			if (!this.show_cache) return;
			const by_role = (this.spend?.by_role ?? []).filter(g => g.claude_usd);
			const by_trigger = (this.spend?.by_trigger ?? []).filter(g => g.claude_usd);
			const row = g => small.c("muted", `${g.key}: $${g.cache_read_usd.toFixed(2)} cache reads of $${g.claude_usd.toFixed(2)}`
				+ (g.cache_read_pct != null ? ` (${g.cache_read_pct}%)` : "") + ` · ${g.count} agent${g.count === 1 ? "" : "s"}`);
			div.c("muted").text("Cache $ breakdown, all-time — share of each group's $ spent re-reading cached context");
			div.c("sessions-cache-cols", () => { div.c("flow", () => by_role.forEach(g => div(() => row(g)))); div.c("flow", () => by_trigger.forEach(g => div(() => row(g)))); });
		});
	}

	// ---- lifecycle -----------------------------------------------------------------------------------

	/** Recompute the rows from the latest snapshot, agent list and date-path index, then redraw. */
	draw(){
		this.last_rows = AISessionRows.with_date_path_rows(AISessionRows.with_live_rows(AISessionRows.merge(this.snapshot_rows, this.last_agents)), this.page_dirs);
		this.render_rows();
		this.$asof?.text("updated " + new Date().toLocaleTimeString());
	}

	// ⚠ A lifecycle, not a one-shot in content(): content() runs once ever (a cached singleton Page), while
	// activated()/deactivated() fire every time the reader leaves and comes back, which is what starts and stops the stream.
	activated(){
		const { get_json, load_index, load_tree, load_spend_tree } = AISessionRows;
		this.polling = true;
		this.last_agents = [];

		const base = servex_base();
		const fetch_agents = async () => (await get_json(base + "/api/agents")) ?? (await get_json("/api/agents")) ?? [];
		let timer = null;
		const soon = () => { timer ??= setTimeout(() => { timer = null; this.draw(); }, 250); };
		const poll = async () => {
			if (!this.polling) return;
			if (!document.hidden && !this.stream_open){ this.last_agents = await fetch_agents(); this.draw(); }
			if (this.polling) setTimeout(poll, AISessionsPage.POLL_MS);
		};
		this.source?.close();
		try {
			this.source = new EventSource(base + "/api/stream");
			this.source.onopen = () => { this.stream_open = true; };
			this.source.onerror = () => { this.stream_open = false; };
			this.source.addEventListener("agent", msg => {
				let ev; try { ev = JSON.parse(msg.data); } catch { return; }
				if (!ev?.card?.id) return;
				const i = this.last_agents.findIndex(a => a.id === ev.card.id);
				i < 0 ? this.last_agents.push(ev.card) : (this.last_agents[i] = ev.card);
				soon();
			});
		} catch {}
		clearInterval(this.tick); this.tick = setInterval(() => { if (!document.hidden && this.last_rows.length) this.render_flight(); this.follow_live(); }, 30000);   // running times advance

		get_json(this.url + "sessions.json").then(async snap => {
			this.snapshot_rows = snap?.rows ?? [];
			this.last_agents = await fetch_agents();
			if (this.polling){ this.draw(); poll(); }
		});

		// ⚠ Each feed below redraws ONLY if real rows are already on screen: render_controls() builds the role and
		// trigger filters once from real data, so a redraw on an empty list would lock them to an empty Set forever.
		load_tree(this.url).then(tree => { AISessionRows.tree = this.tree = tree; if (this.last_rows.length) this.render_rows(); });
		load_index(this.url).then(index => {
			this.session_index = AISessionRows.ix = index;
			if (this.last_rows.length) this.render_rows();
			this.follow_live();
		});
		load_spend_tree(this.url).then(spend => {
			this.spend = spend;
			if (!this.last_rows.length) return;
			this.trigger_filter = null;   // rebuild it now that the real trigger tags exist
			this.render_controls();
			this.render_rows();
		});
		AISessionDetail.dir_index().then(index => {
			this.page_dirs = index;
			if (this.last_rows.length) this.draw();   // upgrades drawn rows to their date-path links
		});
		get_json(this.url + "../usage.json").then(usage => { this.usage = usage; this.render_stats(); });   // the plan's own meter, kept fresh by Servex
		get_json(this.url + "../sessions/openrouter-reconcile.json").then(r => { this.reconcile = r; this.render_stats(); }).catch(() => {});   // written by Server/openrouter-reconcile.mjs
	}

	/** Load the day files the date filter needs (real files: closed days, plus today's live one), then ask the dev socket to push today's changes. With no dev socket the 30-second tick re-reads today's file. A cost change redraws its own row (AISessionView); a new or active/idle session redraws the grid now, a newer last activity a moment later. */
	async follow_live(){
		const today = AISessionLive.ymd(new Date()).replaceAll("/", "-");
		let timer = null;
		const redraw = ms => { if (this.polling) timer ??= setTimeout(() => { timer = null; this.draw(); }, ms); };
		this.live ??= new AISessionLive((moved, later) => redraw(moved.length ? 100 : 1500));
		if (this.live_day !== today){
			this.live_day = today;
			await this.live.load(await AISessionLive.days(this.url, this.date_from, this.date_to));
			this.draw();
		} else if (!AISessionLive.socket()) await this.live.load([`${this.url}${today.replace(/-/g, "/")}/index.json`]);   // static host: re-read the file
		this.live.follow(today);
	}

	deactivated(){ this.polling = false; this.source?.close(); this.source = null; this.stream_open = false; clearInterval(this.tick); }

	/** `/framework/ai/sessions/<id>/` is one session's page; `doc` and `readme` are this page's own docs. */
	route(id){
		if (id.includes(".")) return;   // a stray asset request, not a session id
		if (id === "doc" || id === "readme") return this.docs_page(id);
		return new AISessionDetail({ home: this, id });
	}

	/** "readme" is the readme, "doc" is the priority list (the rest of the docs link from it). */
	docs_page(id){
		const file = id === "readme" ? "readme.md" : "doc/priorities.md", home = this;
		return new Page({
			width: "fill",
			title: id === "readme" ? "Sessions readme" : "Sessions: priorities",
			url: home.url + id + "/",
			content(){
				a.c("page-link", "← all sessions").href(home.url);
				div.c("flow").append(md.file(sessions_dir, file));
			},
		});
	}
}
