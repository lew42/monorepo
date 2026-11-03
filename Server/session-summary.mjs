#!/usr/bin/env node
// Server/session-summary.mjs — ask a script, not a file: what did one Claude session cost?
//
//   node Server/session-summary.mjs <session-id|transcript-path>     update the cache, print the summary
//   node Server/session-summary.mjs <id> --audit                     recompute EVERYTHING from the raw file
//                                                                     (independent code path), compare to the
//                                                                     rolling totals, record the result
//   node Server/session-summary.mjs <id> --json                     the summary as JSON
//   node Server/session-summary.mjs --index [--days 30]              refresh every recent session's cache and
//                                                                     write sessions/session-index.json (the grid's one file)
//   node Server/session-summary.mjs --watch [seconds]                keep the index fresh (default 20 s), changed files only
//
// The work is done by public/framework/ai/AISession/AISession.js (same class the page uses).
// Cache: public/framework/ai/sessions/<id>/cache.jsonl (gitignored machine state); the record is <id>/session.jsonl (tracked). Docs: sessions/doc/ui/session-class.md
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import AISession from "../public/framework/ai/AISession/AISession.js";
import { find_transcript, subagent_files } from "../public/framework/ai/AISession/AISessionAudit.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const SESSIONS_DIR = path.join(here, "..", "public", "framework", "ai", "sessions");
const REGISTRY = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "registry.json");

export function registry_rows(){
	try { const j = JSON.parse(fs.readFileSync(REGISTRY, "utf8")); return Array.isArray(j) ? j : Object.values(j); } catch { return []; }
}

export function files_of(id, main_path){
	main_path ||= find_transcript(id);
	if (!main_path) return [];
	return [{ part: "main", path: main_path }, ...subagent_files(id)];
}

// Load the cache, read only the new bytes, save. The one entry point every caller uses.
export async function refresh(id, { registry = registry_rows(), main_path } = {}){
	const files = files_of(id, main_path);
	if (!files.length) return null;
	const session = (await AISession.load_cached(id)) ?? new AISession(id);
	const { new_lines } = await session.update(files);
	const reg = registry.find(r => r.session_id === id);
	session.set_configured(reg ? { model: reg.model, effort: reg.effort, parent: reg.parent, role: reg.role, agent: reg.id, cost: reg.cost, turns: reg.turns } : null);
	if (new_lines) await session.save();
	return { session, new_lines, files: files.length };
}

const fmt_ms = ms => { const m = Math.round(ms / 60000); return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`; };
const usd = n => "$" + n.toFixed(n >= 100 ? 0 : 2);

export function print_summary(session){
	const d = session.detail(), s = session.s;
	const out = [];
	out.push(`${d.id}   Claude ${usd(d.usd)}   ${d.model}   ${fmt_ms(d.wall_ms)} wall / ${fmt_ms(d.active_ms)} active   ${d.messages} messages, ${d.prompts} prompts`);
	out.push(`  cost: input ${usd(d.usd_parts.in)} · output ${usd(d.usd_parts.out)} · cache read ${usd(d.usd_parts.cache_read)} (${d.cache_read_pct}%) · cache write ${usd(d.usd_parts.cache_write)}`);
	out.push(`  tokens: in ${s.tokens.input} · out ${s.tokens.output} · cache read ${s.tokens.cache_read} · cache write 5m ${s.tokens.cache_write_5m} / 1h ${s.tokens.cache_write_1h}`);
	if (s.sidechain.messages) out.push(`  subagents (in the total): ${s.sidechain.messages} messages, ${usd(s.sidechain.usd)}`);
	out.push("  model + effort:  " + d.units.map(u => `${AISession.model_label(u.model)}·${u.effort ?? "?"} ${usd(u.usd)} (${u.n})`).join("  "));
	out.push("  tools: " + (d.tools.slice(0, 8).map(t => `${t.name} ${t.n}`).join(", ") || "none"));
	out.push("  tokens by purpose (estimate): " + d.purpose.map(p => `${p.key} ${p.pct}% ${usd(p.usd)}`).join(" · "));
	for (const f of d.flags) out.push("  ! " + f);
	return out.join("\n");
}

export async function run_audit(id, session){
	const result = await session.audit(id);
	await session.save_audit(result);
	return result;
}

export function print_audit(r){
	if (r.error) return "AUDIT FAILED: " + r.error;
	if (r.match) return `AUDIT ✓ match — rolling total $${r.old.usd} = recomputed $${r.new.usd} (${r.new.messages} messages)`;
	return "AUDIT ✗ MISMATCH\n" + Object.entries(r.diff).map(([k, v]) => `  ${k}: rolling ${v.rolling}, recomputed ${v.recomputed}, diff ${v.diff}`).join("\n");
}

// ---- the grid's one file ----------------------------------------------------------------------------
/** One grid row as the short array the index stores.  */
export function slim_of(r){
	const r4 = n => Math.round(n * 1e4) / 1e4;
	return [r4(r.usd), r4(r.tree_usd), r.children, Math.round(r.wall_ms), r.model === "unknown" ? 0 : r.model, r.effort ?? 0, r.flags, AISession.day(r.first_at) ?? 0, r.provider === "openrouter" ? "openrouter" : 0, Math.round(r.active_ms ?? 0)];
}

export async function build_index({ days = 30 } = {}){
	const registry = registry_rows(), cutoff = Date.now() - days * 86400000;
	const base = path.join(os.homedir(), ".claude", "projects");
	const ids = new Map();   // id -> transcript path
	for (const d of fs.readdirSync(base)){
		if (!/^c--code-lew42-/i.test(d)) continue;
		for (const f of fs.readdirSync(path.join(base, d))){
			if (!f.endsWith(".jsonl")) continue;
			const p = path.join(base, d, f);
			try { if (fs.statSync(p).mtimeMs >= cutoff) ids.set(f.slice(0, -6), p); } catch {}
		}
	}
	const rows = {};
	let new_lines = 0;
	for (const [id, p] of ids){
		const r = await refresh(id, { registry, main_path: p }).catch(() => null);
		if (!r) continue;
		new_lines += r.new_lines;
		const reg = registry.find(x => x.session_id === id);
		const pv = r.session.preview();
		rows[id] = { id, agent: reg?.id ?? null, role: reg?.role ?? null, parent: reg?.parent ?? null, usd: pv.usd, wall_ms: pv.wall_ms, active_ms: pv.active_ms,
			model: pv.model, provider: pv.provider, effort: pv.effort, flags: pv.flags.length, first_at: r.session.s.first_at, last_at: r.session.s.last_at };
	}
	// a registry parent is an AGENT id; the tree is keyed by session id
	const agent_to_session = new Map(registry.filter(r => r.session_id).map(r => [r.id, r.session_id]));
	// An echo agent is named echo-<first 8 of the owner chat session it serves>: that session is its parent.
	const by8 = new Map(Object.keys(rows).map(id => [id.slice(0, 8), id]));
	const echo_parent = r => { const m = /^echo-([0-9a-f]{8})$/.exec(r.agent || ""); const s = m && by8.get(m[1]); return s && s !== r.id ? s : null; };
	const tree_rows = Object.values(rows).map(r => ({ id: r.id, usd: r.usd, parent: r.parent ? agent_to_session.get(r.parent) : echo_parent(r) }));
	const roll = AISession.rollup(tree_rows);
	for (const r of Object.values(rows)){ const t = roll.get(r.id); r.tree_usd = t.tree_usd; r.children = t.children; r.kids = t.kids; r.parent = tree_rows.find(x => x.id === r.id).parent ?? null; }
	// Spawned agents (anything the registry knows with a session) whose parent was never recorded: a defect, counted.
	const spawned = registry.filter(r => r.session_id && ["minion", "reviewer", "clarity", "assistant", "manager"].includes(r.role));
	const unlinked = spawned.filter(r => !r.parent && !r.forked_from && !r.resumed_from).map(r => r.id);
	// The grid's file stays small: only sessions the grid can show (sessions.json rows + every registry session) plus anything
	// in their trees, nulls and zeros left out. The full set stays in each session's own session.jsonl.
	const want = new Set(registry.map(r => r.session_id).filter(Boolean));
	try { for (const r of JSON.parse(fs.readFileSync(path.join(SESSIONS_DIR, "sessions.json"), "utf8")).rows ?? []) want.add(r.session_id || r.id); } catch {}
	for (const id of [...want]) for (let up = rows[id]?.parent; up && rows[up] && !want.has(up); up = rows[up].parent) want.add(up);
	for (const id of Object.keys(rows)) if (rows[id].children && rows[id].tree_usd >= 0.01 && (want.has(rows[id].parent) || want.has(id))) want.add(id);
	// Grid file: one short array per session [own $, tree $, descendants, wall ms, model, effort, flags]. Tree file: only the
	// sessions that have a parent or children (names, roles, who is whose child) - loaded when a detail page opens.
	const slim = {}, tree = {}, closed = {}, meta = {}, r4 = n => Math.round(n * 1e4) / 1e4;
	for (const id of want){
		const r = rows[id]; if (!r) continue;
		// the hand-written record (tags, alerts, links, weight, closed) from the session's own tracked session.jsonl
		const rec = await AISession.record(id);
		if (rec.closed) closed[id] = rec.closed.at;
		if (rec.tags.length || rec.alerts || rec.links.length || rec.weight != null) meta[id] = { tags: rec.tags, alerts: rec.alerts, links: rec.links.slice(0, 3), weight: rec.weight };
		slim[id] = slim_of(r);
		if (r.parent || r.kids.length) tree[id] = { agent: r.agent ?? undefined, role: r.role ?? undefined, parent: r.parent ?? undefined, kids: r.kids.length ? r.kids : undefined };
	}
	// sessions that have a trace.json: the page asks for one only for these (a 404 is a smoke-test failure)
	const traces = Object.keys(slim).filter(id => fs.existsSync(path.join(fileURLToPath(AISession.dir_url(id, AISession.day(rows[id].first_at) ?? undefined)), "trace.json")));
	const index = { generated_at: new Date().toISOString(), days, traces, columns: ["usd", "tree_usd", "children", "wall_ms", "model", "effort", "flags", "day", "provider", "active_ms"], count: Object.keys(slim).length, scanned: Object.keys(rows).length, unlinked_spawned: unlinked.length, unlinked_sample: unlinked.slice(0, 5), closed, meta, rows: slim };
	fs.writeFileSync(path.join(SESSIONS_DIR, "session-tree.json"), JSON.stringify(tree));
	fs.writeFileSync(path.join(SESSIONS_DIR, "session-index.json"), JSON.stringify(index));
	return { ...index, rows: undefined, new_lines };
}

// ---- CLI ----------------------------------------------------------------------------------------------
const is_main = (() => { try { return path.resolve(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; } })();
if (is_main){
	const args = process.argv.slice(2);
	const flag = n => args.includes(n);
	const num = (n, d) => { const i = args.indexOf(n); return i >= 0 && Number(args[i + 1]) ? Number(args[i + 1]) : d; };
	if (flag("--log")){
		// node Server/session-summary.mjs --log <session-uuid> '<json line>' --by <author>
		const i = args.indexOf("--log"), id = args[i + 1], raw = args[i + 2], by = args.includes("--by") ? args[args.indexOf("--by") + 1] : null;
		try { console.log(JSON.stringify(await AISession.log(id, JSON.parse(raw), by))); }
		catch (e){ console.error("session-summary --log: " + e.message); process.exit(2); }
	} else if (flag("--close") || flag("--reopen")){
		const id = args.find(a => /^[0-9a-f-]{36}$/.test(a));
		if (!id){ console.error("usage: --close|--reopen <session-uuid> [--by name]"); process.exit(2); }
		const by = args.includes("--by") ? args[args.indexOf("--by") + 1] : "owner";
		console.log(JSON.stringify(await AISession.close(id, by, flag("--close"))));
	} else if (flag("--index")){
		const t0 = Date.now(), r = await build_index({ days: num("--days", 30) });
		console.log(`session-index: ${r.count} sessions, ${r.new_lines} new transcript lines read, ${r.unlinked_spawned} spawned agents with no recorded parent, ${Date.now() - t0} ms`);
	} else if (flag("--watch")){
		const secs = num("--watch", 20);
		for (;;){ const r = await build_index({ days: num("--days", 30) }).catch(e => ({ err: e.message })); console.log(new Date().toISOString(), r.err ?? `${r.count} sessions, ${r.new_lines} new lines`); await new Promise(res => setTimeout(res, secs * 1000)); }
	} else {
		const arg = args.find(a => !a.startsWith("--"));
		if (!arg){ console.error("usage: node Server/session-summary.mjs <session-id|transcript path> [--audit] [--json]  |  --index [--days N]  |  --watch [seconds]"); process.exit(2); }
		const isfile = fs.existsSync(arg) && arg.endsWith(".jsonl");
		const id = isfile ? path.basename(arg, ".jsonl") : arg;
		const r = await refresh(id, { main_path: isfile ? arg : undefined });
		if (!r){ console.error("session-summary: no transcript found for " + id); process.exit(1); }
		if (flag("--json")) console.log(JSON.stringify(r.session.detail(), null, 1));
		else console.log(print_summary(r.session) + `\n  (read ${r.new_lines} new lines from ${r.files} file${r.files > 1 ? "s" : ""})`);
		if (flag("--audit")){ const a = await run_audit(id, r.session); console.log(print_audit(a)); process.exit(a.match ? 0 : 3); }
	}
}
