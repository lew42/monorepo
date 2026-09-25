// task-cost.mjs — the dollar cost of a task: its share of its Servex root agent's time, plus every
// agent that root spawned while the task was open.
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
// The window: line 1's `requested_at` → the last `landed_at` (none yet = still open).
function rootOf(dir){
	let first = {}, landed = "";
	const all = lines(join(dir, "task.jsonl"));
	first = all[0]?.assign || {};
	for (const o of all) if (o.assign?.landed_at) landed = o.assign.landed_at;
	const row = (first.session_id && rows.find(r => r.session_id === first.session_id)) || (first.tab && byId.get(first.tab));
	return { root: row?.id || null, requested_at: first.requested_at || "", landed_at: landed || null };
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

// An agent's spend, as the steps its result lines record: `[{ t, usd }]`. A result line's
// `cost` is the RUNNING total of one process, so each step is the rise since the line before —
// unless a value drops, which means the process restarted and began again at 0, so the whole
// new value is the step (the old "banking").
// A result line seen twice (same time, same cost — a replay) counts once; a resumed session
// whose total CONTINUES just keeps growing, so it is never counted twice.
// No billed result line (none, or only a $0 stop marker) = nothing billed yet: null (NOT MEASURED), never 0.
const stepsCache = new Map();
function agentSteps(id){
	if (stepsCache.has(id)) return stepsCache.get(id);
	let last = 0, any = false;
	const seen = new Set(), steps = [];
	for (const o of lines(join(SERVEX, "logs", `agent-${id}.jsonl`))) {
		if (o.type !== "result" || typeof o.cost !== "number") continue;
		const k = `${o.at}|${o.cost}`;
		if (seen.has(k)) continue;
		seen.add(k);
		// A stop marker (`stopped`, 0 turns, $0) is not a measurement: recipe-lab's only result line.
		if (o.cost > 0 || o.turns > 0) any = true;
		const usd = o.cost < last ? o.cost : o.cost - last;
		last = o.cost;
		// Dated by when the TURN STARTED, not when its result line was written: an agent writes
		// `landed_at` and only then ends its turn, so the end time falls just after the window it paid for.
		if (usd > 0) steps.push({ t: Date.parse(o.at) - (o.duration_ms || 0), usd });
	}
	const out = any ? steps : null;
	stepsCache.set(id, out);
	return out;
}
const agentCost = id => { const s = agentSteps(id); return s ? s.reduce((n, x) => n + x.usd, 0) : null; };

// ---- which task owns a moment of a root's time ----
// Every task that shares a root splits that root's time, so each dollar lands in exactly one
// task (Server/doc/task-cost.md, "One agent, several tasks: split by time"). At moment t:
//   1. a task OPEN at t (requested_at <= t < landed_at, or not landed yet) — the latest-started
//      one if several are open;
//   2. else the NEXT task to start: the reading and the brief before a task's line 1 is written
//      are that task's work, and a log opened at landing (requested_at = landed_at) still gets
//      the work that led up to it;
//   3. else, after every task has landed, the last one to land (its wrap-up).
const mapped = allTasks().map(dir => ({ dir, key: taskKey(dir), ...rootOf(dir) })).filter(t => t.root)
	.map(t => ({ ...t, s: Date.parse(t.requested_at) || 0, e: t.landed_at ? Date.parse(t.landed_at) : Infinity }));
const tasksOf = root => mapped.filter(t => t.root === root);
function owner(root, t){
	const list = tasksOf(root);
	if (!list.length) return null;
	const later = (a, b) => (b.s - a.s) || b.key.localeCompare(a.key);
	const open = list.filter(x => x.s <= t && t < x.e).sort(later);
	if (open.length) return open[0];
	const next = list.filter(x => x.s >= t).sort((a, b) => (a.s - b.s) || a.key.localeCompare(b.key));
	if (next.length) return next[0];
	return [...list].sort((a, b) => (b.e - a.e) || later(a, b))[0];
}

// When an agent was spawned (its registry `started_at`), in ms.
const bornAt = id => Date.parse(byId.get(id)?.started_at || "") || 0;

// ---- a true sub-tree: `parent_task` ----
// A task whose root was SPAWNED by another task's root is already inside that task's figure:
// `parent_task` names the task that was open on the ancestor when this branch was spawned.
// Two tasks on the SAME root no longer get it — they split the root by time instead.
function parentTask(me){
	let child = me.root;
	for (const a of ancestors(me.root)) {
		if (tasksOf(a).length) return owner(a, bornAt(child))?.key ?? null;
		child = a;
	}
	return null;
}

const r2 = n => Math.round(n * 100) / 100, r4 = n => Math.round(n * 10000) / 10000;
const closed = id => /^(stopped|gone)$/.test(byId.get(id)?.state || "stopped");

function cost(dir){
	const me = mapped.find(t => t.dir === dir) ?? { dir, key: taskKey(dir), ...rootOf(dir) };
	if (!me.root) return { key: me.key, tracked: false };
	const mine = t => owner(me.root, t)?.key === me.key;

	// The root: only the steps that fall in this task's share of its time.
	const rootSteps = agentSteps(me.root);
	const own = rootSteps ? rootSteps.filter(x => mine(x.t)).reduce((n, x) => n + x.usd, 0) : null;

	// Its minions: each branch under the root goes WHOLE to the task open when it was spawned.
	const branch = [];
	for (const c of children.get(me.root) || []) if (mine(bornAt(c))) branch.push(...tree(c));

	const row = id => byId.get(id) ?? {};
	const agents = [
		{ id: me.root, model: row(me.root).model ?? null, role: row(me.root).role ?? "root", usd: own == null ? null : r4(own) },
		...branch.map(id => { const u = agentCost(id); return { id, model: row(id).model ?? null, role: row(id).role ?? null, usd: u == null ? null : r4(u) }; })
			.sort((a, b) => (b.usd ?? -1) - (a.usd ?? -1)),
	];
	// A tree with no result line anywhere has billed nothing yet: not measured, never $0.
	if (agents.every(a => a.usd === null)) return { key: me.key, dir, tracked: false, unmeasured: true, root: me.root };
	const minions = agents.slice(1).reduce((n, a) => n + (a.usd ?? 0), 0);
	// Can still grow: a minion that has not stopped, or the root while this task owns its "now".
	const open = agents.slice(1).filter(a => !closed(a.id)).length + (!closed(me.root) && mine(Date.now()) ? 1 : 0);
	return {
		key: me.key, dir, tracked: true,
		cost_usd: r4((own ?? 0) + minions),
		cost: { root: me.root, agents, own_usd: r2(own ?? 0), minions_usd: r2(minions),
			parent_task: parentTask(me), open,
			window: { from: me.requested_at || null, to: me.landed_at || null }, at: "NOW" },
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
	if (was.cost_usd === c.cost_usd && was.cost?.open === c.cost.open && was.cost?.parent_task === c.cost.parent_task
		&& JSON.stringify(was.cost?.agents) === JSON.stringify(c.cost.agents)) return "unchanged";
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
	table.push([c.key, c.cost.root, String(c.cost.agents.length), $(c.cost.own_usd), $(c.cost.minions_usd), $(c.cost_usd), String(c.cost.open), c.cost.parent_task || "", action]);
}
if (agent && !dry) process.exit(0); // quiet on success
const w = table[0].map((_, i) => Math.max(...table.map(r => r[i].length)));
for (const r of table) console.log(r.map((v, i) => v.padEnd(w[i])).join("  ").trimEnd());
