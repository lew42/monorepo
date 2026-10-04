// Server/spend-tree.mjs — who spawned whom, why, and what it cost, nested.
// The owner's ask (public/framework/ai/2026-10-03/spend-tree/requirements.md):
// "we should be able to see how and why all the minions are spawned... nest the costs...
// the agent that spawns a bunch of sub agents probably has a bunch of token consumption
// of its own... broken down by Claude dollars and OpenRouter dollars."
//
// Walks EVERY agent Servex has ever registered (not just task roots) and works out:
//   - its spawner (registry `parent`; reconstructed from task.jsonl when null; else "unknown")
//   - its trigger tag (best-effort: owner prompt, task, review gate, clarity,
//     heartbeat/revive, assistant, dispatcher, echo)
//   - its own $ (Claude $ or real $, split by whether its model has a "/" — OpenRouter)
//   - its subtree $ (own + every descendant, same split)
//
// Reuses the exact rule Server/task-cost.mjs already uses for one agent's own $ — "a
// result line's cost is a running total; a drop means the process restarted and banked
// the old total" (Server/doc/task-cost.md) — same algorithm, a different grain:
// task-cost.mjs allocates a ROOT's time across the TASKS that root ran one after another;
// this never splits by time, it just walks the whole spawn tree, agent by agent, because
// the question here is "how and why was EVERY agent spawned", not "which task paid for it".
//
// usage:
//   node Server/spend-tree.mjs             writes public/framework/ai/sessions/spend-tree.json
//   node Server/spend-tree.mjs --dry       prints the top spenders, writes nothing
//   node Server/spend-tree.mjs --root <repo>
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const SERVEX = join(process.env.LOCALAPPDATA || "", "lew42", "servex");

const args = process.argv.slice(2);
const flag = name => { const i = args.indexOf(name); if (i < 0) return null; const v = args[i + 1]; args.splice(i, 2); return v; };
const dry = args.includes("--dry"); if (dry) args.splice(args.indexOf("--dry"), 1);
const root = resolve(flag("--root") || join(here, ".."));
const AI = join(root, "public", "framework", "ai");

const readJson = file => existsSync(file) ? JSON.parse(readFileSync(file, "utf8").replace(/^﻿/, "")) : null;
const readJsonl = file => existsSync(file)
	? readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim())
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
	: [];

// ---- the registry: every agent Servex has ever started ----
const registryRaw = readJson(join(SERVEX, "registry.json")) || {};
const rows = Array.isArray(registryRaw) ? registryRaw : Object.entries(registryRaw).map(([id, r]) => ({ id, ...r }));
const byId = new Map(rows.map(r => [r.id, r]));

// ---- every task dir, and its LATEST cost line (task-cost.mjs already wrote this: the
// root agent, parent_task, and every agent in that task's tree with its OWN $) ----
function allTaskDirs(){
	const out = [];
	if (!existsSync(AI)) return out;
	for (const d of readdirSync(AI, { withFileTypes: true })) {
		if (!d.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(d.name)) continue;
		const day = join(AI, d.name);
		for (const t of readdirSync(day, { withFileTypes: true })) {
			if (!t.isDirectory()) continue;
			const dir = join(day, t.name);
			if (existsSync(join(dir, "task.jsonl"))) out.push(dir);
			// one level of sub-task dirs (minion briefs, part2-*, etc.) also carry their own task.jsonl
			for (const sub of readdirSync(dir, { withFileTypes: true })) {
				if (!sub.isDirectory()) continue;
				const subdir = join(dir, sub.name);
				if (existsSync(join(subdir, "task.jsonl"))) out.push(subdir);
			}
		}
	}
	return out;
}
const taskKey = dir => dir.slice(AI.length + 1).replace(/\\/g, "/");

const tasks = allTaskDirs().map(dir => {
	const lines = readJsonl(join(dir, "task.jsonl"));
	const first = lines[0]?.assign || {};
	let lastCost = null;
	for (const o of lines) if (o.assign?.cost) lastCost = o.assign.cost;
	return { dir, key: taskKey(dir), first, cost: lastCost };
});
// task key (its OWN dir slug, e.g. "spend-tree") -> task record, for the name-match
// reconstruction below (a reviewer/clarity agent's own `name` often repeats its task's slug).
const taskBySlug = new Map(tasks.map(t => [basename(t.dir), t]));
// agent id -> the task record that lists it in `cost.agents` (own_usd already computed there)
const taskOfAgent = new Map();
// ⚠ before 2026-09-24 `cost.agents` was a plain COUNT, not a list (Server/doc/task-cost.md) —
// skip those, there is nothing to index.
for (const t of tasks) for (const a of (Array.isArray(t.cost?.agents) ? t.cost.agents : [])) if (!taskOfAgent.has(a.id)) taskOfAgent.set(a.id, t);
// task key -> its root agent id (from the cost line, the one source of truth for "who was root")
const rootOfTaskKey = new Map(tasks.filter(t => t.cost?.root).map(t => [t.key, t.cost.root]));

// ---- own $ per agent, straight from its own log — the task-cost.mjs rule, reused verbatim ----
// One pass over an agent's own log reads BOTH signals this script needs from it — its own
// $ (the task-cost.mjs rule: a `result` line's `cost` is a running total; a drop means the
// process restarted and banked the old total, Server/doc/task-cost.md) and whether this
// agent's run was ITSELF a heartbeat wake. The signal: the very FIRST line recorded under
// this id is an `agent_msg` from `"servex-heartbeat"` — not just any mention of it anywhere
// in the log. A plain "any mention" match was tried first and over-fired badly: almost
// every long-running mastermind gets ONE routine heartbeat status-check mid-session (that's
// supervision, not why it exists) — every real example checked (task-mastermind-one-dictation,
// mastermind-page, task-mastermind-inbox-ext, mastermind-ai-3) opened with `"from":"host"` or
// a plain process-start, a real brief or a plain resume, and only picked up a heartbeat ping
// later. Line 1 is the one place "this session's reason for being is the heartbeat" is true.
const RESULT_LINE = /"type":"result"/;
const logCache = new Map();
function readAgentLog(id){
	if (logCache.has(id)) return logCache.get(id);
	const file = join(SERVEX, "logs", `agent-${id}.jsonl`);
	let usd = null, heartbeat = false;
	if (existsSync(file)) {
		const text = readFileSync(file, "utf8");
		const nl = text.indexOf("\n");
		const firstLine = nl < 0 ? text : text.slice(0, nl);
		try { heartbeat = JSON.parse(firstLine)?.from === "servex-heartbeat"; } catch { /* leave false */ }
		let last = 0, any = false, total = 0;
		const seen = new Set();
		for (const line of text.split(/\r?\n/)) {
			if (!RESULT_LINE.test(line)) continue;
			let o; try { o = JSON.parse(line); } catch { continue; }
			if (o.type !== "result" || typeof o.cost !== "number") continue;
			const k = `${o.at}|${o.cost}`;
			if (seen.has(k)) continue;
			seen.add(k);
			if (o.cost > 0 || o.turns > 0) any = true;
			total += o.cost < last ? o.cost : o.cost - last;
			last = o.cost;
		}
		usd = any ? total : null;
	}
	// Fall back to the already-computed per-agent figure a task's own cost line carries
	// (covers an agent whose log rotated/aged off disk but whose $ was captured earlier).
	if (usd === null) {
		const t = taskOfAgent.get(id);
		const hit = t?.cost?.agents?.find(a => a.id === id);
		if (typeof hit?.usd === "number") usd = hit.usd;
	}
	const out = { usd, heartbeat };
	logCache.set(id, out);
	return out;
}
const ownUsd = id => readAgentLog(id).usd;
const wasHeartbeatChecked = id => readAgentLog(id).heartbeat;

const isOpenRouter = model => typeof model === "string" && model.includes("/");

// ---- reconstruct a spawner for a null-parent row ----
// Priority: 1) registry's own `parent` (now written going forward by mastermind-servex-10);
// 2) this agent's OWN task's `parent_task` → that parent task's root agent (a task-mastermind
// spawned by another task-mastermind); 3) a task that LISTS this id in its cost.agents and
// isn't itself (a minion spawned inside a task, whose own registry parent was never recorded);
// 4) a reviewer/clarity/checker whose own `name` repeats a task's slug (review.mjs and the
// clarity skill both name the agent after the task they're checking); 5) "unknown".
function reconstructParent(row){
	if (row.parent) return { parent: row.parent, source: "registry" };
	const myTask = taskOfAgent.get(row.id); // the task (if any) this id is ROOT of, or listed in
	const isRootOfMyTask = myTask && rootOfTaskKey.get(myTask.key) === row.id;
	if (isRootOfMyTask && myTask.cost?.parent_task) {
		const parentRoot = rootOfTaskKey.get(myTask.cost.parent_task);
		if (parentRoot && parentRoot !== row.id) return { parent: parentRoot, source: "reconstructed: parent_task" };
	}
	if (myTask && rootOfTaskKey.get(myTask.key) && rootOfTaskKey.get(myTask.key) !== row.id) {
		return { parent: rootOfTaskKey.get(myTask.key), source: "reconstructed: task.cost.agents" };
	}
	if (/^(reviewer|clarity|checker)/.test(row.role || "")) {
		const slugGuess = taskBySlug.get(row.name) || taskBySlug.get((row.name || "").replace(/-\d+$/, ""));
		const rootGuess = slugGuess && rootOfTaskKey.get(slugGuess.key);
		if (rootGuess && rootGuess !== row.id) return { parent: rootGuess, source: "reconstructed: name matches task slug" };
	}
	return { parent: null, source: "unknown" };
}

// ---- trigger tag: best-effort, computed from role + reconstruction, never hand-guessed
// per agent — see doc/spend-tree.md for exactly what each tag means and its false-negative
// rate. The fixed set the owner asked for: owner prompt, task, review gate, clarity,
// heartbeat/revive, assistant, echo — plus "dispatcher" for the one routing agent itself. ----
function triggerOf(row, parentInfo){
	const role = row.role || "";
	if (role === "echo") return "echo";
	if (role === "clarity") return "clarity";
	if (/^(reviewer|checker)$/.test(role)) return "review gate";
	if (/^(assistant|card-assistant|card-manager|master-assistant)$/.test(role)) return "assistant";
	if (role === "dispatcher") return "dispatcher";
	if (wasHeartbeatChecked(row.id)) return "heartbeat/revive";
	if (parentInfo.source === "unknown" && /^(mastermind)$/.test(role)) return "owner prompt"; // a root mastermind with no spawner at all — the owner's own prompt started it
	return "task"; // task-mastermind, minion, agent, helper, fixer, voter, expert*, session-fast/smart, undefined role
}

// ---- build the tree ----
const nodes = new Map();
for (const row of rows) {
	const { parent, source } = reconstructParent(row);
	const own = ownUsd(row.id);
	nodes.set(row.id, {
		id: row.id, role: row.role || null, model: row.model || null, name: row.name || null,
		started_at: row.started_at || null, state: row.state || null,
		parent, parent_source: source,
		own_claude_usd: own === null ? null : (isOpenRouter(row.model) ? 0 : own),
		own_or_usd: own === null ? null : (isOpenRouter(row.model) ? own : 0),
	});
}
for (const n of nodes.values()) n.trigger = triggerOf(byId.get(n.id), { source: n.parent_source });

// parent -> children, guarding against a cycle (none expected, but reconstruction is a
// heuristic and a bad guess could loop) and against a parent id that was never registered.
const childrenOf = new Map();
for (const n of nodes.values()) {
	if (!n.parent || !nodes.has(n.parent) || n.parent === n.id) continue;
	(childrenOf.get(n.parent) ?? childrenOf.set(n.parent, []).get(n.parent)).push(n.id);
}

const subtreeCache = new Map();
function subtree(id, seen = new Set()){
	if (subtreeCache.has(id)) return subtreeCache.get(id);
	if (seen.has(id)) return { claude: 0, or: 0 }; // cycle guard
	seen.add(id);
	const n = nodes.get(id);
	let claude = n.own_claude_usd ?? 0, or = n.own_or_usd ?? 0;
	for (const c of childrenOf.get(id) || []) {
		const s = subtree(c, seen);
		claude += s.claude; or += s.or;
	}
	const out = { claude, or };
	subtreeCache.set(id, out);
	return out;
}
for (const n of nodes.values()) {
	const s = subtree(n.id);
	n.subtree_claude_usd = Math.round(s.claude * 10000) / 10000;
	n.subtree_or_usd = Math.round(s.or * 10000) / 10000;
	n.children_count = (childrenOf.get(n.id) || []).length;
	n.descendant_count = subtreeDescendantCount(n.id);
}
function subtreeDescendantCount(id, seen = new Set()){
	if (seen.has(id)) return 0;
	seen.add(id);
	let n = 0;
	for (const c of childrenOf.get(id) || []) n += 1 + subtreeDescendantCount(c, seen);
	return n;
}

// roots: no parent at all, or a parent that didn't make it into `nodes` (shouldn't happen)
const out = {
	generated_at: new Date().toISOString(),
	note: "Computed by Server/spend-tree.mjs — see public/framework/ai/sessions/doc/spend-tree.md. "
		+ "own_*_usd is null when no result line was ever billed for that agent (not the same as $0). "
		+ "parent_source: \"registry\" = Servex recorded it at spawn time; \"reconstructed: *\" = this "
		+ "script inferred it from task.jsonl; \"unknown\" = no evidence either way.",
	agent_count: nodes.size,
	agents: [...nodes.values()].sort((a, b) => (b.subtree_claude_usd + b.subtree_or_usd) - (a.subtree_claude_usd + a.subtree_or_usd)),
};

const totalClaude = [...nodes.values()].reduce((s, n) => s + (n.own_claude_usd ?? 0), 0);
const totalOr = [...nodes.values()].reduce((s, n) => s + (n.own_or_usd ?? 0), 0);
out.totals = { claude_usd: Math.round(totalClaude * 100) / 100, openrouter_usd: Math.round(totalOr * 100) / 100 };

if (dry) {
	console.log(`${nodes.size} agents · $${out.totals.claude_usd} Claude · $${out.totals.openrouter_usd} OpenRouter`);
	console.log("Top 15 by subtree $ (own + every descendant):");
	for (const n of out.agents.slice(0, 15)) {
		console.log(`  $${(n.subtree_claude_usd + n.subtree_or_usd).toFixed(2).padStart(8)}  ${n.id}  (own $${((n.own_claude_usd ?? 0) + (n.own_or_usd ?? 0)).toFixed(2)}, ${n.children_count} direct children, ${n.descendant_count} total, trigger=${n.trigger})`);
	}
	const byTrigger = new Map();
	for (const n of nodes.values()) {
		const t = byTrigger.get(n.trigger) || { trigger: n.trigger, claude: 0, or: 0, count: 0 };
		t.claude += n.own_claude_usd ?? 0; t.or += n.own_or_usd ?? 0; t.count++;
		byTrigger.set(n.trigger, t);
	}
	console.log("\nBy trigger tag (own $, not subtree — avoids double-counting):");
	for (const t of [...byTrigger.values()].sort((a, b) => (b.claude + b.or) - (a.claude + a.or)))
		console.log(`  ${t.trigger.padEnd(16)} $${(t.claude + t.or).toFixed(2).padStart(8)}  (${t.count} agents)`);
} else {
	const dest = join(AI, "sessions", "spend-tree.json");
	writeFileSync(dest, JSON.stringify(out));
	console.log(`wrote ${dest} — ${nodes.size} agents, $${out.totals.claude_usd} Claude, $${out.totals.openrouter_usd} OpenRouter`);
}
