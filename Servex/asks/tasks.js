// Servex/asks/tasks.js — the task check the owner asked for (2026-10-02, roadmap items 1-2):
// "A node check marks a task stalled when it has no log line for 2 h, isn't landed, and has no
// live agent." This file computes that, plus budget vs actual, for EVERY task dir, and writes
// the one file the Dashboard reads: public/framework/ai/tasks.json.
//
// It reuses Servex/asks/stalled.js's rule rather than writing a second one (CLAUDE.md law 6) —
// a task's "owner" is the agent on its task.jsonl's first line, same as an ask's owner is the
// agent routed to it.
//
// Two ways to run this:
//   - imported: `build_tasks({registry, live})` from Asks.js's tick(), which already has the
//     live Servex agents registry and queue map.
//   - standalone: `node Servex/asks/tasks.js --print` — reads the registry Servex last saved to
//     disk (no live `queue` counts, so a dormant agent with something freshly queued may look
//     stalled for one CLI run; the live tick inside Servex always has the real number).
//
// Read the full rule in Servex/asks/readme.md before changing anything here.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { stalled } from "./stalled.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "..", "..");
const AI = path.join(ROOT, "public", "framework", "ai");
export const OUT_FILE = path.join(AI, "tasks.json");
const DAYS = 7;

const strip_bom = s => s.replace(/^﻿/, "");

function read_lines(file){
	let text;
	try { text = fs.readFileSync(file, "utf8"); } catch { return []; }
	return strip_bom(text).split(/\r?\n/).filter(l => l.trim())
		.map(l => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
}

/* Every `ai/<date>/<slug>/` dir with a task.jsonl, for the last `days` days (today included).
 * A date dir is just its own name (`YYYY-MM-DD`) — string comparison sorts the same as date
 * comparison, so no Date parsing is needed to pick the recent ones. */
export function task_dirs(days = DAYS, now = new Date(), ai_dir = AI){
	if (!fs.existsSync(ai_dir)) return [];
	const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - days);
	const cutoff_str = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
	const out = [];
	for (const d of fs.readdirSync(ai_dir, { withFileTypes: true })){
		if (!d.isDirectory() || !/^\d{4}-\d{2}-\d{2}$/.test(d.name) || d.name < cutoff_str) continue;
		const date_dir = path.join(ai_dir, d.name);
		for (const t of fs.readdirSync(date_dir, { withFileTypes: true })){
			if (!t.isDirectory()) continue;
			const dir = path.join(date_dir, t.name);
			if (fs.existsSync(path.join(dir, "task.jsonl"))) out.push(dir);
		}
	}
	return out;
}

/* The brief's own line: `Budget: $N` on requirements.md's first line (or anywhere in it —
 * agents sometimes add a blank line first). `null` when the brief has none, or there is no
 * brief yet — shown as "no budget set", never guessed at. */
function budget_of(dir){
	let text;
	try { text = fs.readFileSync(path.join(dir, "requirements.md"), "utf8"); } catch { return null; }
	const m = text.match(/Budget:\s*\$(\d+(?:\.\d+)?)/i);
	return m ? Number(m[1]) : null;
}

/* spend.json is {total, points} — Server/task-cost.mjs writes it beside every task.jsonl it has
 * ever priced. `null` (not measured yet), never 0, when the file doesn't exist. */
function spent_of(dir){
	try { return JSON.parse(fs.readFileSync(path.join(dir, "spend.json"), "utf8")).total ?? null; } catch { return null; }
}

/* Folds one task.jsonl into the facts the state check needs. Never throws: a dir mid-write just
 * reads what's on disk so far. `landed` is exactly the brief's own definition — "a landed_at
 * line exists" — nothing about outcome text is required here. */
export function task_facts(dir, root = ROOT){
	const lines = read_lines(path.join(dir, "task.jsonl"));
	const first = lines[0]?.assign ?? {};
	const facts = {
		dir: path.relative(root, dir).split(path.sep).join("/"),
		title: first.card ? first.card.split("/").pop().replace(/-/g, " ") : path.basename(dir).replace(/-/g, " "),
		agent: first.agent ?? null,
		card: first.card ?? null,
		brief: first.brief ?? null,
		started_at: first.requested_at ?? null,
		last_line_at: null,
		landed_at: null,
		snooze: null, kill: null, priority: null,
	};
	for (const line of lines){
		if (line.assign?.landed_at) facts.landed_at = line.assign.landed_at;
		if (line.snooze) facts.snooze = line.snooze;       // latest wins — these three verbs are append-only history
		if (line.kill) facts.kill = line.kill;
		if (line.priority) facts.priority = line.priority;
		// every line shape in this repo's task logs carries `at` somewhere (Asks.js's own task_state does the same walk)
		const at = line.at ?? line.assign?.at ?? line.assign?.landed_at ?? line.log?.at ?? line.action?.at ?? line.decision?.at
			?? line.snooze?.at ?? line.kill?.at ?? line.priority?.at;
		if (at) facts.last_line_at = at;
	}
	facts.landed = !!facts.landed_at;
	facts.budget = budget_of(dir);
	facts.spent = spent_of(dir);
	facts.over = (facts.budget && facts.spent != null) ? Number((facts.spent / facts.budget).toFixed(2)) : null;
	return facts;
}

/* The registry row for a task's owner, shaped the way stalled() wants it — same fields
 * Asks.js's own owner_row() builds for an ask, read from the task's own facts instead of a
 * second task.jsonl read. `live` is the Servex `agents.live` Map (queued messages); omit it
 * (the standalone CLI has no live process map) and queued reads as 0. */
export function owner_row(facts, registry = [], live = null){
	if (!facts.agent) return null;
	const row = registry.find(r => r.id === facts.agent);
	if (!row) return null;
	const queued = live?.get?.(facts.agent)?.queue?.items?.length ?? 0;
	return { ...row, last_task_line_at: facts.last_line_at, queued };
}

/* The one state machine: killed and landed are closed (folded, like a dropped ask); snoozed
 * holds off the stall check until `until`; everything else asks stalled() — the exact rule
 * Servex/asks/stalled.js already uses for asks, fed this task's own owner_row(). */
export function task_state(facts, row, now = Date.now()){
	if (facts.kill) return { state: "killed", why: facts.kill.why };
	if (facts.landed) return { state: "landed", why: "task.jsonl has a landed_at line" };
	if (facts.snooze && Date.parse(facts.snooze.until) > now)
		return { state: "snoozed", why: `snoozed until ${facts.snooze.until}` };
	const verdict = stalled({ status: "building", owner: facts.agent }, row, now);
	return { state: verdict.stalled ? "stalled" : "building", why: verdict.why };
}

/* Item 4's bands, lowest-effort-to-read-first: stalled (100) outranks over-budget (90) outranks
 * a plain building task (50, ordered by last_line_at — the Dashboard's job, not a score split
 * into a hundred tiers) outranks snoozed (10) outranks closed (0). An owner's own
 * `priority.score` always wins — that is the whole point of "re-prioritise". */
function score_of(facts, state){
	if (facts.priority?.score != null) return facts.priority.score;
	if (state.state === "stalled") return 100;
	if (state.state === "building" && facts.over != null && facts.over > 1) return 90;
	if (state.state === "building") return 50;
	if (state.state === "snoozed") return 10;
	return 0;   // landed, killed — folded
}

/** Every recent task's row for the Dashboard, newest-highest-score first. */
export function build_tasks({ days = DAYS, registry = [], live = null, now = Date.now(), ai_dir = AI, root = ROOT } = {}){
	return task_dirs(days, new Date(now), ai_dir).map(dir => {
		const facts = task_facts(dir, root);
		const row = owner_row(facts, registry, live);
		const state = task_state(facts, row, now);
		return {
			dir: facts.dir, title: facts.title, agent: facts.agent, card: facts.card, brief: facts.brief,
			budget: facts.budget, spent: facts.spent, over: facts.over,
			started_at: facts.started_at, last_line_at: facts.last_line_at, landed: facts.landed,
			state: state.state, why: state.why, score: score_of(facts, state),
		};
	}).sort((a, b) => (b.score - a.score) || (Date.parse(b.last_line_at ?? 0) - Date.parse(a.last_line_at ?? 0)));
}

/* Whole-object write, atomic via temp + rename (item 1's own words) — a reader never sees a
 * half-written file. DERIVED DATA: regenerated every Servex tick; never hand-edit it — change
 * the task.jsonl lines (snooze/kill/priority) or this script instead. */
export function write_tasks_json(tasks, out = OUT_FILE){
	const body = JSON.stringify({
		generated_at: new Date().toISOString(),
		note: "DERIVED — regenerated every minute by Servex/asks/tasks.js (wired from Asks.js's tick). Never hand-edit; change a task's task.jsonl (snooze/kill/priority lines) or re-run `node Servex/asks/tasks.js` instead.",
		tasks,
	}, null, 2);
	fs.mkdirSync(path.dirname(out), { recursive: true });
	const tmp = `${out}.${process.pid}.tmp`;
	fs.writeFileSync(tmp, body, "utf8");
	fs.renameSync(tmp, out);
	return out;
}

/* ---------- standalone CLI: `node Servex/asks/tasks.js [--print]` ---------- */

function registry_from_disk(){
	try {
		const file = path.join(process.env.LOCALAPPDATA || "", "lew42", "servex", "registry.json");
		const reg = JSON.parse(fs.readFileSync(file, "utf8"));
		return Array.isArray(reg) ? reg : Object.entries(reg).map(([id, r]) => ({ id, ...r }));
	} catch { return []; }
}

function main(){
	const tasks = build_tasks({ registry: registry_from_disk() });
	write_tasks_json(tasks);
	if (process.argv.includes("--print")){
		const stalled_tasks = tasks.filter(t => t.state === "stalled");
		console.log(`${stalled_tasks.length} stalled task(s) of ${tasks.length} open or recently-landed:`);
		for (const t of stalled_tasks) console.log(`- ${t.dir}  (owner: ${t.agent ?? "none"}) — ${t.why}`);
	} else {
		console.log(`wrote ${OUT_FILE}: ${tasks.length} tasks, ${tasks.filter(t => t.state === "stalled").length} stalled`);
	}
}

const is_main = (() => { try { return import.meta.url === pathToFileURL(process.argv[1] ?? "").href; } catch { return false; } })();
if (is_main) main();
