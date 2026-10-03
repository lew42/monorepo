import { Page, div, a, span, small, p, View } from "/app.js";
import Panel2 from "/framework/ext/panel2/Panel2.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";

View.stylesheet(import.meta, "sessions.css");

/* THE SESSIONS TAB — one preview card per Claude session that has an id: a
 * VS Code tab, a Servex agent, or a standalone CLI run. The owner's own words
 * (owner-words.md, panel2-sessions): "A time-based list, like the inbox view
 * sorts itself, a preview card for each session... for this VS Code tab I
 * should be able to see that with a tag that says VS Code on it."
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
 * Click a card → its own url (`route()`, below), showing its prompts in order.
 * Prompts live inside their session's own page, never a separate log page.
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
			cost: typeof a.cost === "number" ? a.cost : had?.cost ?? null,
			last_activity: a.started_at ?? had?.last_activity ?? null,
			// The live route carries no transcript (sessions.mjs's own note) — a
			// snapshot row for this SAME id would be a coincidence, not real data.
			last_prompt_first_line: null,
		});
	});
	return [...by_id.values()].sort((x, y) => Date.parse(y.last_activity ?? 0) - Date.parse(x.last_activity ?? 0));
}

export function row_view(r, url){
	const src = SOURCE[r.source] ?? { label: r.source, icon: "help" };
	// ⚠ `.sessions-row` and its children already declare their own
	// display/gap/align-items in sessions.css — the generic `flex`/`gap-50`/
	// `v-center` utility classes aren't added here too (review finding,
	// 2026-10-02: a class repeating a declaration its own CSS already makes).
	return a.c("sessions-row").href(url + r.id + "/").append(() => {
		span.c("sessions-tag sessions-tag-" + r.source, src.label);
		div.c("sessions-row-main", () => {
			div.c("sessions-row-meta", () => {
				span.c("sessions-row-title", r.tab_title || r.id);
				if (r.model) small.c("muted", r.model);
				if (r.state) small.c("sessions-state sessions-state-" + r.state, r.state);
			});
			if (r.last_prompt_first_line) small.c("sessions-row-prompt muted", r.last_prompt_first_line.slice(0, 120));
		});
		div.c("sessions-row-end", () => {
			small.c("muted").text(r.last_activity ? age(r.last_activity) : "—").attr("title", r.last_activity ?? "");
			if (typeof r.cost === "number") small.c("muted", "$" + r.cost.toFixed(2));
		});
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

	content(){
		// `wide`: a plain Page's own track is the narrow prose column — a list
		// of session rows reads just as cramped there as a grid of tiles does
		// (see dashboard/page.js's own note for the measured number).
		const panel = new Panel2({ title: "Sessions" }).ac("wide");
		panel.header.append(() => small.c("muted", "live — polls every 20s"));

		this.$list = div.c("sessions-list flow");
		panel.main.append(this.$list);
		this.snapshot_rows = [];
	},

	// ⚠ Lifecycle, not a one-shot in content(): content() runs once ever (this
	// is a cached singleton Page, same as every other tab), so polling started
	// there has no way to stop on the first deactivate and restart on the next
	// activate — it would just run forever, or never run again. `activated()`/
	// `deactivated()` fire every time the reader leaves and comes back.
	activated(){
		this.polling = true;

		const draw = agents => this.$list.empty(() => {
			const rows = merge(this.snapshot_rows, agents);
			if (!rows.length) return void p.c("muted", "No sessions with an id yet.");
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
	route(id){
		if (id.includes(".")) return;   // a stray asset request, not a session id
		return session_page(this, id);
	},
});

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

			Promise.all([get_json(root.url + "sessions.json"), get_json(root.url + "transcripts/" + id + ".json")])
				.then(([snap, transcript]) => {
					const row = snap?.rows?.find(r => r.id === id || r.session_id === id);
					$box.empty(() => {
						if (row){
							const src = SOURCE[row.source] ?? { label: row.source };
							div.c("flex gap-50 v-center", () => {
								span.c("sessions-tag sessions-tag-" + row.source, src.label);
								span.c("sessions-row-title", row.tab_title || row.id);
								if (row.model) small.c("muted", row.model);
							});
						}
						if (transcript?.prompts?.length){
							div.c("flow", () => transcript.prompts.forEach(pr => {
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
