import { Prompts } from "/framework/ai/v/3/Prompts.js";
import { Page, md, h3, div, a, span, small, p, label, input, button, View } from "/app.js";
import { nav, icon } from "/framework/core/View/View.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { usage_rail } from "/framework/ai/AITask/usage.js";
import DataGrid from "/framework/ext/DataGrid/DataGrid.js";
import { page_settings } from "/framework/core/Page/settings/settings.js";
import PageNav from "/framework/ai/AIDashboard/PageNav.js";
import AISessionRows from "./AISessionRows.js";
import AISessionView from "./AISessionView.js";
import AISessionBuckets from "./AISessionBuckets.js";
import AISessionLive from "./AISessionLive.js";
import AISession from "./AISession.js";
import AISessionDetail from "./AISessionDetail.js";
import AISessionFlags from "./AISessionFlags.js";
import StoreFolder from "./StoreFolder.js";
AISessionFlags.usd_of = r => AISessionRows.claude_usd_of(r);   // flags_of reads the row's Claude $ from the session index here
import QueryClient from "/framework/ext/Query/QueryClient.js";
import Day from "/framework/core/Session/Day.js";
import PageWork from "/framework/core/Page/ai/PageWork.js";

const sessions_dir = { url: new URL("../sessions/", import.meta.url).href };   // the page's folder: its stylesheet and docs stay beside page.js
View.stylesheet(sessions_dir, "sessions.css");
View.stylesheet("/framework/ai/AITask/ai.css");   // the usage rail's bars

// THE SESSIONS TAB: a grid of every Claude session that has an id (a VS Code tab, a Servex agent, a CLI run).
// `page.js` instantiates it. The data side is AISessionRows, one row is a AISessionView, a clicked row opens a
// AISessionDetail. Docs: readme.md and doc/ beside this file (decisions.md has the history of every choice).
//
// Where the rows come from: Servex's live agent list (first paint from GET /api/agents, then its event stream;
// a 20 s poll is only the fallback), sessions.json (the VS Code/CLI snapshot, written by sessions.mjs), and the
// computed files session-index.json, session-tree.json, spend-tree.json (written by scripts under Server/).
//
// The list is one ext/DataGrid, a table or a rail of cards (its `view` setting; ext/DataGrid/doc/architecture.md).
// `width` follows the view: "fill" for the table, "small" for the rail. A clicked row opens its detail as a full page in place of the list (design/navigation: previews plus detail views).
//
// Page/Item name clashes found while converting this from an object config: none. The members this class adds
// (content, route, activated, deactivated, render_*, toggle_sort, filter_rows, draw, plus data fields such as
// tree, source, sort, spend, usage) were checked against Item.js and Page.class.js. Item's `root()` is the one
// to avoid, so AISessionDetail calls its parent `home`. Detail: doc/classes.md.
export default class AISessionsPage extends Page {

	static POLL_MS = 20000;
	static PAGE_SIZE = 50;   // the first page; the next one loads by itself as the sentinel scrolls into view (ext/DataGrid paging)
	static TOP_CHIPS = 5;
	// Pages that live under this one and are reached only from here (a click is the test: Server/NavCheck.mjs).
	static NAV = [
		PageNav.merge_link(),
		{ href: "/framework/ai/sessions/v/", label: "Variants", title: "Variant takes on these pages, one folder each" },
		{ href: "/framework/ai/sessions/v/mobile/", label: "Phone", title: "These pages for a 400 px phone" },
		{ href: "/framework/ai/sessions/doc/variants/", label: "Table variants", title: "The sessions table, three ways" },
	];

	constructor(...args){
		super({
			title: "",   // the Panel2 header shows "Sessions"
			description: "Every Claude session with an id — a VS Code tab, a Servex agent, or a CLI run — newest activity first.",
			icon: "history_toggle_off",
			width: "fill",
			classes: "sessions-page",
		}, ...args);
	}

	content(){
		const panel = new Panel2({ title: "Sessions" }).ac("wide sessions-frame");   // `wide`: a plain Page's track is the narrow prose column; its header is hidden (sessions.css), the tab names it
		this.$asof = null;

		this.$summary = null;       // a re-render builds the controls again
		this.role_filter = null;    // Set<string> | null (null until the first real data arrives)
		this.trigger_filter = null; // same shape, for the spend tree's trigger tag
		const today = new Date();
		this.date_to = Day.of(today);
		// Newest month first: the window opens at the 1st of this month (at least 7 days back); "show 30 more days" and the From box load older day files on demand.
		this.date_from = Day.of(Math.min(new Date(today.getFullYear(), today.getMonth(), 1).getTime(), new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6).getTime()));
		this.last_rows = [];        // the latest merged rows, UNFILTERED: filters and sort redraw from this
		this.filtered_count = 0;    // the "sessions shown" count

		this.scope = new URLSearchParams(location.search).get("scope") || AISessionsPage.month_of(today);   // month is the default view
		if (/^\d{4}(-\d{2}){0,2}$/.test(this.scope)) [this.date_from, this.date_to] = AISessionsPage.range(this.scope, new URLSearchParams(location.search).has("scope") ? null : this.date_from);
		else this.scope = AISessionsPage.month_of(today);

		this.$scope = div.c("sessions-scope");
		this.render_scope();

		this.$stats = div.c("sessions-stats");
		this.$status = div.c("sessions-status");   // the footer: one line of small things (counts, plan meters, open tasks)
		this.$status.append(() => { this.$asof = small.c("muted sessions-asof", "loading…"); });   // "updated 9:35 PM", once the panel header's
		this.$status.append(this.$stats, this.$asof, span.c("sessions-status-open").append(PageWork.line(this.url)));
		this.render_stats();

		this.$controls = div.c("sessions-controls");

		this.grid = this.make_grid();
		this.$empty = p.c("muted", "No sessions with an id yet.");
		this.$empty.el.hidden = true;
		panel.main.append(div.c("sessions-body").append(this.nav_view(), div.c("sessions-main").append(new PageNav({ links: AISessionsPage.NAV }), this.$scope, this.$controls, this.grid, this.$empty, this.$status)));
		this.arrange_for(this.grid.view);
		this.grid.watch(g => this.arrange_for(g.view));
		const grid = this.grid;
		page_settings(this.url).then(s => { if (s.view) grid.default_view(s.view); });   // the default in settings.jsonl, unless the url or your last toggle chose
		this.snapshot_rows = [];
	}

	// ---- scope: year / month / day, a breadcrumb that is also the URL (?scope=2026-10) ------------------

	static pad = n => String(n).padStart(2, "0");
	static month_of(d){ return Day.of(d).slice(0, 7); }

	/** [from, to] day strings for "2026", "2026-10" or "2026-10-13". `floor`: the default month keeps its 7-day minimum window. */
	static range(scope, floor){
		const [y, m, d] = scope.split("-").map(Number), pad = AISessionsPage.pad;
		if (d) return [scope, scope];
		if (m) return [floor && floor < `${y}-${pad(m)}-01` ? floor : `${y}-${pad(m)}-01`, `${y}-${pad(m)}-${pad(new Date(y, m, 0).getDate())}`];
		return [`${y}-01-01`, `${y}-12-31`];
	}

	static MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

	/** One clickable trail: All sessions / 2026 / October / 13, the last part current; the arrows step the level (newer/older). */
	render_scope(){
		const parts = this.scope.split("-"), pad = AISessionsPage.pad;
		const step = dir => {
			const [y, m, d] = parts.map(Number);
			if (d) return AISessionsPage.ymd(new Date(y, m - 1, d + dir)).replaceAll("/", "-");
			if (m) return AISessionsPage.month_of(new Date(y, m - 1 + dir, 1));
			return String(y + dir);
		};
		this.$scope?.empty(() => {
			div.c("ui-crumbs flex wrap v-center gap-35", () => {
				parts.forEach((part, i) => {
					const path = parts.slice(0, i + 1).join("-"), text = i === 1 ? AISessionsPage.MONTHS[+part - 1] : i === 2 ? String(+part) : part;
					if (i) span.c("muted", "/");
					const crumb = a.c("page-link sessions-crumb" + (i === parts.length - 1 ? " sessions-crumb-on" : ""), text).href(this.url + "?scope=" + path).attr("title", "Only sessions active in " + path);
					crumb.click(e => { e.preventDefault(); this.set_scope(path); });
				});
				for (const [dir, text, tip] of [[-1, "‹", "the one before"], [1, "›", "the next one"]]){
					const to = step(dir);
					button.c("sessions-crumb-step", text).attr("title", tip + " (" + to + ")").attr("aria-label", tip).on("click", () => this.set_scope(to));
				}
				if (parts.length < 3 && !this.scope.startsWith(AISessionsPage.ymd(new Date()).slice(0, parts.length === 1 ? 4 : 7).replaceAll("/", "-"))) return;
				if (parts.length < 3) button.c("sessions-crumb-step sessions-crumb-day", "today").attr("title", "Only today").on("click", () => this.set_scope(AISessionsPage.ymd(new Date()).replaceAll("/", "-")));
			});
		});
	}

	static ymd(d){ return Day.path(d); }

	/** Scope the list to a year, month or day: the dates move, the URL follows (`?scope=`), and the query asks again. */
	set_scope(scope){
		this.scope = scope;
		[this.date_from, this.date_to] = AISessionsPage.range(scope);
		const url = new URL(location.href); url.searchParams.set("scope", scope);
		history.replaceState(history.state, "", url);
		this.render_scope();
		if (this.$from) this.$from.el.value = this.date_from;
		if (this.$to) this.$to.el.value = this.date_to;
		this.set_from(this.date_from);
	}

	/** The left rail: this page's own sub-views, each a route (the grid, its docs, the other dashboard versions). */
	nav_view(){
		const items = [["Sessions", this.url, "list", "the grid"], ["Docs", this.url + "doc/", "flag", "The docs index for this tab"], ["Readme", this.url + "readme/", "menu_book", "What this tab is, and the docs it links to"],
			["Dashboard v2", "/framework/ai/v/2/", "dashboard", "The older dashboard"], ["All versions", "/framework/ai/v/", "history", "Every dashboard version"]];
		return nav.c("sessions-nav", () => items.forEach(([text, href, glyph, tip], i) =>
			a.c("sessions-nav-item" + (i === 0 ? " sessions-nav-on" : ""), () => { icon(glyph); span(text); }).href(href).attr("title", tip)));
	}

	// ---- drawing -------------------------------------------------------------------------------------

	static WIDTHS = { state: "4rem", name: "1fr", cost: "14rem", updated: "6rem", duration: "6rem", role: "13rem", source: "6rem", model: "9rem" };

	/** The one DataGrid: the table's columns are AISessionRows.COLUMNS; the rows, their order and their nesting are this page's hooks. */
	make_grid(){
		return new DataGrid({
			columns: AISessionRows.COLUMNS.map(c => ({ ...c, width: AISessionsPage.WIDTHS[c.key] })),
			rows: [], filters: false, row_height: null, page_size: AISessionsPage.PAGE_SIZE,
			prefs_id: "sessions", settings: this.settings,
			href: r => this.url + r.id + "/",
			row: r => this.row_view(r, this.nests.get(r)),
			card: r => new AISessionView({ row: r, url: this.url, spend: this.spend, session_index: this.session_index, card: true }),
			sort_rows: (rows, sort) => this.remote ? this.remote_sort(rows, sort) : this.arrange(rows, sort),
			has_more: () => !!this.remote && this.remote.rows.length < this.remote.total,   // the server holds the rest: the drawer's sentinel asks for it
			load_more: () => this.remote_ask({ more: true }),
			natural_dir: key => AISessionRows.natural_dir(key),
		});
	}

	/** The page's width follows the grid's view: the table fills the row, the rail is a narrow list with the detail beside it. */
	arrange_for(view){
		const width = view === "rail" ? "small" : "fill";
		if (this.width === width) return;
		this.width = width;
		this.reshape();
	}

	/** The grid's sort hook: routine sessions stay out until their chip is on (a search shows every match), then the
	 * default or header order, then children nested under their parent (collapsed until opened, open while searching),
	 * flattened for the grid. Doc: ai/sessions/doc/buckets.md */
	arrange(rows, sort){
		const id_of = r => r.session_id || r.id;
		// Only a day-snapshot record carries `agent` and `folder`, which the kind rules read; any other row is never hidden.
		this.buckets ??= new AISessionBuckets([], { of: r => { const ix = AISession.all.get(id_of(r))?.ix; return ix && "folder" in ix ? ix : null; }, key: id_of });
		this.open_kinds ??= new Set();
		this.open_ids ??= new Set();
		const { out, nests, kinds, listed } = AISessionBuckets.arrange(rows, { buckets: this.buckets, sort: rs => AISessionRows.sort_rows(rs, sort), open_kinds: this.open_kinds, open_ids: this.open_ids, all: !!this.search, parent_of: r => AISessionRows.tree?.[id_of(r)]?.parent, id_of });
		for (const [r, n] of nests) if (n.kids || n.open) n.toggle = () => { n.open ? this.open_ids.delete(id_of(r)) : this.open_ids.add(id_of(r)); this.grid.apply(false); };
		Object.assign(this, { nests, kinds, listed });
		return out;
	}

	static KIND_LABELS = { "prompt-cleaning": "prompt cleaning", "short-run": "short headless", clarity: "clarity check", reviewer: "review", helper: "helper" };

	/** One chip per routine kind, with its count and cost: on = its sessions are in the list. Totals: AISessionBuckets (in node, in remote mode). */
	render_kinds(){
		const kinds = this.kinds ?? [], searching = this.remote ? !!this.remote.search : !!this.search;
		this.$kinds?.empty(() => {
			if (!kinds.length) return;
			small.c("muted sessions-chip-head", searching ? "routine (all shown while searching):" : "routine:")
				.attr("title", "Routine sessions (prompt cleaning, short headless runs, clarity checks, reviews, helpers) stay out of the list until you press their chip. A search always finds them.");
			for (const b of kinds){
				const on = this.open_kinds.has(b.key);
				button.c("sessions-chip" + (on ? " sessions-chip-on" : ""), `${AISessionsPage.KIND_LABELS[b.key] ?? b.key} · ${b.n.toLocaleString()} · ${AISessionView.usd(b.usd)}`)
					.attr("aria-pressed", String(on)).attr("title", on ? "In the list now; click to hide them" : "Hidden; click to show them in the list")
					.on("click", () => { on ? this.open_kinds.delete(b.key) : this.open_kinds.add(b.key); if (this.remote) this.remote_ask(); else { this.grid.apply(false); this.render_kinds(); this.render_stats(); } });
			}
		});
	}

	/** Everything a search matches: the name shown, the registered agent, the id, role, model, folder and the session's tags (`page/live-cards`, `task/…`). */
	static haystack(r){
		const ix = AISession.all.get(r.session_id || r.id)?.ix ?? {};
		return [AISessionRows.display_name(r, AISessionRows.tree).text, r.title, r.agent, r.session_id, r.id, r.role, r.model, ix.agent, ix.title, ix.folder, ...(ix.tags ?? [])].filter(Boolean).join(" ").toLowerCase();
	}

	/** The plan's meters as progress bars with the pace marker (ai/AITask/usage.js), then one line of counts. */
	render_stats(){
		if (!this.$stats) return;
		this.$stats.empty(() => {
			if (this.usage) usage_rail(this.usage);
			div.c("sessions-stats-text", () => this.render_counts());
		});
	}

	/** The muted stats lines under the title: what is listed, its cost, the date window; then OpenRouter's real dollars. */
	render_counts(){
		small.c("muted sessions-counts", () => {
			span(`${(this.listed ?? this.filtered_count).toLocaleString()} sessions listed${this.listed != null && this.filtered_count > this.listed ? ` (${(this.filtered_count - this.listed).toLocaleString()} routine hidden)` : ""} · $${(this.shown_usd ?? 0).toFixed(2)} Claude cost · ${this.date_from} to ${this.date_to} · `);
			button.c("sessions-older", "show 30 more days").attr("title", "Loads the older day files (one small file per day) on demand.").on("click", () => { const [y, m, d] = this.date_from.split("-").map(Number); this.set_from(Day.of(new Date(y, m - 1, d - 30))); }); // local midnight, never Date.parse (UTC)
		}).attr("title", "Claude cost is the API-equivalent price of the tokens, summed from the session files. It is not a bill.");
		const r = this.reconcile;
		if (r?.account_total_usd != null) small.c("muted sessions-counts", `OpenRouter (real dollars): $${r.recorded_verified_usd.toFixed(2)} recorded · account says $${r.account_total_usd.toFixed(2)}`)
			.attr("title", `Apart from the Claude cost above. $${(r.recorded_key_diff_usd ?? 0).toFixed(2)} of the recorded is key-diff and may overlap; ${r.gap_total_usd > 0 ? "unattributed $" + r.gap_total_usd.toFixed(2) + " (billed, no session)" : "the log is $" + (-r.gap_total_usd).toFixed(2) + " above the account (overlapping key-diff estimates, doc/cost/openrouter-gap.md)"}. ${r.sessions.unverified} older sessions carry $${r.recorded_unverified_usd.toFixed(2)} of unverified numbers (not counted); ${r.sessions.unrecorded} have no recorded cost. This week: account $${r.account_week_usd?.toFixed(2)}, recorded $${r.week.verified_usd.toFixed(2)}.`);
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
			div.c("sessions-filters flex gap-100 v-center wrap", () => {   // one compact row: search, closed, attention, in flight, dates
				const $q = input.c("sessions-search").attr("type", "search").attr("placeholder", "search name, agent, id, role, model, tag")
					.attr("title", "Searches every loaded session, routine and closed ones too, whatever the other filters say. Older days: \"show 30 more days\".");
				$q.el.value = this.search ?? "";
				let wait;
				$q.on("input", () => { clearTimeout(wait); wait = setTimeout(() => { this.search = $q.el.value.trim().toLowerCase(); this.render_rows(); }, 150); });
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
			this.$kinds = div.c("sessions-kinds");
			div.c("sessions-chiprow", () => {
				this.$by_role = div.c("sessions-chips");
			});
			this.$cache_breakdown = div.c("sessions-by-role flow");
		});
	}

	/** `base` = every filter except role and trigger (so the chips can show what each choice would add), `filtered` = base plus those two (the grid sorts and nests them). */
	filter_rows(){
		const { in_date_range, is_in_flight, trigger_of } = AISessionRows;
		const from = Date.parse(this.date_from + "T00:00:00");
		const to = Date.parse(this.date_to + "T23:59:59.999");
		const meta = this.session_index?.meta ?? {};
		const closed = this.session_index?.closed ?? {};   // closed sessions hide unless "show closed" is ticked (never deleted)
		const id_of = r => r.session_id || r.id;
		if (this.search){ const hits = this.last_rows.filter(r => AISessionsPage.haystack(r).includes(this.search)); return { base: hits, filtered: hits }; }   // a search finds every session
		const base = this.last_rows.filter(r => (this.show_closed || !closed[id_of(r)]) && in_date_range(r, from, to)
			&& (!this.inflight_only || is_in_flight(r))
			&& (!this.attention_only || meta[id_of(r)]?.alerts || AISessionFlags.flags_of(r).length)
			&& (!this.tag_filter || meta[id_of(r)]?.tags.includes(this.tag_filter))
			&& (!this.category_filter || AISession.all.get(id_of(r))?.ix.category === this.category_filter)
			&& AISessionsPage.has_records(AISession.all.get(id_of(r))?.ix, this.records_filter)
			&& (!this.core_filter || AISession.all.get(id_of(r))?.ix.core?.includes(this.core_filter)));
		const filtered = base.filter(r => this.role_filter.has(r.role || "(unknown)") && this.trigger_filter.has(trigger_of(r, this.spend) || "(n/a)"));
		return { base, filtered };
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

		const { base, filtered } = this.filter_rows();
		this.grid.set_rows(filtered);   // the grid sorts, nests and pages them; scroll and sort survive
		this.$empty.el.hidden = filtered.length > 0;

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
		this.render_kinds();
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
		this.polling = true;
		this.start_remote().then(ok => { if (!ok && this.polling) this.activate_files(); });
	}

	/** The files path: every day file, the session index, the tree, the flags and Servex's agent list, loaded and merged in the browser. */
	activate_files(){
		const { get_json, load_index, load_tree, load_spend_tree } = AISessionRows;
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
		if (this.remote) return void this.remote_ask();
		this.render_rows(); this.render_stats();
		if (this.live){ await this.live.load(await AISessionLive.days(this.url, from, this.date_to)); this.draw(); }
	}

	// ---- remote mode: node holds the sessions, the browser asks for the rows it shows (ext/Query, doc/server-query.md) --------------

	static SORT_FIELD = { state: "state", name: "title", cost: "usd", updated: "last_activity", duration: "wall_ms", role: "agent", source: "provider", model: "model" };
	static SEARCH_FIELDS = ["title", "agent", "id", "folder", "model", "role", "tags"];

	/** True when the dev socket answers the first query (the default); `?source=files`, no socket or no source on this server: false, and the page reads files. */
	async start_remote(){
		if (new URLSearchParams(location.search).get("source") === "files" || !AISessionLive.socket()) return false;   // the default on the dev socket; `?source=files` forces the files path (ext/Query/doc/architecture.md)
		this.remote = { rows: [], total: 0, totals: {}, ms: null, sort_key: "", search: "", busy: false };
		this.client = new QueryClient("sessions", { row: snap => this.remote_row(snap), stale: () => this.polling && this.remote_ask({ refresh: true }) });
		this.nests = new Map();
		const ok = await this.remote_ask({ first: true });
		if (!ok) { this.remote = null; this.client = null; return false; }
		this.remote_controls();
		const get_json = AISessionRows.get_json;
		get_json(this.url + "../usage.json").then(usage => { this.usage = usage; this.render_stats(); });
		get_json(this.url + "../sessions/openrouter-reconcile.json").then(r => { this.reconcile = r; this.render_stats(); }).catch(() => {});
		return true;
	}

	/** The spec for the current filters and sort. */
	remote_spec(){
		const r = this.remote, where = r.search ? [] : [   // a search finds every session, whatever the other filters say
			{ field: "last_activity", op: "gte", value: new Date(this.date_from + "T00:00:00").toISOString() }, // local midnight, as the files path reads the dates
			{ field: "last_activity", op: "lte", value: new Date(this.date_to + "T23:59:59.999").toISOString() },
		];
		if (r.search) where.push({ fields: AISessionsPage.SEARCH_FIELDS, op: "contains", value: r.search });
		else if (this.inflight_only) where.push({ field: "state", op: "eq", value: "active" });
		if (!r.search && !this.show_closed) where.push({ field: "closed", op: "eq", value: false });   // closed sessions hide unless ticked (never deleted)
		if (!r.search && this.attention_only) where.push({ field: "attention", op: "gte", value: 1 });
		const [key, dir] = r.sort_key ? r.sort_key.split(":") : ["updated", "desc"];
		this.open_kinds ??= new Set(); this.open_ids ??= new Set();
		return { where, open: { kinds: [...this.open_kinds], ids: [...this.open_ids], all: !!r.search }, sort: { by: AISessionsPage.SORT_FIELD[key], dir }, sum: ["claude_usd", "tokens", "attention"] };
	}

	/** Ask for a page. `first`/default = a fresh query; `more` = the next 50; `refresh` = the same query again, keeping the rows already loaded. */
	async remote_ask({ first, more, refresh } = {}){
		const r = this.remote;
		if (!r) return false;
		if (r.busy && !first){ if (!more) r.pending = true; return true; }   // a new filter waits for the page in flight, then asks
		r.busy = true;
		try {
			const spec = { ...this.remote_spec(), offset: more ? r.rows.length : 0, limit: refresh ? Math.max(AISessionsPage.PAGE_SIZE, r.rows.length) : AISessionsPage.PAGE_SIZE };
			const res = await this.client.ask(spec, { more: more || refresh, timeout: first ? 60000 : undefined });   // the first ask on a cold server waits for the index to load
			if (res.error) return false;
			const rows = res.rows.map(snap => this.remote_row_of(snap));
			Object.assign(r, { rows: more ? [...r.rows, ...rows] : rows, total: res.total, totals: res.totals, ms: res.ms });
			this.filtered_count = res.matched ?? res.total; this.shown_usd = res.totals.claude_usd ?? 0;
			this.kinds = res.meta?.kinds ?? []; this.listed = res.meta?.listed ?? null;
			this.render_kinds();
			this.attention_only_text?.text(`needs attention · ${res.totals.attention ?? 0}`);
			this.nests = new Map(r.rows.map(x => [x, { ...x.nest, toggle: () => { x.nest.open ? this.open_ids.delete(x.id) : this.open_ids.add(x.id); this.remote_ask(); } }]));
			this.grid.set_rows(r.rows, first);
			this.$empty.el.hidden = r.rows.length > 0;
			this.render_stats();
			this.$asof?.text(`${res.ms} ms in node · updated ${new Date().toLocaleTimeString()}`);
			return true;
		} finally { r.busy = false; if (r.pending){ r.pending = false; this.remote_ask(); } }
	}

	/** One snapshot becomes the row AISessionView draws: the live Session holds its numbers, the row holds the identity. */
	remote_row_of(snap){
		const { ses } = AISession.apply_delta(snap), row = { ...ses.grid_row(), source: snap.source ?? "vscode", role: snap.role ?? null };
		row.role = AISessionRows.role_of(row);
		row.nest = snap.nest;
		return row;
	}

	/** A shown session changed: its Session notifies its own row view (AISessionView subscribes); the row object follows. */
	remote_row(snap){
		const { ses } = AISession.apply_delta(snap), row = this.remote?.rows.find(x => x.id === snap.id);
		if (row) AISessionRows.apply_live(row, ses);
	}

	/** The grid's sort hook in remote mode: the server sorted the rows; a header click asks it again. */
	remote_sort(rows, sort){
		const key = sort ? sort.key + ":" + sort.dir : "";
		if (key !== this.remote.sort_key){ this.remote.sort_key = key; queueMicrotask(() => this.remote_ask()); }
		return rows;
	}

	/** The remote controls: the same checkboxes and dates as the files path, plus a search box (the server's `contains`). */
	remote_controls(){
		const check = (text, key, title) => label.c("flex gap-35 v-center h4", () => {
			const $box = input().attr("type", "checkbox");
			$box.el.checked = !!this[key];
			$box.on("change", () => { this[key] = $box.el.checked; this.remote_ask(); });
			this[key + "_text"] = span(text);
		}).attr("title", title);
		this.$controls.empty(() => { div.c("sessions-filters flex gap-100 v-center wrap", () => {
			const $q = input.c("sessions-search").attr("type", "search").attr("placeholder", "search name, agent, id, role, model, tag")
				.attr("title", "Searches every session in node (ext/Query `contains`), routine and closed ones too, whatever the other filters say.");
			let t = null;
			$q.on("input", () => { clearTimeout(t); t = setTimeout(() => { this.remote.search = $q.el.value.trim(); this.remote_ask(); }, 250); });
			check("show closed", "show_closed", "Sessions you marked done are hidden by default. They are never deleted.");
			check("needs attention", "attention_only", "Sessions with a red flag (expensive, stalled, context bloat, Opus minion) or an alert in their session.jsonl record.");
			check("in flight", "inflight_only", "Only sessions working right now.");
			div.c("sessions-daterange flex gap-50 v-center", () => {
				small.c("muted", "from");
				const $from = input().attr("type", "date"); $from.el.value = this.date_from; this.$from = $from;
				$from.on("change", () => this.set_from($from.el.value));
				small.c("muted", "to");
				const $to = input().attr("type", "date"); this.$to = $to; $to.el.value = this.date_to;
				$to.on("change", () => { this.date_to = $to.el.value; this.remote_ask(); });
			});
		}); this.$kinds = div.c("sessions-kinds"); });
		this.render_kinds();
	}

	deactivated(){ this.polling = false; this.source?.close(); this.source = null; this.stream_open = false; clearInterval(this.tick); }

	/** Waits for the session rows before a detail page is built, so its title is the name on the first paint (route() cannot wait). */
	async child(name, levels){
		if (name && !name.includes(".") && !/^\d{4}$/.test(name) && name !== "doc" && name !== "readme") await AISessionDetail.preload(this.url, name);
		return super.child(name, levels);
	}

	/** `/framework/ai/sessions/<id>/` is one session's page; `doc` and `readme` are this page's own docs. */
	route(id){
		if (id.includes(".")) return;   // a stray asset request, not a session id
		if (id === "doc" || id === "readme") return this.docs_page(id);
		if (id === "v") return;   // variants: sessions/v/page.js (e.g. v/mobile/), a folder and not a session id
		if (/^\d{4}$/.test(id)) return new StoreFolder({ home: this, segs: [id] });   // the store by path: YYYY/MM/DD/<session>/<task>/ (ai/doc/task-folders.md)
		return new AISessionDetail({ home: this, id });
	}

	/** "readme" is the readme, "doc" is the docs index (doc/readme.md). */
	docs_page(id){
		const file = id === "readme" ? "readme.md" : "doc/readme.md", home = this;   // the docs index (priorities.md was archived to doc/archive/ in the 10-12 consolidation)
		return new Page({
			width: "fill",
			title: id === "readme" ? "Sessions readme" : "Sessions docs",
			url: home.url + id + "/",
			content(){
				a.c("page-link", "← all sessions").href(home.url);
				div.c("flow").append(md.file(sessions_dir, file));
			},
		});
	}
}
