#!/usr/bin/env node
// page-ai-cost.mjs — "$N.NN of AI work" on every page: redistributes each task's already-
// computed cost (Server/task-cost.mjs's `cost_usd`) across the page folders that task's
// `action` lines actually touched, and appends one line to each page's own log.
//
// Read first: Server/task-cost.mjs (where `cost_usd` comes from — this script NEVER
// recomputes it, CLAUDE.md law 7: compute, don't recall, but compute it ONCE, in one place).
// Server/page-refs.mjs (the log-file convention this reuses exactly): a page.js folder's data
// line goes in a sibling `weight.jsonl`, never a new `page.jsonl` — creating a `page.jsonl`
// subscribes that folder to the dev server's file watcher (Server/plugins/PageFiles.js), which
// is churn unrelated to cost. A folder with no `page.js` of its own already IS a page.jsonl
// page, so it keeps using that file.
//
// usage:
//   node Server/page-ai-cost.mjs [--root <repo>] [--dry]
//
// What it does, in order:
//   1. Walks every ai/<date>/<slug>/task.jsonl.
//   2. Takes the task's cost_usd — the LATEST assign line that has one (task-cost.mjs writes
//      it). A task with none billed yet is skipped, never estimated.
//   3. Collects the distinct page folders named in that task's `action` lines' `files`: each
//      file's nearest ancestor directory that has a page.js. A file with no such ancestor
//      under public/framework (a Server/ script, a root readme, scratch) isn't a page, and is
//      skipped.
//   4. Splits the task's cost evenly across those folders (law 7 — a computed split, not a
//      guess at which page "really" earned it).
//   5. Sums every task's share per folder and writes one `{"ai_cost": {usd, tasks, at}}` line —
//      a "set", like weight's manual line: the LATEST line wins, never summed by the reader.
//      Skipped when the figure didn't change, so running this twice in a row appends nothing.

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function parse_args(argv){
	const rest = argv.slice(2);
	let root = null, dry = false;
	for (let i = 0; i < rest.length; i++){
		if (rest[i] === "--root") { root = rest[++i]; continue; }
		if (rest[i] === "--dry") { dry = true; continue; }
	}
	return { root: path.resolve(root ?? path.resolve(HERE, "..")), dry };
}

const { root, dry } = parse_args(process.argv);
const AI = path.join(root, "public", "framework", "ai");
const FRAMEWORK = path.join(root, "public", "framework");

function read_lines(jsonl_path){
	if (!fs.existsSync(jsonl_path)) return [];
	return fs.readFileSync(jsonl_path, "utf8").split("\n").filter(l => l.trim())
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

// Every dated task dir that has a task.jsonl.
function all_task_dirs(){
	const out = [];
	if (!fs.existsSync(AI)) return out;
	for (const d of fs.readdirSync(AI, { withFileTypes: true })){
		if (!d.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(d.name)) continue;
		const day_dir = path.join(AI, d.name);
		for (const t of fs.readdirSync(day_dir, { withFileTypes: true })){
			if (!t.isDirectory()) continue;
			const dir = path.join(day_dir, t.name);
			if (fs.existsSync(path.join(dir, "task.jsonl"))) out.push(dir);
		}
	}
	return out;
}

// The task's own cost_usd — the latest assign line that carries one. Never recomputed here.
function task_cost(dir){
	let cost = null;
	for (const obj of read_lines(path.join(dir, "task.jsonl")))
		if (obj.assign && typeof obj.assign.cost_usd === "number") cost = obj.assign.cost_usd;
	return cost;
}

// Walk up from a touched file to the nearest ancestor directory that has a page.js — that
// directory IS the page this edit counts against. Memoized: many files in one task share a dir.
const page_dir_cache = new Map();
function page_folder_for(file){
	const abs = path.isAbsolute(file) ? file : path.join(root, file);
	let dir = path.dirname(abs);
	if (fs.existsSync(abs) && fs.statSync(abs).isDirectory()) dir = abs;

	const climbed = [];
	let found = null;
	while (dir === FRAMEWORK || dir.startsWith(FRAMEWORK + path.sep)){
		if (page_dir_cache.has(dir)){ found = page_dir_cache.get(dir); break; }
		climbed.push(dir);
		if (fs.existsSync(path.join(dir, "page.js"))){ found = dir; break; }
		const parent = path.dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	for (const d of climbed) page_dir_cache.set(d, found);
	return found;
}

// Every distinct page folder this task's `action` lines touched.
function pages_touched(dir){
	const found = new Set();
	for (const obj of read_lines(path.join(dir, "task.jsonl"))){
		const files = obj.action?.files;
		if (!Array.isArray(files)) continue;
		for (const file of files){
			const folder = page_folder_for(file);
			if (folder) found.add(folder);
		}
	}
	return [...found];
}

// page-refs.mjs's own rule, reused exactly: a page.js folder's data line lives in a sibling
// weight.jsonl (never page.jsonl — that would subscribe it to the file watcher); a folder with
// no page.js of its own already IS a page.jsonl page.
function log_path_for(dir){
	return fs.existsSync(path.join(dir, "page.js")) ? path.join(dir, "weight.jsonl") : path.join(dir, "page.jsonl");
}

// ---- gather: task cost → the pages it touched, split evenly ----
const per_page = new Map(); // dir -> { usd, tasks: Set<task key> }
for (const dir of all_task_dirs()){
	const cost = task_cost(dir);
	if (cost === null || cost <= 0) continue;
	const pages = pages_touched(dir);
	if (!pages.length) continue;

	const share = cost / pages.length;
	const key = path.relative(AI, dir).replace(/\\/g, "/");
	for (const page_dir of pages){
		const row = per_page.get(page_dir) ?? { usd: 0, tasks: new Set() };
		row.usd += share;
		row.tasks.add(key);
		per_page.set(page_dir, row);
	}
}

// ---- write: one line per page, skipped when unchanged ----
const r2 = n => Math.round(n * 100) / 100;
const table = [["page", "usd", "tasks", "log"]];
let appended = 0, skipped = 0;

for (const [page_dir, row] of per_page){
	const usd = r2(row.usd), tasks = row.tasks.size;
	const rel = "/" + path.relative(path.join(root, "public"), page_dir).replace(/\\/g, "/") + "/";
	const jsonl_path = log_path_for(page_dir);
	const had_jsonl = fs.existsSync(jsonl_path);

	const parsed = read_lines(jsonl_path);
	const last = parsed.filter(obj => obj.ai_cost && typeof obj.ai_cost.usd === "number").at(-1)?.ai_cost;

	if (last && last.usd === usd && last.tasks === tasks){
		table.push([rel, "$" + usd.toFixed(2), String(tasks), "unchanged"]);
		skipped++;
		continue;
	}

	if (!dry){
		const lines = [];
		if (!had_jsonl) lines.push(JSON.stringify({ note: "weight/cost data only — core/Page/weight/doc/design.md" }));
		lines.push(JSON.stringify({ ai_cost: { usd, tasks, at: new Date().toISOString() } }));
		fs.appendFileSync(jsonl_path, lines.join("\n") + "\n");
	}
	table.push([rel, "$" + usd.toFixed(2), String(tasks), dry ? "dry" : "appended"]);
	appended++;
}

const w = table[0].map((_, i) => Math.max(...table.map(r => r[i].length)));
for (const r of table) console.log(r.map((v, i) => v.padEnd(w[i])).join("  ").trimEnd());
console.log(`\npage-ai-cost: ${appended} page(s) updated, ${skipped} unchanged${dry ? " (dry run — nothing written)" : ""}.`);
