import { Page, div, a, span, small, p, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { grip } from "/framework/ext/grip/grip.js";

View.stylesheet(import.meta, "sessions.css");

/* THE SESSIONS TAB — a data grid of EVERY Claude session that has an id: a
 * VS Code tab, a Servex agent, or a standalone CLI run. The owner's own words
 * (requirements.md, 2026-10-02, sessions-grid-v2): "the start time, the
 * source tag, the agent or tab name, the model, the state and the cost."
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
// (CLAUDE.md law 6).
export const SOURCE = {
	servex: { label: "Servex", icon: "hub" },
	vscode: { label: "VS Code", icon: "laptop_windows" },
	cli: { label: "CLI", icon: "terminal" },
};

const POLL_MS = 20000;

// One row per column, one token, one minimum — `write()` below never touches
// any token but its own (the owner's own ask: "resizing a column changes the
// one token"). `min` mirrors sessions.css's own `minmax()` floor for the same
// column; the grid enforces it either way, this just keeps the drag's own
// pill from visually overshooting it.
export const COLUMNS = [
	{ key: "time",   label: "Start",  min: 112 },
	{ key: "source", label: "Source", min: 88 },
	{ key: "name",   label: "Name",   min: 160 },
	{ key: "model",  label: "Model",  min: 88 },
	{ key: "state",  label: "State",  min: 80 },
	{ key: "cost",   label: "Cost",   min: 64 },
];

function header_row($grid){
	div.c("sessions-head", () => {
		COLUMNS.forEach((col, i) => {
			div.c("sessions-cell sessions-head-cell", () => {
				span(col.label);
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

// The snapshot's VS Code/CLI rows, plus Servex's own live list laid on top —
// a Servex row always wins its own session_id, since it is the live truth.
export function merge(snapshot_rows, agents){
	const by_id = new Map(snapshot_rows.map(r => [r.session_id, r]));
	agents.forEach(a => {
		if (!a.session_id) return;   // the dispatcher and a few internal roles have none — nothing to show
		const had = by_id.get(a.session_id);
		by_id.set(a.session_id, {
			id: a.id, source: "servex", session_id: a.session_id, tab_title: a.id,
			model: a.model, state: a.state,
			cost: typeof a.cost === "number" ? a.cost : (typeof had?.cost === "number" ? had.cost : null),
			last_activity: a.started_at ?? had?.last_activity ?? null,
			// The live route carries no transcript (sessions.mjs's own note) — a
			// snapshot row for this SAME id would be a coincidence, not real data.
			last_prompt_first_line: null,
		});
	});
	return [...by_id.values()].sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
}

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
		div.c("sessions-cell", () => { if (r.state) small.c("sessions-state sessions-state-" + r.state, r.state); });
		div.c("sessions-cell", () => { if (typeof r.cost === "number") small.c("muted", "$" + r.cost.toFixed(2)); });
	});
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

		this.$grid = div.c("sessions-grid", $grid => {
			header_row($grid);
			this.$rows = div.c("sessions-rows");
		});
		panel.main.append(this.$grid);
		this.snapshot_rows = [];
	},

	// ⚠ Lifecycle, not a one-shot in content(): content() runs once ever (this
	// is a cached singleton Page, same as every other tab), so polling started
	// there has no way to stop on the first deactivate and restart on the next
	// activate — it would just run forever, or never run again. `activated()`/
	// `deactivated()` fire every time the reader leaves and comes back.
	activated(){
		this.polling = true;

		const draw = agents => this.$rows.empty(() => {
			const rows = merge(this.snapshot_rows, agents);
			// `grid-column: 1 / -1` — this box is a grid ITEM of `.sessions-grid` like
			// every row cell is, so without it the empty message would be squeezed
			// into just the first (Start) column's own width instead of spanning.
			if (!rows.length) return void p.c("muted").style({ gridColumn: "1 / -1" }).text("No sessions with an id yet.");
			rows.forEach(r => row_view(r, this.url));
		});

		const poll = async () => {
			if (!this.polling) return;
			if (!document.hidden) draw((await get_json("/api/agents")) ?? []);
			if (this.polling) setTimeout(poll, POLL_MS);
		};

		get_json(this.url + "sessions.json").then(snap => {
			this.snapshot_rows = snap?.rows ?? [];
			if (this.polling) poll();
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

			load_transcript(root.url, id).then(({ row, prompts }) => {
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
					} else {
						p.c("muted", "No transcript for this session yet. Servex-sourced sessions don't carry one over "
							+ "today's GET /api/agents — a GET /api/sessions route (asked for, see this task's "
							+ "doc/decisions.md) would add it. A VS Code or CLI session whose file sessions.mjs "
							+ "hasn't scanned yet needs that script re-run.");
					}
				});
			});

			$box;
		},
	});
}
