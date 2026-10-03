import { Page, div, a, span, small, p, label, input, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { grip } from "/framework/ext/grip/grip.js";

View.stylesheet(import.meta, "sessions.css");

/* THE SESSIONS TAB — a data grid of EVERY Claude session that has an id: a
 * VS Code tab, a Servex agent, or a standalone CLI run. The owner's own words
 * (requirements.md, 2026-10-02, sessions-grid-v2): "the start time, the
 * source tag, the agent or tab name, the model, the state and the cost."
 *
 * 2026-10-02 (session-costs minion-build) ADDED on top of that shipped grid,
 * same brief's "owner addition" (requirements.md item 7): a Role column, a
 * Cost column that sorts, a RAM column, real per-model Claude $ next to real
 * OpenRouter $, a role + date filter, a summary row and a "cost by role"
 * list — all computed from the SAME rows this grid already polls (CLAUDE.md
 * law 7: no new endpoint, no second data source).
 *
 * WHERE THE DATA COMES FROM (the full record: sessions.mjs's own header comment,
 * and doc/decisions.md beside this file):
 *   - Servex rows are LIVE — this page polls Servex's own `GET /api/agents`
 *     directly, every 20s, stopped while the tab is hidden (the same shape
 *     `ai2/needs.js`'s `watch_needs()` already uses).
 *   - VS Code/CLI rows come from `sessions.json`, a snapshot written by
 *     `sessions.mjs` (a one-shot node script — see that file for why a script
 *     and not a live route: no `GET /api/sessions` route exists yet, and this
 *     task cannot add one under `Server/`). Re-run it to refresh those rows:
 *     `node public/framework/ai/2026-10-02/panel2-sessions/sessions.mjs`.
 *   - This week's $ line, the summary row and the Claude-$ half of the Cost
 *     column all read `cost` data a SEPARATE script wrote: `Server/session-cost.mjs`
 *     (per-session, appended to that session's own `page.jsonl` by the Stop
 *     hook) and `Server/week-cost.mjs` (`week.json`, a run-by-hand snapshot —
 *     neither is live; re-run them to refresh). See doc/decisions.md.
 *
 * Click a row → its own url (`route()`, below), showing its prompts in order.
 * `this.columns()` (core/Page, doc/columns.md) turns that into a real
 * MASTER-DETAIL: on a wide screen the detail opens as a column beside the
 * grid — a side peek, Notion-style — and on a narrow one `core`'s own < 32em
 * phone regime already folds it to one screen at a time. Reused, not built
 * twice (CLAUDE.md law 6) — the alternative was a bespoke drawer on
 * `Panel2.Side`, which is navigation chrome (it slides OVER the page), not a
 * second reading pane beside it; `columns()` is the system built for exactly
 * this shape and three other pages on the site already use it this way
 * (`core/Page/overview/columns/uses/inbox/`).
 *
 * ⚠ THE PROMPT-LOADING SEAM: `/framework/ai/2026-10-02/sessions-grid-v2`'s own
 * requirements.md records a note from `task-mastermind-prompt-refine` — this
 * route is meant to end up a FILTER over `.claude/prompts/<date>.jsonl`'s
 * `refined` lines, not today's `transcripts/<id>.json` snapshot. That data
 * isn't landed yet, so `load_transcript()` below is the one function that
 * reads it today — swapping the source later is a one-function change.
 */

// Exported too: the Dashboard tab's own Sessions tile (dashboard/page.js) shows
// the same rows the same way — one row renderer, reused, not a second copy
// (CLAUDE.law 6).
export const SOURCE = {
	servex: { label: "Servex", icon: "hub" },
	vscode: { label: "VS Code", icon: "laptop_windows" },
	cli: { label: "CLI", icon: "terminal" },
};

const POLL_MS = 20000;

// A row's own `state` word that counts as "in flight" — the state cell shows a
// blinking ▶ for these, a plain quiet dot for anything else (idle, dormant,
// stopped, gone, or no state at all).
const WORKING_STATES = new Set(["working", "active"]);

// One row per column, one token, one minimum — `write()` below never touches
// any token but its own (the owner's own ask: "resizing a column changes the
// one token"). `min` mirrors sessions.css's own `minmax()` floor for the same
// column; the grid enforces it either way, this just keeps the drag's own
// pill from visually overshooting it.
export const COLUMNS = [
	{ key: "time",   label: "Start",  min: 112 },
	{ key: "source", label: "Source", min: 88 },
	{ key: "role",   label: "Role",   min: 110 },
	{ key: "name",   label: "Name",   min: 160 },
	{ key: "model",  label: "Model",  min: 88 },
	{ key: "state",  label: "State",  min: 80 },
	{ key: "ram",    label: "RAM",    min: 64 },
	{ key: "cost",   label: "Cost",   min: 64 },
];

// The Cost header is also a sort toggle: default (newest-activity-first) →
// highest cost first → lowest cost first → back to default. `page` carries
// the state (`page.cost_sort`) and the arrow label (`page.$cost_label`).
function header_row($grid, page){
	div.c("sessions-head", () => {
		COLUMNS.forEach((col, i) => {
			div.c("sessions-cell sessions-head-cell", () => {
				if (col.key === "cost"){
					page.$cost_label = span.c("sessions-sort-label").click(() => page.toggle_cost_sort());
					page.render_cost_label();
				} else {
					span(col.label);
				}
				// The last column has nothing to its right to resize into —
				// no grip on it, same as the Page columns system leaves the
				// rightmost column's own outer edge alone.
				if (i < COLUMNS.length - 1){
					grip({
						from: "start",   // this cell's OWN left edge is the column's start
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
}

export async function get_json(url){
	try {
		const r = await fetch(url, { cache: "no-store" });
		return r.ok ? await r.json() : null;
	} catch { return null; }
}

// Read a `.jsonl` file as a plain array of parsed lines — `get_json()` above
// expects one JSON VALUE per file; a `.jsonl` log is one JSON OBJECT per line.
export async function get_jsonl(url){
	try {
		const r = await fetch(url, { cache: "no-store" });
		if (!r.ok) return null;
		const text = await r.text();
		return text.split(/\r?\n/).filter(l => l.trim())
			.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	} catch { return null; }
}

// A row's best-effort ROLE. A Servex row already carries a real one straight
// from the agent registry (`a.role`, same field `Server/task-cost.mjs` already
// reads as `row(id).role`) — never guessed. A VS Code/CLI row has no role field
// at all in the data this page reads, so this is a heuristic, not a fact:
//   - an id/tab starting "echo-" → "echo/refiner" (the one naming convention
//     this page can actually see).
//   - otherwise, the existing source tag is the fallback, not a stronger guess
//     ("vscode mastermind" for a VS Code row, "cli" for a standalone CLI run).
// A REAL role needs the session's own line 1 to record it going forward — that
// is outside this task's fence; see doc/decisions.md.
export function role_of(r){
	if (r.source === "servex") return r.role || null;
	if (/^echo-/.test(r.id || "")) return "echo/refiner";
	if (r.source === "vscode") return "vscode mastermind";
	if (r.source === "cli") return "cli";
	return null;
}

// The "amount sorted by" and "amount totalled" for a row's cost: the real
// split (Claude $ + OpenRouter $) when either is known, else the one older
// `r.cost` figure every currently-live row still carries. Returns `null`,
// never 0, when nothing is known — "missing sorts last" needs to tell a real
// zero apart from "no data yet".
export function cost_value(r){
	const claude = typeof r.cost_claude_usd === "number" ? r.cost_claude_usd : null;
	const or = typeof r.cost_openrouter_usd === "number" ? r.cost_openrouter_usd : null;
	if (claude !== null || or !== null) return (claude ?? 0) + (or ?? 0);
	return typeof r.cost === "number" ? r.cost : null;
}

// The snapshot's VS Code/CLI rows, plus Servex's own live list laid on top —
// a Servex row always wins its own session_id, since it is the live truth.
export function merge(snapshot_rows, agents){
	const by_id = new Map(snapshot_rows.map(r => [r.session_id, r]));
	agents.forEach(a => {
		if (!a.session_id) return;   // the dispatcher and a few internal roles have none — nothing to show
		const had = by_id.get(a.session_id);
		by_id.set(a.session_id, {
			id: a.id, source: "servex", session_id: a.session_id, tab_title: a.id,
			model: a.model, state: a.state, role: a.role ?? had?.role ?? null,
			cost: typeof a.cost === "number" ? a.cost : (typeof had?.cost === "number" ? had.cost : null),
			// New, optional — nothing fills these in today (neither GET /api/agents nor
			// sessions.json carries them yet); they default to null so every currently-live
			// row keeps rendering its one `cost` figure unchanged (see row_view() below).
			cost_claude_usd: typeof a.cost_claude_usd === "number" ? a.cost_claude_usd : (had?.cost_claude_usd ?? null),
			cost_openrouter_usd: typeof a.cost_openrouter_usd === "number" ? a.cost_openrouter_usd : (had?.cost_openrouter_usd ?? null),
			// New, optional — blank until Servex's own agent card carries a live sample
			// (doc/decisions.md: open dependency, never a fabricated number).
			ram_mb: typeof a.ram_mb === "number" ? a.ram_mb : (had?.ram_mb ?? null),
			ram_sample_age_ms: typeof a.ram_sample_age_ms === "number" ? a.ram_sample_age_ms : (had?.ram_sample_age_ms ?? null),
			last_activity: a.started_at ?? had?.last_activity ?? null,
			// The live route carries no transcript (sessions.mjs's own note) — a
			// snapshot row for this SAME id would be a coincidence, not real data.
			last_prompt_first_line: null,
		});
	});
	return [...by_id.values()]
		.map(r => ({
			role: role_of(r), cost_claude_usd: null, cost_openrouter_usd: null, ram_mb: null, ram_sample_age_ms: null,
			...r, // a real value already on the row (set above for a Servex row) always wins these defaults
		}))
		.sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
}

// Missing/null sorts LAST regardless of direction — a session nobody has
// priced yet shouldn't look like the cheapest one. `null` (the default) does
// nothing: the rows already arrive newest-activity-first from `merge()`.
export function sort_by_cost(rows, direction){
	if (!direction) return rows;
	const priced = rows.filter(r => cost_value(r) !== null);
	const unpriced = rows.filter(r => cost_value(r) === null);
	priced.sort((a, b) => direction === "desc" ? cost_value(b) - cost_value(a) : cost_value(a) - cost_value(b));
	return [...priced, ...unpriced];
}

const WORKING_STATE_ATTR = state => WORKING_STATES.has(state) ? "working" : "idle";

// Six cells, same order as COLUMNS — one `<div class="sessions-cell">` per
// column, so a cell's position in the DOM is what lines it up under its own
// header, not a class naming the column (sessions.css's grid tracks are
// positional, same as a `<table>`'s cells always were — the one thing this
// grid still borrows from that idea, without the element).
export function row_view(r, url){
	const src = SOURCE[r.source] ?? { label: r.source, icon: "help" };
	return a.c("sessions-row").href(url + r.id + "/").append(() => {
		div.c("sessions-cell", () => small.c("muted").text(r.last_activity ? age(r.last_activity) : "—").attr("title", r.last_activity ?? ""));
		div.c("sessions-cell", () => span.c("sessions-tag sessions-tag-" + r.source, src.label));
		div.c("sessions-cell", () => { if (r.role) small.c("muted", r.role); });
		div.c("sessions-cell", () => div.c("sessions-name-stack", () => {
			span.c("sessions-row-title", r.tab_title || r.id);
			if (r.last_prompt_first_line) small.c("sessions-row-prompt muted").attr("title", r.last_prompt_first_line).text(r.last_prompt_first_line.slice(0, 80));
		}));
		// Plain `if` statements, not `&&` expressions: a cell callback's return
		// value can end up rendered as a stray text node (found live — a
		// `false` cost value from the live agent feed, not caught by `typeof
		// … === "number"`, rendered the literal word "false" in the Cost
		// column because the arrow function's own return value WAS `false`).
		div.c("sessions-cell", () => { if (r.model) small.c("muted", r.model); });
		// A ▶ that blinks while the row is in flight, a plain quiet dot
		// otherwise — a ✓ for "done" belongs only on the detail page
		// (the owner's own words: this grid never shows it).
		div.c("sessions-cell", () => {
			if (!r.state) return;
			const working = WORKING_STATES.has(r.state);
			span.c("sessions-state-dot sessions-state-dot-" + (working ? "working" : "idle"))
				.attr("title", r.state).text(working ? "▶" : "•");
		});
		// Blank, never a stale number, unless the sample is under 10s old —
		// GET /api/agents carries no RAM field yet (doc/decisions.md), so this
		// stays blank for every row today; the column and the check are both
		// here so the moment Servex adds the field, this just lights up.
		div.c("sessions-cell", () => { if (typeof r.ram_mb === "number" && typeof r.ram_sample_age_ms === "number" && r.ram_sample_age_ms < 10000) small.c("muted", Math.round(r.ram_mb) + "MB"); });
		div.c("sessions-cell", () => {
			const has_split = typeof r.cost_claude_usd === "number" || typeof r.cost_openrouter_usd === "number";
			if (has_split){
				if (typeof r.cost_claude_usd === "number") small.c("muted", "$" + r.cost_claude_usd.toFixed(2));
				if (typeof r.cost_openrouter_usd === "number") div.c("sessions-cost-or flex gap-35 v-center", () => {
					span.c("sessions-tag sessions-tag-or", "OR");
					small.c("muted", "$" + r.cost_openrouter_usd.toFixed(2));
				});
			} else if (typeof r.cost === "number") {
				small.c("muted", "$" + r.cost.toFixed(2));
			}
		});
	});
}

// ---- filters + summary + "cost by role", all computed client-side over the
// rows already fetched (CLAUDE.md law 7: no new endpoint). ----

function claude_usd_of(r){ return typeof r.cost_claude_usd === "number" ? r.cost_claude_usd : (typeof r.cost === "number" ? r.cost : 0); }
function openrouter_usd_of(r){ return typeof r.cost_openrouter_usd === "number" ? r.cost_openrouter_usd : 0; }

function in_date_range(r, from, to){
	if (!r.last_activity) return true;   // nothing to filter on — don't hide it
	const t = Date.parse(r.last_activity);
	return t >= from && t <= to;
}

function by_role_totals(rows){
	const totals = new Map();
	for (const r of rows){
		const key = r.role || "(unknown)";
		const prev = totals.get(key) ?? { role: key, claude_usd: 0, openrouter_usd: 0, count: 0 };
		prev.claude_usd += claude_usd_of(r);
		prev.openrouter_usd += openrouter_usd_of(r);
		prev.count += 1;
		totals.set(key, prev);
	}
	return [...totals.values()].sort((a, b) => (b.claude_usd + b.openrouter_usd) - (a.claude_usd + a.openrouter_usd));
}

export default new Page({
	meta: import.meta,
	// Blank on purpose: the Panel2 header below already shows "Sessions" as
	// its own toolbar title (review finding, 2026-10-02 — said twice
	// otherwise). dashboard/page.js does the identical thing, with the fuller
	// note.
	title: "",
	description: "Every Claude session with an id — a VS Code tab, a Servex agent, or a CLI run — newest activity first.",
	icon: "history_toggle_off",

	// `{"settings":{"tab":true,...}}` lives in settings.jsonl beside this file
	// (a page.js folder's own settings, per overview.js's detect_tabs()) —
	// nothing to declare here; the tab strip finds it on its own.

	// `width: "fill"` + `columns()`: alone, the grid claims the whole row (it
	// IS the content, not a rail beside some other content — `doc/columns.md`
	// names a grid/table exactly as what `fill` is for). The moment a row is
	// clicked, `fill` YIELDS to the open child (the same rule every other
	// `fill` page on the site already gets, doc/columns.md) and drops to the
	// default reading width, leaving the detail page the rest of the row — the
	// side peek, for free, from a rule this page did not have to write.
	width: "fill",
	initialize(){ this.columns(); },

	content(){
		// `wide`: a plain Page's own track is the narrow prose column — a list
		// of session rows reads just as cramped there as a grid of tiles does
		// (see dashboard/page.js's own note for the measured number).
		const panel = new Panel2({ title: "Sessions" }).ac("wide");
		panel.header.append(() => small.c("muted", "live — polls every 20s"));
		this.$week_line = panel.header.append(() => small.c("muted sessions-week-line"));

		this.cost_sort = null;      // null | "desc" | "asc" — the Cost header's own toggle
		this.role_filter = null;    // Set<string> | null (null = "everything", until the first real data arrives)
		const today = new Date();
		this.date_to = today.toISOString().slice(0, 10);
		this.date_from = new Date(today.getTime() - 30 * 864e5).toISOString().slice(0, 10);
		this.last_rows = [];        // the latest merged rows, UNFILTERED — filters/sort redraw from this

		this.$controls = div.c("sessions-controls flow");
		panel.main.append(this.$controls);

		this.$grid = div.c("sessions-grid", $grid => {
			header_row($grid, this);
			this.$rows = div.c("sessions-rows");
		});
		panel.main.append(this.$grid);
		this.snapshot_rows = [];
	},

	render_cost_label(){
		if (!this.$cost_label) return;
		const arrow = this.cost_sort === "desc" ? " ↓" : this.cost_sort === "asc" ? " ↑" : "";
		this.$cost_label.text("Cost" + arrow);
	},

	toggle_cost_sort(){
		this.cost_sort = this.cost_sort === null ? "desc" : this.cost_sort === "desc" ? "asc" : null;
		this.render_cost_label();
		this.render_rows();
	},

	// Builds the role-filter checkboxes the first time real rows arrive (so
	// the list is never a guess at what roles exist), then redraws the grid.
	render_controls(){
		if (this.role_filter === null){
			this.role_filter = new Set(this.last_rows.map(r => r.role || "(unknown)"));
		}
		const roles = [...new Set(this.last_rows.map(r => r.role || "(unknown)"))].sort();
		this.$controls.empty(() => {
			if (roles.length){
				div.c("sessions-role-filter flex wrap gap-50", () => {
					roles.forEach(role => {
						label.c("flex gap-35 v-center h4", () => {
							const $box = input().attr("type", "checkbox");
							$box.el.checked = this.role_filter.has(role);
							$box.on("change", () => {
								if ($box.el.checked) this.role_filter.add(role); else this.role_filter.delete(role);
								this.render_rows();
							});
							span(role);
						});
					});
				});
			}
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
			this.$summary = div.c("sessions-summary flex gap-50 v-center");
			this.$by_role = div.c("sessions-by-role flow");
		});
	},

	// Recomputes the filtered + sorted row set from `this.last_rows` and
	// redraws the grid, the summary line and the "cost by role" list — never a
	// new fetch (CLAUDE.md law 7).
	render_rows(){
		if (!this.$controls) return;
		if (!this.$summary) this.render_controls();

		const from = Date.parse(this.date_from + "T00:00:00");
		const to = Date.parse(this.date_to + "T23:59:59.999");
		const filtered = this.last_rows.filter(r => this.role_filter.has(r.role || "(unknown)") && in_date_range(r, from, to));
		const sorted = sort_by_cost(filtered, this.cost_sort);

		this.$rows.empty(() => {
			if (!sorted.length) return void p.c("muted").style({ gridColumn: "1 / -1" }).text("No sessions with an id yet.");
			sorted.forEach(r => row_view(r, this.url));
		});

		const claude_total = filtered.reduce((n, r) => n + claude_usd_of(r), 0);
		const or_total = filtered.reduce((n, r) => n + openrouter_usd_of(r), 0);
		this.$summary?.empty(() => {
			small.c("muted", `${filtered.length} session${filtered.length === 1 ? "" : "s"} shown — $${claude_total.toFixed(2)} Claude · $${or_total.toFixed(2)} OpenRouter`);
		});

		this.$by_role?.empty(() => {
			const totals = by_role_totals(filtered).filter(t => t.claude_usd || t.openrouter_usd);
			if (!totals.length) return;
			small.c("muted", "Cost by role (largest first)");
			totals.forEach(t => div.c("sessions-by-role-row flex gap-50 v-center", () => {
				small.c("sessions-by-role-name", t.role);
				small.c("muted", `$${t.claude_usd.toFixed(2)} Claude · $${t.openrouter_usd.toFixed(2)} OpenRouter · ${t.count} session${t.count === 1 ? "" : "s"}`);
			}));
		});
	},

	// ⚠ Lifecycle, not a one-shot in content(): content() runs once ever (this
	// is a cached singleton Page, same as every other tab), so polling started
	// there has no way to stop on the first deactivate and restart on the next
	// activate — it would just run forever, or never run again. `activated()`/
	// `deactivated()` fire every time the reader leaves and comes back.
	activated(){
		this.polling = true;

		const draw = agents => {
			this.last_rows = merge(this.snapshot_rows, agents);
			this.render_rows();
		};

		const poll = async () => {
			if (!this.polling) return;
			if (!document.hidden) draw((await get_json("/api/agents")) ?? []);
			if (this.polling) setTimeout(poll, POLL_MS);
		};

		get_json(this.url + "sessions.json").then(snap => {
			this.snapshot_rows = snap?.rows ?? [];
			if (this.polling) poll();
		});

		// `week.json` (Server/week-cost.mjs) — a manual, point-in-time snapshot,
		// not live; degrades silently (no line shown) on a 404, i.e. the script
		// hasn't been run yet on this machine.
		get_json(this.url + "week.json").then(week => {
			if (!week || !this.$week_line) return;
			const pct = typeof week.plan_pct_used === "number" ? `, plan ${week.plan_pct_used}% used` : "";
			const per_pct = typeof week.usd_per_pct === "number" && week.usd_per_pct > 0 ? ` — ~$${week.usd_per_pct.toFixed(2)}/1%` : "";
			this.$week_line.text(`$${week.claude_usd.toFixed(2)} Claude · $${week.openrouter_usd.toFixed(2)} OpenRouter this week${pct}${per_pct}`);
		});
	},

	deactivated(){ this.polling = false; },

	// `/framework/ai/sessions/<id>/` — one session's own prompts, in order.
	// A real route, not a client-side peek state: reload lands on the same
	// url and the same column (the owner's own ask — "routed, so it reloads
	// to the same view").
	route(id){
		if (id.includes(".")) return;   // a stray asset request, not a session id
		return session_page(this, id);
	},
});

// THE ONE SEAM for where a session's prompts come from. Today: this task's
// own `sessions.json` snapshot + a `transcripts/<id>.json` file written
// beside it. Tomorrow, once `task-mastermind-prompt-refine` lands: filter
// `.claude/prompts/<date>.jsonl`'s `refined` lines by `session_id`. Every
// caller of this function is unaffected by that swap — only this body changes.
async function load_transcript(root_url, id){
	const [snap, transcript] = await Promise.all([
		get_json(root_url + "sessions.json"),
		get_json(root_url + "transcripts/" + id + ".json"),
	]);
	const row = snap?.rows?.find(r => r.id === id || r.session_id === id);
	const prompts = transcript?.prompts ?? null;
	return { row, prompts };
}

// Finds the dated `.../<slug>-<id8>/` folder a `page.jsonl` (if any) lives in
// for this session, by walking `/framework/directory.json` (the same listing
// `ai/v/2/page.js` and `ai2/groups.js` already read client-side — a browser
// page has no filesystem access, so this is the one way to find a folder
// whose exact name it doesn't know in full). `Server/week-cost.mjs` does the
// equivalent walk server-side, over the real filesystem instead of this JSON
// listing — two different environments, the same one-line glob, duplicated
// rather than shared across the server/browser boundary (this is a static site).
async function find_session_page_dir(id){
	const id8 = id.slice(0, 8);
	const dir = await get_json("/framework/directory.json");
	const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
	for (const y of ai){
		if (y.type !== "dir" || !/^\d{4}$/.test(y.name)) continue;
		for (const m of y.children ?? []){
			if (m.type !== "dir" || !/^\d{2}$/.test(m.name)) continue;
			for (const d of m.children ?? []){
				if (d.type !== "dir" || !/^\d{2}$/.test(d.name)) continue;
				const hit = (d.children ?? []).find(s => s.type === "dir" && s.name.endsWith("-" + id8));
				if (hit) return `/framework/ai/${y.name}/${m.name}/${d.name}/${hit.name}/`;
			}
		}
	}
	return null;
}

// This session's own logged cost lines, oldest first — `null` when there is no
// `page.jsonl` for it yet, or it has no `cost` line (either is normal: most
// sessions predate this task, or haven't had a Stop hook fire yet). Takes the
// already-resolved `dir` (from `find_session_page_dir()`), not the id — the
// caller resolves that glob ONCE and passes the same dir in here and to
// `load_trace()` below, rather than every loader re-walking directory.json
// for itself.
async function load_cost_log(dir){
	if (!dir) return null;
	const lines = await get_jsonl(dir + "page.jsonl");
	const costs = (lines ?? []).filter(l => l.cost).map(l => l.cost);
	return costs.length ? costs : null;
}

// `<session-dir>/trace.json` — the per-tool-call detail behind the
// cost-over-time chart and the "what was it doing" table below. Written by
// hand today, `node Server/session-cost.mjs --trace-file <id> <out-path>`
// (2026-10-03 brief, public/framework/ai/2026-10-03/session-trace/) — NOT
// wired into the Stop hook (a trace file can run to several MB for a long
// session; doc/decisions.md says why this is an open, honest gap rather than
// a hidden limitation, same shape week.json's own note already uses). Missing
// (no dir, or a 404) just means the chart/table don't render — nothing warns,
// same silent-degrade rule week.json already follows.
async function load_trace(dir){
	if (!dir) return null;
	const trace = await get_json(dir + "trace.json");
	return trace?.calls && trace?.turns ? trace : null;
}

// ---- the "what was it doing" table: one row per tool, sorted by $ (largest
// first — dataviz: the thing that matters most comes first). `usd` sums each
// DISTINCT turn that tool's own calls touched (a turn's $ exists once, for
// the whole turn, however many tool calls it made — `turn_at` is the de-dupe
// key `trace_of_transcript()` stamped on every call for exactly this). ----
export function trace_table_rows(trace){
	if (!trace?.calls?.length) return [];
	const turn_usd = new Map((trace.turns || []).map(t => [t.at, t.usd]));
	const total = [...turn_usd.values()].reduce((n, usd) => n + usd, 0);
	const by_tool = new Map();
	for (const c of trace.calls){
		const row = by_tool.get(c.tool) || { tool: c.tool, count: 0, turn_ats: new Set() };
		row.count++;
		row.turn_ats.add(c.turn_at);
		by_tool.set(c.tool, row);
	}
	const rows = [...by_tool.values()].map(r => {
		const usd = [...r.turn_ats].reduce((n, at) => n + (turn_usd.get(at) || 0), 0);
		return { tool: r.tool, count: r.count, usd, share: total > 0 ? usd / total : 0 };
	});
	rows.sort((a, b) => b.usd - a.usd);
	return rows;
}

// A tool whose own `input` can really write something — used by two of the
// four waste checks below ("nothing written in between"). `Edit`/`Write`/
// `NotebookEdit` always write; a `Bash` call MIGHT (this is a pattern match on
// the command text, not a certainty — noted as a tunable in doc/decisions.md,
// since there is no reliable way to know what an arbitrary shell command did
// without actually running it).
const WRITE_TOOLS = new Set(["Edit", "Write", "NotebookEdit"]);
const READ_TOOLS = new Set(["Read", "Grep", "Glob", "ToolSearch"]);
function bash_looks_like_a_write(cmd){
	return /(>|>>|\brm \b|\bmv \b|\bcp \b|mkdir|touch |git (add|commit|checkout|reset)|npm i|writeFileSync|Set-Content|Out-File)/i.test(cmd || "");
}
function call_writes(c){ return WRITE_TOOLS.has(c.tool) || (c.tool === "Bash" && bash_looks_like_a_write(c.input?.command)); }

// A short, readable name for a flag line — a file path shows its last ~57
// characters (the part that actually tells two files apart; a shared parent
// folder doesn't), a Bash command is already clipped to 60 chars by
// `target_of()` server-side.
function short(s){ s = String(s ?? ""); return s.length > 60 ? "…" + s.slice(-57) : s; }

// Four waste checks, all COMPUTED from `trace.calls` (CLAUDE.md law 7 — never
// guessed), each producing one plain sentence a reader can skim without
// reading code first (CLAUDE.md law 2). Thresholds are this task's own best
// first guess, not laws — doc/decisions.md names each one as tunable.
export function waste_flags(trace){
	const calls = trace?.calls || [];
	const flags = [];
	if (!calls.length) return flags;

	// 1. The same file read 3+ times — a wider single read would likely do.
	const read_counts = new Map();
	for (const c of calls) if (c.tool === "Read") read_counts.set(c.target, (read_counts.get(c.target) || 0) + 1);
	for (const [file, n] of read_counts) if (n >= 3) flags.push(`${short(file)} was read ${n} times — maybe one read with a wider range would have done.`);

	// 2. Chunked reads of one file — 2+ reads of the SAME file with a
	// different `offset`/`limit` each time (the raw `input` kept on every
	// call is what makes this possible — `target` alone can't tell "the same
	// file, a different slice" apart from "the same file, the same slice").
	const by_file_reads = new Map();
	for (const c of calls) if (c.tool === "Read"){
		if (!by_file_reads.has(c.target)) by_file_reads.set(c.target, []);
		by_file_reads.get(c.target).push(c);
	}
	for (const [file, reads] of by_file_reads){
		if (reads.length < 2) continue;
		const any_offset = reads.some(r => r.input?.offset != null || r.input?.limit != null);
		const shapes = new Set(reads.map(r => `${r.input?.offset ?? ""}:${r.input?.limit ?? ""}`));
		if (any_offset && shapes.size >= 2) flags.push(`${short(file)} was read in ${reads.length} separate chunks of the same file (a different offset/limit each time).`);
	}

	// 3. Polling — the same file (or the exact same Bash command) called 2+
	// times with under 15 seconds between calls and nothing written in
	// between: "waiting for a background thing to finish", not "re-reading
	// because it actually changed". Bash groups by the FULL command, never
	// the 60-char `target` string — two different commands that happen to
	// start the same way (`cd some/long/path && …`) are not "the same call".
	for (const tool of ["Read", "Bash"]){
		const key_of = c => tool === "Bash" ? (c.input?.command || c.target) : c.target;
		const by_key = new Map();
		calls.forEach((c, i) => { if (c.tool !== tool) return; const k = key_of(c); if (!by_key.has(k)) by_key.set(k, []); by_key.get(k).push(i); });
		for (const [key, idxs] of by_key){
			let cluster = [idxs[0]];
			const flush = () => {
				if (cluster.length >= 2) flags.push(`${short(key)} was ${tool === "Bash" ? "run" : "read"} ${cluster.length} times within 15 seconds of each other, nothing written in between — looks like polling/waiting, not a real change.`);
				cluster = [];
			};
			for (let k = 1; k < idxs.length; k++){
				const gap = (Date.parse(calls[idxs[k]].at) - Date.parse(calls[idxs[k - 1]].at)) / 1000;
				const wrote = Array.from({ length: idxs[k] - idxs[k - 1] - 1 }, (_, j) => calls[idxs[k - 1] + 1 + j]).some(call_writes);
				if (gap >= 0 && gap <= 15 && !wrote) cluster.push(idxs[k]);
				else { flush(); cluster = [idxs[k]]; }
			}
			flush();
		}
	}

	// 4. Long read-no-write runs — 5+ consecutive read-shaped calls
	// (Read/Grep/Glob/ToolSearch) with no write in between. 5 is a starting
	// guess (doc/decisions.md), not a law.
	const RUN_THRESHOLD = 5;
	let run = 0, run_start = null;
	const runs = [];
	for (let i = 0; i < calls.length; i++){
		const c = calls[i];
		if (READ_TOOLS.has(c.tool) && !call_writes(c)){
			if (run === 0) run_start = i;
			run++;
		} else {
			if (run >= RUN_THRESHOLD) runs.push({ start: run_start, len: run });
			run = 0;
		}
	}
	if (run >= RUN_THRESHOLD) runs.push({ start: run_start, len: run });
	for (const r of runs) flags.push(`${r.len} read-only tool calls in a row with no write in between, starting at call #${r.start + 1}.`);

	return flags;
}

// A nice round step (1, 2, 5 × 10ⁿ) for about `count` gridlines — the exact
// helper `ux/Content/Spend.js` already uses for its own $-over-time bars
// (same shape of chart, a different aggregation); copied rather than
// imported since that class is a `ContentModule` built around its OWN fetch,
// not a plain function this page could call standalone.
function nice_step(max, count){
	const raw = max / count, mag = 10 ** Math.floor(Math.log10(raw || 1)), r = raw / mag;
	return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * mag;
}

function esc_attr(s){ return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

// The cost-over-time chart: plain inline SVG, no charting library (CLAUDE.md:
// no new npm dependency) — same house style as `ux/Content/Spend.js`'s own
// bar chart, just a cumulative STEP line instead of bins, plus a tick per
// tool call. ONE chart (dataviz skill: never two y-axes) — x = elapsed time
// since the session's own first turn, y = cumulative $, unit picked from the
// session's OWN real span (seconds / minutes / hours), never hardcoded.
// Honest axes: y starts at 0, x starts at 0 and runs to the real last call —
// neither is truncated.
export function trace_chart_svg(trace, w){
	w = w || 720;
	const H = 220, L = 56, R = 16, T = 20, B = 34, iw = w - L - R, ih = H - T - B;
	const turns = trace.turns || [], calls = trace.calls || [];
	if (!turns.length) return "";

	const t0 = Date.parse(turns[0].at);
	const elapsed = at => (Date.parse(at) - t0) / 1000;   // seconds, always — unit is a DISPLAY choice below, not stored

	let cum = 0;
	const steps = [[0, 0]];
	for (const t of turns){
		const x = elapsed(t.at);
		steps.push([x, cum]);
		cum += t.usd;
		steps.push([x, cum]);
	}
	const calls_max_x = calls.length ? Math.max(...calls.map(c => elapsed(c.at))) : 0;
	const max_x = Math.max(steps.at(-1)[0], calls_max_x, 1);
	steps.push([max_x, cum]);

	const total_usd = cum;
	const y_step = nice_step(total_usd || 1, 4);
	const y_max = Math.ceil((total_usd || 1) / y_step) * y_step || 1;

	let unit = "s", unit_div = 1;
	if (max_x > 3 * 3600) { unit = "h"; unit_div = 3600; }
	else if (max_x > 180) { unit = "min"; unit_div = 60; }

	const X = secs => L + (secs / max_x) * iw;
	const Y = usd => T + ih - (usd / y_max) * ih;

	let s = `<svg viewBox="0 0 ${w} ${H}" width="${w}" height="${H}" role="img" aria-label="Cumulative cost over time — total $${total_usd.toFixed(2)}, ${calls.length} tool calls">`;

	for (let v = 0; v <= y_max + 1e-9; v += y_step){
		s += `<line class="g" x1="${L}" x2="${w - R}" y1="${Y(v)}" y2="${Y(v)}"/>`;
		s += `<text class="t" x="${L - 6}" y="${Y(v) + 4}" text-anchor="end">$${v.toFixed(2)}</text>`;
	}

	// a tick per tool_use block — short, on the x-axis baseline, so a flat $
	// stretch with many ticks (cheap tool-calling) reads differently from a
	// jump with none (one expensive turn) — the owner's own ask.
	const baseline = T + ih;
	for (const c of calls){
		const x = X(elapsed(c.at)).toFixed(1);
		s += `<line class="tick" x1="${x}" x2="${x}" y1="${baseline - 6}" y2="${baseline}"><title>${esc_attr(c.tool)}: ${esc_attr(c.target)}</title></line>`;
	}

	const path = steps.map(([x, y], i) => `${i === 0 ? "M" : "L"}${X(x).toFixed(1)},${Y(y).toFixed(1)}`).join(" ");
	s += `<path class="line" d="${path}" fill="none"/>`;

	const nt = Math.max(2, Math.min(6, Math.floor(iw / 90)));
	for (let i = 0; i <= nt; i++){
		const secs = max_x * i / nt, x = X(secs);
		const label = (secs / unit_div).toFixed(secs / unit_div < 10 ? 1 : 0);
		s += `<text class="t" x="${x.toFixed(1)}" y="${H - 6}" text-anchor="${i === 0 ? "start" : i === nt ? "end" : "middle"}">${label}${unit}</text>`;
	}

	s += `<text class="total" x="${L}" y="14">$${total_usd.toFixed(2)} total — Claude $ (no real per-turn OpenRouter split in this session's own data; doc/decisions.md)</text>`;
	s += `</svg>`;
	return s;
}

// Builds the chart + the "what was it doing" table + the waste flags into
// `$el` — one function, called once the trace has loaded (or not at all, if
// it 404'd: `session_page()` below never calls this without a real trace).
function render_trace_section($el, trace){
	small.c("muted", "What it was doing (Server/session-cost.mjs --trace-file — a manual, on-demand file; doc/decisions.md)");
	div.c("sessions-trace-chart").html_unsafe(trace_chart_svg(trace, 720));

	const rows = trace_table_rows(trace);
	if (rows.length){
		div.c("sessions-trace-table", () => {
			div.c("sessions-trace-row sessions-trace-head", () => {
				small.c("muted", "Tool"); small.c("muted", "Calls"); small.c("muted", "$"); small.c("muted", "Share");
			});
			rows.forEach(r => div.c("sessions-trace-row", () => {
				span(r.tool);
				small.c("muted", String(r.count));
				small.c("muted", "$" + r.usd.toFixed(2));
				small.c("muted", Math.round(r.share * 100) + "%");
			}));
		});
	}

	const flags = waste_flags(trace);
	div.c("flow", () => {
		small.c("muted", "Waste check (computed — same file read 3+ times, chunked reads, polling, long read-no-write runs)");
		if (!flags.length){
			p.c("muted", "Nothing flagged.");
		} else {
			flags.forEach(f => p.c("sessions-trace-flag", f));
		}
	});
}

function session_page(root, id){
	return new Page({
		// A session id is a raw uuid or an agent name — fine as a url, too long and
		// too opaque to read as a page's own giant h1 (a card's title is the one
		// precedent for showing a raw id here, and a card's id is a short slug, not
		// a 36-character uuid). The short form is still unique enough to tell two
		// sessions apart at a glance; the full id sits right below it either way.
		title: id.length > 24 ? id.slice(0, 8) + "…" : id,
		url: root.url + id + "/",
		content(){
			a.c("page-link", "← all sessions").href(root.url);
			small.c("muted sessions-full-id", id);

			const $box = div.c("flow");
			const $costs = div.c("flow");
			const $trace = div.c("flow");   // the cost-over-time chart + "what was it doing" table, BELOW $costs (2026-10-03 brief)

			Promise.all([load_transcript(root.url, id), find_session_page_dir(id)]).then(async ([{ row, prompts }, dir]) => {
				// `dir` is resolved ONCE here and handed to both loaders below —
				// `find_session_page_dir()` walks the whole directory.json tree, so
				// calling it twice (once per loader) would be the same glob done
				// twice for nothing.
				const [costs, trace] = await Promise.all([load_cost_log(dir), load_trace(dir)]);

				$costs.empty(() => {
					if (!costs) return;
					small.c("muted", "Logged cost (Server/session-cost.mjs, after each turn)");
					costs.forEach(c => div.c("sessions-cost-row card flex gap-50 v-center", () => {
						small.c("muted", c.at ? age(c.at) : "");
						small(`${c.last_prompt_input ?? 0} in / ${c.last_prompt_output ?? 0} out`);
						small.c("sessions-row-title", "$" + (c.last_prompt_usd ?? 0).toFixed(4));
						small.c("muted", "running total $" + (c.total_usd ?? 0).toFixed(2));
					}));
				});

				$box.empty(() => {
					if (row){
						const src = SOURCE[row.source] ?? { label: row.source };
						div.c("flex gap-50 v-center", () => {
							span.c("sessions-tag sessions-tag-" + row.source, src.label);
							span.c("sessions-row-title", row.tab_title || row.id);
							if (row.model) small.c("muted", row.model);
						});
					}
					if (prompts?.length){
						div.c("flow", () => prompts.forEach(pr => {
							div.c("sessions-prompt card", () => {
								small.c("muted", pr.at ? age(pr.at) : "");
								p(pr.text);
							});
						}));
					} else if (!costs) {
						p.c("muted", "No transcript for this session yet. Servex-sourced sessions don't carry one over "
							+ "today's GET /api/agents — a GET /api/sessions route (asked for, see this task's "
							+ "doc/decisions.md) would add it. A VS Code or CLI session whose file sessions.mjs "
							+ "hasn't scanned yet needs that script re-run.");
					}
				});

				$trace.empty(() => {
					if (!trace) return;   // no trace.json for this session yet — silent degrade, same rule week.json already uses
					render_trace_section($trace, trace);
				});
			});

			$costs;
			$box;
			$trace;
		},
	});
}
