// task-cost.mjs — the dollar cost of a task: its Servex root agent plus every agent it spawned.
// Appends one `assign` line with `cost_usd` to the task's task.jsonl (only when the figure changed).
// Read the doc first: Server/doc/task-cost.md
//
// usage:
//   node Server/task-cost.mjs <task-dir>            one task (path to its dir)
//   node Server/task-cost.mjs --date 2026-09-24     every task dir of that day
//   node Server/task-cost.mjs --agent <agent-id>    every task (last 7 days) whose root is this agent or an
//                                                   ancestor of it — Servex calls this after a result; quiet
//   --dry            print the table, append nothing
//   --root <repo>    the repo whose public/framework/ai/ holds the tasks (default: this script's repo)
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdtempSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const SERVEX = join(process.env.LOCALAPPDATA || "", "lew42", "servex");

// ---- arguments ----
const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const dry = args.includes("--dry"); if (dry) args.splice(args.indexOf("--dry"), 1);
const date = flag("--date");
const agent = flag("--agent");
const root = resolve(flag("--root") || join(here, ".."));
const AI = join(root, "public", "framework", "ai");
if (!date && !agent && !args[0]) { console.error("usage: node Server/task-cost.mjs <task-dir> | --date YYYY-MM-DD | --agent <id>  [--dry] [--root <repo>]"); process.exit(2); }

// ---- reading ----
const lines = file => existsSync(file)
	? readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
	: [];

// Every task dir in the ai/ tree (dated dirs only), with its line-1 assign.
function allTasks(){
	const out = [];
	for (const d of readdirSync(AI, { withFileTypes: true })) {
		if (!d.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(d.name)) continue;
		for (const t of readdirSync(join(AI, d.name), { withFileTypes: true })) {
			if (!t.isDirectory()) continue;
			const dir = join(AI, d.name, t.name);
			if (existsSync(join(dir, "task.jsonl"))) out.push(dir);
		}
	}
	return out;
}
const taskKey = dir => `${basename(dirname(dir))}/${basename(dir)}`;

// ---- the registry ----
const registry = JSON.parse(readFileSync(join(SERVEX, "registry.json"), "utf8"));
const rows = Array.isArray(registry) ? registry : Object.entries(registry).map(([id, r]) => ({ id, ...r }));
const byId = new Map(rows.map(r => [r.id, r]));
const children = new Map();
for (const r of rows) if (r.parent) (children.get(r.parent) || children.set(r.parent, []).get(r.parent)).push(r.id);

// Line 1's session_id → the registry row with that session_id; else line 1's tab === row id.
function rootOf(dir){
	let first = {};
	try { first = JSON.parse(readFileSync(join(dir, "task.jsonl"), "utf8").replace(/^\uFEFF/, "").split(/\r?\n/, 1)[0]).assign || {}; } catch {}
	const row = (first.session_id && rows.find(r => r.session_id === first.session_id)) || (first.tab && byId.get(first.tab));
	return { root: row?.id || null, requested_at: first.requested_at || "" };
}

// The root plus every descendant (parent links), each once.
function tree(id){
	const seen = new Set(), stack = [id];
	while (stack.length) { const a = stack.pop(); if (seen.has(a)) continue; seen.add(a); stack.push(...(children.get(a) || [])); }
	return [...seen];
}
function ancestors(id){
	const out = [], seen = new Set();
	let p = byId.get(id)?.parent;
	while (p && !seen.has(p)) { out.push(p); seen.add(p); p = byId.get(p)?.parent; }
	return out;
}

// An agent's cost. A result line's `cost` is the RUNNING total of one process, so the last value
// is the cost — unless a value drops, which means the process restarted: bank what came before.
function agentCost(id){
	// A result line seen twice (same time, same cost — a replay) counts once; a resumed session
	// whose total CONTINUES just keeps growing, so it is never banked twice.
	// No billed result line (none, or only a $0 stop marker) = nothing billed yet: null (NOT MEASURED), never 0.
	let banked = 0, last = 0, any = false;
	const seen = new Set();
	for (const o of lines(join(SERVEX, "logs", `agent-${id}.jsonl`))) {
		if (o.type !== "result" || typeof o.cost !== "number") continue;
		const k = `${o.at}|${o.cost}`;
		if (seen.has(k)) continue;
		seen.add(k);
		// A stop marker (`stopped`, 0 turns, $0) is not a measurement: recipe-lab's only result line.
		if (o.cost > 0 || o.turns > 0) any = true;
		if (o.cost < last) banked += last;
		last = o.cost;
	}
	return any ? banked + last : null;
}

// ---- which task already counts this one (parent_task) ----
// Another task whose root is an ANCESTOR of mine already includes me. Two tasks with the SAME root:
// the earlier (by line-1 requested_at, then key) owns it; the later points at it.
const mapped = allTasks().map(dir => ({ dir, key: taskKey(dir), ...rootOf(dir) })).filter(t => t.root);
function parentTask(me){
	const same = mapped.filter(t => t.root === me.root && t.key !== me.key)
		.filter(t => t.requested_at < me.requested_at || (t.requested_at === me.requested_at && t.key < me.key))
		.sort((a, b) => a.requested_at.localeCompare(b.requested_at) || a.key.localeCompare(b.key));
	if (same.length) return same[0].key;
	for (const a of ancestors(me.root)) {
		const hit = mapped.filter(t => t.root === a).sort((x, y) => x.requested_at.localeCompare(y.requested_at) || x.key.localeCompare(y.key))[0];
		if (hit) return hit.key;
	}
	return null;
}

const r2 = n => Math.round(n * 100) / 100, r4 = n => Math.round(n * 10000) / 10000;

function cost(dir){
	const me = { dir, key: taskKey(dir), ...rootOf(dir) };
	if (!me.root) return { key: me.key, tracked: false };
	const ids = tree(me.root);
	const each = ids.map(agentCost);
	// A tree with no result line anywhere has billed nothing yet: not measured, never $0.
	if (each.every(c => c === null)) return { key: me.key, dir, tracked: false, unmeasured: true, root: me.root };
	const own = agentCost(me.root) ?? 0;
	const total = each.reduce((s, c) => s + (c ?? 0), 0);
	return {
		key: me.key, dir, tracked: true,
		cost_usd: r4(total),
		cost: { root: me.root, agents: ids.length, own_usd: r2(own), minions_usd: r2(total - own),
			parent_task: parentTask(me), open: ids.filter(id => byId.get(id)?.state !== "stopped").length, at: "NOW" },
	};
}

// The figure the task already carries (later assign lines win).
function current(dir){
	const merged = {};
	for (const o of lines(join(dir, "task.jsonl"))) if (o.assign) Object.assign(merged, o.assign);
	return merged;
}

function append(c){
	const was = current(c.dir);
	if (was.cost_usd === c.cost_usd && was.cost?.open === c.cost.open && was.cost?.parent_task === c.cost.parent_task) return "unchanged";
	const tmp = join(mkdtempSync(join(tmpdir(), "task-cost-")), "line.json");
	writeFileSync(tmp, JSON.stringify([{ assign: { cost_usd: c.cost_usd, cost: c.cost } }]));
	execFileSync(process.execPath, [join(root, ".claude", "hooks", "append.mjs"), join(c.dir, "task.jsonl"), tmp], { stdio: "pipe", windowsHide: true });
	return "appended";
}

// A tree that billed nothing writes no figure. If an earlier run wrote $0 for it, clear that
// once with nulls, so the board falls back to "not tracked" (ext/AITask/cost.js: non-number).
function clearZero(c){
	if (typeof current(c.dir).cost_usd !== "number") return "not measured";
	const tmp = join(mkdtempSync(join(tmpdir(), "task-cost-")), "line.json");
	writeFileSync(tmp, JSON.stringify([{ assign: { cost_usd: null, cost: null } }]));
	execFileSync(process.execPath, [join(root, ".claude", "hooks", "append.mjs"), join(c.dir, "task.jsonl"), tmp], { stdio: "pipe", windowsHide: true });
	return "cleared";
}

// ---- run ----
function recentDirs(days){
	const since = new Date(Date.now() - days * 864e5).toISOString().slice(0, 10);
	return allTasks().filter(d => basename(dirname(d)) >= since);
}
if (agent && !byId.has(agent)) { console.error(`task-cost: unknown agent ${agent} — nothing to do`); process.exit(0); }
const dirs = agent
	? (() => { const chain = new Set([agent, ...ancestors(agent)]); return recentDirs(7).filter(d => chain.has(rootOf(d).root)); })()
	: date
	? (existsSync(join(AI, date)) ? readdirSync(join(AI, date), { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join(AI, date, d.name, "task.jsonl"))).map(d => join(AI, date, d.name)) : [])
	: [resolve(args[0])];

const $ = n => "$" + n.toFixed(2);
const table = [["task", "root", "agents", "own", "minions", "total", "open", "parent_task", "action"]];
for (const dir of dirs) {
	let c;
	try { c = cost(dir); } catch (e) { if (agent) { console.error(`task-cost: ${taskKey(dir)}: ${e.message}`); continue; } throw e; }
	if (c.unmeasured) { table.push([c.key, c.root, "", "", "", "not measured", "", "", dry ? (typeof current(c.dir).cost_usd === "number" ? "dry: would clear" : "dry") : clearZero(c)]); continue; }
	if (!c.tracked) { table.push([c.key, "not tracked", "", "", "", "", "", "", ""]); continue; }
	const action = dry ? "dry" : append(c);
	table.push([c.key, c.cost.root, String(c.cost.agents), $(c.cost.own_usd), $(c.cost.minions_usd), $(c.cost_usd), String(c.cost.open), c.cost.parent_task || "", action]);
}
if (agent && !dry) process.exit(0); // quiet on success
const w = table[0].map((_, i) => Math.max(...table.map(r => r[i].length)));
for (const r of table) console.log(r.map((v, i) => v.padEnd(w[i])).join("  ").trimEnd());
