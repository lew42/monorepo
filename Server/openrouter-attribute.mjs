#!/usr/bin/env node
// Server/openrouter-attribute.mjs — put OpenRouter's own per-call dollars onto the session snapshots.
//
//   node Server/openrouter-attribute.mjs [--repo <checkout>] [--log <openrouter.jsonl>] [--apply]
//
// Servex logs every OpenRouter call: %LOCALAPPDATA%/lew42/servex/logs/openrouter.jsonl, one row per turn with the agent's name, `cost_usd`
// and a `source`: "generation" (OpenRouter's exact figure for those calls), "reconcile" (an exact correction), or "key_diff" (the change in the
// whole KEY's spend during the turn: it also contains any other OpenRouter agent that ran at the same time, so it can overstate).
// Each snapshot already carries the agent's name (`agent`). A row joins the snapshot whose name matches; when one name has several sessions
// the row goes to the one that was running at the row's time (else the nearest). Per session the snapshot gets:
//   usd            the sum of its rows (every source), usd_source "openrouter"
//   usd_key_diff   the part of that sum that came from key_diff rows (the part that may include other agents)
// Rows whose agent has no snapshot are reported as unattributed, never dropped silently. Without --apply nothing is written.
// --apply patches the day composites (and a session's own index.json when it exists), rebuilds the month and year totals, and writes
// ai/sessions/openrouter-costs.json (machine state) with the totals, which Server/openrouter-reconcile.mjs and the page read.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const argv = process.argv.slice(2), val = n => argv.includes(n) ? argv[argv.indexOf(n) + 1] : undefined;
const REPO = path.resolve(val("--repo") ?? path.join(path.dirname(fileURLToPath(import.meta.url)), ".."));
const SESS = path.join(REPO, "public", "framework", "ai", "sessions");
const LOG = val("--log") ?? path.join(process.env.LOCALAPPDATA ?? "", "lew42", "servex", "logs", "openrouter.jsonl");
const r4 = n => Math.round(n * 1e4) / 1e4, r2 = n => Math.round(n * 100) / 100;
const numbered = (p, len) => { try { return fs.readdirSync(p).filter(n => n.length === len && /^[0-9]+$/.test(n)).sort(); } catch { return []; } };

export async function attribute({ apply = false } = {}){
	const rows = fs.readFileSync(LOG, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(r => r && typeof r.cost_usd === "number");
	const days = [];   // { file, doc }
	for (const y of numbered(SESS, 4)) for (const m of numbered(path.join(SESS, y), 2)) for (const d of numbered(path.join(SESS, y, m), 2)){
		const file = path.join(SESS, y, m, d, "index.json");
		try { days.push({ file, dir: path.dirname(file), doc: JSON.parse(fs.readFileSync(file, "utf8")) }); } catch {}
	}
	const by_agent = new Map();
	for (const day of days) for (const s of Object.values(day.doc.snapshots ?? {})) if (s.agent && s.provider === "openrouter"){
		if (!by_agent.has(s.agent)) by_agent.set(s.agent, []);
		by_agent.get(s.agent).push({ s, day });
	}
	const pick = (cands, at) => {
		if (cands.length === 1) return cands[0];
		const t = Date.parse(at), slack = 10 * 60 * 1000;
		const span = c => [Date.parse(c.s.first_at) - slack, Date.parse(c.s.last_activity) + slack];
		const inside = cands.filter(c => { const [a, b] = span(c); return t >= a && t <= b; });
		const pool = inside.length ? inside : cands;
		return pool.reduce((best, c) => Math.abs(Date.parse(c.s.last_activity) - t) < Math.abs(Date.parse(best.s.last_activity) - t) ? c : best);
	};
	const per = new Map(), lost = {}, by_source = {};
	let total = 0, unattributed = 0, first = null, last = null;
	for (const r of rows){
		total += r.cost_usd; by_source[r.source] = (by_source[r.source] ?? 0) + r.cost_usd;
		first = !first || r.at < first ? r.at : first; last = !last || r.at > last ? r.at : last;
		const cands = by_agent.get(r.agent);
		if (!cands){ unattributed += r.cost_usd; lost[r.agent] = (lost[r.agent] ?? 0) + r.cost_usd; continue; }
		const c = pick(cands, r.at), rec = per.get(c.s.id) ?? { ...c, usd: 0, key_diff: 0, rows: 0 };
		rec.usd += r.cost_usd; rec.rows++; if (r.source === "key_diff") rec.key_diff += r.cost_usd;
		per.set(c.s.id, rec);
	}
	let patched = 0;
	if (apply){
		const touched = new Set();
		for (const rec of per.values()){
			const s = rec.s, before = s.usd ?? 0, usd = r4(rec.usd);
			s.usd = usd; s.tree_usd = r4((s.tree_usd ?? before) - before + usd); s.usd_source = "openrouter"; s.usd_key_diff = r4(rec.key_diff);
			delete s.usd_estimate; touched.add(rec.day); patched++;
			const own = path.join(rec.day.dir, s.folder ?? s.id, "index.json");
			try { const o = JSON.parse(fs.readFileSync(own, "utf8")); Object.assign(o.snapshot ?? o, { usd, tree_usd: s.tree_usd, usd_source: "openrouter", usd_key_diff: s.usd_key_diff }); fs.writeFileSync(own, JSON.stringify(o)); } catch {}
		}
		for (const d of touched){
			const list = d.doc.snapshots; const all = Array.isArray(list) ? list : Object.values(list);
			d.doc.usd = r4(all.reduce((n, s) => n + (s.provider === "openrouter" ? 0 : s.usd || 0), 0));
			d.doc.usd_openrouter = r4(all.reduce((n, s) => n + (s.provider === "openrouter" ? s.usd || 0 : 0), 0));
			fs.writeFileSync(d.file, JSON.stringify(d.doc));
		}
		const mod = await import(path.join(REPO, "public", "framework", "ai", "AISession", "AISessionIndex.mjs").replace(/\\/g, "/").replace(/^/, "file:///"));
		(mod.AISessionIndex ?? mod.default).roll(SESS);
	}
	const out = {
		at: new Date().toISOString(), log_rows: rows.length, log_from: first, log_to: last,
		log_total_usd: r2(total), by_source: Object.fromEntries(Object.entries(by_source).map(([k, v]) => [k, r2(v)])),
		attributed_usd: r2(total - unattributed), unattributed_usd: r2(unattributed), sessions: per.size,
		key_diff_usd: r2([...per.values()].reduce((n, x) => n + x.key_diff, 0)),
		unattributed_agents: Object.fromEntries(Object.entries(lost).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, v]) => [k, r2(v)])), applied: apply, patched,
	};
	if (apply) fs.writeFileSync(path.join(SESS, "openrouter-costs.json"), JSON.stringify(out, null, 1));
	return out;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(await attribute({ apply: argv.includes("--apply") }), null, 1));
