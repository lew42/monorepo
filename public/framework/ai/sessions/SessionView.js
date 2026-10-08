// SessionView — draws what the Session class computed (Session.js) on the Sessions page.
// Two small pieces: the grid's cost cell (one line per number that matters) and the detail section
// (tree, model + effort, tokens by purpose, tools, audit button). It computes nothing: the numbers
// come from sessions/session-index.json (the grid, one small file) and GET /ai-logs/<id>/session
// (the detail, served by Server/plugins/AILogs.js from the cached session.jsonl).
// Docs: doc/session-class.md
import { div, span, small, p, a } from "/app.js";

const usd = n => "$" + (n >= 100 ? n.toFixed(0) : n.toFixed(2));
export function runtime(ms){
	if (!(ms > 0)) return "—";
	const m = Math.round(ms / 60000);
	return m < 1 ? "<1m" : m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
}

// ---- the grid ------------------------------------------------------------------------------------
export async function load_index(root_url){
	try { const r = await fetch(root_url + "session-index.json", { cache: "no-store" }); return r.ok ? await r.json() : null; } catch { return null; }
}

// The grid file keeps one short array per session (see Server/session-summary.mjs); this reads it as an object.
export function row_of(index, id){
	const v = index?.rows?.[id];
	if (!v) return null;
	return { id, usd: v[0], tree_usd: v[1], children: v[2], wall_ms: v[3], model: v[4] || null, effort: v[5] || null, flags: v[6] };
}
export async function load_tree(root_url){
	try { const r = await fetch(root_url + "session-tree.json", { cache: "no-store" }); return r.ok ? await r.json() : {}; } catch { return {}; }
}

// Inside the Cost cell: Claude $ for the whole tree, what the session itself cost, how long it ran, and the model that really ran.
export function cost_lines(row, index){
	if (!row) return;
	const kids = row.children || 0;
	span.c("sessions-cost-main").text("Claude " + usd(row.tree_usd ?? row.usd))
		.attr("title", kids ? `This session ${usd(row.usd)} + ${kids} descendant${kids > 1 ? "s" : ""} ${usd(row.tree_usd - row.usd)}` : "This session, counted from its own transcript");
	if (kids) small.c("muted sessions-subtree-note", `own ${usd(row.usd)} + ${kids} child${kids > 1 ? "ren" : ""}`);
	if (row.flags) small.c("sessions-flag").text("⚠ " + row.flags + " flag" + (row.flags > 1 ? "s" : "")).attr("title", "Open the session to read the flags");
}

// The one-line banner above the grid: spawned agents with no recorded parent are a defect.
export function defect_line(index){
	if (!index?.unlinked_spawned) return;
	small.c("muted").text(`${index.unlinked_spawned} spawned agents have no recorded parent`)
		.attr("title", "Not in any tree, so their cost is counted on its own. Examples: " + (index.unlinked_sample || []).join(", "));
}

// ---- the detail ----------------------------------------------------------------------------------
async function get(url, init){ try { const r = await fetch(url, init); return r.ok ? await r.json() : null; } catch { return null; } }

function tree_rows(index, tree, id, depth = 0){
	const row = row_of(index, id), t = tree[id] || {};
	if (!row) return;
	div.c("sessions-tree-row flex gap-50 v-center").style("padding-inline-start", depth * 1.5 + "em").append(() => {
		const label = t.agent || id.slice(0, 8);
		a(label).href("../" + (t.agent || id) + "/");
		small.c("muted", `${t.role ?? ""} ${row.model ?? ""}${row.effort ? " · " + row.effort : ""}`);
		span.c("sessions-tree-usd").text(usd(row.usd) + (row.children ? " own · " + usd(row.tree_usd) + " with children" : ""));
	});
	for (const kid of t.kids || []) tree_rows(index, tree, kid, depth + 1);
}

function audit_result(r){
	if (!r) return "audit unavailable (the dev server route is not running)";
	if (r.error) return "audit failed: " + r.error;
	if (r.match) return `✓ match — rolling $${r.old.usd.toFixed(4)} = recomputed $${r.new.usd.toFixed(4)} from ${r.new.messages} messages`;
	return "✗ MISMATCH — " + Object.entries(r.diff).map(([k, v]) => `${k}: rolling ${v.rolling}, recomputed ${v.recomputed} (off ${v.diff})`).join("; ");
}

// Fill `$el` with the detail section for one Claude session id. `index` is the grid's session-index (for the tree).
export function detail_section($el, id, index, tree = {}){
	$el.empty(() => small.c("muted", "Loading the Session class numbers…"));
	get(`/ai-logs/${id}/session`).then(d => {
		$el.empty(() => {
			if (!d){ p.c("muted", "No Session numbers for this id — it has no Claude transcript, or the dev-server route (GET /ai-logs/<id>/session) is not running."); return; }
			const mine = row_of(index, id);
			div.c("sessions-detail-head flex gap-50 v-center", () => {
				span.c("sessions-row-title").text("Claude " + usd(mine?.tree_usd ?? d.usd));
				small.c("muted", `own ${usd(d.usd)} · ${runtime(d.wall_ms)} wall, ${runtime(d.active_ms)} active · ${d.messages} messages, ${d.prompts} prompts · ${d.cache_read_pct}% of the $ is cache reads`);
			});
			// model + effort: the unit that prices a session
			div.c("flow", () => {
				small.c("muted", "Models that ran (from the session file, version included) · effort");
				d.units.forEach(u => div.c("flex gap-50 v-center", () => {
					span(`${u.model} · ${u.effort ?? "effort unknown"}`);
					small.c("muted", `${usd(u.usd)} · ${u.n} messages`);
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
			// audit
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
