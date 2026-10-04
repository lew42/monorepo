import { Page, div, a, span, small, p, label, input, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { grip } from "/framework/ext/grip/grip.js";
import { load as raw_transcript_lines } from "/framework/ext/AITask/replay.js";
import { dur, elapsed } from "/framework/ext/AITask/stats.js";

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
 * ⚠ 2026-10-03 (sessions-date-homes) reconciled three things with decisions
 * made since the grid shipped — the full record is doc/decisions.md, this is
 * the one-paragraph version:
 *   1. NO DUPLICATE DATA — a session's prompts used to be copied into
 *      `transcripts/<id>.json` (110 files, 2.5 MB). They aren't copied
 *      anywhere now: `load_transcript()` below fetches them LIVE, through
 *      `/ai-logs/<id>` (`Server/plugins/AILogs.js`), the same in-place route
 *      `ext/AITask/replay.js` already used — reused, not rebuilt.
 *   2. A SESSION'S HOME IS ITS DATE PATH — `ai/<Y>/<M>/<D>/<slug>-<id8>/`, once
 *      `task-mastermind-prompt-refine`'s hooks start writing one there
 *      (page-item-design.md). None exist yet (checked live, 2026-10-03), so
 *      `session_page_dir_index()` below — which looks one up — finds nothing
 *      today and every row still opens its existing `/sessions/<id>/` view;
 *      the moment a real one appears, that SAME lookup links to it instead,
 *      with no further code change.
 *   3. START / STOP / DURATION / COST on every row — `sessions.mjs` now
 *      tracks a row's own `started_at` (the file's first timestamp) and
 *      `stopped_at` (null while still going; Servex now exposes this too,
 *      `Agents.js` `card()`).
 */

// Exported too: the Dashboard tab's own Sessions tile (dashboard/page.js) shows
// the same rows the same way — one row renderer, reused, not a second copy
// (CLAUDE.law 6).
export const SOURCE = {
	servex: { label: "Servex", icon: "hub" },
	vscode: { label: "VS Code", icon: "laptop_windows" },
	cli: { label: "CLI", icon: "terminal" },
	// A row synthesized purely from a date-path folder's own NAME (2026-10-03,
	// sessions-date-homes) — `with_date_path_rows()` below, for a session that
	// has a real `ai/<Y>/<M>/<D>/<slug>-<id8>/` page but no `sessions.json`/
	// `GET /api/agents` entry of its own (yet).
	page: { label: "Page", icon: "description" },
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
	{ key: "time",     label: "Start",    min: 112 },
	// Stop/Duration (2026-10-03, sessions-date-homes — the owner's own ask: "show
	// the start time, stop time, duration and cost on every row"), right beside
	// Start since all three describe the same span.
	{ key: "stop",     label: "Stop",     min: 112 },
	{ key: "duration", label: "Duration", min: 84 },
	{ key: "source",   label: "Source",   min: 88 },
	{ key: "role",     label: "Role",     min: 110 },
	{ key: "name",     label: "Name",     min: 160 },
	{ key: "model",    label: "Model",    min: 88 },
	{ key: "state",    label: "State",    min: 80 },
	{ key: "ram",      label: "RAM",      min: 64 },
	{ key: "cost",     label: "Cost",     min: 64 },
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

// "$X.YZ" split into a big whole-dollar part and a smaller cents part — the
// stat cards' own "big bold dollars, smaller cents" (the owner's own words,
// 2026-10-03). No existing "$ big, ¢ small" convention turned up on the site
// (`ux/Content/Spend.js` renders a plain "$12.34" string — checked first,
// CLAUDE.md law 6) so this splits the STRING in markup, two `span`s, rather
// than inventing a new CSS class for the whole amount.
export function money_parts(usd){
	const n = typeof usd === "number" && isFinite(usd) ? usd : 0;
	const s = n.toFixed(2);
	const dot = s.indexOf(".");
	return { whole: "$" + s.slice(0, dot), cents: s.slice(dot) };
}

// Plain words for the role filter (the owner's own follow-up, 2026-10-03:
// "'(unknown)' and 'CLI' mean nothing to me"). Only the two words he named,
// plus the other two short/guessy ones `role_of()` already produces, get a
// friendlier label here — a real Servex role (e.g. "minion-sessions-tab-
// polish-build") is already a real, meaningful name and passes through
// unchanged. Every entry also gets a `title=` spelling out exactly what it
// contains, since a short label can't carry the whole explanation
// (`role_of()`'s own doc comment has the full, honest gap this reads from).
export const ROLE_LABELS = {
	"(unknown)": { label: "(unknown)", title: "A VS Code or CLI session this page can't name a role for — nothing in the data it reads (sessions.json, GET /api/agents) says who was driving it." },
	"cli": { label: "Terminal sessions", title: "A standalone `claude` run from a terminal — not a VS Code tab, not a Servex-spawned agent." },
	"vscode mastermind": { label: "VS Code tabs", title: "An interactive VS Code tab — a human typing, not a spawned agent." },
	"echo/refiner": { label: "Echo / refiner", title: "A session whose id starts \"echo-\" — the one naming convention this page can see." },
};
export function role_label(role){
	const key = role || "(unknown)";
	return ROLE_LABELS[key] ?? { label: key, title: "A Servex agent's own role, straight from the agent registry." };
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

// Requirement 2, "the Sessions tab lists from those pages (the day indexes)
// as they appear" — not just links (review finding, 2026-10-03): a date-path
// session folder that exists but isn't ALREADY one of `rows` (checked by its
// own id8) gets a row of its own, synthesized from nothing but its folder's
// own NAME (`<slug>-<id8>`) — no fetch into that page's `page.jsonl`, whose
// own line-1 shape has changed three times already while this task alone was
// open (doc/decisions.md); the folder's mere existence is the one fact this
// can show without guessing at a schema still moving under it. Always a
// no-op today — `page_dirs` is always empty, since no such folder exists yet
// (checked live) — and becomes real the moment one does, with no further
// code change, the same seam `session_page_dir_index()` itself already is.
export function with_date_path_rows(rows, page_dirs){
	if (!page_dirs?.size) return rows;
	const known = new Set(rows.map(r => (r.session_id || r.id || "").slice(0, 8)));
	const extra = [];
	for (const [id8, dir] of page_dirs){
		if (known.has(id8)) continue;
		const folder = dir.split("/").filter(Boolean).pop() ?? id8;
		extra.push({
			id: id8, session_id: null, source: "page", tab_title: folder.replace(new RegExp("-" + id8 + "$"), ""),
			role: null, model: null, state: null, started_at: null, stopped_at: null, last_activity: null,
			cost: null, cost_claude_usd: null, cost_openrouter_usd: null, ram_mb: null, ram_sample_age_ms: null,
			last_prompt_first_line: null,
		});
	}
	return extra.length ? [...rows, ...extra] : rows;
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
			// Start/Stop (2026-10-03): `GET /api/agents` now carries `stopped_at`
			// (null while the agent is still live) alongside `started_at`, which
			// it always had — both pass straight through, same fallback shape
			// every other optional field here already uses.
			started_at: a.started_at ?? had?.started_at ?? null,
			stopped_at: a.stopped_at ?? had?.stopped_at ?? null,
			last_activity: a.started_at ?? had?.last_activity ?? null,
			// The live route carries no transcript (sessions.mjs's own note) — a
			// snapshot row for this SAME id would be a coincidence, not real data.
			last_prompt_first_line: null,
		});
	});
	return [...by_id.values()]
		.map(r => ({
			role: role_of(r), cost_claude_usd: null, cost_openrouter_usd: null, ram_mb: null, ram_sample_age_ms: null,
			started_at: null, stopped_at: null,
			...r, // a real value already on the row (set above for a Servex row, or already on a snapshot row) always wins these defaults
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

// One `<div class="sessions-cell">` per COLUMNS entry, in the same order —
// a cell's position in the DOM is what lines it up under its own header, not
// a class naming the column (sessions.css's grid tracks are positional, same
// as a `<table>`'s cells always were — the one thing this grid still borrows
// from that idea, without the element).
//
// `page_dirs` (2026-10-03, sessions-date-homes) is the optional id8 → date-path
// index from `session_page_dir_index()` below — when a row's session already
// has a real page at its date path, the row opens THAT url (the owner's own
// decision: "a session's home is its date path"); otherwise it falls back to
// this tab's own `/sessions/<id>/` view, same as before this task. Omitted
// entirely (the Dashboard tile's own call) just means every row falls back,
// which is harmless and correct — no session has a date-path page yet.
export function row_view(r, url, page_dirs, spend){
	const src = SOURCE[r.source] ?? { label: r.source, icon: "help" };
	const dated = page_dirs?.get((r.session_id || r.id || "").slice(0, 8));
	const href = dated ?? (url + r.id + "/");
	return a.c("sessions-row").href(href).append(() => {
		// Start / Stop / Duration (the owner's own ask, requirement 3).
		// ⚠ Three honest states, not two (review finding, 2026-10-03): still
		// WORKING (→ "ongoing", Duration keeps counting to now — the only case
		// where that's true, not a guess); STOPPED with a real `stopped_at`
		// (→ the real time, Duration is real too); or neither — a Servex row
		// that finished WITHOUT an explicit stop (`Agents.js` only stamps
		// `stopped_at` on that one path, never a normal settle) — here Stop
		// and Duration both read "—", because nothing computed actually knows
		// either number; showing a ever-growing Duration for an agent that
		// finished minutes ago would be worse than admitting it's unknown.
		const working = WORKING_STATES.has(r.state);
		const span_end = r.stopped_at ?? (working ? new Date().toISOString() : null);
		div.c("sessions-cell", () => small.c("muted").text(r.started_at ? age(r.started_at) : "—").attr("title", r.started_at ?? ""));
		div.c("sessions-cell", () => small.c("muted").text(r.stopped_at ? age(r.stopped_at) : (working ? "ongoing" : "—")).attr("title", r.stopped_at ?? ""));
		div.c("sessions-cell", () => small.c("muted", dur(elapsed(r.started_at, span_end))));
		div.c("sessions-cell", () => span.c("sessions-tag sessions-tag-" + r.source, src.label));
		// Plain words here too (review finding 2, 2026-10-03) — the role filter
		// row and the "cost by role" list already call role_label(); this grid
		// cell is "any place these words show" too, per the owner's own ask.
		div.c("sessions-cell", () => { if (r.role) { const { label: text, title } = role_label(r.role); small.c("muted").attr("title", title).text(text); } });
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
			// Nested cost (spend-tree): this row's OWN $ is what's above; if it ever
			// spawned anything, a second line shows the whole subtree's $ too — the
			// owner's own ask ("the agent that spawns a bunch of sub agents probably
			// has a bunch of token consumption of its own ... we want to nest the
			// costs"). Only drawn when there's a real tree below it, and it adds up to
			// more than the row's own $ already shown just above.
			const node = spend?.by_id.get(r.id);
			if (node?.children_count > 0){
				const subtree = node.subtree_claude_usd + node.subtree_or_usd;
				const own = (node.own_claude_usd ?? 0) + (node.own_or_usd ?? 0);
				if (subtree > own + 0.004) small.c("muted sessions-subtree-note", `$${subtree.toFixed(2)} w/ ${node.descendant_count}`);
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

// ---- the spend tree (2026-10-03, spend-tree): who spawned whom, why, and what it cost,
// nested — `Server/spend-tree.mjs` computes this ONCE from the Servex registry + every
// agent's own log (doc/spend-tree.md); this page only ever reads its output, never
// recomputes a dollar (CLAUDE.md law 7). A Servex-sourced row's own `id` IS the same id
// the tree uses (`merge()` above sets `tab_title`/href off `a.id`, not `session_id`), so
// no id-mapping is needed to join the two — a VS Code/CLI row just won't be in the tree
// (it isn't a Servex agent) and every lookup below degrades to "nothing shown", same
// silent-degrade rule week.json already uses.
export async function load_spend_tree(root_url){
	const data = await get_json(root_url + "spend-tree.json");
	if (!data?.agents) return null;
	const by_id = new Map(data.agents.map(a => [a.id, a]));
	const children = new Map();
	for (const a of data.agents) {
		if (!a.parent || !by_id.has(a.parent)) continue;
		(children.get(a.parent) ?? children.set(a.parent, []).get(a.parent)).push(a.id);
	}
	return { by_id, children, totals: data.totals, generated_at: data.generated_at };
}

// A row's trigger tag, straight from the spend tree — `null` (never guessed) when the row
// isn't a Servex agent, or the tree hasn't loaded yet.
export function trigger_of(r, spend){
	return spend?.by_id.get(r.id)?.trigger ?? null;
}

export function by_trigger_totals(rows, spend){
	if (!spend) return [];
	const totals = new Map();
	for (const r of rows){
		const key = trigger_of(r, spend) || "(n/a)";
		const prev = totals.get(key) ?? { trigger: key, claude_usd: 0, openrouter_usd: 0, count: 0 };
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

		this.cost_sort = null;      // null | "desc" | "asc" — the Cost header's own toggle
		this.role_filter = null;    // Set<string> | null (null = "everything", until the first real data arrives)
		this.trigger_filter = null; // Set<string> | null — same shape, for the spend tree's trigger tag (2026-10-03, spend-tree)
		const today = new Date();
		this.date_to = today.toISOString().slice(0, 10);
		this.date_from = new Date(today.getTime() - 30 * 864e5).toISOString().slice(0, 10);
		this.last_rows = [];        // the latest merged rows, UNFILTERED — filters/sort redraw from this
		this.week = null;           // the real week.json figures (Server/week-cost.mjs) — the one source of truth for "this week"
		this.filtered_count = 0;    // the current filtered row count — the "sessions shown" stat card

		// The stat-card row (the owner's own words, 2026-10-03: "put them on
		// their own little dashboard cards, a horizontal preview rail across
		// the top" — not one line of plain text he couldn't parse). The
		// `ui/stats` tile TEMPLATE, reused as-is (CLAUDE.md law 6: `grid gap
		// auto` + `surface pad flex v gap` + `h4 muted` / `h2`, no new CSS) —
		// `render_stats()` below fills it in once real data (week.json, or a
		// filter change) arrives.
		this.$stats = div.c("sessions-stats grid gap auto").style("--column", "11em");
		panel.main.append(this.$stats);
		this.render_stats();

		this.$controls = div.c("sessions-controls flow");
		panel.main.append(this.$controls);

		this.$grid = div.c("sessions-grid", $grid => {
			header_row($grid, this);
			this.$rows = div.c("sessions-rows");
		});
		panel.main.append(this.$grid);
		this.snapshot_rows = [];
	},

	// Five small cards: Claude $ this week, OpenRouter $ this week, plan used
	// %, the plan's own $-per-1% (spelled OUT as a label, not crammed into
	// the number — the owner's own words: "I'm not sure what '$26.65/1%'
	// means"), and the current filtered row count. The first four come from
	// `this.week` (the real `week.json` snapshot, `Server/week-cost.mjs`);
	// the fifth from `this.filtered_count`, set by `render_rows()` every time
	// a filter changes — called from both places so either one redraws all
	// five together, same "one function redraws everything" rule
	// `render_rows()` already uses for the grid/summary/by-role list.
	render_stats(){
		if (!this.$stats) return;
		const week = this.week;
		const claude = money_parts(week?.claude_usd);
		const or = money_parts(week?.openrouter_usd);
		const per_pct = money_parts(week?.usd_per_pct);
		const pct_text = typeof week?.plan_pct_used === "number" ? week.plan_pct_used + "%" : "—";
		const money_body = parts => () => { span(parts.whole); span.c("sessions-stat-cents", parts.cents); };

		const tile = (label_text, body, title) => {
			const $tile = div.c("surface pad flex v gap", () => {
				div.c("h4 muted", label_text);
				div.c("h2", body);
			}).style("--gap", "calc(var(--gap) * 0.1)");
			if (title) $tile.attr("title", title);
			return $tile;
		};

		this.$stats.empty(() => {
			tile("Claude this week", week ? money_body(claude) : "—");
			tile("OpenRouter this week", week ? money_body(or) : "—");
			tile("Plan used this week", pct_text);
			tile("Per 1% of your weekly plan", week?.usd_per_pct ? money_body(per_pct) : "—",
				week?.usd_per_pct
					? "How far $1 of Claude spend moves the plan's own weekly meter — the plan's week total divided by its own percent used."
					: "Blank until this week has both a real Claude $ total and a real percent-used figure to divide it by (review finding 3, 2026-10-03).");
			tile("Sessions shown", String(this.filtered_count));
		});
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
	// This still only ever runs once `this.last_rows` holds real data — see
	// the guard on `session_page_dir_index()`'s own call to `render_rows()`
	// in `activated()`, which exists specifically to keep that true.
	render_controls(){
		if (this.role_filter === null){
			this.role_filter = new Set(this.last_rows.map(r => r.role || "(unknown)"));
		}
		if (this.trigger_filter === null){
			this.trigger_filter = new Set(this.last_rows.map(r => trigger_of(r, this.spend) || "(n/a)"));
		}
		const roles = [...new Set(this.last_rows.map(r => r.role || "(unknown)"))].sort();
		// Only offered once the spend tree has real trigger data to show — before that,
		// every row would show "(n/a)" and the filter would be one useless checkbox.
		const triggers = [...new Set(this.last_rows.map(r => trigger_of(r, this.spend) || "(n/a)"))].sort();
		this.$controls.empty(() => {
			if (roles.length){
				div.c("sessions-role-filter flex wrap gap-50", () => {
					roles.forEach(role => {
						const { label: text, title } = role_label(role);
						label.c("flex gap-35 v-center h4").attr("title", title).append(() => {
							const $box = input().attr("type", "checkbox");
							$box.el.checked = this.role_filter.has(role);
							$box.on("change", () => {
								if ($box.el.checked) this.role_filter.add(role); else this.role_filter.delete(role);
								this.render_rows();
							});
							span(text);
						});
					});
				});
			}
			if (this.spend && triggers.length > 1){
				div.c("sessions-role-filter flex wrap gap-50", () => {
					small.c("muted", "trigger:");
					triggers.forEach(tag => {
						label.c("flex gap-35 v-center h4", () => {
							const $box = input().attr("type", "checkbox");
							$box.el.checked = this.trigger_filter.has(tag);
							$box.on("change", () => {
								if ($box.el.checked) this.trigger_filter.add(tag); else this.trigger_filter.delete(tag);
								this.render_rows();
							});
							span(tag);
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
			this.$by_trigger = div.c("sessions-by-role flow");
			this.$cache_breakdown = div.c("sessions-by-role flow");
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
		const filtered = this.last_rows.filter(r => this.role_filter.has(r.role || "(unknown)")
			&& this.trigger_filter.has(trigger_of(r, this.spend) || "(n/a)") && in_date_range(r, from, to));
		const sorted = sort_by_cost(filtered, this.cost_sort);

		// Paging, not windowing: rows are variable-height (a title line plus an
		// optional wrapped prompt-preview line), so there's no fixed row height
		// to compute a scroll-visible slice from the way ext/DataGrid's windowing
		// does. The owner's own fallback for that case ("if windowing is hard,
		// page it... we definitely don't want that many items rendered at once")
		// -- only the first PAGE_SIZE of the filtered/sorted rows render; a
		// "show more" line grows it page by page instead of all ~1,800 at once.
		const PAGE_SIZE = 200;
		this.shown ??= PAGE_SIZE;
		const visible = sorted.slice(0, this.shown);
		this.$rows.empty(() => {
			if (!sorted.length) return void p.c("muted").style({ gridColumn: "1 / -1" }).text("No sessions with an id yet.");
			visible.forEach(r => row_view(r, this.url, this.page_dirs, this.spend));
			if (sorted.length > visible.length){
				div.c("sessions-show-more").style({ gridColumn: "1 / -1" }).append(() => {
					small.c("muted").text(`Showing ${visible.length} of ${sorted.length} — `);
					a.c("sessions-show-more-link").href("#").text(`show ${Math.min(PAGE_SIZE, sorted.length - visible.length)} more`)
						.on("click", e => { e.preventDefault(); this.shown += PAGE_SIZE; this.render_rows(); });
				});
			}
		});

		// ⚠ Honest, not a reconciliation (2026-10-03, sessions-tab-polish — the
		// owner's own words: "the two Claude figures don't reconcile on
		// screen... OpenRouter shows $0.00 in range"). This total is summed
		// client-side from whatever `cost`/`cost_claude_usd` ALREADY SITS on
		// the rows this page has loaded — and almost none of them carry one:
		// `sessions.mjs` writes `cost: null` for every VS Code/CLI row (it has
		// no per-session $ to put there), so in practice this only ever totals
		// the live Servex rows' own running cost. No row anywhere carries a
		// real per-session OpenRouter $ at all (checked: `sessions.json` never
		// writes `cost_openrouter_usd`, `GET /api/agents` doesn't either) — so
		// an "OpenRouter in range" figure here would always read $0.00, not
		// because OpenRouter spend is zero (the ledger has real entries,
		// doc/decisions.md) but because this filtered list structurally can't
		// see it. Rather than show a confident, wrong zero next to the REAL
		// OpenRouter figure one scroll up (the stat card, from
		// `Server/week-cost.mjs`'s own ledger sum), this line only claims what
		// it can actually compute, and says so — CLAUDE.md law 7.
		const claude_total = filtered.reduce((n, r) => n + claude_usd_of(r), 0);
		this.filtered_count = filtered.length;
		this.render_stats();
		this.$summary?.empty(() => {
			small.c("muted", `${filtered.length} session${filtered.length === 1 ? "" : "s"} shown — $${claude_total.toFixed(2)} Claude logged in range`)
				.attr("title", "Only rows that already carry a logged cost (mostly live Servex agents) are counted here — most VS Code/CLI sessions don't have one yet. OpenRouter $ isn't tracked per session at all, so it can't be summed for an arbitrary date range; the real Claude $ and OpenRouter $ for THIS WEEK are the cards above, computed straight from the transcripts and the OpenRouter ledger. ai/sessions/doc/decisions.md has the full reasoning.");
		});

		this.$by_role?.empty(() => {
			const totals = by_role_totals(filtered).filter(t => t.claude_usd);
			if (!totals.length) return;
			small.c("muted", "Claude $ logged by role (largest first, same caveat as above)");
			totals.forEach(t => div.c("sessions-by-role-row flex gap-50 v-center", () => {
				const { label: text, title } = role_label(t.role);
				small.c("sessions-by-role-name").attr("title", title).text(text);
				small.c("muted", `$${t.claude_usd.toFixed(2)} · ${t.count} session${t.count === 1 ? "" : "s"}`);
			}));
		});

		// "Cost by trigger" (spend-tree, 2026-10-03) — the owner's own ask: "tag sessions
		// based on their purpose... figure out the breakdown." These are each row's OWN $,
		// same as "by role" above — never the subtree, which would double-count a parent
		// and its children under two different totals.
		this.$by_trigger?.empty(() => {
			const totals = by_trigger_totals(filtered, this.spend).filter(t => t.claude_usd || t.openrouter_usd);
			if (!totals.length) return;
			small.c("muted", "Cost by trigger — why it was spawned (largest first)");
			totals.forEach(t => div.c("sessions-by-role-row flex gap-50 v-center", () => {
				small.c("sessions-by-role-name", t.trigger);
				small.c("muted", `$${t.claude_usd.toFixed(2)} Claude · $${t.openrouter_usd.toFixed(2)} OpenRouter · ${t.count} session${t.count === 1 ? "" : "s"}`);
			}));
		});

		// The cache $ breakdown, by role and by trigger (token-accounting, 2026-10-04) — the
		// owner's own ask: "a breakdown... grouped by role, by trigger". Straight from
		// `Server/spend-tree.mjs`'s own `by_role`/`by_trigger` (computed once there, never
		// recomputed here — CLAUDE.md law 7). ALL-TIME, not date-filtered, unlike the two lists
		// above it — spend-tree.json is a whole-history snapshot, same as the subtree note each
		// row already shows — labelled plainly so it doesn't read as the same figure.
		this.$cache_breakdown?.empty(() => {
			const groups = [...(this.spend?.by_role ?? []), ...(this.spend?.by_trigger ?? [])].filter(g => g.claude_usd);
			if (!groups.length) return;
			small.c("muted", "Cache $ breakdown, all-time (role, then trigger) — share of each group's $ spent re-reading cached context")
				.attr("title", "From Server/spend-tree.mjs's own by_role/by_trigger, every agent ever registered — not the date-filtered lists above.");
			groups.forEach(g => div.c("sessions-by-role-row flex gap-50 v-center", () => {
				small.c("sessions-by-role-name", g.key);
				small.c("muted", `$${g.cache_read_usd.toFixed(2)} cache reads of $${g.claude_usd.toFixed(2)}`
					+ (g.cache_read_pct != null ? ` (${g.cache_read_pct}%)` : "") + ` · ${g.count} agent${g.count === 1 ? "" : "s"}`);
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
		this.last_agents = [];

		// One shared recompute, called from every trigger below (a fresh
		// `GET /api/agents` poll, or the date-path index resolving/changing) —
		// `with_date_path_rows()` also needs the latest `this.page_dirs`, so
		// this can't just be the old `draw(agents)` closure anymore.
		const draw = () => {
			this.last_rows = with_date_path_rows(merge(this.snapshot_rows, this.last_agents), this.page_dirs);
			this.render_rows();
		};

		const poll = async () => {
			if (!this.polling) return;
			if (!document.hidden){ this.last_agents = (await get_json("/api/agents")) ?? []; draw(); }
			if (this.polling) setTimeout(poll, POLL_MS);
		};

		get_json(this.url + "sessions.json").then(snap => {
			this.snapshot_rows = snap?.rows ?? [];
			if (this.polling) poll();
		});

		// The spend tree (2026-10-03, spend-tree) — a snapshot too (Server/spend-tree.mjs,
		// run by hand; same "not live, re-run to refresh" rule week.json already follows).
		// Fetched once per activation; redraw ONLY if real rows are already on screen, same
		// guard the date-path index below already needs for the identical reason (it would
		// otherwise lock render_controls()'s trigger filter to an empty Set forever).
		load_spend_tree(this.url).then(spend => {
			this.spend = spend;
			if (!this.last_rows.length) return;
			// The trigger filter is only ever built from REAL data (same rule the role
			// filter already follows) — before this resolves, every row reads "(n/a)",
			// so rebuild it now that the real tags exist, not just re-render the rows.
			this.trigger_filter = null;
			this.render_controls();
			this.render_rows();
		});

		// The date-path index (2026-10-03) — fetched ONCE per activation, not
		// per row: every row's `href` wants the same answer to "does this
		// session already have a page at its date path", so one directory.json
		// walk serves the whole grid instead of one per row.
		// ⚠ Only redraw here if real rows are ALREADY on screen (found live:
		// this fetch can resolve before `sessions.json`/`GET /api/agents` do,
		// and redrawing on an empty `last_rows` locks `render_controls()`'s
		// role filter to an empty Set forever — it only ever runs once, the
		// first time `$summary` gets set). When this resolves first, it just
		// sets `this.page_dirs` quietly; the real `draw()` above reads it the
		// moment actual rows arrive. When it resolves after, THIS redraw is
		// what both upgrades already-drawn rows to their date-path links AND
		// adds any page-only row `with_date_path_rows()` found.
		session_page_dir_index().then(index => {
			this.page_dirs = index;
			if (this.last_rows.length) draw();
		});

		// `week.json` (Server/week-cost.mjs) — a manual, point-in-time snapshot
		// of the REAL week numbers (summed straight from the transcripts and
		// the OpenRouter ledger — the one trustworthy source this page has),
		// not live yet (doc/decisions.md); degrades silently (the stat cards
		// just show "—") on a 404, i.e. the script hasn't been run yet on this
		// machine. Feeds the stat-card row, not a line of text — `render_stats()`.
		get_json(this.url + "week.json").then(week => {
			if (!week) return;
			this.week = week;
			this.render_stats();
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

// This session's own row (tab_title, model, source...) from the snapshot —
// `sessions.json` is a COMPUTED CACHE, the owner's own words, never the
// record itself; a Servex row with a real date-path page (none yet — see
// `session_page_dir_index()` below) will stop needing this once one exists.
async function load_row(root_url, id){
	const snap = await get_json(root_url + "sessions.json");
	return snap?.rows?.find(r => r.id === id || r.session_id === id) ?? null;
}

// THE SEAM for where a session's own PROMPTS come from (2026-10-03,
// sessions-date-homes — "no duplicate data"): fetched LIVE, through
// `/ai-logs/<session_id>`, the loopback-guarded dev-server route that reads
// straight from `~/.claude/projects/...` — nothing is copied anywhere.
// `raw_transcript_lines` (`ext/AITask/replay.js`'s own `load()`, exported and
// reused — law 6) does the fetch-and-parse; the filter below picks out real,
// human-or-agent-typed prompts the same way `sessions.mjs` already does
// server-side (a parallel, not a shared function, across the node/browser
// boundary — the same split that file's own header comment already notes for
// `session_page_dir_index()`'s directory.json walk, below). Once
// `task-mastermind-prompt-refine` lands a real source (page-item-design.md),
// this is the one function whose body changes — every caller is unaffected.
async function load_transcript(session_id){
	const lines = await raw_transcript_lines(session_id);
	if (!lines) return null;
	const prompts = lines
		.filter(l => l.type === "user" && !l.isMeta && !l.isSidechain && l.turnOrigin !== "task_notification")
		.map(l => {
			const c = l.message?.content;
			const text = typeof c === "string" ? c : Array.isArray(c) ? c.find(b => b?.type === "text")?.text : null;
			return text ? { at: l.timestamp, text } : null;
		})
		.filter(Boolean);
	return prompts.length ? prompts.slice(-50) : null;
}

// Every `.../<slug>-<id8>/` folder that already holds a `page.jsonl`, keyed by
// its session's own id8 — one walk of `/framework/directory.json` (the same
// listing `ai/v/2/page.js` and `ai2/groups.js` already read client-side — a
// browser page has no filesystem access, so this is the one way to find a
// folder whose exact name it doesn't know in full), shared by the grid (every
// row's own `href`, fetched once per activation) and the detail page (its
// cost/trace lookups) instead of walking the tree once per caller.
// `Server/week-cost.mjs` does the equivalent walk server-side, over the real
// filesystem instead of this JSON listing — two different environments, the
// same one-line glob, duplicated rather than shared across the server/browser
// boundary (this is a static site).
async function session_page_dir_index(){
	const dir = await get_json("/framework/directory.json");
	const ai = dir?.files?.find(f => f.name === "ai")?.children ?? [];
	const index = new Map();
	for (const y of ai){
		if (y.type !== "dir" || !/^\d{4}$/.test(y.name)) continue;
		for (const m of y.children ?? []){
			if (m.type !== "dir" || !/^\d{2}$/.test(m.name)) continue;
			for (const d of m.children ?? []){
				if (d.type !== "dir" || !/^\d{2}$/.test(d.name)) continue;
				for (const s of d.children ?? []){
					if (s.type !== "dir") continue;
					const hit = /-([0-9a-f]{8})$/.exec(s.name);
					if (hit) index.set(hit[1], `/framework/ai/${y.name}/${m.name}/${d.name}/${s.name}/`);
				}
			}
		}
	}
	return index;
}

// One session's own dir, from an already-fetched index — the detail page
// resolves the index itself (it only ever needs one id, so there is no
// shared-across-rows cost to pay for).
function session_page_dir(index, id){
	return index.get((id || "").slice(0, 8)) ?? null;
}

// This session's own logged cost lines, oldest first — `null` when there is no
// `page.jsonl` for it yet, or it has no `cost` line (either is normal: most
// sessions predate this task, or haven't had a Stop hook fire yet). Takes the
// already-resolved `dir` (from `session_page_dir()`), not the id — the
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

// Who spawned this agent, why, and what IT spawned in turn — the owner's own ask ("nest
// the costs... if we can click through and see where our tokens are going"). One small
// link up to the parent (when known), then every direct child, each a routed link to the
// SAME page shape one level down — clicking a child re-enters this exact function on its
// own id, so the tree is just normal navigation, never a special drill-down view.
function render_spawn_section($el, node, spend, root_url){
	small.c("muted", "Spawned (Server/spend-tree.mjs — see doc/spend-tree.md)");

	div.c("sessions-cost-row card flex gap-50 v-center wrap", () => {
		small.c("sessions-row-title", "Trigger: " + node.trigger);
		if (node.parent){
			a.c("sessions-tag sessions-tag-servex").href(root_url + node.parent + "/").text("↑ " + node.parent);
			if (node.parent_source !== "registry") small.c("muted").attr("title", "Servex didn't record this spawn's parent — this script worked it out from task.jsonl.").text("(" + node.parent_source.replace("reconstructed: ", "guessed from ") + ")");
		} else {
			small.c("muted", "no known spawner — " + (node.parent_source === "unknown" ? "none of task.jsonl, the registry or a name match found one" : node.parent_source));
		}
	});

	const own = (node.own_claude_usd ?? 0) + (node.own_or_usd ?? 0);
	const subtree = node.subtree_claude_usd + node.subtree_or_usd;
	div.c("sessions-cost-row card flex gap-50 v-center", () => {
		small(`Own: $${own.toFixed(2)}`);
		if (node.children_count) small.c("muted", `Whole subtree: $${subtree.toFixed(2)} across ${node.descendant_count} descendant${node.descendant_count === 1 ? "" : "s"}`);
	});

	const kids = [...spend.by_id.values()].filter(n => n.parent === node.id)
		.sort((a, b) => (b.subtree_claude_usd + b.subtree_or_usd) - (a.subtree_claude_usd + a.subtree_or_usd));
	if (!kids.length) return;
	small.c("muted", `Spawned ${kids.length} agent${kids.length === 1 ? "" : "s"} directly`);
	div.c("flow", () => kids.forEach(k => {
		const k_own = (k.own_claude_usd ?? 0) + (k.own_or_usd ?? 0);
		const k_subtree = k.subtree_claude_usd + k.subtree_or_usd;
		a.c("sessions-cost-row card flex gap-50 v-center").href(root_url + k.id + "/").append(() => {
			small.c("sessions-row-title", k.id);
			small.c("muted", k.trigger);
			small(`$${k_own.toFixed(2)}`);
			if (k.children_count) small.c("muted", `+ $${(k_subtree - k_own).toFixed(2)} under it (${k.descendant_count})`);
		});
	}));
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
			const $spawn = div.c("flow");   // who spawned this, why, and what it spawned in turn (2026-10-03, spend-tree)
			const $trace = div.c("flow");   // the cost-over-time chart + "what was it doing" table, BELOW $costs (2026-10-03 brief)

			// `row` first, on its own — everything else needs its `session_id`.
			// For a VS Code/CLI row the url's own `id` already IS the session id;
			// for a Servex row `id` is the AGENT's id (e.g. "clarity-weight-badges"),
			// a different string from its `session_id` — using `id` for the
			// transcript fetch and the date-path lookup would ask `/ai-logs/` for
			// the wrong file and glob for the wrong folder (latent since the Role/
			// Cost build added Servex rows to this page; fixed here while touching
			// this same lookup for the date-path reconciliation).
			load_row(root.url, id).then(async row => {
				const session_id = row?.session_id ?? id;
				const dir_index = await session_page_dir_index();
				const dir = session_page_dir(dir_index, session_id);
				const [costs, trace, prompts] = await Promise.all([
					load_cost_log(dir), load_trace(dir), load_transcript(session_id),
				]);

				$costs.empty(() => {
					if (!costs) return;
					small.c("muted", "Logged cost (Server/session-cost.mjs, after each turn)");
					costs.forEach(c => div.c("sessions-cost-row card flex gap-50 v-center", () => {
						small.c("muted", c.at ? age(c.at) : "");
						small(`${c.last_prompt_input ?? 0} in / ${c.last_prompt_output ?? 0} out`);
						small.c("sessions-row-title", "$" + (c.last_prompt_usd ?? 0).toFixed(4));
						small.c("muted", "running total $" + (c.total_usd ?? 0).toFixed(2));
					}));
					// The cache $ breakdown (token-accounting, 2026-10-04): the LATEST logged
					// line's `usd_breakdown` is already the whole session's own total, split by
					// token kind — the owner's own ask, "keeping track of these tokens very
					// precisely in terms of their cache costs". `cache_read_pct` is the one
					// figure named explicitly: what share of the $ is cache reads.
					const last = costs.at(-1);
					if (last?.usd_breakdown) div.c("sessions-cost-breakdown card flex gap-50 v-center muted", () => {
						const b = last.usd_breakdown;
						small(`input $${b.in.toFixed(4)}`);
						small(`cache write $${b.cache_write.toFixed(4)}`);
						small(`cache read $${b.cache_read.toFixed(4)} (${last.cache_read_pct ?? 0}% of $)`);
						small(`output $${b.out.toFixed(4)}`);
					});
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
						p.c("muted", "No transcript for this session — either /ai-logs/ (the dev-server-only "
							+ "route this reads it through) isn't running, or this session's own file has no "
							+ "real prompt in it yet.");
					}
				});

				$trace.empty(() => {
					if (!trace) return;   // no trace.json for this session yet — silent degrade, same rule week.json already uses
					render_trace_section($trace, trace);
				});

				// Only a Servex agent is IN the spend tree at all (it isn't a thing a VS
				// Code tab or a plain CLI run has — doc/spend-tree.md); a non-Servex row's
				// $spawn section just silently stays empty, same degrade rule as above.
				load_spend_tree(root.url).then(spend => {
					$spawn.empty(() => {
						const node = spend?.by_id.get(id);
						if (!node) return;
						render_spawn_section($spawn, node, spend, root.url);
					});
				});
			});

			$costs;
			$box;
			$spawn;
			$trace;
		},
	});
}
