#!/usr/bin/env node
// post-analysis.mjs — the owner's ask (2026-10-07): now that find_transcript() is fixed
// (reliable, see findings.md), look back over real history and say WHERE the money went
// and what could have been optimized. Reads Server/spend-tree.mjs's own spend-tree.json
// (regenerate first: `node Server/spend-tree.mjs`) plus every task.jsonl under
// public/framework/ai/ (for "did this spend ever land anything"). Writes
// post-analysis.md + post-analysis.json beside this script. Compute, don't recall.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../../../../");
const r2 = n => Math.round(n * 100) / 100;

const tree = JSON.parse(fs.readFileSync(path.join(ROOT, "public/framework/ai/sessions/spend-tree.json"), "utf8"));
const agents = tree.agents;

// ---- every task.jsonl under public/framework/ai/, so a root agent's $ can be checked
// against "did the task it was spawned for ever land" ----
function all_task_dirs(){
	const AI = path.join(ROOT, "public/framework/ai");
	const out = [];
	const walk = dir => {
		let entries; try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
		for (const e of entries){
			if (!e.isDirectory()) continue;
			const full = path.join(dir, e.name);
			if (fs.existsSync(path.join(full, "task.jsonl"))) out.push(full);
			else walk(full);
		}
	};
	walk(AI);
	return out;
}
const landed_roots = new Set(), open_roots = new Map();   // agent id -> task dir, for roots with no landed_at
for (const dir of all_task_dirs()){
	let agent = null, landed = false;
	for (const line of fs.readFileSync(path.join(dir, "task.jsonl"), "utf8").split(/\r?\n/)){
		if (!line.trim()) continue;
		let o; try { o = JSON.parse(line); } catch { continue; }
		if (o.assign?.agent) agent = o.assign.agent;
		if (o.assign?.landed_at) landed = true;
	}
	if (!agent) continue;
	if (landed) landed_roots.add(agent);
	else open_roots.set(agent, path.relative(ROOT, dir).replace(/\\/g, "/"));
}

// ---- 1. spend by day / model / role ----
const by_day = new Map(), by_model = new Map(), by_role = new Map();
const bump = (map, key, usd) => map.set(key, (map.get(key) ?? 0) + usd);
for (const a of agents){
	const usd = (a.own_claude_usd ?? 0) + (a.own_or_usd ?? 0);
	if (!usd) continue;
	const day = (a.started_at ?? "").slice(0, 10) || "unknown";
	bump(by_day, day, usd);
	bump(by_model, a.model ?? "unknown", usd);
	bump(by_role, a.role ?? "unknown", usd);
}

// ---- 2. Opus/Fable spent on MINION-tier work (policy says minions build on Sonnet;
// Opus/Fable without a stated reason is the house rule this flags against) ----
const EXPENSIVE = /opus|fable/i;
const minion_on_expensive = agents.filter(a => a.role === "minion" && EXPENSIVE.test(a.model ?? "") && (a.own_claude_usd ?? 0) > 0)
	.sort((a, b) => b.own_claude_usd - a.own_claude_usd);
const minion_on_expensive_usd = r2(minion_on_expensive.reduce((n, a) => n + a.own_claude_usd, 0));

// ---- 3. "long window" candidates: high cache_read_pct (mostly re-reading itself) AND
// real $ (small sessions always read a high % cache of a tiny base; only worth flagging
// once real money is behind it) ----
const long_windows = agents.filter(a => (a.cache_read_pct ?? 0) > 70 && (a.own_claude_usd ?? 0) > 15)
	.sort((a, b) => b.own_claude_usd - a.own_claude_usd);
const long_windows_usd = r2(long_windows.reduce((n, a) => n + a.own_claude_usd, 0));

// ---- 4. stopped-in-flight waste: a ROOT agent (mastermind/task-mastermind) that spent
// real money but whose task never landed (checked against task.jsonl, not guessed) ----
const abandoned = agents.filter(a => open_roots.has(a.id) && (a.own_claude_usd ?? 0) > 5)
	.map(a => ({ ...a, task_dir: open_roots.get(a.id) }))
	.sort((a, b) => b.subtree_claude_usd - a.subtree_claude_usd);
const abandoned_usd = r2(abandoned.reduce((n, a) => n + a.subtree_claude_usd, 0));

const result = {
	generated_at: new Date().toISOString(),
	totals: { claude_usd: r2(tree.totals?.claude_usd ?? agents.reduce((n, a) => n + (a.own_claude_usd ?? 0), 0)) },
	by_day: [...by_day.entries()].sort().map(([day, usd]) => ({ day, usd: r2(usd) })),
	by_model: [...by_model.entries()].sort((a, b) => b[1] - a[1]).map(([model, usd]) => ({ model, usd: r2(usd) })),
	by_role: [...by_role.entries()].sort((a, b) => b[1] - a[1]).map(([role, usd]) => ({ role, usd: r2(usd) })),
	minion_on_expensive_model: { total_usd: minion_on_expensive_usd, count: minion_on_expensive.length,
		top: minion_on_expensive.slice(0, 10).map(a => ({ id: a.id, model: a.model, usd: r2(a.own_claude_usd) })) },
	long_windows: { total_usd: long_windows_usd, count: long_windows.length,
		top: long_windows.slice(0, 10).map(a => ({ id: a.id, role: a.role, cache_read_pct: a.cache_read_pct, usd: r2(a.own_claude_usd) })) },
	abandoned_spend: { total_subtree_usd: abandoned_usd, count: abandoned.length,
		top: abandoned.slice(0, 10).map(a => ({ id: a.id, task_dir: a.task_dir, own_usd: r2(a.own_claude_usd), subtree_usd: r2(a.subtree_claude_usd) })) },
};

fs.writeFileSync(path.join(HERE, "post-analysis.json"), JSON.stringify(result, null, 2));

const md = [];
md.push("# Post-analysis — where the money went, and what could have been optimized");
md.push(`\nGenerated ${result.generated_at}. Source: \`spend-tree.json\` (regenerate it first: \`node Server/spend-tree.mjs\`), cross-checked against every \`task.jsonl\`.`);
md.push(`\nTotal Claude $, all agents ever registered: **$${result.totals.claude_usd}**`);
md.push("\n## By day (top 10)");
for (const d of [...result.by_day].sort((a, b) => b.usd - a.usd).slice(0, 10)) md.push(`- ${d.day}: $${d.usd}`);
md.push("\n## By model");
for (const m of result.by_model) md.push(`- ${m.model}: $${m.usd}`);
md.push("\n## By role");
for (const r of result.by_role) md.push(`- ${r.role}: $${r.usd}`);
md.push(`\n## Opus/Fable spent on minion-tier work: $${result.minion_on_expensive_model.total_usd} across ${result.minion_on_expensive_model.count} minions`);
md.push("Policy is Sonnet-by-default for minions; every one of these is a minion that ran on Opus/Fable instead, no stated reason recorded on the agent itself:");
for (const a of result.minion_on_expensive_model.top) md.push(`- ${a.id} (${a.model}): $${a.usd}`);
md.push(`\n## "Long window" candidates: $${result.long_windows.total_usd} across ${result.long_windows.count} agents`);
md.push("Over 70% of their own $ was cache-read (re-reading old context) AND over $15 real money behind it — the session-freshness finding's own signature, now applied as a filter:");
for (const a of result.long_windows.top) md.push(`- ${a.id} (${a.role}): ${a.cache_read_pct}% cache-read, $${a.usd}`);
md.push(`\n## Stopped-in-flight waste: $${result.abandoned_spend.total_subtree_usd} subtree $ across ${result.abandoned_spend.count} roots whose task never landed`);
md.push("A task-mastermind/mastermind that spent real money (own $ > $5) whose own task.jsonl never got a `landed_at` line — checked against the real file, not guessed (a task genuinely still open today will show here too; read the task dir before assuming it was abandoned):");
for (const a of result.abandoned_spend.top) md.push(`- ${a.id}: own $${a.own_usd}, subtree $${a.subtree_usd} — ${a.task_dir}`);

fs.writeFileSync(path.join(HERE, "post-analysis.md"), md.join("\n") + "\n");
console.log(md.join("\n"));
