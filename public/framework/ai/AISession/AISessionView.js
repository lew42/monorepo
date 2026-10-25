import { View, div, span, small, p, a } from "/app.js";
import { age } from "/framework/core/Page/ext/Inbox/Inbox.js";
import { dur, elapsed } from "/framework/ai/AITask/stats.js";
import AISessionRows from "./AISessionRows.js";
import AISession from "./AISession.js";
import AISessionFlags from "./AISessionFlags.js";
import AISessionResume from "./AISessionResume.js";
import AICost from "/framework/ai/AITask/AICost.js";

// One session, drawn. `new AISessionView({ row, url, ... })` is one grid row (an <a> of cells, in the order of
// AISessionRows.COLUMNS: the grid tracks are positional). The statics draw the pieces the Session class computed
// (AISession.js): the Cost cell, the banner above the grid, and the detail section. It computes nothing; the numbers come
// from session-index.json (the grid) and GET /ai-logs/<id>/session (the detail, served by Server/plugins/AILogs.js).
// Docs: doc/session-class.md
//
// Options: row (a merged row), url (the tab's url), page_dirs, spend, session_index, and an optional
// nest = { depth, kids, open, toggle } (how deep the row sits, how many children, whether they show, the click).
export default class AISessionView extends View {

	// Getters, not class fields: prerender() runs inside View's constructor, before a subclass's fields exist.
	get tag(){ return this.card ? "div" : "a"; }   // `card`: drawn inside a rail card, which is the link
	get classes(){ return this.card ? "sessions-card" : "sessions-row"; }

	prerender(){
		super.prerender();
		if (!this.card) this.href(AISession.page_url(this.row.session_id || this.row.id, this.url + this.row.id + "/"));   // one url per session: its dated folder (the id url redirects there)
	}

	// Subscribes to this row's Session: a delta from the live feed redraws THIS row and no other (doc/realtime.md).
	initialize(){
		super.initialize();
		const ses = AISession.all.get(this.row.session_id || this.row.id);
		if (ses?.subs) this.unsubscribe = ses.subscribe(() => this.changed(ses));
	}

	/** A row whose element left the page (the grid was redrawn) quietly drops its subscription instead of leaking it. */
	changed(ses){
		if (!this.el.isConnected) return void this.unsubscribe?.();
		AISessionRows.apply_live(this.row, ses);
		this.empty(() => this.render());
	}

	render(){
		if (this.card) return this.render_card();
		const { row: r, nest } = this, { SOURCE, WORKING_STATES, is_in_flight, display_name, role_label, row_of } = AISessionRows;
		const src = SOURCE[r.source] ?? { label: r.source, icon: "help" };
		const working = WORKING_STATES.has(r.state);

		div.c("sessions-cell", () => AISessionView.state_dot(r));

		const name = display_name(r, AISessionRows.tree);
		div.c("sessions-cell", () => div.c("sessions-name-stack", () => {
			span.c("sessions-row-title").style(nest?.depth ? { paddingInlineStart: nest.depth * 1.5 + "em" } : {}).append(() => {
				if (nest?.kids) span.c("sessions-fold").attr("role", "button").attr("tabindex", "0").attr("title", nest.open ? "Hide the sessions this one started" : "Show the sessions this one started")
					.text((nest.open ? "▾ " : "▸ ") + nest.kids).on("click", e => { e.preventDefault(); e.stopPropagation(); nest.toggle(); });
				span(name.text);
				if (name.agent && name.agent !== name.text) small.c("sessions-row-agent muted").attr("title", "Registered name (register_session)").text(" · " + name.agent);
				AISessionView.flag_tags(r);   // red tags, inline on the title line so a row never changes height
			});
			const touched = AISession.all.get(r.session_id || r.id)?.ix;   // what it spent on: the modules it edited and how many files (from its own Edit/Write calls, or the task audit)
			if (touched?.core?.length) small.c("sessions-row-core muted").attr("title", (touched.files ? touched.files + " files edited · " : "") + "modules: " + touched.core.join(", ")).text(touched.core.join(" · ") + (touched.files ? " · " + touched.files + " files" : ""));
			if (r.last_prompt_first_line && name.from !== "prompt") small.c("sessions-row-prompt muted").attr("title", r.last_prompt_first_line).text(r.last_prompt_first_line.slice(0, 80));
		}));

		div.c("sessions-cell", () => {
			// The session index is the truth for a Claude session's cost. A row it does not know keeps the older figures below.
			const ix = row_of(this.session_index, r.session_id || r.id);
			if (ix){ div.c("sessions-name-stack", () => AISessionView.cost_lines(ix, r)); return; }
			const has_split = typeof r.cost_claude_usd === "number" || typeof r.cost_openrouter_usd === "number";
			if (has_split){
				if (typeof r.cost_claude_usd === "number") small.c("muted", "$" + r.cost_claude_usd.toFixed(2));
				if (typeof r.cost_openrouter_usd === "number") div.c("sessions-cost-or flex gap-35 v-center", () => {
					span.c("sessions-tag sessions-tag-or", "OR");
					small.c("muted", "$" + r.cost_openrouter_usd.toFixed(2));
				});
			} else if (typeof r.cost === "number") {
				small.c("muted", "$" + r.cost.toFixed(2));
			} else small.c("muted", "—").attr("title", "cost not measured: this session is not in the session index yet");
			// the whole subtree's $ on a second line, only when it adds up to more than the row's own
			const node = this.spend?.by_id.get(r.id);
			if (node?.children_count > 0){
				const subtree = node.subtree_claude_usd + node.subtree_or_usd;
				const own = (node.own_claude_usd ?? 0) + (node.own_or_usd ?? 0);
				if (subtree > own + 0.004) small.c("muted sessions-subtree-note", `$${subtree.toFixed(2)} w/ ${node.descendant_count}`);
			}
		});

		div.c("sessions-cell", () => small.c("muted").text(working ? "now" : (r.last_activity ? age(r.last_activity) : "—")).attr("title", r.last_activity ?? ""));
		div.c("sessions-cell", () => small.c("muted", dur(AISessionRows.span_ms(r))));
		div.c("sessions-cell", () => { if (r.role) { const { label: text, title } = role_label(r.role); small.c("muted").attr("title", title).text(text); } { const f = AISessionFlags.of(r); if (f?.last){ const { tier, why } = AISessionResume.tier(f), t = AISessionResume.TIERS[tier]; span.c("sessions-tag sessions-tier sessions-tier-" + tier, t.label).attr("title", t.title + " (" + why + ")"); } } if (AISessionFlags.is_mastermind(r)) span.c("sessions-tag sessions-tag-mm", "mastermind").attr("title", "A mastermind: it registered as one in Servex, or its first prompt loads the mastermind skill."); });
		div.c("sessions-cell", () => span.c("sessions-tag sessions-tag-" + r.source, src.label));
		// Plain `if`s, not `&&`: a cell callback's return value can end up rendered as a stray text node (a `false` once printed "false").
		div.c("sessions-cell", () => { const m = row_of(this.session_index, r.session_id || r.id)?.model || r.model; if (m) small.c("muted", m); });   // the latest turn's model, not the configured one
	}

	/** State first: a blinking ▶ while working, a filled dot when alive and waiting, a quiet dot otherwise. */
	static state_dot(r){
		if (!r.state) return;
		const { WORKING_STATES, is_in_flight } = AISessionRows, working = WORKING_STATES.has(r.state), ready = !working && is_in_flight(r);
		span.c("sessions-state-dot sessions-state-dot-" + (working ? "working" : ready ? "ready" : "idle")).attr("title", r.state + (working ? "" : ready ? " (alive, waiting for work)" : " (not working right now)")).text(working ? "▶" : ready ? "●" : "•");
	}

	/** The rail card (the grid's `card` hook): a snapshot of one session in three lines. Redraws itself on a live change, like a row. */
	render_card(){
		const { row: r } = this, { WORKING_STATES, display_name, role_label, row_of, SOURCE } = AISessionRows, { usd, state_dot, flag_tags } = AISessionView;
		const working = WORKING_STATES.has(r.state), name = display_name(r, AISessionRows.tree);
		div.c("sessions-card-line", () => {
			state_dot(r);
			span.c("sessions-row-title", name.text);
			flag_tags(r);
		});
		div.c("sessions-card-line muted", () => {
			const ix = row_of(this.session_index, r.session_id || r.id);
			const cost = ix ? null : typeof r.cost_claude_usd === "number" ? usd(r.cost_claude_usd) : typeof r.cost === "number" ? usd(r.cost) : "—";
			if (ix) AISessionView.cost_parts(ix, r, true); else small(cost);
			if (ix?.flags) small.c("sessions-flag").text("⚠ " + ix.flags).attr("title", "Open the session to read the flags");
			small("· " + (working ? "updated now" : r.last_activity ? "updated " + age(r.last_activity) : "—")).attr("title", r.last_activity ?? "");
		});
		small.c("muted sessions-card-line", [r.role && role_label(r.role).label, (SOURCE[r.source] ?? { label: r.source }).label, row_of(this.session_index, r.session_id || r.id)?.model || r.model].filter(Boolean).join(" · "));
	}

	/** One small red tag per flag that applies to the row (AISessionFlags). */
	static flag_tags(r){
		for (const k of AISessionFlags.flags_of(r)){ const f = AISessionFlags.FLAGS[k]; span.c("sessions-redflag", f.label).attr("title", f.title); }
	}

	// ---- the pieces ----------------------------------------------------------------------------------

	static usd(n){ return "$" + (n >= 100 ? n.toFixed(0) : n.toFixed(2)); }

	static runtime(ms){
		if (!(ms > 0)) return "—";
		const m = Math.round(ms / 60000);
		return m < 1 ? "<1m" : m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
	}

	/** "Claude $1.20" for a Claude session; just "$1.20" for OpenRouter (its model name already says who it is). */
	static provider_label(provider){ return provider === "openrouter" ? "" : "Claude "; }

	/** Inside the Cost cell: the one cost line (AICost.cost_line), in the same words as the session page's Cost tile: what the session
	 *  itself spent, labelled "this tab" or "this session", then what it and every agent it started spent. The list never asks Servex
	 *  for every row: "with children" shows an answer already here (the session page was open), else a small button asks for this one row. */
	static cost_lines(ix, r){
		if (!ix) return;
		AISessionView.cost_parts(ix, r);
		if (ix.flags) small.c("sessions-flag").text("⚠ " + ix.flags + " flag" + (ix.flags > 1 ? "s" : "")).attr("title", "Open the session to read the flags");
	}

	/** The cost line's parts, for the grid row (three stacked lines) and the rail card (`card`: one line). "with children" is the answer
	 *  already here, else, for a session that may have children (a tab, a mastermind, a tree with children), a button that asks for this one. */
	static cost_parts(ix, r, card = false){
		const { provider_label } = AISessionView, tab = AICost.is_tab(r), base = AICost.session_url(ix.id);
		const line = AICost.cost_line({ cost: AICost.known_cost(base), own_usd: ix.usd, tab });
		if (card) small(line.mine);
		else { span.c("sessions-cost-main").text(provider_label(ix.provider) + AICost.short(line.own ?? 0)).attr("title", "What this session itself spent, counted from its own transcript"); small.c("muted", line.who); }
		const note = "muted sessions-subtree-note" + (card ? " sessions-card-kids" : "");
		const sep = () => { if (card) small(" · "); };   // the card is one line: a dot only before a part that is drawn
		if (line.total != null){ sep(); return small.c(note, line.with_kids); }
		if (!(tab || ix.children || AISessionFlags.is_mastermind(r ?? {}))) return;
		sep();
		const $b = small.c(note + " sessions-cost-ask", line.with_kids).attr("title", "Ask Servex what this session and every agent it started spent");
		$b.on("click", e => {
			e.stopPropagation(); e.preventDefault(); $b.text("asking …");
			AICost.summary(base).then(({ summary, why }) => summary?.cost ? $b.text(AICost.cost_line({ cost: summary.cost, tab: AICost.is_tab(r, summary) }).with_kids) : $b.text("not known").attr("title", why ?? ""));
		});
	}

	/** The banner above the grid: spawned agents with no recorded parent are a defect. */
	static defect_line(index){
		if (!index?.unlinked_spawned) return;
		small.c("muted").text(`${index.unlinked_spawned} spawned agents have no recorded parent`)
			.attr("title", "Not in any tree, so their cost is counted on its own. Examples: " + (index.unlinked_sample || []).join(", "));
	}

	// ---- the detail ----------------------------------------------------------------------------------

	static async get(url, init){ try { const r = await fetch(url, init); return r.ok ? await r.json() : null; } catch { return null; } }

	static tree_rows(index, tree, id, depth = 0){
		const { usd, tree_rows } = AISessionView, row = AISessionRows.row_of(index, id), t = tree[id] || {};
		if (!row) return;
		div.c("sessions-tree-row flex gap-50 v-center").style("padding-inline-start", depth * 1.5 + "em").append(() => {
			const label = t.agent || id.slice(0, 8);
			a(label).href(AISession.page_url(id, AISession.root_url().pathname + (t.agent || id) + "/"));
			small.c("muted", `${t.role ?? ""} ${row.model ?? ""}${row.effort ? " · " + row.effort : ""}`);
			span.c("sessions-tree-usd").text(usd(row.usd) + (row.children ? " own · " + usd(row.tree_usd) + " with children" : ""));
		});
		for (const kid of t.kids || []) tree_rows(index, tree, kid, depth + 1);
	}

	static audit_result(r){
		if (!r) return "audit unavailable (the dev server route is not running)";
		if (r.error) return "audit failed: " + r.error;
		if (r.match) return `✓ match — rolling $${r.old.usd.toFixed(4)} = recomputed $${r.new.usd.toFixed(4)} from ${r.new.messages} messages`;
		return "✗ MISMATCH — " + Object.entries(r.diff).map(([k, v]) => `${k}: rolling ${v.rolling}, recomputed ${v.recomputed} (off ${v.diff})`).join("; ");
	}

	/** Fill `$el` with the detail section for one Claude session id. `index` is the grid's session-index (for the tree). */
	static detail_section($el, id, index, tree = {}){
		const { usd, runtime, provider_label, get, tree_rows, audit_result } = AISessionView;
		$el.empty(() => small.c("muted", "Loading the Session class numbers…"));
		get(`/ai-logs/${id}/session`).then(d => {
			$el.empty(() => {
				if (!d){ p.c("muted", "No Session numbers for this id — it has no Claude transcript, or the dev-server route (GET /ai-logs/<id>/session) is not running."); return; }
				const mine = AISessionRows.row_of(index, id);
				div.c("sessions-summary flex gap-50 wrap", () => {
					span.c("sessions-summary-cost").text(provider_label(d.provider) + usd(mine?.tree_usd ?? d.usd));
					small.c("muted", `own ${usd(d.usd)} · ${runtime(d.wall_ms)} wall, ${runtime(d.active_ms)} active · ${d.messages} ${d.provider === "openrouter" ? "turns" : "messages"}, ${d.prompts} prompts${d.provider === "openrouter" ? " · cost and turns from the Servex registry (OpenRouter)" : ` · ${d.cache_read_pct}% of the $ is cache reads`}`);
				});
				// model + effort: the unit that prices a session
				div.c("flow", () => {
					small.c("muted", "Models that ran (from the session file, version included) · effort");
					d.units.forEach(u => div.c("flex gap-50 v-center", () => {
						span(`${u.model} · ${u.effort ?? "effort unknown"}`);
						small.c("muted", d.provider === "openrouter" ? `${u.n} messages` : `${usd(u.usd)} · ${u.n} messages`);
					}));
					const c = d.configured;
					if (c?.model || c?.effort) small.c("muted", `Servex registry says: ${c.model ?? "?"} · ${c.effort ?? "?"}`);
					else small.c("muted", "No Servex spawn record, so the configured model and effort cannot be compared (a VS Code or CLI session).");
				});
				if (d.flags?.length) div.c("flow", () => d.flags.forEach(f => small.c("sessions-flag").text("⚠ " + f)));
				// the tree: parent = own + children, visibly
				if (mine?.children) div.c("flow", () => {
					small.c("muted", `Tree: ${usd(mine.tree_usd)} = own ${usd(mine.usd)} + ${mine.children} descendant${mine.children > 1 ? "s" : ""}`);
					tree_rows(index, tree, id);
				});
				// tokens by purpose
				div.c("flow", () => {
					small.c("muted", "What the tokens were for (an estimate, see the method)");
					d.purpose.forEach(r => div.c("sessions-purpose-row flex gap-50 v-center", () => {
						span.c("sessions-purpose-label").text(r.label);
						span.c("sessions-purpose-bar").style("--pct", Math.min(100, r.pct) + "%");
						small.c("muted", `${r.pct}% · ${r.tokens.toLocaleString()} tok · ${usd(r.usd)}`);
					}));
					small.c("muted sessions-method").text(d.method);
				});
				if (d.tools.length) small.c("muted").text("Tools: " + d.tools.slice(0, 12).map(t => `${t.name} ${t.n}`).join(", "));
				// lifecycle: "done, rubber stamp". Appends a stamped `closed` line (nothing is deleted); the table hides it by default.
				div.c("sessions-audit flex gap-50 v-center", () => {
					const $st = small.c("muted");
					let is_closed = !!index?.closed?.[id];
					const show = () => { $st.text(is_closed ? "closed — hidden from the table unless 'show closed' is ticked" : "open"); $b.text(is_closed ? "Reopen" : "Close (done)"); };
					const $b = span.c("sessions-audit-btn").attr("role", "button").attr("tabindex", "0")
						.attr("title", "Mark this session done. It drops out of the default table and stops being chased. Nothing is deleted.")
						.click(async () => {
							const r = await get(`/ai-logs/${id}/close${is_closed ? "?undo=1" : ""}`, { method: "POST" });
							if (r && !r.error){ is_closed = !is_closed; if (index?.closed){ if (is_closed) index.closed[id] = r.at; else delete index.closed[id]; } show(); }
							else $st.text("could not save (the dev server route is not running)");
						})
						.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); e.target.click(); } });
					show();
				});
				div.c("sessions-audit flex gap-50 v-center", () => {
					const $out = small.c("sessions-audit-result muted");
					const last = d.audit;
					$out.text(last ? `last audit ${last.match ? "✓ match" : "✗ mismatch"} at ${last.at}` : "never audited");
					span.c("sessions-audit-btn").text("Audit").attr("role", "button").attr("tabindex", "0")
						.attr("title", "Recompute everything from the raw transcript by an independent code path and compare")
						.click(async () => {
							$out.text("auditing…");
							const r = await get(`/ai-logs/${id}/audit`, { method: "POST" });
							$out.text(audit_result(r?.audit)).attr("class", "sessions-audit-result " + (r?.audit?.match ? "sessions-audit-ok" : "sessions-flag"));
						})
						.on("keydown", e => { if (e.key === "Enter" || e.key === " "){ e.preventDefault(); e.target.click(); } });
				});
			});
		});
	}
}

AISession.View = AISessionView;   // so a Session can draw itself: session.render() (AISession.js)
