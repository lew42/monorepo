#!/usr/bin/env node
// count.mjs — read-only: how filled are tags/nesting fields over the last 30 days. node count.mjs [days=30]
import fs from "node:fs"; import path from "node:path";
let ROOT = import.meta.dirname; while (path.basename(ROOT) !== "sessions") ROOT = path.dirname(ROOT); const N = +process.argv[2] || 30;
const ls = d => { try { return fs.readdirSync(d, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name); } catch { return []; } };
const cut = new Date(Date.now() - N * 864e5).toISOString().slice(0, 10).replaceAll("-", "/");
const filled = v => v != null && v !== "" && !(Array.isArray(v) && !v.length);
const T = { rows: 0, landed: 0, f: {} }, S = { rows: 0, f: {} }, bump = (o, k, v) => { o.f[k] ??= 0; if (filled(v)) o.f[k]++; };
const TF = ["kind", "parent_task", "after", "home", "module", "card", "tags", "model"], SF = ["tags", "parent", "agent", "title", "category", "core", "kind"];
const days = new Set(); const walk = (dir, depth, day) => {
	for (const n of ls(dir)) { const p = path.join(dir, n);
		if (fs.existsSync(path.join(p, "task.jsonl"))) {
			T.rows++; let first = null, landed = false;
			for (const l of fs.readFileSync(path.join(p, "task.jsonl"), "utf8").split("\n")) { if (!l.startsWith("{")) continue; let o; try { o = JSON.parse(l); } catch { continue; } if (!first && o.assign) first = o.assign; if (o.assign?.landed_at || o.landed_at) landed = true; }
			if (landed) T.landed++; for (const k of TF) bump(T, k, first?.[k]); }
		if (fs.existsSync(path.join(p, "index.json")) && /^session-|^[0-9a-f-]{36}$/.test(n)) {
			let s; try { s = JSON.parse(fs.readFileSync(path.join(p, "index.json"), "utf8")); } catch { continue; }
			S.rows++; for (const k of SF) bump(S, k, s[k]); if (s.parent && s.parent !== "sessions") S.nested = (S.nested ?? 0) + 1; if (s.tags?.length) { S.tagk ??= {}; for (const t of s.tags) { const k = String(t).split("/")[0]; S.tagk[k] = (S.tagk[k] ?? 0) + 1; } } }
		if (depth < 6 && !n.startsWith("session-") ) walk(p, depth + 1, day);   // task dirs nest inside session dirs
		else if (n.startsWith("session-")) walk(p, depth + 1, day);
	}
};
for (const y of ls(ROOT).filter(x => /^\d{4}$/.test(x))) for (const m of ls(path.join(ROOT, y))) for (const d of ls(path.join(ROOT, y, m)).filter(x => /^[0-9][0-9]$/.test(x))) { const k = `${y}/${m}/${d}`; if (k >= cut) { days.add(k); walk(path.join(ROOT, y, m, d), 0, k); } }
const pct = (a, n) => `${a}/${n} (${n ? Math.round(100 * a / n) : 0}%)`;
console.log(`window: ${[...days].sort()[0]} .. ${[...days].sort().at(-1)} (${days.size} day folders)`);
console.log(`\ntask.jsonl line-1 assign (${T.rows} tasks; landed anywhere: ${pct(T.landed, T.rows)})`); for (const k of TF) console.log(`  ${k.padEnd(12)} ${pct(T.f[k], T.rows)}`);
console.log(`\nsession index.json snapshots (${S.rows} sessions)`); for (const k of SF) console.log(`  ${k.padEnd(12)} ${pct(S.f[k], S.rows)}`);
console.log(`  parent not "sessions": ${pct(S.nested ?? 0, S.rows)}\n  tag prefixes: ${JSON.stringify(S.tagk ?? {})}`);
