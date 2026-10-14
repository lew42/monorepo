// DaySpend.mjs — one day's spend, two currencies, and which modules it touched.
// Reads only what Server/task-cost.mjs already wrote (never recomputes a cost itself) plus each
// task's own `action` log lines, and writes public/framework/ai/<date>/spend.json.
// Read the doc first: Server/doc/task-cost.md (this script leans on its `cost.agents` shape).
//
// usage:
//   node Server/DaySpend.mjs <YYYY-MM-DD>          writes public/framework/ai/<date>/spend.json
//   node Server/DaySpend.mjs <YYYY-MM-DD> --dry     prints the same numbers, writes nothing
import { readFileSync, readdirSync, existsSync, writeFileSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..");
const AI = join(ROOT, "public", "framework", "ai");

const args = process.argv.slice(2);
const dry = args.includes("--dry"); if (dry) args.splice(args.indexOf("--dry"), 1);
const date = args[0];
if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) { console.error("usage: node Server/DaySpend.mjs YYYY-MM-DD [--dry]"); process.exit(2); }

const lines = file => existsSync(file)
	? readFileSync(file, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean)
	: [];

// The merged `assign` of ONE task.jsonl — last value per key wins. Same rule task-cost.mjs's
// own `current()` uses, read directly here (that function isn't exported — it's one line).
const current = file => { const m = {}; for (const o of lines(file)) if (o.assign) Object.assign(m, o.assign); return m; };

// Every `action.files` entry from this task.jsonl AND every task.jsonl nested under its dir
// (a minion's own log) — a parent rarely logs a minion's edits itself.
function allTaskJsonl(dir){
	const out = [];
	const walk = d => { for (const e of readdirSync(d, { withFileTypes: true })){
		const p = join(d, e.name);
		if (e.isDirectory()) walk(p);
		else if (e.name === "task.jsonl") out.push(p);
	} };
	walk(dir);
	return out;
}
function filesTouched(dir){
	const set = new Set();
	for (const f of allTaskJsonl(dir)) for (const o of lines(f)) for (const file of o.action?.files ?? []) set.add(String(file).replaceAll("\\", "/"));
	return [...set];
}

// A file path → the module it belongs to, or null for noise this breakdown should skip:
// an absolute path (`C:/...`, a bug in whatever logged it) or a loose scratch file with no
// directory at all (`.tmp-log6.json`, `_answers.json` — a minion's own scratch, never a
// module). Simplest rule that matches how the owner names a module (core/Page, ux/Dictate,
// Servex, ...) — not a general-purpose classifier.
function moduleOf(file){
	if (!file.includes("/") || /^[A-Za-z]:/.test(file) || file.startsWith("."+"tmp")) return null;
	const m = /^public\/framework\/(core|ext|ux|ui)\/([^/]+)\//.exec(file);
	if (m) return `${m[1]}/${m[2]}`;
	const fw = /^public\/framework\/([^/]+)\//.exec(file);
	if (fw) return `framework/${fw[1]}`;
	if (file.startsWith("Servex/")) return "Servex";
	if (file.startsWith("Server/")) return "Server";
	if (file.startsWith(".claude/")) return ".claude";
	if (file.startsWith("public/")) return "public";
	return null;
}

// Real $ vs Claude $: `Servex/ext/openrouter/provider.js`'s own `provider_for` rule — a
// model id with a "/" in it (`openai/gpt-6-luna`) ran through OpenRouter and its `usd` is
// already the REAL dollar figure (Agents.js's `refresh_or_cost()` overwrites the SDK's
// Anthropic-priced guess for exactly that agent). No "/" → Claude $ (subscription usage,
// priced at Anthropic's own table). Reimplemented here, not imported — provider.js pulls in
// Servex internals this plain report script has no business depending on.
const isOpenRouter = model => String(model ?? "").includes("/");

function splitAgents(agents){
	let claude_usd = 0, real_usd = 0;
	for (const a of agents ?? []){
		const usd = typeof a.usd === "number" ? a.usd : 0;
		if (isOpenRouter(a.model)) real_usd += usd; else claude_usd += usd;
	}
	return { claude_usd, real_usd };
}

function dayDirTasks(dateDir){
	if (!existsSync(dateDir)) return [];
	return readdirSync(dateDir, { withFileTypes: true })
		.filter(d => d.isDirectory() && existsSync(join(dateDir, d.name, "task.jsonl")))
		.map(d => ({ name: d.name, dir: join(dateDir, d.name) }));
}

const r2 = n => Math.round(n * 100) / 100;
const firstLine = m => (m?.outcome ?? m?.request ?? "").split("\n")[0].replaceAll("**", "");

function build(date){
	const dateDir = join(AI, date);
	const taskDirs = dayDirTasks(dateDir);
	const keyOf = t => `${date}/${t.name}`;
	const keys = new Set(taskDirs.map(keyOf));

	const tasks = taskDirs.map(t => {
		const m = current(join(t.dir, "task.jsonl"));
		const tracked = typeof m.cost_usd === "number";
		const split = tracked ? splitAgents(m.cost?.agents) : { claude_usd: 0, real_usd: 0 };
		const modules = [...new Set(filesTouched(t.dir).map(moduleOf).filter(Boolean))];
		return {
			key: keyOf(t), outcome: firstLine(m), tracked,
			claude_usd: r2(split.claude_usd), real_usd: r2(split.real_usd),
			parent_task: m.cost?.parent_task ?? null,
			agents: (m.cost?.agents ?? []).map(a => ({ model: a.model ?? null, usd: typeof a.usd === "number" ? a.usd : null })),
			modules,
		};
	});

	// The day's own totals — skip a task whose parent_task is ALSO one of today's tasks: its
	// cost is already folded into that parent's own cost.agents (mirrors ai/AITask/cost.js's
	// `total()`, same reason: counting both would count that time twice).
	let claude_usd = 0, real_usd = 0;
	for (const t of tasks){
		if (!t.tracked) continue;
		if (t.parent_task && keys.has(t.parent_task)) continue;
		claude_usd += t.claude_usd; real_usd += t.real_usd;
	}

	// By model — same parent/child skip as the day total just above: a task whose
	// parent_task is also today's own task already has its agents counted inside that
	// parent's `cost.agents` list, so counting this task's agents too would double them.
	const byModel = new Map();
	for (const t of tasks){
		if (!t.tracked || (t.parent_task && keys.has(t.parent_task))) continue;
		for (const a of t.agents){
			const key = a.model ?? "model unknown";
			const row = byModel.get(key) ?? { model: key, claude_usd: 0, real_usd: 0 };
			if (isOpenRouter(a.model)) row.real_usd += a.usd ?? 0; else row.claude_usd += a.usd ?? 0;
			byModel.set(key, row);
		}
	}

	// Modules touched, each with the tasks that touched it. A task spanning several modules
	// appears under every one of them — this is "what touched what", not an accounting split,
	// so a module's own dollar total is deliberately NOT shown here: summing it would double
	// count any task that spans modules against the day's real total above.
	const byModule = new Map();
	for (const t of tasks) for (const mod of t.modules){
		const list = byModule.get(mod) ?? [];
		list.push({ key: t.key, outcome: t.outcome });
		byModule.set(mod, list);
	}

	return {
		date, claude_usd: r2(claude_usd), real_usd: r2(real_usd),
		by_model: [...byModel.values()].map(r => ({ model: r.model, claude_usd: r2(r.claude_usd), real_usd: r2(r.real_usd) }))
			.sort((a, b) => (b.claude_usd + b.real_usd) - (a.claude_usd + a.real_usd)),
		tasks: tasks.map(({ parent_task, agents, ...rest }) => rest),
		modules: [...byModule.entries()].map(([module, list]) => ({ module, tasks: list })).sort((a, b) => b.tasks.length - a.tasks.length),
	};
}

const result = build(date);
const outFile = join(AI, date, "spend.json");
if (!dry){
	if (!existsSync(join(AI, date))) { console.error(`day-spend: no such day dir: ${join(AI, date)}`); process.exit(1); }
	writeFileSync(outFile, JSON.stringify(result, null, 1));
}
console.log(`${date} — Claude ${"$" + result.claude_usd.toFixed(2)} · real ${"$" + result.real_usd.toFixed(2)} · ${result.tasks.length} tasks · ${result.modules.length} modules`);
for (const m of result.modules) console.log(`  ${m.module.padEnd(24)} ${m.tasks.length} task${m.tasks.length === 1 ? "" : "s"}`);
console.log(dry ? "(dry — nothing written)" : `wrote ${outFile}`);
