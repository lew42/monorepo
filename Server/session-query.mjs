#!/usr/bin/env node
// Server/session-query.mjs — find past sessions the way the Sessions dashboard does, and say what they cost.
// Doc: public/framework/ai/sessions/doc/data/record-spec.md ("Asking about past sessions")
//
//   node Server/session-query.mjs --tag transcription --since 2026-10-01 --json
//   node Server/session-query.mjs --system dictation --since 2026-10-02 --sort cost
//
// It reads the same files the dashboard reads: the day composites `sessions/YYYY/MM/DD/index.json` (live or closed), one snapshot per session.
// A session is counted once, on the day of its last activity. Rows are capped (default 25) so an answer never floods a caller's context;
// the totals always cover EVERY match, not only the rows shown.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(here, "..", "public", "framework", "ai", "sessions");
const r2 = n => Math.round(n * 100) / 100;
const list = v => v == null || v === "" ? [] : (Array.isArray(v) ? v : String(v).split(",")).map(s => String(s).trim()).filter(Boolean);
const day_of = s => String(s.last_activity ?? s.first_at ?? "").slice(0, 10);

/** Every snapshot in `root`, folded by id (the later last_activity wins). */
export function load_all(root = ROOT){
	const dirs = (p, width) => { try { return fs.readdirSync(p, { withFileTypes: true }).filter(d => d.isDirectory() && new RegExp(`^\\d{${width}}$`).test(d.name)).map(d => d.name).sort(); } catch { return []; } };
	const by = new Map();
	for (const y of dirs(root, 4)) for (const m of dirs(path.join(root, y), 2)) for (const d of dirs(path.join(root, y, m), 2)){
		let day; try { day = JSON.parse(fs.readFileSync(path.join(root, y, m, d, "index.json"), "utf8")); } catch { continue; }
		for (const s of day.snapshots ?? []){ const old = by.get(s.id); if (!old || String(s.last_activity) >= String(old.last_activity)) by.set(s.id, s); }
	}
	return [...by.values()];
}

/** query({ since, until, tags, system, state, model, provider, parent, min_cost, text, sort, limit }) -> { count, shown, usd, claude_usd, openrouter_usd, rows }.
 *  since/until: YYYY-MM-DD (inclusive, the UTC day of last activity). tags: all must be present. system: a core module (`ext/Dictate`, or any prefix of it) or a task category.
 *  model/provider/state: exact words (model also matches a part, e.g. `opus`). parent: a parent session id. min_cost: dollars. text: a part of a tag, id, agent, category or module.
 *  sort: `recent` (default), `oldest` or `cost`. limit: rows returned, default 25, at most 200. */
export function query(args = {}, { root = ROOT, snapshots } = {}){
	const tags = list(args.tags ?? args.tag), system = args.system ? String(args.system).toLowerCase() : null, text = args.text ? String(args.text).toLowerCase() : null;
	const min = Number(args.min_cost ?? 0) || 0, limit = Math.min(200, Math.max(0, Number(args.limit ?? 25)));
	const hit = s => {
		const day = day_of(s);
		if (args.since && day < args.since) return false;
		if (args.until && day > args.until) return false;
		if (tags.length && !tags.every(t => (s.tags ?? []).includes(t))) return false;
		if (system && !(s.core ?? []).some(c => c.toLowerCase().includes(system)) && !String(s.category ?? "").toLowerCase().includes(system)) return false;
		if (args.state && s.state !== args.state) return false;
		if (args.model && !String(s.model ?? "").toLowerCase().includes(String(args.model).toLowerCase())) return false;
		if (args.provider && s.provider !== args.provider) return false;
		if (args.parent && s.parent !== args.parent) return false;
		if (min && !((s.usd ?? 0) >= min)) return false;
		if (text && ![s.id, s.agent, s.category, ...(s.tags ?? []), ...(s.core ?? [])].some(v => String(v ?? "").toLowerCase().includes(text))) return false;
		return true;
	};
	const found = (snapshots ?? load_all(root)).filter(hit);
	const sorts = { cost: (a, b) => (b.usd ?? 0) - (a.usd ?? 0), oldest: (a, b) => String(a.last_activity).localeCompare(String(b.last_activity)), recent: (a, b) => String(b.last_activity).localeCompare(String(a.last_activity)) };
	found.sort(sorts[args.sort] ?? sorts.recent);
	// Claude sessions are priced at API-equivalent rates (what the plan saves, not money spent); OpenRouter sessions are real dollars.
	const claude = found.filter(s => s.provider === "claude" || !s.provider), router = found.filter(s => s.provider && s.provider !== "claude");
	const sum = l => r2(l.reduce((n, s) => n + (s.usd || 0), 0));
	return {
		count: found.length, shown: Math.min(limit, found.length),
		claude_api_equivalent_usd: sum(claude), openrouter_real_usd: sum(router),
		rows: found.slice(0, limit).map(s => ({ id: s.id, day: day_of(s), state: s.state, model: s.model, provider: s.provider, usd: r2(s.usd || 0), tags: s.tags ?? [], category: s.category ?? null, core: s.core ?? [], parent: s.parent ?? null, agent: s.agent ?? null }))
	};
}

/** Plain text for a human or a model that did not ask for --json. */
export function format(result){
	const lines = [`${result.count} session(s) matched; Claude API-equivalent $${result.claude_api_equivalent_usd}, OpenRouter real $${result.openrouter_real_usd}${result.count > result.shown ? `; showing the first ${result.shown}` : ""}`];
	for (const r of result.rows) lines.push(`${r.day}  $${String(r.usd).padStart(7)}  ${String(r.model ?? "").padEnd(18)} ${r.id}  ${[r.category, ...r.tags].filter(Boolean).join(", ")}${r.core.length ? "  [" + r.core.join(" ") + "]" : ""}`);
	return lines.join("\n");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
	const args = {}, argv = process.argv.slice(2);
	let json = false;
	for (let i = 0; i < argv.length; i++){
		const a = argv[i];
		if (a === "--json") json = true;
		else if (a === "--help" || a === "-h"){ console.log("usage: node Server/session-query.mjs [--since YYYY-MM-DD] [--until YYYY-MM-DD] [--tag a,b] [--system module|category] [--state active|idle|closed] [--model part] [--provider claude|openrouter] [--parent id] [--min-cost usd] [--text word] [--sort recent|oldest|cost] [--limit 25] [--json]"); process.exit(0); }
		else if (a.startsWith("--")){ args[a.slice(2).replaceAll("-", "_")] = argv[++i]; }
	}
	const result = query(args);
	console.log(json ? JSON.stringify(result) : format(result));
}
