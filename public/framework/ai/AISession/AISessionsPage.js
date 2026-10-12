import { Prompts } from "/framework/ai/v/3/Prompts.js";
import { Page, md, h3, div, a, span, small, p, label, input, button, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { usage_rail } from "/framework/ext/AITask/usage.js";
import { grip } from "/framework/ext/grip/grip.js";
import AISessionRows from "./AISessionRows.js";
import AISessionView from "./AISessionView.js";
import AISessionLive from "./AISessionLive.js";
import AISession from "./AISession.js";
import AISessionDetail from "./AISessionDetail.js";
import AISessionFlags from "./AISessionFlags.js";
import StoreFolder from "./StoreFolder.js";

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
	static TOP_CHIPS = 5;

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
		// Newest month first: the window opens at the 1st of this month (at least 7 days back); "show 30 more days" and the From box load older day files on demand.
		this.date_from = new Date(Math.min(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1), today.getTime() - 6 * 864e5)).toISOString().slice(0, 10);
		this.last_rows = [];        // the latest merged rows, UNFILTERED: filters and sort redraw from this
		this.filtered_count = 0;    // the "sessions shown" count

		this.$stats = div.c("sessions-stats");
		panel.main.append(this.$stats);
		this.render_stats();

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
							write: px => this.resize_col($grid, col, px),
							reset: () => this.unfreeze_cols($grid),   // double-click: back to widths that fit the content
						});
					}
				});
			});
		});
		this.render_sort_labels();
	}

	/** Columns size to their content until the first drag; then every width is frozen at what it measured (so each column answers the drag, not just the capped ones) and `px` goes to the dragged one. */
	resize_col($grid, col, px){
		const el = $grid.el;
		if (!el.classList.contains("sessions-grid-fixed")){
			const widths = getComputedStyle(el).gridTemplateColumns.split(" ").map(parseFloat);
			AISessionRows.COLUMNS.forEach((c, i) => el.style.setProperty("--col-" + c.key, (widths[i] || c.min) + "px"));
			el.classList.add("sessions-grid-fixed");
		}
		const clamped = Math.max(48, Math.round(px));
		cancelAnimationFrame(this.resize_raf);
		this.resize_raf = requestAnimationFrame(() => el.style.setProperty("--col-" + col.key, clamped + "px"));   // once per frame
		return clamped;
	}

	unfreeze_cols($grid){
		$grid.el.classList.remove("sessions-grid-fixed");
		AISessionRows.COLUMNS.forEach(c => $grid.el.style.removeProperty("--col-" + c.key));
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
			small.c("muted sessions-counts", () => {
				span(`${this.filtered_count} sessions shown · $${(this.shown_usd ?? 0).toFixed(2)} Claude cost · ${this.date_from} to ${this.date_to} · `);
				button.c("sessions-older", "show 30 more days").attr("title", "Loads the older day files (one small file per day) on demand.").on("click", () => this.set_from(new Date(Date.parse(this.date_from) - 30 * 864e5).toISOString().slice(0, 10)));
			}).attr("title", "Claude cost is the API-equivalent price of the tokens, summed from the session files. It is not a bill.");
			const r = this.reconcile;
			if (r?.account_total_usd != null) small.c("muted sessions-counts", `OpenRouter (real dollars, apart from the Claude cost above): $${r.recorded_verified_usd.toFixed(2)} recorded ($${(r.recorded_key_diff_usd ?? 0).toFixed(2)} of it key-diff, may overlap) · account says $${r.account_total_usd.toFixed(2)} · ${r.gap_total_usd > 0 ? "unattributed OpenRouter $" + r.gap_total_usd.toFixed(2) + " (billed, no session)" : "unattributed OpenRouter $0.00 (the log is $" + (-r.gap_total_usd).toFixed(2) + " above the account: overlapping key-diff estimates, doc/cost/openrouter-gap.md)"}`)
				.attr("title", `${r.sessions.unverified} older sessions carry $${r.recorded_unverified_usd.toFixed(2)} of unverified numbers (not counted); ${r.sessions.unrecorded} have no recorded cost. This week: account $${r.account_week_usd?.toFixed(2)}, recorded $${r.week.verified_usd.toFixed(2)}.`);
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
			this[key + "_text"] = span(text);
		}).attr("title", title);
		this.$controls.empty(() => {
			div.c("sessions-filters flex gap-100 v-center wrap", () => {   // one compact row: closed, attention, in flight, tag, dates
				check("show closed", "show_closed", "Sessions you marked done are hidden by default. They are never deleted.");
				const red = AISessionFlags.counts(this.last_rows), flagged = red.any;
					check(`needs attention · ${flagged}`, "attention_only", "Sessions with a red flag (expensive, stalled, context bloat, Opus minion) or an alert in their session.jsonl record.");
					
					this.$red_counts = small.c("sessions-redflag-counts").attr("title", "How many sessions carry each red flag right now");
				check("in flight", "inflight_only", "Only sessions working right now (a transcript that moved in the last 5 minutes, or a Servex agent that is running).");
					this.records_filter ??= new URLSearchParams(location.search).get("records") || "";   // /sessions/?records=has-card still works (doc/patterns.md); the tag, category, core and records pickers were cut (2026-10-12)
				div.c("sessions-daterange flex gap-50 v-center", () => {
					small.c("muted", "from");
					const $from = input().attr("type", "date");
					$from.el.value = this.date_from;
					this.$from = $from;
					$from.on("change", () => this.set_from($from.el.value));
					small.c("muted", "to");
					const $to = input().attr("type", "date");
					$to.el.value = this.date_to;
					$to.on("change", () => { this.date_to = $to.el.value; this.render_rows(); });
				});
			});
			this.$summary = div.c("sessions-summary flex gap-50 v-center");
			div.c("sessions-chiprow", () => {
				this.$by_role = div.c("sessions-chips");
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
			&& (!this.attention_only || meta[id_of(r)]?.alerts || AISessionFlags.flags_of(r).length)
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
		const red = AISessionFlags.counts(this.last_rows);   // the "needs attention" label and the per-flag counts follow the live rows
		this.attention_only_text?.text(`needs attention · ${red.any}`);
		this.$red_counts?.text(Object.keys(AISessionFlags.FLAGS).filter(k => red[k]).map(k => `${red[k]} ${AISessionFlags.FLAGS[k].label}`).join(" · "));
		this.shown_usd = filtered.reduce((n, r) => n + AISessionRows.claude_usd_of(r), 0);
		this.filtered_count = filtered.length;
		this.render_stats();

		this.$summary?.empty(() => {
			AISessionView.defect_line(this.session_index);
			a.c("sessions-show-more-link").href("#").text((this.show_cache ? "hide cache breakdown" : "cache breakdown") + " · " + AISessionsPage.age_of(this.spend?.generated_at))
				.on("click", e => { e.preventDefault(); this.show_cache = !this.show_cache; this.render_rows(); });
		});

		// Chips list every group present in `base`, so a deselected group stays visible and can be clicked back.
		this.render_chips(this.$by_role, AISessionRows.by_role_totals(base), this.role_filter, g => g.role, g => AISessionRows.role_label(g.role), "role");
		this.render_cache_breakdown();
	}

	/** One row of clickable chips. Click one to show only that group; click again to show all. */
	render_chips(host, all_groups, filter, key_of, label_of, heading){
		const groups = this.all_roles ? all_groups : all_groups.slice().sort((x, y) => y.claude_usd - x.claude_usd).slice(0, AISessionsPage.TOP_CHIPS);   // the few that matter: the biggest spenders
		host?.empty(() => {
			if (heading) small.c("muted sessions-chip-head", heading);
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
			if (all_groups.length > AISessionsPage.TOP_CHIPS) button.c("sessions-chip", this.all_roles ? "fewer" : `+${all_groups.length - AISessionsPage.TOP_CHIPS} more`).on("click", () => { this.all_roles = !this.all_roles; this.render_rows(); });
		});
	}

	/** "computed 3 h ago" for a timestamp, or "age unknown": how fresh a derived file is. */
	static age_of(iso){
		const t = Date.parse(iso ?? ""); if (!t) return "age unknown";
		const m = Math.round((Date.now() - t) / 6e4);
		return "computed " + (m < 1 ? "just now" : m < 90 ? m + " min ago" : m < 2880 ? Math.round(m / 60) + " h ago" : Math.round(m / 1440) + " days ago");
	}

	/** The cache $ breakdown (all-time, from Server/spend-tree.mjs): one click down, not on level 1. */
	render_cache_breakdown(){
		this.$cache_breakdown?.empty(() => {
			if (!this.show_cache) return;
			const by_role = (this.spend?.by_role ?? []).filter(g => g.claude_usd);
			const by_trigger = (this.spend?.by_trigger ?? []).filter(g => g.claude_usd);
			const row = g => small.c("muted", `${g.key}: $${g.cache_read_usd.toFixed(2)} cache reads of $${g.claude_usd.toFixed(2)}`
				+ (g.cache_read_pct != null ? ` (${g.cache_read_pct}%)` : "") + ` · ${g.count} agent${g.count === 1 ? "" : "s"}`);
			div.c("muted").text("Cache $ breakdown, all-time — share of each group's $ spent re-reading cached context · " + AISessionsPage.age_of(this.spend?.generated_at));
			div.c("sessions-cache-cols", () => { div.c("flow", () => by_role.forEach(g => div(() => row(g)))); div.c("flow", () => by_trigger.forEach(g => div(() => row(g)))); });
		});
	}

	// ---- lifecycle -----------------------------------------------------------------------------------

	/** Recompute the rows from the latest snapshot, agent list and date-path index, then redraw. */
	build_rows(){ this.last_rows = AISessionRows.with_date_path_rows(AISessionRows.with_live_rows(AISessionRows.merge(this.snapshot_rows, this.last_agents)), this.page_dirs); }

	/** A full redraw at most every 3 s however many changes arrive (doc/live/grid-loading.md, lag). */
	draw_later(ms = 0){
		if (this.draw_timer) return;
		this.draw_timer = setTimeout(() => { this.draw_timer = null; this.draw(); }, Math.max(ms, 3000 - (Date.now() - (this.last_draw ?? 0))));
	}

	draw(){
		this.last_draw = Date.now();
		this.build_rows();
		this.render_rows();
		this.$asof?.text("updated " + new Date().toLocaleTimeString());
	}

	// ⚠ A lifecycle, not a one-shot in content(): content() runs once ever (a cached singleton Page), while
	// activated()/deactivated() fire every time the reader leaves and comes back, which is what starts and stops the stream.
	activated(){
		const { get_json, load_index, load_tree, load_spend_tree } = AISessionRows;
		this.polling = true;
		this.last_agents = [];

		const base = Prompts.base();
		const fetch_agents = async () => (await get_json(base + "/api/agents")) ?? (await get_json("/api/agents")) ?? [];
		let timer = null;
		// An agent event redraws the grid at most every 3 s (a draw is ~45 ms).
		const soon = () => { timer ??= setTimeout(() => { timer = null; this.build_rows(); this.draw_later(); }, 250); };
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
		clearInterval(this.tick); let n = 0; this.tick = setInterval(() => { if (!document.hidden && this.last_rows.length){ this.render_stats(); if (++n % 4 === 0) AISessionFlags.load(this.url).then(() => this.draw()); } this.follow_live(); }, 30000);   // the 1.4 MB flags file and a full redraw: every 2 minutes, not every 30 s   // running times advance

		AISessionFlags.load(this.url).then(() => {   // roles and red flags: the roles change, so the role filter is rebuilt from them
			if (!this.last_rows.length) return;
			this.role_filter = null;
			this.build_rows(); this.render_controls(); this.render_rows();
		});
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
		const redraw = ms => { if (this.polling) this.draw_later(ms); };
		this.live ??= new AISessionLive((moved, later) => redraw(moved.length ? 100 : 1500));
		if (this.live_day !== today){
			this.live_day = today;
			await this.live.load(await AISessionLive.days(this.url, this.date_from, this.date_to));
			this.draw();
		} else if (!AISessionLive.socket()) await this.live.load([`${this.url}${today.replace(/-/g, "/")}/index.json`]);   // static host: re-read the file
		this.live.follow(today);
	}

	/** Move the window's start; day files older than what is loaded are fetched now (AISessionLive keeps what it already has). */
	async set_from(from){
		if (!from) return;
		this.date_from = from;
		if (this.$from) this.$from.el.value = from;
		this.render_rows(); this.render_stats();
		if (this.live){ await this.live.load(await AISessionLive.days(this.url, from, this.date_to)); this.draw(); }
	}

	deactivated(){ this.polling = false; this.source?.close(); this.source = null; this.stream_open = false; clearInterval(this.tick); }

	/** `/framework/ai/sessions/<id>/` is one session's page; `doc` and `readme` are this page's own docs. */
	route(id){
		if (id.includes(".")) return;   // a stray asset request, not a session id
		if (id === "doc" || id === "readme") return this.docs_page(id);
		if (/^\d{4}$/.test(id)) return new StoreFolder({ home: this, segs: [id] });   // the store by path: YYYY/MM/DD/<session>/<task>/ (ai/doc/task-folders.md)
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
