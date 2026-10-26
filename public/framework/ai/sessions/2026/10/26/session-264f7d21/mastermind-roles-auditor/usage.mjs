// node usage.mjs  — role spawns/spend (registry.json) and skill loads (skills.jsonl injected + "skill: X" log lines) since SINCE
import fs from "node:fs"; import path from "node:path";
const SINCE = process.argv[2] ?? "2026-10-12", L = process.env.LOCALAPPDATA + "/lew42/servex";
const reg = Object.values(JSON.parse(fs.readFileSync(L + "/registry.json")));
const roles = {};
for (const a of reg){ if ((a.started_at ?? "") < SINCE) continue; const r = roles[a.role] ??= { n: 0, usd: 0, model: {} };
	r.n++; r.usd += Number(a.cost?.usd ?? a.cost ?? 0) || 0; r.model[a.model] = (r.model[a.model] ?? 0) + 1; }
console.log("ROLE\tspawned\tusd\ttopModel");
for (const [k, v] of Object.entries(roles).sort((a, b) => b[1].n - a[1].n)) console.log(k, v.n, v.usd.toFixed(2), Object.entries(v.model).sort((a, b) => b[1] - a[1])[0]?.[0], sep());
function sep(){ return ""; }
const inj = {}, tot = { system: 0, message: 0, fallback: 0 };
for (const l of fs.readFileSync(L + "/logs/skills.jsonl", "utf8").split("\n").filter(Boolean)){ const j = JSON.parse(l); if (j.at < SINCE) continue;
	tot[j.where ?? "message"]++; if (j.fallback) tot.fallback++; for (const n of j.injected ?? []) inj[n] = (inj[n] ?? 0) + 1; }
console.log("\nINJECTED (by role row)", tot, inj);
const called = {};
(function walk(d){ for (const e of fs.readdirSync(d, { withFileTypes: true })){ const p = path.join(d, e.name);
	if (e.isDirectory()) walk(p); else if (/^(session|task)\.jsonl$/.test(e.name)){ for (const m of fs.readFileSync(p, "utf8").matchAll(/"msg":"skill: ([\w:-]+)"/g)) called[m[1]] = (called[m[1]] ?? 0) + 1; } } })("public/framework/ai/sessions/2026/10");
console.log("\nSKILL TOOL CALLS (logged)", called);
const have = fs.readdirSync(".claude/skills", { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
console.log("\nZERO use skills:", have.filter(s => !inj[s] && !called[s]).join(", "));
console.log("ZERO spawn roles in roles.js:", fs.readFileSync("Servex/agents/roles.js", "utf8").match(/^\t"?([\w-]+)"?:\s+\{/gm).map(x => x.trim().replace(/[":{\s]/g, "")).filter(r => !roles[r]).join(", "));
