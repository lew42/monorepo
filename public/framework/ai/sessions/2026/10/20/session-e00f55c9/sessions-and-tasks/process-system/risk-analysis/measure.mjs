#!/usr/bin/env node
// measure.mjs — read-only counts for cracks.md. Walks the real store (TaskDirs.list), replays each
// log through AIIndex's own fold (same rule the dashboard uses), and counts three things the brief asks for:
//   1. tasks in the last 7 days that are "running" with no log line for >= 24h
//   2. tasks in the last 7 days that never reached `complete` (stopped, or still open and abandoned)
//   3. nested child task folders whose parent's own log never mentions them
// node public/framework/ai/sessions/2026/10/20/session-e00f55c9/sessions-and-tasks/process-system/risk-analysis/measure.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const REPO = "C:/Code/lew42/monorepo";
process.chdir(REPO);

const { default: TaskDirs } = await import(pathToFileURL(path.join(REPO, "Server", "TaskDirs.mjs")));
const { default: SessionRecord } = await import(pathToFileURL(path.join(REPO, "Server", "SessionRecord.mjs")));
const { default: AIIndex } = await import(pathToFileURL(path.join(REPO, "Server", "AIIndex.mjs")));

const now = Date.now();
const entries = TaskDirs.list(7, new Date(now));
const pub = path.join(REPO, "public");

function read(dir){
	const file = SessionRecord.log_file(dir) ?? path.join(dir, "task.jsonl");
	let text; try { text = fs.readFileSync(file, "utf8"); } catch { return null; }
	const lines = text.split("\n").filter(l => l.trim()).map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
	const f = AIIndex.fold(lines, pub);
	const mtime = fs.statSync(file).mtimeMs;
	return { file, lines, text, state: f.state, last: f.last, outcome: f.outcome, mtime };
}

// ---- 1: running, no line for >= 24h ----
const DAY_MS = 24 * 3600 * 1000;
const running_quiet = [];
for (const e of entries){
	const r = read(e.dir); if (!r) continue;
	if (r.state !== "running" && r.state !== "paused") continue;
	const lastMs = Date.parse(r.last) || r.mtime;
	if (now - lastMs >= DAY_MS) running_quiet.push({ dir: path.relative(REPO, e.dir).split(path.sep).join("/"), quiet_h: +((now - lastMs) / 3600000).toFixed(1) });
}

// ---- 2: no `complete` ever reached ----
let no_complete = 0, total = 0, by_state = {};
for (const e of entries){
	const r = read(e.dir); if (!r) continue;
	total++;
	by_state[r.state] = (by_state[r.state] ?? 0) + 1;
	if (r.state !== "complete") no_complete++;
}

// ---- 3: nested child folders the parent's own log never mentions ----
const dirset = new Map(entries.map(e => [path.resolve(e.dir), e]));
const unreferenced = [];
for (const [abs, e] of dirset){
	const parentAbs = path.resolve(path.dirname(abs));
	const parent = dirset.get(parentAbs);
	if (!parent) continue;   // only count a dir whose immediate parent folder is itself a tracked task
	const pr = read(parent.dir); if (!pr) continue;
	const slug = path.basename(abs);
	if (!pr.text.includes(slug)) unreferenced.push({ child: path.relative(REPO, abs).split(path.sep).join("/"), parent: path.relative(REPO, parentAbs).split(path.sep).join("/") });
}

const result = {
	scanned: entries.length,
	running_quiet_24h: { count: running_quiet.length, examples: running_quiet.slice(0, 5) },
	no_complete: { count: no_complete, of: total, by_state },
	unreferenced_children: { count: unreferenced.length, examples: unreferenced.slice(0, 5) },
};
console.log(JSON.stringify(result, null, 2));
