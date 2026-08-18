import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(process.env.LEDGER_ROOT || path.join(fileURLToPath(import.meta.url), "../../.."));

// Appending to any of these from PostToolUse would log the log, forever.
const skip = new Set(["task.jsonl", "day.jsonl", "usage.jsonl", "usage.json"]);

const now = () => {
	const d = new Date(), o = -d.getTimezoneOffset(), pad = n => String(Math.floor(Math.abs(n))).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${o < 0 ? "-" : "+"}${pad(o / 60)}:${pad(o % 60)}`;
};

const lines = file => fs.readFileSync(file, "utf8").split("\n").flatMap(l => {
	try { return l.trim() ? [JSON.parse(l)] : []; } catch { return []; }
});

// A log whose last line has no newline glues our entry onto it — and a line holding
// two objects fails JSON.parse, so BOTH silently vanish from every reader.
const append = (file, entry) => {
	let lead = "";
	try { const b = fs.readFileSync(file); if (b.length && b.at(-1) !== 10) lead = "\n"; } catch {}
	fs.appendFileSync(file, lead + JSON.stringify(entry) + "\n");
};

const state = file => Object.assign({}, ...lines(file).filter(e => e.assign).map(e => e.assign));

// null means "outside the repo" — including a different drive, where relative() returns an absolute path.
const rel = file => {
	const r = path.relative(root, path.resolve(file));
	return !r || r.startsWith("..") || path.isAbsolute(r) ? null : r.split(path.sep).join("/");
};

const walk = function* (dir) {
	let entries;
	try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
	for (const e of entries) {
		if (!e.isDirectory()) { if (e.name === "task.jsonl") yield path.join(dir, e.name); continue; }
		if (e.name === "node_modules" || e.name[0] === ".") continue;
		yield* walk(path.join(dir, e.name));
	}
};

// An edit's path is ground truth: the first task.jsonl walking up owns it, no
// session match needed. Null outside every task dir falls through below.
const find_task_by_path = file => {
	let dir = path.dirname(path.resolve(file));
	while (dir === root || dir.startsWith(root + path.sep)) {
		const candidate = path.join(dir, "task.jsonl");
		if (fs.existsSync(candidate)) return candidate;
		if (path.dirname(dir) === dir) return null;
		dir = path.dirname(dir);
	}
	return null;
};

/* Fallback for paths outside every task dir: subagents inherit the parent's
   session_id, so many tasks share one session and matching by session alone is a
   guess. `newest` picks by CREATION, never mtime — this hook's own appends keep
   bumping whichever file it already chose, so mtime self-pins. */
const find_task = (session, newest) => {
	if (!session) return null;
	const key = newest ? "edit" : "run";
	const cache = path.join(os.tmpdir(), `claude-ledger-${key}-${String(session).replace(/[^\w-]/g, "_")}.txt`);
	try {
		if (Date.now() - fs.statSync(cache).mtimeMs < 60000) {
			const hit = fs.readFileSync(cache, "utf8").trim();
			if (hit.startsWith(root) && fs.existsSync(hit)) return hit;
		}
	} catch {}

	const born = [];
	for (const file of walk(path.join(root, "public")))
		try { const s = fs.statSync(file); born.push([s.birthtimeMs || s.mtimeMs, file]); } catch {}
	born.sort((a, b) => newest ? b[0] - a[0] : a[0] - b[0]);

	for (const [, file] of born) {
		if (lines(file).find(e => e.assign)?.assign.session_id !== session) continue;
		try { fs.writeFileSync(cache, file); } catch {}
		return file;
	}
	return null;
};

// An edit or a stop must never resolve to a task another agent is still working
// in: the only safe source beyond an edit's own path is THIS agent's own prior
// path-based resolution — never the session guess, which can land on a
// sibling's live task. Null means "no ground truth yet for this agent".
const agent_cache = id => path.join(os.tmpdir(), `claude-ledger-agent-${String(id).replace(/[^\w-]/g, "_")}.txt`);
const cached_task = (agent_id, session) => {
	if (!agent_id) return null;
	try {
		const hit = fs.readFileSync(agent_cache(agent_id), "utf8").trim();
		if (hit.startsWith(root) && fs.existsSync(hit) && lines(hit).find(e => e.assign)?.assign.session_id === session) return hit;
	} catch {}
	return null;
};

const stdin = () => new Promise(resolve => {
	if (process.stdin.isTTY) return resolve("");
	let s = "";
	process.stdin.setEncoding("utf8");
	process.stdin.on("data", d => s += d);
	process.stdin.on("end", () => resolve(s));
	process.stdin.on("error", () => resolve(""));
});

const run = async () => {
	let input = {};
	try { input = JSON.parse(await stdin()) || {}; } catch {}
	const event = String(process.argv[2] || input.hook_event_name || "").toLowerCase().replace(/[^a-z]/g, "");

	// Blocking again after our own block loops the session forever.
	if (event === "stop" && input.stop_hook_active) return;

	if (event === "posttooluse" && input.tool_name === "Skill") {
		const task = cached_task(input.agent_id, input.session_id) || find_task(input.session_id, true);
		if (task && input.tool_input?.skill) append(task, { log: { at: now(), msg: `skill: ${input.tool_input.skill}` } });
		return;
	}

	if (event === "posttooluse") {
		const file = input.tool_input?.file_path || input.tool_input?.notebook_path;
		const r = file && rel(file);
		if (!r || skip.has(path.basename(r))) return;
		const by_path = find_task_by_path(file);
		const task = by_path || cached_task(input.agent_id, input.session_id) || find_task(input.session_id, true);
		if (!task) return;
		if (by_path && input.agent_id) try { fs.writeFileSync(agent_cache(input.agent_id), by_path); } catch {}
		if (lines(task).some(e => e.action?.files?.includes(r))) return; // first touch only
		append(task, { action: { at: now(), did: "edit", files: [r] } });
		return;
	}

	if (event === "stop") {
		const task = cached_task(input.agent_id, input.session_id) || find_task(input.session_id, false);
		if (!task) return;
		const s = state(task);
		if (s.landed_at || !Array.isArray(s.steps) || !(Number(s.step) < s.steps.length)) return;
		console.log(JSON.stringify({
			decision: "block",
			reason: `Your task ledger says step ${s.step} of ${s.steps.length} with no landed_at. Finish the remaining steps and bump step, or land it by appending ONE line to ${rel(task)}: {"assign": {"step": ${s.steps.length}, "landed_at": "<ISO with local offset>", "outcome": "**what landed** — …"}} — landed_at and outcome go INSIDE assign, never as their own verb.`
		}));
		return;
	}

	const task = find_task(input.session_id, false);
	if (!task) return;

	if (event === "sessionstart") {
		if (input.source === "resume") append(task, { log: { at: now(), msg: "session resumed" } });
		return;
	}

	if (event === "sessionend" && !state(task).landed_at)
		append(task, { log: { at: now(), msg: `session ended (${input.reason || "other"}) without landing` } });
};

try { await run(); } catch {}
process.exit(0);
