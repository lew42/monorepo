// abandoned.mjs — which tasks of the last N days never landed, and which spawned agents stopped mid-task.
// Reuses Servex/asks/tasks.js (the Dashboard's own state machine) and Agents.js's task_landed(); adds the
// cases those two disagree on. Read-only: prints a summary and writes abandoned.json beside this file.
// usage: node public/framework/ai/sessions/2026/10/15/voice-20261015/ai-systems/abandoned.mjs [days=14]
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { task_facts, owner_row, task_state } from "../../../../../../../../../Servex/asks/tasks.js";
import TaskDirs from "../../../../../../../../../Server/TaskDirs.mjs";
import { task_landed } from "../../../../../../../../../Servex/agents/Agents.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const days = Number(process.argv[2] ?? 14);
const now = Date.now();
const reg_file = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "registry.json");
const raw = JSON.parse(fs.readFileSync(reg_file, "utf8"));
const registry = Array.isArray(raw) ? raw : Object.entries(raw).map(([id, r]) => ({ id, ...r }));
const by_id = new Map(registry.map(r => [r.id, r]));
const by_dir = new Map();
for (const r of registry) if (r.task_dir) by_dir.set(path.resolve(r.task_dir).toLowerCase(), r);

const lines = f => { try { return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean); } catch { return []; } };
// Every task.jsonl under the day folders, at any depth (TaskDirs.list stops two levels below the day).
const SESS = path.resolve("public/framework/ai/sessions"), cut = new Date(now - days * 864e5).toISOString().slice(0, 10);
const listed = new Set(TaskDirs.list(days, new Date(now)).map(t => path.resolve(t.dir).toLowerCase()));
const found = []; const walk = d => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === "task.jsonl") found.push(d); } };
for (const y of fs.readdirSync(SESS).filter(n => /^\d{4}$/.test(n))) for (const m of fs.readdirSync(path.join(SESS, y)).filter(n => /^\d\d$/.test(n))) for (const d of fs.readdirSync(path.join(SESS, y, m)).filter(n => /^\d\d$/.test(n)))
	if (`${y}-${m}-${d}` >= cut) walk(path.join(SESS, y, m, d));
const tasks = found.map(dir => { const f = task_facts(dir); const s = task_state(f, owner_row(f, registry), now); return { ...f, state: s.state, why: s.why, depth: path.relative(SESS, dir).split(path.sep).length - 3, listed: listed.has(dir.toLowerCase()) }; });
const rows = tasks.map(t => {
	const abs = path.resolve(t.dir);
	const tl = lines(path.join(abs, "task.jsonl"));
	const top_landed = tl.some(l => l.landed_at);               // Agents.js counts this; tasks.js does not
	const closed = tl.some(l => l.assign?.closed_by);
	const agents_landed = task_landed(abs);
	const row = (t.agent && by_id.get(t.agent)) || by_dir.get(abs.toLowerCase()) || null;
	// did the agent end its turn (a done/blocked wake in the parent's inbox), or stop mid-turn?
	const parent = tl[0]?.assign?.parent_task;
	const inbox = parent ? lines(path.join(path.resolve(parent), "inbox.jsonl")) : [];
	const woke = row ? inbox.filter(m => m.from === row.id).map(m => m.kind) : [];
	return {
		dir: t.dir, depth: t.depth, listed: t.listed, agent: row?.id ?? t.agent, role: row?.role ?? null, model: row?.model ?? null,
		agent_state: row?.state ?? null, stopped_by: row?.stopped_by ?? null, ended: row?.ended ?? null,
		dash_state: t.state, why: t.why, started_at: t.started_at, last_line_at: t.last_line_at,
		silent_h: t.last_line_at ? Math.round((now - Date.parse(t.last_line_at)) / 36e5) : null,
		n_lines: tl.length, top_landed, closed, agents_landed, woke, spent: t.spent,
	};
});

const open = rows.filter(r => r.dash_state !== "landed" && r.dash_state !== "killed");
const disagree = rows.filter(r => r.dash_state !== "landed" && r.agents_landed);
const really_open = open.filter(r => !r.agents_landed);
const count = (a, k) => a.reduce((m, r) => (m[r[k] ?? "none"] = (m[r[k] ?? "none"] ?? 0) + 1, m), {});
const mid_task = really_open.filter(r => r.agent && ["stopped", "gone"].includes(r.agent_state) && !r.woke.some(k => k === "done" || k === "blocked"));
const finished_unlanded = really_open.filter(r => r.woke.includes("done"));

const summary = {
	at: new Date().toISOString(), days, task_dirs: rows.length,
	dash_states: count(rows, "dash_state"),
	not_seen_by_dashboard: rows.filter(r => !r.listed).length,
	not_landed_and_not_seen_by_dashboard: really_open.filter(r => !r.listed).length,
	not_landed_by_depth: count(really_open, "depth"),
	landing_rules_disagree: disagree.length,
	not_landed_by_either_rule: really_open.length,
	not_landed_by_agent_state: count(really_open, "agent_state"),
	not_landed_by_role: count(really_open, "role"),
	not_landed_silent_over_24h: really_open.filter(r => (r.silent_h ?? 1e9) > 24).length,
	not_landed_one_line_only: really_open.filter(r => r.n_lines <= 1).length,
	agent_ended_turn_but_no_landing: finished_unlanded.length,
	agent_stopped_or_gone_mid_task: mid_task.length,
	still_live: really_open.filter(r => ["working", "idle"].includes(r.agent_state)).length,
};
fs.writeFileSync(path.join(HERE, "abandoned.json"), JSON.stringify({ summary, disagree: disagree.map(r => r.dir), mid_task, finished_unlanded, really_open }, null, 1));
console.log(JSON.stringify(summary, null, 1));
const by_day = {}; for (const r of really_open) { const d = (r.dir.match(/sessions\/(\d{4}\/\d\d\/\d\d)/) ?? [])[1] ?? "old-shape"; by_day[d] = (by_day[d] ?? 0) + 1; }
console.log("not landed, by day:", JSON.stringify(by_day));
console.log("\nsample mid-task:"); for (const r of mid_task.slice(0, 12)) console.log(` ${r.dir}  ${r.agent} ${r.role}/${r.agent_state} by=${r.stopped_by} silent ${r.silent_h}h lines ${r.n_lines}`);
console.log("\nsample ended-turn-no-landing:"); for (const r of finished_unlanded.slice(0, 8)) console.log(` ${r.dir}  ${r.agent} silent ${r.silent_h}h`);
