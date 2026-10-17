// Step 17: applies seed.json through the item tool (run_item). Safe to rerun: a task whose folder exists is skipped.
// `node seed.mjs` writes; `node seed.mjs --dry` only prints. Nothing here writes a task.jsonl by hand.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
let ROOT = HERE;
while (!fs.existsSync(path.join(ROOT, "Servex", "agents", "page_tools.js"))) ROOT = path.dirname(ROOT);
const { run_item } = await import(pathToFileURL(path.join(ROOT, "Servex", "agents", "page_tools.js")).href);

const PUBLIC = path.join(ROOT, "public");
const DRY = process.argv.includes("--dry");
const seed = JSON.parse(fs.readFileSync(path.join(HERE, "seed.json"), "utf8"));
const app = dir => "/" + path.relative(PUBLIC, dir).split(path.sep).join("/") + "/";
const dir_of = url => path.join(PUBLIC, url.replace(/^\/+/, ""));
const SESSION_URL = "/framework/ai/sessions/2026/10/16/voice-20261016/";
const caller_log = fs.existsSync(path.join(dir_of(SESSION_URL), "task.jsonl")) ? path.join(dir_of(SESSION_URL), "task.jsonl") : null;
const ctx = { caller: "voice-app", ...(caller_log ? { caller_log } : {}) };
const plain = x => JSON.parse(JSON.stringify(x));
const say = (...a) => console.log(...a);

// The existing child of `parent_dir` whose line 1 has this title, or null (no slug maths here).
function find_child(parent_dir, title){
	if (!fs.existsSync(parent_dir)) return null;
	for (const e of fs.readdirSync(parent_dir, { withFileTypes: true })){
		const file = path.join(parent_dir, e.name, "task.jsonl");
		if (!e.isDirectory() || !fs.existsSync(file)) continue;
		try { if (JSON.parse(fs.readFileSync(file, "utf8").split("\n")[0]).title === title) return path.join(parent_dir, e.name); } catch {}
	}
	return null;
}

async function add(parent_url, fields){
	const r = plain(await run_item({ path: parent_url, delta: { tasks: { add: { type: "Task", ...fields } } } }, ctx));
	if (!r.ok) throw new Error(`add "${fields.title}" on ${parent_url}: ${r.why}`);
	return r.homes[0].path;
}

// ---- the step states, computed from the {"commit": hash} lines of the task-system task.jsonl ----
// A commit counts for step N when its subject (or a commit it merged) says `step N` / `steps N-M`, or it merged one of the
// task-system branches below. Everything else stays open.
const BRANCH_STEP = { "task-replay": ["1", "2"], "task-fields": ["3"], "task-view": ["4"], "task-complete": ["3b"], "item-tool": ["5"], "item-local": ["12"], "task-commits": ["6"],
	"session-item": ["7"], "refine-tasks": ["8"], "item-replay": ["13"], "task-page": ["11"], "task-homes": ["14a"], "task-homes-browser": ["14b"], "tool-files-refs": ["16"] };
const git = (...a) => { try { return execFileSync("git", a, { cwd: ROOT, encoding: "utf8", windowsHide: true, stdio: ["ignore", "pipe", "ignore"] }).trim(); } catch { return ""; } };
function landed_steps(log_url){
	const file = path.join(dir_of(log_url), "task.jsonl"), out = new Set();
	const hashes = fs.readFileSync(file, "utf8").split("\n").filter(Boolean).map(l => { try { return JSON.parse(l).commit; } catch { return null; } }).filter(Boolean);
	for (const h of hashes){
		const subject = git("log", "-1", "--format=%s", h);
		if (!subject) continue;
		const texts = [subject, ...git("log", "--format=%s", `${h}^1..${h}`).split("\n")];
		for (const t of texts){
			for (const m of t.matchAll(/\bsteps? (\d+[ab]?)(?:[-–](\d+))?/g)){
				out.add(m[1]);
				if (m[2]) for (let n = Number(m[1]); n <= Number(m[2]); n++) out.add(String(n));
			}
			for (const m of t.matchAll(/worktree\/([a-z0-9-]+)/g)) for (const s of BRANCH_STEP[m[1]] ?? []) out.add(s);
		}
	}
	return out;
}

async function state_of(url){ return plain(await run_item({ path: url }, ctx)).state?.state; }

let made = 0, completed = 0, skipped = 0;
for (const [module, goal] of Object.entries(seed.goals)){
	const list_dir = path.join(PUBLIC, "framework", module, "tasks");
	let goal_dir = find_child(list_dir, goal.title), goal_url = goal_dir ? app(goal_dir) : null;
	if (!goal_url){
		if (DRY){ say("would make goal", module, goal.title); continue; }
		// The module list task is made by the tool's first add into the module; later goals go straight on the list.
		goal_url = fs.existsSync(path.join(list_dir, "task.jsonl"))
			? await add(app(list_dir), { title: goal.title, source: goal.source })
			: await add(SESSION_URL, { title: goal.title, source: goal.source, module });
		made++; say("goal", module, goal_url);
	} else skipped++;
	goal_dir = dir_of(goal_url);

	const kids = [];
	if (goal.steps){
		const landed = landed_steps(goal.steps_from_commits);
		for (const s of goal.steps){
			const title = `Step ${s.step}: ${s.title}`;
			kids.push({ title, source: "/framework/ai/sessions/2026/10/16/voice-20261016/task-system/plan.md", done: !!s.folded || landed.has(s.step), ...(s.folded ? { note: s.folded } : {}) });
		}
	}
	for (const c of goal.children ?? []) kids.push({ title: c.title, source: c.source, done: false });

	for (const k of kids){
		const { done, ...fields } = k;
		let url, existing = find_child(goal_dir, k.title);
		if (existing) { url = app(existing); skipped++; }
		else {
			if (DRY){ say("would make", k.title); continue; }
			url = await add(goal_url, fields); made++;
		}
		if (done && !DRY && await state_of(url) !== "complete"){
			const r = plain(await run_item({ path: url, delta: { complete: {} } }, ctx));
			if (!r.ok) throw new Error(`complete ${url}: ${r.why}`);
			completed++;
		}
	}
}
say(`${DRY ? "dry run" : "done"}: ${made} made, ${completed} completed, ${skipped} skipped`);
